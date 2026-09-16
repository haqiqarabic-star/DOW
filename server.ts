import express from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DOWNLOADS_DIR = '/tmp/downloads';

// Ensure download directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: '10mb' }));

// Enable CORS for frontend and cross-origin API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory jobs tracking
interface ServerJob {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'audio';
  quality: string;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  totalSize?: string;
  filename?: string;
  filePath?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

const jobs = new Map<string, ServerJob>();

// Get yt-dlp binary path (supports Linux, Docker, Cloud Run, and Vercel serverless functions)
function getYtDlpPath(): string {
  const tmpBinary = '/tmp/yt-dlp';
  if (fs.existsSync(tmpBinary)) {
    return tmpBinary;
  }

  // Check candidate paths
  const candidatePaths = [
    path.join(process.cwd(), 'yt-dlp'),
    path.join(process.cwd(), 'yt-dlp_linux'),
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp'
  ];

  for (const bin of candidatePaths) {
    if (fs.existsSync(bin)) {
      try {
        // If on Vercel or read-only filesystem, copy to writable /tmp
        if (process.env.VERCEL) {
          fs.copyFileSync(bin, tmpBinary);
          fs.chmodSync(tmpBinary, 0o755);
          return tmpBinary;
        }
        fs.chmodSync(bin, 0o755);
        return bin;
      } catch {
        try {
          fs.copyFileSync(bin, tmpBinary);
          fs.chmodSync(tmpBinary, 0o755);
          return tmpBinary;
        } catch {
          // ignore
        }
      }
    }
  }

  return 'yt-dlp';
}

function getNodePath(): string {
  return process.execPath || '/usr/local/bin/node';
}

// Base yt-dlp arguments to ensure maximum compatibility with YouTube and other sites
function getBaseYtDlpArgs(): string[] {
  const nodePath = getNodePath();
  const args = [
    '--no-playlist',
    '--no-warnings',
    '--socket-timeout', '15',
    '--retries', '2'
  ];
  if (nodePath && fs.existsSync(nodePath)) {
    args.push('--js-runtimes', `node:${nodePath}`);
  }
  return args;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 100) || 'video';
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// 2. Fetch video info & formats
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return res.status(400).json({ error: 'يرجى إدخال رابط صالح يبدأ بـ http:// أو https://' });
  }

  const cleanUrl = url.trim();
  const ytDlp = getYtDlpPath();
  const isYoutube = /youtube\.com|youtu\.be/i.test(cleanUrl);

  const runExtraction = (extraArgs: string[] = []): Promise<{ stdout: string; stderr: string; code: number }> => {
    return new Promise((resolve) => {
      const args = [
        ...getBaseYtDlpArgs(),
        ...extraArgs,
        '--dump-single-json',
        cleanUrl
      ];

      const p = spawn(ytDlp, args);
      let stdout = '';
      let stderr = '';
      let isDone = false;

      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          try {
            p.kill('SIGKILL');
          } catch {
            // ignore
          }
          resolve({ stdout: '', stderr: 'Timeout: extraction took too long', code: 124 });
        }
      }, 25000);

      p.stdout.on('data', (c) => stdout += c.toString());
      p.stderr.on('data', (c) => stderr += c.toString());
      p.on('close', (code) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          resolve({ stdout, stderr, code: code ?? 1 });
        }
      });
      p.on('error', (err) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          resolve({ stdout: '', stderr: err?.message || 'Process error', code: 1 });
        }
      });
    });
  };

  // First extraction attempt
  let { stdout: stdoutData, stderr: stderrData, code } = await runExtraction();

  // If first attempt failed on YouTube due to bot check or sign-in, attempt fallback with tv client
  if (code !== 0 && isYoutube && (stderrData.includes('Sign in to confirm') || stderrData.includes('403') || stderrData.includes('bot'))) {
    const fallbackRes = await runExtraction(['--extractor-args', 'youtube:player_client=tv,web']);
    if (fallbackRes.code === 0 && fallbackRes.stdout.trim()) {
      stdoutData = fallbackRes.stdout;
      stderrData = fallbackRes.stderr;
      code = 0;
    }
  }

  if (code !== 0 || !stdoutData.trim()) {
    let cleanError = stderrData.replace(/Deprecated Feature:.*?\n/g, '').trim();
    let friendlyError = 'تعذر استخراج معلومات الفيديو من هذا الرابط. تأكد من أن الرابط عام وصحيح.';
    let errorType = 'general';

    if (cleanError.includes('Timeout') || code === 124) {
      friendlyError = 'استغرقت عملية فحص الرابط وقتاً أطول من المعتاد وتوقفت لتفادي التعليق. يرجى التأكد من صحة الرابط والمحاولة مجدداً.';
      errorType = 'timeout';
    } else if (cleanError.includes('Sign in to confirm you’re not a bot') || cleanError.includes("confirm you're not a bot")) {
      friendlyError = 'حماية يوتيوب (Bot Check): تطلب المنصة التحقق من الأمان على هذا الرابط حالياً. يرجى تجربة رابط آخر أو المحاولة لاحقاً.';
      errorType = 'bot_check';
    } else if (cleanError.includes('confirm your age') || cleanError.includes('age-restricted') || cleanError.includes('inappropriate for some users')) {
      friendlyError = 'فيديو مقيّد بالفئة العمرية (+18): هذا الفيديو مقيّد ويتطلب تسجيل الدخول على المنصة الأصلية.';
      errorType = 'age_restricted';
    } else if (cleanError.includes('Private video') || cleanError.includes('private')) {
      friendlyError = 'هذا الفيديو خاص (Private) ومحصور بأشخاص محددين فقط ولا يمكن الوصول إليه علناً.';
      errorType = 'private';
    } else if (cleanError.includes('Sign in') || cleanError.includes('login') || cleanError.includes('members-only')) {
      friendlyError = 'يتطلب هذا الفيديو تسجيل دخول على المنصة الأصلية ولا يمكن تنزيله علناً.';
      errorType = 'login_required';
    } else if (cleanError.includes('Unsupported URL') || cleanError.includes('is not a valid URL')) {
      friendlyError = 'الرابط غير مدعوم أو غير مباشر. يرجى التحقق من الرابط.';
      errorType = 'unsupported';
    }

    return res.status(422).json({
      error: friendlyError,
      errorType,
      rawError: cleanError || 'Extraction failed'
    });
  }

    try {
      // Find the JSON block
      const jsonStart = stdoutData.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON output found');
      }
      const parsed = JSON.parse(stdoutData.slice(jsonStart));

      // Build available quality options
      const rawFormats = Array.isArray(parsed.formats) ? parsed.formats : [];
      const heights = new Set<number>();
      let hasAudio = false;

      rawFormats.forEach((f: any) => {
        if (f.height && typeof f.height === 'number') {
          heights.add(f.height);
        }
        if (f.acodec && f.acodec !== 'none') {
          hasAudio = true;
        }
      });

      const sortedHeights = Array.from(heights).sort((a, b) => b - a);

      const availableQualities: any[] = [
        {
          resolution: 'best',
          label: 'أفضل جودة متاحة (Best Quality)',
          ext: 'mp4',
          type: 'video',
          approxSize: parsed.filesize ? `${(parsed.filesize / (1024 * 1024)).toFixed(1)} MB` : undefined
        }
      ];

      // Standard quality tiers if video has them or higher
      const standardResolutions = [
        { h: 2160, label: '4K Ultra HD (2160p)' },
        { h: 1440, label: '2K Quad HD (1440p)' },
        { h: 1080, label: 'Full HD (1080p)' },
        { h: 720, label: 'HD (720p)' },
        { h: 480, label: 'SD (480p)' },
        { h: 360, label: 'خفيف (360p)' }
      ];

      standardResolutions.forEach((tier) => {
        if (sortedHeights.some((h) => h >= tier.h)) {
          availableQualities.push({
            resolution: `${tier.h}`,
            label: tier.label,
            ext: 'mp4',
            type: 'video'
          });
        }
      });

      // Audio Options
      availableQualities.push(
        {
          resolution: 'mp3-320',
          label: 'ملف صوتي عالي النقاء MP3 (High Quality)',
          ext: 'mp3',
          type: 'audio'
        },
        {
          resolution: 'm4a',
          label: 'ملف صوتي نقي M4A / AAC',
          ext: 'm4a',
          type: 'audio'
        }
      );

      // Best thumbnail
      let bestThumb = parsed.thumbnail || '';
      if (Array.isArray(parsed.thumbnails) && parsed.thumbnails.length > 0) {
        const last = parsed.thumbnails[parsed.thumbnails.length - 1];
        if (last && last.url) bestThumb = last.url;
      }

      const videoInfo = {
        id: parsed.id || crypto.randomUUID(),
        url: cleanUrl,
        title: parsed.title || 'فيديو بدون عنوان',
        description: parsed.description ? parsed.description.slice(0, 250) : '',
        thumbnail: bestThumb,
        duration: parsed.duration || 0,
        durationFormatted: formatDuration(parsed.duration || 0),
        uploader: parsed.uploader || parsed.channel || parsed.creator || 'غير محدد',
        uploaderUrl: parsed.uploader_url || parsed.channel_url || '',
        viewCount: parsed.view_count || null,
        extractor: parsed.extractor_key || parsed.extractor || 'Web',
        availableQualities
      };

      return res.json(videoInfo);
    } catch (parseErr: any) {
      return res.status(500).json({
        error: 'حدث خطأ أثناء معالجة بيانات الفيديو.',
        details: parseErr?.message
      });
    }
});

// 2. Start download job
app.post('/api/download/start', (req, res) => {
  const { url, type = 'video', quality = 'best', title } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'الرابط مطلوب للتحميل' });
  }

  const isYoutube = /youtube\.com|youtu\.be/i.test(url);
  const jobId = crypto.randomUUID();
  const cleanTitle = sanitizeFilename(title || 'video');
  const ext = type === 'audio' ? (quality === 'm4a' ? 'm4a' : 'mp3') : 'mp4';
  const outTemplate = path.join(DOWNLOADS_DIR, `${jobId}.%(ext)s`);

  const job: ServerJob = {
    id: jobId,
    url,
    title: cleanTitle,
    type,
    quality,
    status: 'downloading',
    progress: 0,
    speed: '',
    eta: '',
    totalSize: '',
    filename: `${cleanTitle}.${ext}`,
    createdAt: Date.now()
  };

  jobs.set(jobId, job);

  const ytDlp = getYtDlpPath();
  const args: string[] = [
    ...getBaseYtDlpArgs(),
    '--newline'
  ];

  if (isYoutube) {
    args.push('--extractor-args', 'youtube:player_client=tv,web');
  }

  if (type === 'audio') {
    if (quality === 'm4a') {
      args.push('-x', '--audio-format', 'm4a', '-o', outTemplate, url);
    } else {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0', '-o', outTemplate, url);
    }
  } else {
    // Video: Use robust format selector that handles combined streams, separate streams, and fallback
    let formatArg = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best';
    if (quality !== 'best') {
      const h = parseInt(quality, 10);
      if (!isNaN(h)) {
        formatArg = `bestvideo[height<=${h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
      }
    }
    args.push('-f', formatArg, '--merge-output-format', 'mp4', '-o', outTemplate, url);
  }

  const process_ = spawn(ytDlp, args);
  let stderrBuffer = '';

  process_.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match yt-dlp download progress: [download]  42.5% of   15.40MiB at    5.12MiB/s ETA 00:03
      const progressMatch = trimmed.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([^\s]+)\s+at\s+([^\s]+)\s+ETA\s+([^\s]+)/);
      if (progressMatch) {
        job.progress = Math.min(Math.round(parseFloat(progressMatch[1])), 99);
        job.totalSize = progressMatch[2];
        job.speed = progressMatch[3];
        job.eta = progressMatch[4];
        job.status = 'downloading';
        continue;
      }

      // Match completion of download step before post-processing
      if (trimmed.includes('100% of') || trimmed.includes('[ExtractAudio]') || trimmed.includes('[Merger]')) {
        job.status = 'processing';
        job.progress = 95;
      }
    }
  });

  process_.stderr.on('data', (data) => {
    stderrBuffer += data.toString();
  });

  process_.on('close', (code) => {
    if (code === 0) {
      // Find the final file on disk matching jobId (ignoring .part or temporary files)
      try {
        const files = fs.readdirSync(DOWNLOADS_DIR);
        const matchingFile = files.find((f) => f.startsWith(jobId) && !f.endsWith('.part') && !f.endsWith('.ytdl'));

        if (matchingFile) {
          job.filePath = path.join(DOWNLOADS_DIR, matchingFile);
          const actualExt = path.extname(matchingFile).slice(1) || ext;
          job.filename = `${cleanTitle}.${actualExt}`;
          job.status = 'completed';
          job.progress = 100;
          job.completedAt = Date.now();
        } else {
          job.status = 'error';
          job.error = 'لم يتم العثور على الملف بعد الانتهاء من التحميل.';
        }
      } catch (err: any) {
        job.status = 'error';
        job.error = 'خطأ في قراءة ملف التنزيل.';
      }
    } else {
      job.status = 'error';
      const cleanErr = stderrBuffer.replace(/Deprecated Feature:.*?\n/g, '').trim();
      job.error = cleanErr || 'فشل تحميل الفيديو. يرجى التحقق من الرابط والمحاولة مرة أخرى.';
    }
  });

  res.json({ jobId });
});

// 4. Check job status
app.get('/api/download/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'مهمة التحميل غير موجودة أو انتهت صلاحيتها' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    speed: job.speed,
    eta: job.eta,
    totalSize: job.totalSize,
    filename: job.filename,
    error: job.error,
    type: job.type,
    quality: job.quality,
    downloadUrl: job.status === 'completed' ? `/api/download/file/${job.id}` : undefined
  });
});

// 5. Download the finished file
app.get('/api/download/file/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).json({ error: 'الملف غير موجود أو انتهت صلاحيته' });
  }

  const filename = job.filename || 'download.mp4';
  const encodedFilename = encodeURIComponent(filename);

  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
  res.download(job.filePath, filename, (err) => {
    if (err) {
      console.error('Error serving file:', err);
    }
  });
});

// Automatic cleanup every 15 minutes for files older than 30 minutes
setInterval(() => {
  try {
    const now = Date.now();
    const files = fs.readdirSync(DOWNLOADS_DIR);
    for (const file of files) {
      const fp = path.join(DOWNLOADS_DIR, file);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 30 * 60 * 1000) {
        fs.unlinkSync(fp);
      }
    }
    // Clean old jobs
    for (const [id, job] of jobs.entries()) {
      if (now - job.createdAt > 30 * 60 * 1000) {
        jobs.delete(id);
      }
    }
  } catch (err) {
    console.error('Error cleaning up downloads:', err);
  }
}, 15 * 60 * 1000);

// API 404 handler to ensure no /api calls ever return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'نقطة نهاية API غير موجودة.' });
});

// Global API error handler
app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error handler:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({
    error: 'حدث خطأ داخلي في معالجة طلب API.',
    details: err?.message || 'Server error'
  });
});

// Vite middleware / production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Only start standalone server when NOT running inside Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export default app;

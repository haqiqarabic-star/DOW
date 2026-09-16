import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { UrlInputBar } from './components/UrlInputBar';
import { VideoResultCard } from './components/VideoResultCard';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { PlatformGuide } from './components/PlatformGuide';
import { HistoryList } from './components/HistoryList';
import { BatchDownloader } from './components/BatchDownloader';
import { VercelDeployModal } from './components/VercelDeployModal';
import { safeFetchJson } from './lib/api';
import { VideoInfo, DownloadJob, HistoryItem } from './types';
import { AlertCircle, Sparkles, ShieldCheck, Zap, Download } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [activeJob, setActiveJob] = useState<DownloadJob | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('uvd_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uvd_history', JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // 1. Analyze video URL
  const handleAnalyze = async (customUrl?: string) => {
    const targetUrl = (customUrl || url).trim();
    if (!targetUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const { ok, data } = await safeFetchJson<VideoInfo & { error?: string }>('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (!ok) {
        throw new Error(data?.error || (lang === 'ar' ? 'تعذر استخراج معلومات الفيديو' : 'Failed to extract video info'));
      }

      setVideoInfo(data as VideoInfo);
      if (customUrl) {
        setUrl(customUrl);
      }
      setActiveTab('single');
    } catch (err: any) {
      setError(err?.message || (lang === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Start download
  const handleStartDownload = async (type: 'video' | 'audio', quality: string, formatId?: string) => {
    if (!videoInfo) return;

    setError(null);
    setShowProgressModal(true);

    const initialJob: DownloadJob = {
      id: 'temp',
      url: videoInfo.url,
      title: videoInfo.title,
      type,
      quality,
      status: 'downloading',
      progress: 5,
      createdAt: Date.now()
    };
    setActiveJob(initialJob);

    try {
      const { ok, data } = await safeFetchJson<{ jobId: string; error?: string }>('/api/download/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoInfo.url,
          type,
          quality,
          formatId,
          title: videoInfo.title
        })
      });

      if (!ok || !data?.jobId) {
        throw new Error(data?.error || (lang === 'ar' ? 'فشل بدء التنزيل' : 'Failed to start download'));
      }

      const realJobId = data.jobId;
      setActiveJob((prev) => (prev ? { ...prev, id: realJobId } : null));

      // Poll status every 1 second
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const { ok: isStatusOk, data: jobData } = await safeFetchJson<DownloadJob>(`/api/download/status/${realJobId}`);
          if (!isStatusOk || !jobData) return;

          setActiveJob(jobData);

          if (jobData.status === 'completed' || jobData.status === 'error') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

            if (jobData.status === 'completed') {
              // Add to history
              setHistory((prev) => {
                const filtered = prev.filter((item) => item.url !== videoInfo.url);
                const newItem: HistoryItem = {
                  id: jobData.id,
                  url: videoInfo.url,
                  title: videoInfo.title,
                  thumbnail: videoInfo.thumbnail,
                  duration: videoInfo.durationFormatted,
                  extractor: videoInfo.extractor,
                  downloadedAt: Date.now(),
                  type,
                  quality
                };
                return [newItem, ...filtered].slice(0, 30);
              });

              // Trigger download
              if (jobData.downloadUrl) {
                window.location.href = jobData.downloadUrl;
              }
            }
          }
        } catch {
          // ignore transient polling errors
        }
      }, 1000);
    } catch (err: any) {
      setActiveJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              error: err?.message || (lang === 'ar' ? 'تعذر بدء التنزيل' : 'Failed to start download')
            }
          : null
      );
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('uvd_history');
    } catch {
      // ignore
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        onOpenVercelModal={() => setShowVercelModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Error Alert if any */}
        {error && (
          <div className="w-full bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/30">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{isAr ? 'تنبيه: ' : 'Notice: '}</span>
                {error}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-500/20 transition-colors"
              >
                {isAr ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Single Video Downloader */}
        {activeTab === 'single' && (
          <>
            <UrlInputBar
              url={url}
              setUrl={setUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              lang={lang}
            />

            {/* Analyzed Video Result Card */}
            {videoInfo && (
              <VideoResultCard
                info={videoInfo}
                onDownload={handleStartDownload}
                lang={lang}
              />
            )}

            {/* Supported Platforms Guide */}
            <PlatformGuide lang={lang} onSelectSample={handleAnalyze} />
          </>
        )}

        {/* Tab 2: Batch Links Downloader */}
        {activeTab === 'batch' && (
          <BatchDownloader
            onAnalyzeUrl={(link) => {
              setUrl(link);
              handleAnalyze(link);
            }}
            lang={lang}
          />
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <HistoryList
            history={history}
            onSelectUrl={(link) => {
              setUrl(link);
              handleAnalyze(link);
            }}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            lang={lang}
          />
        )}

        {/* Feature Highlights Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'تحميل مباشر فائق السرعة' : 'Blazing Fast Processing'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'خوادم معالجة قوية بدون إعلانات مزعجة' : 'Direct processing with no popups or delays'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'دقة فائقة تصل إلى 4K' : 'Full HD & 4K Quality'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'دمج مسارات الصوت والصورة تلقائياً' : 'Automatic video & audio merging'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'آمن ومجاني 100%' : '100% Free & Safe'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'حماية تامة لخصوصيتك وحذف الملفات المؤقتة' : 'Automatic cleanup of temporary files'}
              </p>
            </div>
          </div>
        </section>
        {/* Vercel & GitHub Deploy CTA Banner */}
        <section className="w-full bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5 text-center sm:text-start">
            <div className="w-12 h-12 rounded-xl bg-black border border-slate-700 text-white flex items-center justify-center shrink-0 text-2xl font-bold shadow-lg">
              ▲
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>{isAr ? 'جاهز للنشر على Vercel عبر GitHub' : 'Ready to Deploy on Vercel via GitHub'}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">vercel.json</span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {isAr
                  ? 'تم تجهيز ملفات vercel.json و Serverless API لتشغيل التطبيق مباشرة على Vercel بنقرة واحدة.'
                  : 'Pre-configured with vercel.json & Serverless API for one-click deployment on Vercel.'}
              </p>
            </div>
          </div>
          <button
            id="vercel-cta-btn"
            onClick={() => setShowVercelModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 whitespace-nowrap flex items-center gap-2"
          >
            <span>▲</span>
            <span>{isAr ? 'عرض خطوات النشر على Vercel' : 'View Vercel Deploy Guide'}</span>
          </button>
        </section>
      </main>

      {/* Real-time Download Progress Modal */}
      {showProgressModal && (
        <DownloadProgressModal
          job={activeJob}
          onClose={() => setShowProgressModal(false)}
          lang={lang}
        />
      )}

      {/* Vercel & GitHub Deploy Modal */}
      <VercelDeployModal
        isOpen={showVercelModal}
        onClose={() => setShowVercelModal(false)}
        lang={lang}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {isAr
              ? 'Universal Video Downloader © 2026 — أداة مفتوحة لتحميل المحتوى للاستخدام الشخصي'
              : 'Universal Video Downloader © 2026 — Personal media backup & downloader'}
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>MP4 / MP3 / WebM</span>
            <span>•</span>
            <span>FFmpeg Ready</span>
            <span>•</span>
            <span>1000+ Extractor engines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

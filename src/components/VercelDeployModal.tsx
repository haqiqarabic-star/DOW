import React, { useState } from 'react';
import {
  GitBranch,
  ExternalLink,
  Check,
  Copy,
  X,
  AlertTriangle,
  FileCode,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Info,
  Server
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'guide' | 'config' | 'git'>('guide');
  const [copied, setCopied] = useState<string | null>(null);

  const vercelJsonContent = `{
  "version": 2,
  "framework": "vite",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const gitCommands = `# 1. تهيئة المستودع وإضافة الملفات
git init
git add .
git commit -m "Initial commit: Universal Video Downloader"

# 2. ربط مستودع GitHub الخاص بك
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-black border border-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            ▲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isAr ? 'النشر عبر Vercel و GitHub' : 'Deploy to Vercel & GitHub'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                {isAr ? 'جاهز بالكامل' : 'Pre-configured'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تم تجهيز ملفات vercel.json و api/index.ts لدعم النشر المباشر'
                : 'vercel.json & api/index.ts configured for seamless Vercel deployment'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>{isAr ? 'خطوات النشر (3 خطوات)' : 'Deploy Steps'}</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>vercel.json</span>
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'git'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>{isAr ? 'أوامر Git' : 'Git Commands'}</span>
          </button>
        </div>

        {/* Tab 1: Step by Step Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {isAr ? 'تصدير المشروع إلى GitHub' : 'Export to GitHub'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr
                      ? 'يمكنك التصدير مباشرة من زر القائمة (Menu) أعلى التطبيق في Google AI Studio واختيار "Export to GitHub"، أو رفع الملفات يدوياً عبر أوامر Git.'
                      : 'You can export directly via the AI Studio menu > "Export to GitHub", or push the files using Git commands.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {isAr ? 'استيراد المشروع في Vercel' : 'Import Project in Vercel'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr
                      ? 'افتح حسابك على vercel.com واضغط على "Add New Project" ثم اختر مستودع GitHub الخاص بهذا المشروع.'
                      : 'Open vercel.com, click "Add New Project", and select your GitHub repository.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">
                    {isAr ? 'الضغط على Deploy مباشرة' : 'Click Deploy'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr
                      ? 'لن تحتاج لتعديل أي إعدادات بناء (Framework Preset / Build Command)، لأن ملف vercel.json الذي تم إنشاؤه مسبقاً يتكفل بربط الواجهة بمسارات الـ API تلقائياً!'
                      : 'No build setting changes are required. The pre-configured vercel.json routes both the frontend and API functions automatically.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Note about Vercel Serverless Limits */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>{isAr ? 'معلومة تقنية هامة حول بيئة Vercel:' : 'Important note regarding Vercel:'}</strong>
                <p className="mt-1 text-slate-300">
                  {isAr
                    ? 'دوال Vercel في الخطة المجانية (Serverless Functions) لها مهلة أقصاها 10 إلى 15 ثانية. عمليات فحص الروابط (Info) وتنزيل المقاطع الصوتية تعمل بسرعة. إذا كنت بحاجة لتحميل ملفات فيديو ضخمة جداً (أكثر من 500 ميغابايت) تستغرق وقتاً طويلاً للدمج، يفضل دائماً تشغيل الخادم على Docker / VPS أو منصات مثل Cloud Run و Render.'
                    : 'Free-tier Vercel functions have a 10-15s timeout limit. Link inspection and audio extraction work fast. For heavy, multi-minute 4K video downloads, persistent server environments (Docker/Cloud Run/VPS) are recommended.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: vercel.json */}
        {activeTab === 'config' && (
          <div>
            <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-xl border border-b-0 border-slate-800 text-xs text-slate-400 font-mono">
              <span>vercel.json</span>
              <button
                onClick={() => handleCopy(vercelJsonContent, 'vercel')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                {copied === 'vercel' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="w-full bg-slate-950 p-4 rounded-b-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto" dir="ltr">
              {vercelJsonContent}
            </pre>
            <p className="text-xs text-slate-400 mt-2">
              {isAr
                ? '✅ هذا الملف موجود بالفعل داخل المشروع ومجهز لتوجيه مسارات /api/* إلى دالة السيرفرليس.'
                : '✅ This file already exists in the root of your project.'}
            </p>
          </div>
        )}

        {/* Tab 3: Git Commands */}
        {activeTab === 'git' && (
          <div>
            <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-xl border border-b-0 border-slate-800 text-xs text-slate-400 font-mono">
              <span>Terminal / Bash</span>
              <button
                onClick={() => handleCopy(gitCommands, 'git')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                {copied === 'git' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تم النسخ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="w-full bg-slate-950 p-4 rounded-b-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed" dir="ltr">
              {gitCommands}
            </pre>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <span>{isAr ? 'فتح لوحة تحكم Vercel' : 'Open Vercel Dashboard'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

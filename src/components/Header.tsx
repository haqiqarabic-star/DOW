import React from 'react';
import { Download, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  activeTab: 'single' | 'batch' | 'history';
  setActiveTab: (tab: 'single' | 'batch' | 'history') => void;
  historyCount: number;
  onOpenVercelModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeTab,
  setActiveTab,
  historyCount,
  onOpenVercelModal
}) => {
  const isAr = lang === 'ar';

  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                {isAr ? 'محمل الفيديوهات الشامل' : 'Universal Video Downloader'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {isAr ? 'المحرك جاهز' : 'Engine Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تحميل الفيديوهات والمقاطع الصوتية من جميع المواقع بجودة عالية'
                : 'Download videos and audio from any website in HD quality'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
            <button
              id="tab-single-btn"
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'تحميل فردي' : 'Single Video'}
            </button>
            <button
              id="tab-batch-btn"
              onClick={() => setActiveTab('batch')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'batch'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'تحميل متعدد' : 'Batch Links'}
            </button>
            <button
              id="tab-history-btn"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{isAr ? 'السجل' : 'History'}</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/40 text-indigo-200">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Vercel & GitHub Deploy button */}
          <button
            id="vercel-deploy-btn"
            onClick={onOpenVercelModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 transition-all hover:scale-[1.02]"
            title={isAr ? 'نشر التطبيق على Vercel عبر GitHub' : 'Deploy to Vercel via GitHub'}
          >
            <span className="text-xs font-bold">▲</span>
            <span>{isAr ? 'Vercel / GitHub' : 'Vercel / GitHub'}</span>
          </button>

          {/* Language Switch */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-300 transition-colors"
            title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

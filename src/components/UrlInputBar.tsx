import React, { useState } from 'react';
import { Search, ClipboardPaste, X, Loader2, Sparkles, Link2 } from 'lucide-react';
import { SAMPLE_VIDEOS } from '../data/platforms';

interface UrlInputBarProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: (customUrl?: string) => void;
  isLoading: boolean;
  lang: 'ar' | 'en';
}

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  url,
  setUrl,
  onAnalyze,
  isLoading,
  lang
}) => {
  const isAr = lang === 'ar';
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrl(text.trim());
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      // Fallback if permission blocked
      const input = document.getElementById('video-url-input') as HTMLInputElement;
      if (input) input.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim() && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl shadow-slate-950/40">
      <div className="mb-3 flex items-center justify-between">
        <label
          htmlFor="video-url-input"
          className="text-sm font-semibold text-slate-200 flex items-center gap-2"
        >
          <Link2 className="w-4 h-4 text-indigo-400" />
          {isAr ? 'ضع رابط الفيديو أو المقطع هنا:' : 'Paste video or audio link here:'}
        </label>
        <span className="text-xs text-slate-400">
          {isAr ? 'يدعم يوتيوب، تيك توك، فيسبوك، انستغرام، وغيرها' : 'YouTube, TikTok, Instagram, FB & more'}
        </span>
      </div>

      {/* Input box with buttons */}
      <div className="relative flex items-center">
        <input
          id="video-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isAr
              ? 'https://www.youtube.com/watch?v=... أو https://vm.tiktok.com/...'
              : 'https://www.youtube.com/watch?v=... or https://tiktok.com/@.../video/...'
          }
          className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-28 sm:pr-36 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 focus:border-indigo-500 transition-all font-mono"
          dir="ltr"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {url ? (
            <button
              id="clear-url-btn"
              onClick={() => setUrl('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isAr ? 'مسح الرابط' : 'Clear URL'}
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="paste-url-btn"
              onClick={handlePaste}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                pasteSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              type="button"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {pasteSuccess ? (isAr ? 'تم اللصق!' : 'Pasted!') : isAr ? 'لصق' : 'Paste'}
              </span>
            </button>
          )}

          <button
            id="analyze-video-btn"
            onClick={() => onAnalyze()}
            disabled={!url.trim() || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md ${
              !url.trim() || isLoading
                ? 'bg-indigo-600/40 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isAr ? 'جاري الفحص...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{isAr ? 'تحليل الرابط' : 'Fetch Video'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Test Samples */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isAr ? 'روابط تجريبية سريعة:' : 'Quick test samples:'}
        </span>
        {SAMPLE_VIDEOS.map((sample, idx) => (
          <button
            key={idx}
            id={`sample-btn-${idx}`}
            onClick={() => {
              setUrl(sample.url);
              onAnalyze(sample.url);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            type="button"
          >
            <span>{isAr ? sample.titleAr : sample.title}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
              {isAr ? sample.platformAr : sample.platform}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

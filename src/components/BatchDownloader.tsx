import React, { useState } from 'react';
import { ListPlus, Play, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';

interface BatchDownloaderProps {
  onAnalyzeUrl: (url: string) => void;
  lang: 'ar' | 'en';
}

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({
  onAnalyzeUrl,
  lang
}) => {
  const isAr = lang === 'ar';
  const [inputText, setInputText] = useState('');

  const links = inputText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http://') || l.startsWith('https://'));

  const handleClear = () => setInputText('');

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ListPlus className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            {isAr ? 'التحميل المتعدد (روابط متعددة دفعة واحدة)' : 'Batch Links Downloader'}
          </h3>
        </div>
        {links.length > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            {links.length} {isAr ? 'روابط مكتشفة' : 'links detected'}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-3">
        {isAr
          ? 'ضع الروابط في الصندوق أدناه، رابط واحد في كل سطر. يمكنك بعد ذلك فحص كل رابط وتحميله بسرعة:'
          : 'Paste multiple video links below, one per line, then click to inspect each link:'}
      </p>

      <textarea
        id="batch-links-textarea"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={5}
        placeholder={
          isAr
            ? 'https://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@.../video/...\nhttps://www.instagram.com/reel/...'
            : 'https://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@.../video/...\nhttps://www.instagram.com/reel/...'
        }
        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 transition-all mb-3"
        dir="ltr"
      />

      <div className="flex items-center justify-between">
        <button
          id="clear-batch-btn"
          onClick={handleClear}
          disabled={!inputText}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {isAr ? 'مسح القائمة' : 'Clear List'}
        </button>

        <div className="text-xs text-slate-400">
          {links.length} {isAr ? 'رابط صالح' : 'valid links'}
        </div>
      </div>

      {links.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-300">
            {isAr ? 'قائمة الروابط الجاهزة للفحص والتحميل:' : 'Detected URLs Ready to Inspect:'}
          </h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {links.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono"
              >
                <span className="truncate max-w-[70%]" dir="ltr">{link}</span>
                <button
                  id={`batch-inspect-btn-${idx}`}
                  onClick={() => onAnalyzeUrl(link)}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isAr ? 'فحص وتحميل' : 'Inspect'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, ArrowUpRight, Film, Music, Download } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  lang: 'ar' | 'en';
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectUrl,
  onClearHistory,
  onDeleteItem,
  lang
}) => {
  const isAr = lang === 'ar';

  if (history.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 text-slate-600 stroke-1" />
        <h3 className="text-sm font-semibold text-slate-300 mb-1">
          {isAr ? 'لا يوجد سجل تنزيلات حتى الآن' : 'No Download History Yet'}
        </h3>
        <p className="text-xs text-slate-500">
          {isAr
            ? 'ستظهر هنا الفيديوهات والمقاطع التي قمت بفحصها أو تنزيلها لسهولة الرجوع إليها'
            : 'Videos and audios you inspect or download will appear here for fast access'}
        </p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">
            {isAr ? 'سجل التنزيلات والعمليات السابقة' : 'Download History'}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">
            {history.length}
          </span>
        </div>

        <button
          id="clear-all-history-btn"
          onClick={onClearHistory}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors border border-rose-500/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'مسح السجل' : 'Clear All'}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-14 h-10 object-cover rounded-lg border border-slate-800 shrink-0"
                />
              ) : (
                <div className="w-14 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-slate-500">
                  <Film className="w-4 h-4" />
                </div>
              )}

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {item.extractor}
                  </span>
                  <span>•</span>
                  <span>{formatDate(item.downloadedAt)}</span>
                  {item.duration && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{item.duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id={`history-reanalyze-${item.id}`}
                onClick={() => onSelectUrl(item.url)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs transition-colors flex items-center gap-1"
                title={isAr ? 'تحميل مجدداً' : 'Analyze again'}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'إعادة الفحص' : 'Re-check'}</span>
              </button>
              <button
                id={`history-delete-${item.id}`}
                onClick={() => onDeleteItem(item.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title={isAr ? 'حذف من السجل' : 'Delete'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

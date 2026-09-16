import React from 'react';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileVideo,
  FileAudio,
  HardDrive,
  Gauge,
  Clock
} from 'lucide-react';
import { DownloadJob } from '../types';

interface DownloadProgressModalProps {
  job: DownloadJob | null;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  job,
  onClose,
  lang
}) => {
  if (!job) return null;
  const isAr = lang === 'ar';

  const isCompleted = job.status === 'completed';
  const isError = job.status === 'error';
  const isProcessing = job.status === 'processing';

  const handleSaveFile = () => {
    if (job.downloadUrl) {
      window.location.href = job.downloadUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 relative">
        {/* Close button */}
        <button
          id="close-progress-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                : isError
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : isError ? (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            ) : job.type === 'audio' ? (
              <FileAudio className="w-6 h-6" />
            ) : (
              <FileVideo className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-white leading-snug truncate">
              {isCompleted
                ? isAr
                  ? 'اكتمل التحميل بنجاح!'
                  : 'Download Complete!'
                : isError
                ? isAr
                  ? 'تعذر إكمال التحميل'
                  : 'Download Failed'
                : isProcessing
                ? isAr
                  ? 'جاري دمج ومعالجة الملف...'
                  : 'Processing & Merging...'
                : isAr
                ? 'جاري تحميل الفيديو...'
                : 'Downloading Video...'}
            </h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{job.title}</p>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        {!isError && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-slate-300">
                {isCompleted
                  ? isAr
                    ? '100% تم إعداد الملف'
                    : '100% Ready'
                  : isProcessing
                  ? isAr
                    ? 'تحويل وترميز الصوت/الفيديو...'
                    : 'Encoding format...'
                  : isAr
                  ? 'التقدم الحالي'
                  : 'Progress'}
              </span>
              <span className="font-mono text-indigo-400 font-bold">{job.progress}%</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isCompleted
                    ? 'bg-emerald-500'
                    : isProcessing
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${Math.max(job.progress, 5)}%` }}
              />
            </div>
          </div>
        )}

        {/* Dynamic Telemetry / Stats */}
        {!isCompleted && !isError && (
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-5 text-center">
            <div>
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" />
                {isAr ? 'السرعة' : 'Speed'}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                {job.speed || '...'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3 text-indigo-400" />
                {isAr ? 'الحجم' : 'Size'}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                {job.totalSize || '...'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                {isAr ? 'المتبقي' : 'ETA'}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200 mt-0.5 block">
                {job.eta || '...'}
              </span>
            </div>
          </div>
        )}

        {/* Error message if any */}
        {isError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs leading-relaxed mb-5">
            {job.error || (isAr ? 'حدث خطأ غير متوقع أثناء التحميل' : 'An error occurred during download')}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {isCompleted ? (
            <button
              id="save-downloaded-file-btn"
              onClick={handleSaveFile}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'حفظ الملف على جهازك الآن' : 'Save File to Device Now'}</span>
            </button>
          ) : isError ? (
            <button
              id="dismiss-error-btn"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>{isAr ? 'يرجى الانتظار ثوانٍ قليلة...' : 'Please wait a moment...'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

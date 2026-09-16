import React, { useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Music,
  Video,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Clock,
  User,
  Check,
  Copy,
  Sparkles,
  Film
} from 'lucide-react';
import { VideoInfo } from '../types';

interface VideoResultCardProps {
  info: VideoInfo;
  onDownload: (type: 'video' | 'audio', quality: string, formatId?: string) => void;
  lang: 'ar' | 'en';
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({
  info,
  onDownload,
  lang
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'thumbnail'>('video');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoQualities = info.availableQualities.filter((q) => q.type === 'video');
  const audioQualities = info.availableQualities.filter((q) => q.type === 'audio');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(info.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatViews = (views?: number) => {
    if (!views) return null;
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
  };

  return (
    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-slate-950/60">
      {/* Top Banner / Video Overview */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start border-b border-slate-800/80">
        {/* Thumbnail / Preview Player */}
        <div className="md:col-span-5 relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
          {showPreview ? (
            <video
              src={info.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={info.thumbnail}
            >
              {isAr ? 'المتصفح لا يدعم تشغيل هذا الرابط مباشرة' : 'Browser cannot play this video link directly'}
            </video>
          ) : (
            <>
              {info.thumbnail ? (
                <img
                  src={info.thumbnail}
                  alt={info.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-slate-500">
                  <Film className="w-12 h-12 mb-2 stroke-1" />
                  <span className="text-xs">{isAr ? 'معاينة غير متوفرة' : 'Preview Unavailable'}</span>
                </div>
              )}

              {/* Duration badge */}
              {info.durationFormatted && (
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-mono text-white flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{info.durationFormatted}</span>
                </div>
              )}

              {/* Play preview overlay button if direct or previewable */}
              <button
                id="preview-video-btn"
                onClick={() => setShowPreview(true)}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg shadow-indigo-900/50 hover:scale-110 active:scale-95 transition-all opacity-90 group-hover:opacity-100"
                title={isAr ? 'معاينة الفيديو' : 'Preview Video'}
              >
                <Play className="w-5 h-5 ml-0.5 fill-white" />
              </button>
            </>
          )}
        </div>

        {/* Video Info Details */}
        <div className="md:col-span-7 flex flex-col justify-between h-full">
          <div>
            {/* Platform & Extractor Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {info.extractor}
              </span>
              {info.viewCount ? (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{formatViews(info.viewCount)} {isAr ? 'مشاهدة' : 'views'}</span>
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug mb-3">
              {info.title}
            </h2>

            {/* Author / Channel */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 mb-4">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-slate-200">{info.uploader}</span>
            </div>

            {/* Description Snippet */}
            {info.description && (
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                {info.description}
              </p>
            )}
          </div>

          {/* Quick link actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              id="copy-video-link-btn"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isAr ? 'تم نسخ الرابط!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy link')}</span>
            </button>
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isAr ? 'فتح المصدر الأصلي' : 'Open original page'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quality Selection Tabs & Downloads Section */}
      <div className="p-5 sm:p-6 bg-slate-950/40">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            {isAr ? 'خيارات وصيغ التحميل المتاحة:' : 'Available Download Formats:'}
          </h3>

          {/* Format Tabs */}
          <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              id="tab-format-video"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isAr ? 'فيديو (MP4)' : 'Video (MP4)'}</span>
            </button>
            <button
              id="tab-format-audio"
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                activeTab === 'audio'
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isAr ? 'صوت (MP3/M4A)' : 'Audio (MP3)'}</span>
            </button>
            {info.thumbnail && (
              <button
                id="tab-format-thumbnail"
                onClick={() => setActiveTab('thumbnail')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
                  activeTab === 'thumbnail'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{isAr ? 'الغلاف (HD)' : 'Cover Image'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Formats List */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {videoQualities.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all hover:shadow-lg hover:shadow-indigo-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                        {item.label}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {item.ext}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.approxSize || (isAr ? 'دمج صوت وفيديو فائق النقاء' : 'High quality video + audio')}
                    </p>
                  </div>
                </div>

                <button
                  id={`download-video-${item.resolution}`}
                  onClick={() => onDownload('video', item.resolution, item.formatId)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل' : 'Download'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Audio Formats List */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {audioQualities.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all hover:shadow-lg hover:shadow-cyan-950/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-600/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100">
                        {item.label}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {item.ext}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAr ? 'استخراج المقطع الصوتي فقط' : 'Audio track only extraction'}
                    </p>
                  </div>
                </div>

                <button
                  id={`download-audio-${item.resolution}`}
                  onClick={() => onDownload('audio', item.resolution, item.formatId)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل الصوت' : 'Download MP3'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Thumbnail Direct Download */}
        {activeTab === 'thumbnail' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={info.thumbnail}
                alt="Thumbnail"
                referrerPolicy="no-referrer"
                className="w-20 h-14 object-cover rounded-lg border border-slate-700"
              />
              <div>
                <h4 className="text-sm font-semibold text-slate-100">
                  {isAr ? 'صورة الغلاف الرسمية عالية الجودة' : 'Official High-Definition Cover'}
                </h4>
                <p className="text-xs text-slate-400">
                  {isAr ? 'صورة مصغرة أصلية بصيغة JPG أو WebP' : 'Original resolution preview cover image'}
                </p>
              </div>
            </div>

            <a
              href={info.thumbnail}
              target="_blank"
              rel="noopener noreferrer"
              download={`${info.title}_thumbnail.jpg`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل الصورة' : 'Save Image'}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

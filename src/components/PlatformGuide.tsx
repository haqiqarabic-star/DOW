import React from 'react';
import {
  Youtube,
  Video,
  Instagram,
  Twitter,
  Facebook,
  Share2,
  Pin,
  DownloadCloud,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SUPPORTED_PLATFORMS } from '../data/platforms';

interface PlatformGuideProps {
  lang: 'ar' | 'en';
  onSelectSample?: (url: string) => void;
}

export const PlatformGuide: React.FC<PlatformGuideProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const getPlatformIcon = (name: string) => {
    switch (name) {
      case 'YouTube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'TikTok':
        return <Video className="w-5 h-5 text-cyan-400" />;
      case 'Instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'Twitter / X':
        return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'Facebook':
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'Reddit':
        return <Share2 className="w-5 h-5 text-orange-500" />;
      case 'Pinterest':
        return <Pin className="w-5 h-5 text-rose-500" />;
      default:
        return <DownloadCloud className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-400" />
          {isAr ? 'المنصات المدعومة وطريقة النسخ:' : 'Supported Platforms & Guide:'}
        </h3>
        <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {isAr ? 'أكثر من 1000+ موقع ومنصة' : '1000+ websites supported'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SUPPORTED_PLATFORMS.map((platform, idx) => (
          <div
            key={idx}
            className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800">
                    {getPlatformIcon(platform.name)}
                  </div>
                  <span className="text-xs font-bold text-white">
                    {isAr ? platform.nameAr : platform.name}
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {platform.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr ? platform.tipAr : platform.tipEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

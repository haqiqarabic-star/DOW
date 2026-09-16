import { SupportedPlatform } from '../types';

export const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  {
    name: 'YouTube',
    nameAr: 'يوتيوب',
    icon: 'Youtube',
    domain: 'youtube.com',
    color: '#FF0000',
    badge: 'فيديوهات & شورتس & صوتيات',
    tipAr: 'انسخ رابط الفيديو أو الشورتس (Shorts) مباشرة من تطبيق أو موقع يوتيوب',
    tipEn: 'Copy video or Shorts link directly from YouTube app or website'
  },
  {
    name: 'TikTok',
    nameAr: 'تيك توك',
    icon: 'Video',
    domain: 'tiktok.com',
    color: '#00F2FE',
    badge: 'بدون علامة مائية',
    tipAr: 'اضغط على زر المشاركة ثم "نسخ الرابط" لتحميل الفيديو بجودة نقية بدون شعار',
    tipEn: 'Click Share then "Copy Link" to download clean video without watermark'
  },
  {
    name: 'Instagram',
    nameAr: 'انستغرام',
    icon: 'Instagram',
    domain: 'instagram.com',
    color: '#E1306C',
    badge: 'ريلز & بوستات & IGTV',
    tipAr: 'انسخ رابط أي ريلز (Reel) أو منشور فيديو لتحميله بدقة أصلية',
    tipEn: 'Copy any Reels or post video link to download in original high quality'
  },
  {
    name: 'Twitter / X',
    nameAr: 'تويتر / إكس',
    icon: 'Twitter',
    domain: 'twitter.com',
    color: '#1DA1F2',
    badge: 'تغريدات الفيديو & مقاطع البث',
    tipAr: 'انسخ رابط التغريدة التي تحتوي على فيديو أو مقطع GIF',
    tipEn: 'Copy the tweet URL containing the video or GIF clip'
  },
  {
    name: 'Facebook',
    nameAr: 'فيسبوك',
    icon: 'Facebook',
    domain: 'facebook.com',
    color: '#1877F2',
    badge: 'فيديوهات عامة & Watch',
    tipAr: 'انسخ رابط الفيديو من قائمة الخيارات في المنشور العام',
    tipEn: 'Copy the video link from options menu on public posts'
  },
  {
    name: 'Reddit',
    nameAr: 'ريديت',
    icon: 'Share2',
    domain: 'reddit.com',
    color: '#FF4500',
    badge: 'مقاطع مدمجة بالصوت',
    tipAr: 'يتم دمج مسار الصوت والصورة تلقائياً لتنزيل فيديو كامل عالي الدقة',
    tipEn: 'Video and audio tracks are automatically merged in high quality'
  },
  {
    name: 'Pinterest',
    nameAr: 'بينتريست',
    icon: 'Pin',
    domain: 'pinterest.com',
    color: '#E60023',
    badge: 'فيديوهات وبنس (Pins)',
    tipAr: 'انسخ رابط البن الذي يحتوي على فيديو لحفظه كملف MP4',
    tipEn: 'Copy any video Pin URL to save it directly as MP4'
  },
  {
    name: 'Direct Links',
    nameAr: 'روابط مباشرة',
    icon: 'DownloadCloud',
    domain: 'direct',
    color: '#10B981',
    badge: 'MP4 / WebM / M4A',
    tipAr: 'يدعم أي رابط مباشر لملف فيديو أو صوت من أي موقع على الويب',
    tipEn: 'Supports any direct video or audio URL from across the web'
  }
];

export const SAMPLE_VIDEOS = [
  {
    title: 'Big Buck Bunny (Sample HD Video)',
    titleAr: 'فيديو تجريبي: Big Buck Bunny (جودة عالية)',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    platform: 'Direct MP4',
    platformAr: 'رابط مباشر MP4'
  },
  {
    title: 'Elephants Dream (Open Movie Project)',
    titleAr: 'مشروع مفتوح: Elephants Dream (عالي الدقة)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    platform: 'Web Storage',
    platformAr: 'سيرفر تخزين سحابي'
  },
  {
    title: 'For Bigger Blazes (Sample MP4)',
    titleAr: 'فيديو تجريبي قصير (For Bigger Blazes)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    platform: 'Direct MP4',
    platformAr: 'رابط مباشر MP4'
  }
];

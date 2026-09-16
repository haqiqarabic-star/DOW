export interface VideoFormat {
  formatId: string;
  ext: string;
  resolution?: string;
  qualityLabel: string;
  filesize?: number;
  filesizeStr?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  isAudioOnly?: boolean;
  height?: number;
  width?: number;
  fps?: number;
}

export interface VideoInfo {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number; // in seconds
  durationFormatted: string;
  uploader?: string;
  uploaderUrl?: string;
  viewCount?: number;
  extractor: string;
  extractorKey: string;
  formats: VideoFormat[];
  availableQualities: {
    resolution: string;
    label: string;
    ext: string;
    approxSize?: string;
    formatId?: string;
    type: 'video' | 'audio';
  }[];
  thumbnailUrls?: string[];
}

export interface DownloadJob {
  id: string;
  url: string;
  title: string;
  status: 'queued' | 'downloading' | 'processing' | 'completed' | 'error';
  progress: number; // 0 - 100
  speed?: string;
  eta?: string;
  totalSize?: string;
  type: 'video' | 'audio';
  quality?: string;
  filename?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
  downloadUrl?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: string;
  extractor: string;
  downloadedAt: number;
  type: 'video' | 'audio';
  quality: string;
}

export interface SupportedPlatform {
  name: string;
  nameAr: string;
  icon: string;
  domain: string;
  color: string;
  badge: string;
  tipAr: string;
  tipEn: string;
}

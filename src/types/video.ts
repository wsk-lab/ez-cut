// 视频文件类型定义
export interface VideoFile {
  name: string;
  size: number;
  type: string;
  duration: number;
  url: string;
  lastModified: number;
}

// 剪辑范围类型
export interface CutRange {
  start: number;
  end: number;
}

// 导出选项类型
export interface ExportOptions {
  format: 'mp4' | 'mov' | 'webm' | 'avi' | 'mkv';
  quality: 'high' | 'medium' | 'low';
  qualityValue: number; // 1-100
  bitrate: string;
  includeAudio: boolean;
  resolution: string;
  fps: number;
}

// 处理模式类型
export type ProcessingMode = 'lossless' | 'smart';

// 播放状态类型
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
}

// 视频信息类型
export interface VideoInfo {
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
  audioCodec: string;
  duration: number;
  fileSize: number;
}

// 处理进度类型
export interface ProcessingProgress {
  isProcessing: boolean;
  progress: number; // 0-100
  currentOperation: string;
  estimatedTime: number; // 预估剩余时间(秒)
  speed: number; // 处理速度(MB/s)
}

// 应用设置类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  defaultExportFormat: ExportOptions['format'];
  defaultExportQuality: ExportOptions['quality'];
  autoPlay: boolean;
  showWatermark: boolean;
  maxRecentFiles: number;
}

// 快捷键配置类型
export interface ShortcutKeys {
  playPause: string;
  seekForward: string;
  seekBackward: string;
  setStart: string;
  setEnd: string;
  export: string;
  newProject: string;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// FFmpeg 命令结果类型
export interface FFmpegResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  duration: number;
  fileSize: number;
}

// 批量处理任务类型
export interface BatchTask {
  id: string;
  inputFile: File;
  outputPath: string;
  options: ExportOptions;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

// 平台预设类型
export interface PlatformPreset {
  name: string;
  displayName: string;
  options: ExportOptions;
  description: string;
  recommended: boolean;
}

// 历史记录类型
export interface HistoryRecord {
  id: string;
  inputFile: string;
  outputFile: string;
  cutRange: CutRange;
  exportOptions: ExportOptions;
  timestamp: number;
  fileSize: number;
  duration: number;
}

// 用户统计类型
export interface UserStats {
  totalVideosProcessed: number;
  totalProcessingTime: number;
  favoriteFormat: string;
  averageCutDuration: number;
  lastOperation: string;
}

// 导出预设类型
export const EXPORT_PRESETS = {
  'high': { 
    quality: 90, 
    bitrate: '8000k', 
    label: '高质量',
    description: '最佳画质，文件较大'
  },
  'medium': { 
    quality: 80, 
    bitrate: '4000k', 
    label: '平衡',
    description: '画质和文件大小的平衡'
  },
  'low': { 
    quality: 70, 
    bitrate: '2000k', 
    label: '快速',
    description: '快速处理，文件较小'
  }
} as const;

// 平台预设配置
export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  'default': {
    name: 'default',
    displayName: '通用设置',
    options: {
      format: 'mp4',
      quality: 'medium',
      qualityValue: 80,
      bitrate: '4000k',
      includeAudio: true,
      resolution: 'original',
      fps: 30
    },
    description: '适用于大多数场景',
    recommended: true
  },
  'tiktok': {
    name: 'tiktok',
    displayName: '抖音/抖音',
    options: {
      format: 'mp4',
      quality: 'high',
      qualityValue: 90,
      bitrate: '6000k',
      includeAudio: true,
      resolution: '1080x1920',
      fps: 30
    },
    description: '竖屏视频，适合短视频平台',
    recommended: true
  },
  'youtube': {
    name: 'youtube',
    displayName: 'YouTube',
    options: {
      format: 'mp4',
      quality: 'high',
      qualityValue: 90,
      bitrate: '8000k',
      includeAudio: true,
      resolution: '1920x1080',
      fps: 30
    },
    description: '高清横屏视频',
    recommended: true
  },
  'wechat': {
    name: 'wechat',
    displayName: '微信',
    options: {
      format: 'mp4',
      quality: 'medium',
      qualityValue: 75,
      bitrate: '2000k',
      includeAudio: true,
      resolution: '1280x720',
      fps: 25
    },
    description: '适合微信分享，文件较小',
    recommended: false
  },
  'bilibili': {
    name: 'bilibili',
    displayName: 'B站',
    options: {
      format: 'mp4',
      quality: 'high',
      qualityValue: 90,
      bitrate: '6000k',
      includeAudio: true,
      resolution: '1920x1080',
      fps: 60
    },
    description: '高帧率，适合游戏和动画',
    recommended: true
  }
} as const;

import { create } from 'zustand';
import { FastVideoCutter } from '../utils/ffmpegProcessor';

interface VideoState {
  // 视频数据
  currentVideo: File | null;
  videoUrl: string;
  duration: number;
  currentTime: number;

  // 播放状态
  isPlaying: boolean;
  playbackRate: number;

  // 剪辑范围
  startTime: number;
  endTime: number;

  // 处理状态
  isProcessing: boolean;
  progress: number;
  processingMessage: string;
  processingMode: 'lossless' | 'smart';

  // Actions
  loadVideo: (file: File) => Promise<void>;
  loadDemoVideo: () => Promise<void>;
  resetVideo: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  play: () => void;
  pause: () => void;
  setPlaybackRate: (rate: number) => void;
  setClipRange: (start: number, end: number) => void;
  setProcessingMode: (mode: 'lossless' | 'smart') => void;
  fastCut: () => Promise<Blob>;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideo: null,
  videoUrl: '',
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  startTime: 0,
  endTime: 30,
  isProcessing: false,
  progress: 0,
  processingMessage: '',
  processingMode: 'lossless',

  setProcessingMode: (mode: 'lossless' | 'smart') => set({ processingMode: mode }),

  loadVideo: async (file: File) => {
    const videoUrl = URL.createObjectURL(file);
    set({
      currentVideo: file,
      videoUrl,
      currentTime: 0,
      isPlaying: false,
      startTime: 0,
      endTime: 30,
      isProcessing: true,
      progress: 0,
      processingMessage: '正在解析视频信息...'
    });

    try {
      const cutter = FastVideoCutter.getInstance();
      const info = await cutter.getVideoInfo(file);
      set({
        duration: info.duration,
        endTime: Math.min(30, info.duration),
        isProcessing: false
      });
    } catch (error) {
      console.error('获取视频信息失败:', error);
      set({ isProcessing: false });
    }
  },

  loadDemoVideo: async () => {
    // 创建演示视频（实际项目中可以从服务器加载）
    const demoVideoUrl = 'https://example.com/demo-video.mp4';
    try {
      const response = await fetch(demoVideoUrl);
      const blob = await response.blob();
      const file = new File([blob], 'demo-video.mp4', { type: 'video/mp4' });
      await get().loadVideo(file);
    } catch (error) {
      console.log('演示视频加载失败，继续使用上传模式');
    }
  },

  resetVideo: () => {
    const { videoUrl } = get();
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    set({
      currentVideo: null,
      videoUrl: '',
      duration: 0,
      currentTime: 0,
      isPlaying: false,
      progress: 0
    });
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  setPlaybackRate: (rate: number) => set({ playbackRate: rate }),

  setClipRange: (start: number, end: number) => set({
    startTime: Math.max(0, start),
    endTime: Math.min(get().duration, end)
  }),

  fastCut: async (): Promise<Blob> => {
    const { currentVideo, startTime, endTime } = get();
    if (!currentVideo) throw new Error('没有可用的视频文件');

    set({ isProcessing: true, progress: 0, processingMessage: '正在准备剪辑任务...' });

    try {
      const cutter = FastVideoCutter.getInstance();

      // 设置真实进度回调
      cutter.setProgressCallback((progress) => {
        set({ progress });
      });

      set({ processingMessage: '正在导出剪辑视频...' });
      const result = await cutter.losslessCut(
        currentVideo,
        startTime,
        endTime,
        'cut-video.mp4'
      );

      set({ isProcessing: false, progress: 100 });

      // 延迟清除进度显示，让用户看到 100%
      setTimeout(() => {
        set({ progress: 0 });
      }, 1000);

      return new Blob([result.buffer as any], { type: 'video/mp4' });

    } catch (error) {
      set({ isProcessing: false, progress: 0 });
      throw error;
    }
  }
}));

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export class FastVideoCutter {
  private static instance: FastVideoCutter;
  private ffmpeg: FFmpeg;
  private onProgress: ((progress: number) => void) | null = null;
  
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.setupListeners();
  }

  public static getInstance(): FastVideoCutter {
    if (!FastVideoCutter.instance) {
      FastVideoCutter.instance = new FastVideoCutter();
    }
    return FastVideoCutter.instance;
  }

  private setupListeners() {
    this.ffmpeg.on('progress', ({ progress }) => {
      if (this.onProgress) {
        this.onProgress(Math.round(progress * 100));
      }
    });

    this.ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });
  }

  public setProgressCallback(callback: (progress: number) => void) {
    this.onProgress = callback;
  }

  async init(): Promise<void> {
    if (!this.ffmpeg.loaded) {
      // 在 Electron 环境下，也可以使用本地资源路径
      // 这里暂时使用官方 CDN，也可以配合 electron-vite 的 assets 文件夹使用本地 worker
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }
  }

  // 无损快速切割
  async losslessCut(
    inputFile: File,
    startTime: number,
    endTime: number,
    outputPath: string = 'output.mp4'
  ): Promise<Uint8Array> {
    await this.init();
    
    // 写入输入文件
    const inputData = await fetchFile(inputFile);
    await this.ffmpeg.writeFile('input.mp4', inputData);
    
    const duration = endTime - startTime;
    
    // 使用 -ss 在 -i 之前可以实现快速跳转，但在某些情况下可能不够精确
    // 对于无损切割（-c copy），通常建议将 -ss 放在 -i 之后以确保精确
    const args = [
      '-ss', startTime.toString(),
      '-i', 'input.mp4',
      '-t', duration.toString(),
      '-c', 'copy',
      '-avoid_negative_ts', 'make_zero',
      '-map', '0', // 包含所有流
      '-y',
      outputPath
    ];
    
    await this.ffmpeg.exec(args);
    
    const data = await this.ffmpeg.readFile(outputPath);
    // 清理资源
    await this.ffmpeg.deleteFile('input.mp4');
    await this.ffmpeg.deleteFile(outputPath);
    
    return data as Uint8Array;
  }

  // 获取视频信息
  async getVideoInfo(inputFile: File): Promise<{ duration: number; format: string }> {
    await this.init();
    
    const inputData = await fetchFile(inputFile);
    await this.ffmpeg.writeFile('temp_info_input.mp4', inputData);
    
    // 通过执行一个简单的命令来获取信息
    // 注意：FFmpeg 会将信息输出到日志
    let duration = 0;
    const logListener = ({ message }: { message: string }) => {
      const match = message.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
      if (match) {
        const h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const s = parseInt(match[3]);
        const ms = parseInt(match[4]);
        duration = h * 3600 + m * 60 + s + ms / 100;
      }
    };

    this.ffmpeg.on('log', logListener);
    await this.ffmpeg.exec(['-i', 'temp_info_input.mp4']);
    this.ffmpeg.off('log', logListener);
    
    await this.ffmpeg.deleteFile('temp_info_input.mp4');
    
    return {
      duration,
      format: inputFile.name.split('.').pop() || 'mp4'
    };
  }
}

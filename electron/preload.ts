import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../src/types/electron';

// 暴露安全的 API 给渲染进程
const electronAPI: ElectronAPI = {
  // 文件操作
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  saveVideoFile: (buffer: ArrayBuffer, fileName: string) => 
    ipcRenderer.invoke('save-video-file', buffer, fileName),
  getFileInfo: (filePath: string) => ipcRenderer.invoke('get-file-info', filePath),

  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // 对话框
  showMessageBox: (options: any) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),

  // 系统操作
  showItemInFolder: (path: string) => ipcRenderer.invoke('show-item-in-folder', path),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  beep: () => ipcRenderer.invoke('beep'),

  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // 设置管理
  getSetting: (key: string, defaultValue: any) => 
    ipcRenderer.invoke('get-setting', key, defaultValue),
  setSetting: (key: string, value: any) => 
    ipcRenderer.invoke('set-setting', key, value),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),

  // 最近文件
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  addRecentFile: (filePath: string) => ipcRenderer.invoke('add-recent-file', filePath),
  clearRecentFiles: () => ipcRenderer.invoke('clear-recent-files'),

  // 更新检查
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),

  // 硬件加速
  getGPUInfo: () => ipcRenderer.invoke('get-gpu-info'),
  enableHardwareAcceleration: (enable: boolean) => 
    ipcRenderer.invoke('enable-hardware-acceleration', enable)
};

// 暴露 API 到全局窗口对象
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 监听主进程发送的消息
ipcRenderer.on('video-file-selected', (event, filePath) => {
  // 发送自定义事件到渲染进程
  window.dispatchEvent(new CustomEvent('video-file-selected', { detail: filePath }));
});

ipcRenderer.on('app-update-available', (event, updateInfo) => {
  window.dispatchEvent(new CustomEvent('app-update-available', { detail: updateInfo }));
});

ipcRenderer.on('app-update-downloaded', (event) => {
  window.dispatchEvent(new CustomEvent('app-update-downloaded'));
});

// 工具函数：将文件路径转换为文件对象
const filePathToFile = async (filePath: string): Promise<File> => {
  try {
    const response = await fetch(`file://${filePath}`);
    const blob = await response.blob();
    return new File([blob], filePath.split('/').pop() || 'video.mp4', { type: blob.type });
  } catch (error) {
    throw new Error(`无法读取文件: ${error}`);
  }
};

// 工具函数：将 ArrayBuffer 保存为文件
const saveArrayBufferAsFile = async (buffer: ArrayBuffer, fileName: string): Promise<string> => {
  return electronAPI.saveVideoFile(buffer, fileName);
};

// 工具函数：显示原生对话框
const showDialog = {
  error: (title: string, content: string) => {
    return electronAPI.showMessageBox({
      type: 'error',
      title,
      message: content,
      buttons: ['确定']
    });
  },
  
  info: (title: string, content: string) => {
    return electronAPI.showMessageBox({
      type: 'info',
      title,
      message: content,
      buttons: ['确定']
    });
  },
  
  confirm: (title: string, content: string): Promise<boolean> => {
    return electronAPI.showMessageBox({
      type: 'question',
      title,
      message: content,
      buttons: ['取消', '确定']
    }).then(result => result.response === 1);
  }
};

// 暴露工具函数
contextBridge.exposeInMainWorld('electronUtils', {
  filePathToFile,
  saveArrayBufferAsFile,
  showDialog
});

// 类型声明扩展
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electronUtils: {
      filePathToFile: (filePath: string) => Promise<File>;
      saveArrayBufferAsFile: (buffer: ArrayBuffer, fileName: string) => Promise<string>;
      showDialog: {
        error: (title: string, content: string) => Promise<any>;
        info: (title: string, content: string) => Promise<any>;
        confirm: (title: string, content: string) => Promise<boolean>;
      };
    };
  }

  // 自定义事件类型
  interface WindowEventMap {
    'video-file-selected': CustomEvent<string>;
    'app-update-available': CustomEvent<any>;
    'app-update-downloaded': CustomEvent<void>;
  }
}

// 控制台日志（仅开发模式）
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDebug', {
    log: (...args: any[]) => console.log('[Electron]', ...args),
    error: (...args: any[]) => console.error('[Electron]', ...args),
    warn: (...args: any[]) => console.warn('[Electron]', ...args)
  });
}

console.log('🚀 EZ CUT 预加载脚本已加载');

// Electron API 类型定义

// 主进程与渲染进程通信的 API 接口
export interface ElectronAPI {
  // 文件操作
  selectVideoFile: () => Promise<{ filePaths: string[]; canceled: boolean }>;
  saveVideoFile: (buffer: ArrayBuffer, fileName: string) => Promise<string>;
  getFileInfo: (filePath: string) => Promise<{ size: number; created: number }>;
  
  // 窗口操作
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isMaximized: () => Promise<boolean>;
  
  // 应用信息
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getAppPath: () => Promise<string>;
  
  // 对话框
  showMessageBox: (options: MessageBoxOptions) => Promise<MessageBoxResult>;
  showSaveDialog: (options: SaveDialogOptions) => Promise<{ filePath?: string; canceled: boolean }>;
  showOpenDialog: (options: OpenDialogOptions) => Promise<{ filePaths: string[]; canceled: boolean }>;
  
  // 系统操作
  showItemInFolder: (path: string) => void;
  openExternal: (url: string) => void;
  beep: () => void;
  
  // 设置管理
  getSetting: <T>(key: string, defaultValue: T) => Promise<T>;
  setSetting: <T>(key: string, value: T) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // 最近文件
  getRecentFiles: () => Promise<string[]>;
  addRecentFile: (filePath: string) => Promise<void>;
  clearRecentFiles: () => Promise<void>;
  
  // 更新检查
  checkForUpdates: () => Promise<UpdateCheckResult>;
  downloadUpdate: () => Promise<void>;
  restartAndUpdate: () => void;
  
  // 硬件加速
  getGPUInfo: () => Promise<GPUInfo>;
  enableHardwareAcceleration: (enable: boolean) => Promise<void>;
}

// 对话框选项类型
export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
  noLink?: boolean;
  icon?: string;
}

export interface MessageBoxResult {
  response: number;
  checkboxChecked?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  properties?: Array<'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'showOverwriteConfirmation' | 'dontAddToRecent'>;
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'treatPackageAsDirectory' | 'noResolveAliases' | 'dontAddToRecent'>;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

// 更新检查结果
export interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: string;
  releaseNotes?: string;
  releaseDate?: string;
  url?: string;
}

// GPU 信息
export interface GPUInfo {
  graphicsCard: string;
  driverVersion: string;
  memory: number;
  features: string[];
}

// 系统信息
export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  totalMemory: number;
  freeMemory: number;
  load: number[];
}

// 全局窗口类型扩展
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// IPC 通道常量
export const IPC_CHANNELS = {
  // 文件操作
  SELECT_VIDEO_FILE: 'select-video-file',
  SAVE_VIDEO_FILE: 'save-video-file',
  GET_FILE_INFO: 'get-file-info',
  
  // 窗口操作
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_MAXIMIZE: 'window-maximize',
  WINDOW_CLOSE: 'window-close',
  WINDOW_IS_MAXIMIZED: 'window-is-maximized',
  
  // 应用信息
  GET_APP_VERSION: 'get-app-version',
  GET_PLATFORM: 'get-platform',
  GET_APP_PATH: 'get-app-path',
  
  // 对话框
  SHOW_MESSAGE_BOX: 'show-message-box',
  SHOW_SAVE_DIALOG: 'show-save-dialog',
  SHOW_OPEN_DIALOG: 'show-open-dialog',
  
  // 系统操作
  SHOW_ITEM_IN_FOLDER: 'show-item-in-folder',
  OPEN_EXTERNAL: 'open-external',
  BEEP: 'beep',
  
  // 设置管理
  GET_SETTING: 'get-setting',
  SET_SETTING: 'set-setting',
  RESET_SETTINGS: 'reset-settings',
  
  // 最近文件
  GET_RECENT_FILES: 'get-recent-files',
  ADD_RECENT_FILE: 'add-recent-file',
  CLEAR_RECENT_FILES: 'clear-recent-files',
  
  // 更新检查
  CHECK_FOR_UPDATES: 'check-for-updates',
  DOWNLOAD_UPDATE: 'download-update',
  RESTART_AND_UPDATE: 'restart-and-update',
  
  // 硬件加速
  GET_GPU_INFO: 'get-gpu-info',
  ENABLE_HARDWARE_ACCELERATION: 'enable-hardware-acceleration',
} as const;

// 错误代码
export const ERROR_CODES = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  INVALID_VIDEO_FORMAT: 'INVALID_VIDEO_FORMAT',
  FFMPEG_ERROR: 'FFMPEG_ERROR',
  INSUFFICIENT_DISK_SPACE: 'INSUFFICIENT_DISK_SPACE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

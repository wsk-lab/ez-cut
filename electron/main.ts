import { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeTheme } from 'electron';
import { join, dirname, basename } from 'path';
import { readFile, writeFile, stat, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';

// 类型定义
interface AppConfig {
  windowBounds: { width: number; height: number; x?: number; y?: number };
  theme: 'light' | 'dark' | 'system';
  language: string;
  recentFiles: string[];
  exportSettings: any;
}

class EZCutApp {
  private mainWindow: BrowserWindow | null = null;
  private isDev: boolean = process.env.NODE_ENV === 'development';
  private configPath: string;
  private appConfig: AppConfig = {
    windowBounds: { width: 1200, height: 800 },
    theme: 'system',
    language: 'zh-CN',
    recentFiles: [],
    exportSettings: {}
  };

  constructor() {
    this.configPath = join(app.getPath('userData'), 'config.json');
    this.initializeApp();
  }

  private async initializeApp() {
    // 等待应用准备就绪
    await app.whenReady();
    
    // 加载配置
    await this.loadConfig();
    
    // 创建主窗口
    this.createMainWindow();
    
    // 设置应用菜单
    this.setupMenu();
    
    // 设置 IPC 处理器
    this.setupIPC();
    
    // 设置应用事件
    this.setupAppEvents();
  }

  private createMainWindow() {
    const { windowBounds } = this.appConfig;
    
    this.mainWindow = new BrowserWindow({
      width: windowBounds.width,
      height: windowBounds.height,
      x: windowBounds.x,
      y: windowBounds.y,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      title: 'EZ CUT - 智能视频剪辑软件',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: join(__dirname, 'preload.js'),
        webSecurity: !this.isDev,
        allowRunningInsecureContent: this.isDev
      },
      show: false,
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#1f1f1f' : '#ffffff'
    });

    // 加载应用
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:3344');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(join(__dirname, '../dist-react/index.html'));
    }

    // 窗口事件
    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    this.mainWindow.on('close', () => {
      this.saveWindowBounds();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 阻止新窗口打开
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // 开发模式下的自动重载
    if (this.isDev) {
      this.mainWindow.webContents.on('did-fail-load', () => {
        setTimeout(() => {
          this.mainWindow?.reload();
        }, 1000);
      });
    }
  }

  private setupMenu() {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: '文件',
        submenu: [
          {
            label: '打开视频',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.handleOpenVideo()
          },
          {
            label: '最近文件',
            submenu: this.getRecentFilesMenu()
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { role: 'undo', label: '撤销' },
          { role: 'redo', label: '重做' },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '复制' },
          { role: 'paste', label: '粘贴' }
        ]
      },
      {
        label: '视图',
        submenu: [
          { role: 'reload', label: '重新加载' },
          { role: 'forceReload', label: '强制重新加载' },
          { role: 'toggleDevTools', label: '开发者工具' },
          { type: 'separator' },
          { role: 'resetZoom', label: '实际大小' },
          { role: 'zoomIn', label: '放大' },
          { role: 'zoomOut', label: '缩小' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: '切换全屏' }
        ]
      },
      {
        label: '窗口',
        submenu: [
          { role: 'minimize', label: '最小化' },
          { role: 'close', label: '关闭' }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '关于 EZ CUT',
            click: () => this.showAboutDialog()
          },
          {
            label: '检查更新',
            click: () => this.checkForUpdates()
          },
          { type: 'separator' },
          {
            label: '开发者工具',
            click: () => this.mainWindow?.webContents.openDevTools()
          },
          {
            label: '访问官网',
            click: () => shell.openExternal('https://wsk-lab.com')
          },
          {
            label: 'GitHub 仓库',
            click: () => shell.openExternal('https://github.com/wsk-lab/ez-cut')
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC() {
    // 文件操作
    ipcMain.handle('select-video-file', () => this.handleOpenVideo());
    ipcMain.handle('save-video-file', (_, buffer: ArrayBuffer, fileName: string) => 
      this.handleSaveVideoFile(buffer, fileName)
    );
    ipcMain.handle('get-file-info', (_, filePath: string) => this.getFileInfo(filePath));

    // 窗口操作
    ipcMain.handle('window-minimize', () => this.mainWindow?.minimize());
    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });
    ipcMain.handle('window-close', () => this.mainWindow?.close());
    ipcMain.handle('window-is-maximized', () => this.mainWindow?.isMaximized());

    // 对话框
    ipcMain.handle('show-message-box', (_, options: Electron.MessageBoxOptions) => 
      dialog.showMessageBox(this.mainWindow!, options)
    );
    ipcMain.handle('show-save-dialog', (_, options: Electron.SaveDialogOptions) => 
      dialog.showSaveDialog(this.mainWindow!, options)
    );
    ipcMain.handle('show-open-dialog', (_, options: Electron.OpenDialogOptions) => 
      dialog.showOpenDialog(this.mainWindow!, options)
    );

    // 系统操作
    ipcMain.handle('show-item-in-folder', (_, path: string) => shell.showItemInFolder(path));
    ipcMain.handle('open-external', (_, url: string) => shell.openExternal(url));
    ipcMain.handle('beep', () => shell.beep());

    // 应用信息
    ipcMain.handle('get-app-version', () => app.getVersion());
    ipcMain.handle('get-platform', () => process.platform);
    ipcMain.handle('get-app-path', () => app.getAppPath());

    // 设置管理
    ipcMain.handle('get-setting', (_, key: string, defaultValue: any) => 
      this.getSetting(key, defaultValue)
    );
    ipcMain.handle('set-setting', (_, key: string, value: any) => 
      this.setSetting(key, value)
    );

    // 最近文件
    ipcMain.handle('get-recent-files', () => this.appConfig.recentFiles);
    ipcMain.handle('add-recent-file', (_, filePath: string) => 
      this.addRecentFile(filePath)
    );
  }

  private setupAppEvents() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', async () => {
      await this.saveConfig();
    });

    // 阻止多实例
    if (!app.requestSingleInstanceLock()) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    // 文件关联（macOS）
    app.on('open-file', (event, path) => {
      event.preventDefault();
      this.openVideoFile(path);
    });
  }

  private async handleOpenVideo(): Promise<{ filePaths: string[]; canceled: boolean }> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: '选择视频文件',
      filters: [
        { 
          name: '视频文件', 
          extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'] 
        },
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      await this.addRecentFile(filePath);
      this.mainWindow?.webContents.send('video-file-selected', filePath);
    }

    return result;
  }

  private async handleSaveVideoFile(buffer: ArrayBuffer, fileName: string): Promise<string> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: '保存视频文件',
      defaultPath: fileName,
      filters: [
        { name: 'MP4 视频', extensions: ['mp4'] },
        { name: 'MOV 视频', extensions: ['mov'] },
        { name: 'WebM 视频', extensions: ['webm'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      throw new Error('用户取消保存');
    }

    try {
      await writeFile(result.filePath, Buffer.from(buffer));
      await this.addRecentFile(result.filePath);
      return result.filePath;
    } catch (error) {
      throw new Error(`保存文件失败: ${error}`);
    }
  }

  private async getFileInfo(filePath: string) {
    try {
      const stats = await stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime.getTime(),
        modified: stats.mtime.getTime()
      };
    } catch (error) {
      throw new Error(`无法获取文件信息: ${error}`);
    }
  }

  private getRecentFilesMenu(): Electron.MenuItemConstructorOptions[] {
    return this.appConfig.recentFiles.slice(0, 10).map(filePath => ({
      label: basename(filePath),
      click: () => this.openVideoFile(filePath)
    })).concat([
      { type: 'separator' },
      {
        label: '清除最近文件',
        click: () => this.clearRecentFiles()
      }
    ]);
  }

  private async openVideoFile(filePath: string) {
    try {
      await access(filePath, constants.F_OK);
      this.mainWindow?.webContents.send('video-file-selected', filePath);
      await this.addRecentFile(filePath);
    } catch (error) {
      dialog.showErrorBox('错误', `无法打开文件: ${filePath}`);
    }
  }

  private async addRecentFile(filePath: string) {
    // 移除重复项
    this.appConfig.recentFiles = this.appConfig.recentFiles.filter(f => f !== filePath);
    // 添加到开头
    this.appConfig.recentFiles.unshift(filePath);
    // 限制数量
    this.appConfig.recentFiles = this.appConfig.recentFiles.slice(0, 15);
    
    // 更新菜单
    this.setupMenu();
    await this.saveConfig();
  }

  private async clearRecentFiles() {
    this.appConfig.recentFiles = [];
    this.setupMenu();
    await this.saveConfig();
  }

  private async loadConfig() {
    try {
      if (existsSync(this.configPath)) {
        const configData = await readFile(this.configPath, 'utf-8');
        this.appConfig = { ...this.appConfig, ...JSON.parse(configData) };
      }
    } catch (error) {
      console.warn('加载配置失败，使用默认配置:', error);
    }
  }

  private async saveConfig() {
    try {
      await writeFile(this.configPath, JSON.stringify(this.appConfig, null, 2));
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }

  private async saveWindowBounds() {
    if (this.mainWindow) {
      const bounds = this.mainWindow.getBounds();
      this.appConfig.windowBounds = bounds;
      await this.saveConfig();
    }
  }

  private getSetting(key: string, defaultValue: any) {
    return this.appConfig[key as keyof AppConfig] ?? defaultValue;
  }

  private setSetting(key: string, value: any) {
    (this.appConfig as any)[key] = value;
    this.saveConfig();
  }

  private getAppIcon(): string {
    const basePath = join(__dirname, '../../build');
    switch (process.platform) {
      case 'win32': return join(basePath, 'icon.ico');
      case 'darwin': return join(basePath, 'icon.icns');
      default: return join(basePath, 'icon.png');
    }
  }

  private showAboutDialog() {
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: '关于 EZ CUT',
      message: 'EZ CUT - 智能视频剪辑软件',
      detail: [
        `版本: ${app.getVersion()}`,
        `Electron: ${process.versions.electron}`,
        `Chromium: ${process.versions.chrome}`,
        `Node.js: ${process.versions.node}`,
        `V8: ${process.versions.v8}`,
        '',
        '© 2024 WSK-Lab. 保留所有权利。',
        'MIT 开源许可证'
      ].join('\n'),
      buttons: ['确定', '访问官网']
    }).then(result => {
      if (result.response === 1) {
        shell.openExternal('https://wsk-lab.com');
      }
    });
  }

  private async checkForUpdates() {
    // 简化版更新检查
    dialog.showMessageBox(this.mainWindow!, {
      type: 'info',
      title: '检查更新',
      message: '当前已是最新版本',
      detail: `EZ CUT ${app.getVersion()} 是最新版本。`
    });
  }
}

// 启动应用
new EZCutApp();

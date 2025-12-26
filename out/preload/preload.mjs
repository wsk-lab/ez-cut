import { contextBridge, ipcRenderer } from "electron";
const electronAPI = {
  // 文件操作
  selectVideoFile: () => ipcRenderer.invoke("select-video-file"),
  saveVideoFile: (buffer, fileName) => ipcRenderer.invoke("save-video-file", buffer, fileName),
  getFileInfo: (filePath) => ipcRenderer.invoke("get-file-info", filePath),
  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),
  isMaximized: () => ipcRenderer.invoke("window-is-maximized"),
  // 对话框
  showMessageBox: (options) => ipcRenderer.invoke("show-message-box", options),
  showSaveDialog: (options) => ipcRenderer.invoke("show-save-dialog", options),
  showOpenDialog: (options) => ipcRenderer.invoke("show-open-dialog", options),
  // 系统操作
  showItemInFolder: (path) => ipcRenderer.invoke("show-item-in-folder", path),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  beep: () => ipcRenderer.invoke("beep"),
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  getAppPath: () => ipcRenderer.invoke("get-app-path"),
  // 设置管理
  getSetting: (key, defaultValue) => ipcRenderer.invoke("get-setting", key, defaultValue),
  setSetting: (key, value) => ipcRenderer.invoke("set-setting", key, value),
  resetSettings: () => ipcRenderer.invoke("reset-settings"),
  // 最近文件
  getRecentFiles: () => ipcRenderer.invoke("get-recent-files"),
  addRecentFile: (filePath) => ipcRenderer.invoke("add-recent-file", filePath),
  clearRecentFiles: () => ipcRenderer.invoke("clear-recent-files"),
  // 更新检查
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  restartAndUpdate: () => ipcRenderer.invoke("restart-and-update"),
  // 硬件加速
  getGPUInfo: () => ipcRenderer.invoke("get-gpu-info"),
  enableHardwareAcceleration: (enable) => ipcRenderer.invoke("enable-hardware-acceleration", enable)
};
contextBridge.exposeInMainWorld("electronAPI", electronAPI);
ipcRenderer.on("video-file-selected", (event, filePath) => {
  window.dispatchEvent(new CustomEvent("video-file-selected", { detail: filePath }));
});
ipcRenderer.on("app-update-available", (event, updateInfo) => {
  window.dispatchEvent(new CustomEvent("app-update-available", { detail: updateInfo }));
});
ipcRenderer.on("app-update-downloaded", (event) => {
  window.dispatchEvent(new CustomEvent("app-update-downloaded"));
});
const filePathToFile = async (filePath) => {
  try {
    const response = await fetch(`file://${filePath}`);
    const blob = await response.blob();
    return new File([blob], filePath.split("/").pop() || "video.mp4", { type: blob.type });
  } catch (error) {
    throw new Error(`无法读取文件: ${error}`);
  }
};
const saveArrayBufferAsFile = async (buffer, fileName) => {
  return electronAPI.saveVideoFile(buffer, fileName);
};
const showDialog = {
  error: (title, content) => {
    return electronAPI.showMessageBox({
      type: "error",
      title,
      message: content,
      buttons: ["确定"]
    });
  },
  info: (title, content) => {
    return electronAPI.showMessageBox({
      type: "info",
      title,
      message: content,
      buttons: ["确定"]
    });
  },
  confirm: (title, content) => {
    return electronAPI.showMessageBox({
      type: "question",
      title,
      message: content,
      buttons: ["取消", "确定"]
    }).then((result) => result.response === 1);
  }
};
contextBridge.exposeInMainWorld("electronUtils", {
  filePathToFile,
  saveArrayBufferAsFile,
  showDialog
});
if (process.env.NODE_ENV === "development") {
  contextBridge.exposeInMainWorld("electronDebug", {
    log: (...args) => console.log("[Electron]", ...args),
    error: (...args) => console.error("[Electron]", ...args),
    warn: (...args) => console.warn("[Electron]", ...args)
  });
}
console.log("🚀 EZ CUT 预加载脚本已加载");

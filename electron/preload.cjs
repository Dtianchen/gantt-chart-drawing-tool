// Preload script - runs in a sandboxed environment
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  // 语言切换相关 API
  getLanguage: () => ipcRenderer.invoke('get-language'),
  setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),
  onLanguageChange: (callback) => ipcRenderer.on('language-changed', (_, lang) => callback(lang)),
})

// Preload script - runs in a sandboxed environment
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Expose safe APIs to renderer process if needed
  platform: process.platform,
})

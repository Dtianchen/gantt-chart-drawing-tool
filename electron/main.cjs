const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')

let mainWindow
let currentLanguage = 'zh' // 默认中文

// 语言文本
const translations = {
  zh: {
    file: '文件',
    newWindow: '新建窗口',
    close: '关闭',
    edit: '编辑',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    view: '视图',
    reload: '重新加载',
    forceReload: '强制重新加载',
    toggleDevTools: '开发者工具',
    resetZoom: '实际大小',
    zoomIn: '放大',
    zoomOut: '缩小',
    toggleFullscreen: '全屏',
    language: '语言',
    chinese: '中文',
    english: 'English',
    help: '帮助',
    about: '关于'
  },
  en: {
    file: 'File',
    newWindow: 'New Window',
    close: 'Close',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Actual Size',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    toggleFullscreen: 'Toggle Full Screen',
    language: 'Language',
    chinese: '中文',
    english: 'English',
    help: 'Help',
    about: 'About'
  }
}

// 创建菜单
function createMenu() {
  const t = translations[currentLanguage]
  
  const template = [
    {
      label: t.file,
      submenu: [
        {
          label: t.newWindow,
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow()
        },
        { type: 'separator' },
        {
          label: t.close,
          accelerator: 'CmdOrCtrl+W',
          click: () => mainWindow?.close()
        }
      ]
    },
    {
      label: t.edit,
      submenu: [
        { label: t.undo, accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: t.redo, accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: t.cut, accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: t.copy, accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: t.paste, accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: t.selectAll, accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: t.view,
      submenu: [
        { label: t.reload, accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: t.forceReload, accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: t.toggleDevTools, accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: t.resetZoom, accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: t.zoomIn, accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: t.zoomOut, accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: t.toggleFullscreen, role: 'togglefullscreen' }
      ]
    },
    {
      label: t.language,
      submenu: [
        {
          label: t.chinese,
          type: 'radio',
          checked: currentLanguage === 'zh',
          click: () => setLanguage('zh')
        },
        {
          label: t.english,
          type: 'radio',
          checked: currentLanguage === 'en',
          click: () => setLanguage('en')
        }
      ]
    },
    {
      label: t.help,
      submenu: [
        {
          label: t.about,
          click: () => {
            // 可以在这里显示关于对话框
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 设置语言
function setLanguage(lang) {
  if (currentLanguage !== lang) {
    currentLanguage = lang
    createMenu()
    // 通知渲染进程语言已改变
    mainWindow?.webContents.send('language-changed', lang)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Gantt Tool v1.0.5',
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  // 创建菜单
  createMenu()

  // Load production build
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
    // Ensure full process termination on all platforms
    app.quit()
  })
}

// IPC 处理
ipcMain.handle('get-language', () => currentLanguage)
ipcMain.handle('set-language', (_, lang) => setLanguage(lang))

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { readFileSync, statSync } = require('fs');
const { release } = require('node:os');
const { join } = require('path')

process.env.PUBLIC = join('./public');

// 定义 FAVICON
const FAVICON = join(process.env.PUBLIC, 'favicon.ico');
const PLATFORMICON = process.platform === 'darwin' ? join(process.env.PUBLIC, 'favicon.png') : join(process.env.PUBLIC, 'favicon.ico');

// icon 只对 windows/linux 有效
// 下面是 Mac dock 栏的设置方式
// 且 Mac 下不认 ico 格式的文件 推荐用 png 格式文件
if (process.platform === 'darwin') {
  app.dock.setIcon(PLATFORMICON);
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: FAVICON,
    width: 1280,
    minWidth: 1280,
    height: 900,
    minHeight: 900,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Test actively push message to the Electron-Renderer
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  // mainWindow.webContents.on('will-navigate', (event, url) => {
    // event.preventDefault();
    // shell.openExternal(url);
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('render-process-gone', (event, webContents, details) => {
  console.warn('app:render-process-gone', event, webContents, details);
});

app.on('child-process-gone', (event, details) => {
  console.warn('app:child-process-gone', event, details);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('time:dynasty', (_, args) => {
  console.log('args::', args)
  const { dynasty } = args;
  const file = join(__dirname, `huaxia-data/data/${dynasty}/content.json`)
  const stat = statSync(file)
  if (stat?.isFile()) {
    const data = readFileSync(file)
    // console.log('file data::', data.toString())
    return JSON.parse(data.toString());
  } else {
    throw "文件不存在";
  }
})

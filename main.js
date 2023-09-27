// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const { readFileSync, statSync } = require('fs');
const { release } = require('node:os');
const { join } = require('path');
const { autoUpdater } = require('electron-updater');
const os = require('os');
const Log = require('electron-log');

process.env.PUBLIC = join(__dirname, 'public');

// 定义 LOG 方法
Log.initialize();
Log.transports.file.level = 'silly';
// Log.transports.console.level = 'silly'
// Log.transports.file.level = false       // 禁用文件日志输出
// Log.transports.console.level = false    // 禁用控制台日志输出
Log.transports.file.maxSize = 1048576; // 日志文件大小 达到上限之后会备份为 main.old.log 有且仅有一个备份
// 重定义日志文件路径
Log.transports.file.resolvePathFn = () => join(app.getPath('userData'), 'logs/main.log');
const log = Log.scope('main');

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

let win = null;

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
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
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  // win.webContents.on('will-navigate', (event, url) => {
    // event.preventDefault();
    // shell.openExternal(url);
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  win = createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 检查更新
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
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

// ************************** 检测更新 ******************************************
// 设置自动下载为false
autoUpdater.autoDownload = false;
// 检测下载错误
autoUpdater.on('error', (error) => {
  log.info('[LOG] 更新错误:', error);
  dialog.showErrorBox('下载错误', '更新文件下载错误')
});
// 检测是否需要更新
autoUpdater.on('checking-for-update', () => {
  log.info('[LOG] 检测更新中...');
});
// 检测到可以更新时
autoUpdater.on('update-available', () => {
  // 这里我们可以做一个提示，让用户自己选择是否进行更新
  dialog.showMessageBox({
    type: 'info',
    title: '应用有新的更新',
    message: '发现新版本，是否现在更新？',
    buttons: ['是', '否']
  }).then(({ response }) => {
    if (response === 0) {
      // 下载更新
      autoUpdater.downloadUpdate();
      log.info('[LOG] 更新中...');
    }
  });
  
  // 也可以默认直接更新，二选一即可
  // autoUpdater.downloadUpdate();
  // log.info('');
});
// 检测到不需要更新时
autoUpdater.on('update-not-available', () => {
  // 这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
  log.info('[LOG] 已经是最新版本，不需要更新');
  // dialog.showMessageBox({
  //   title: '检查更新',
  //   message: '已经是最新版本，不需要更新'
  // })
});
// 更新下载进度
autoUpdater.on('download-progress', (progress) => {
  // 直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
  log.info('downloadProgress:', progress);
  win?.setProgressBar(progress.percent * 0.01);
});
// 当需要更新的内容下载完成后
autoUpdater.on('update-downloaded', () => {
  // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
  win?.setProgressBar(-1);
  dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
  }).then(() => {
      // 退出并安装应用
      setImmediate(() => autoUpdater.quitAndInstall());
  });
});

// **************************** 菜单栏 ******************************************
const aboutMessage = `
Version: ${app.getVersion()}
Chrome: ${process.versions.chrome}
v8: ${process.versions.v8}
node: ${process.versions.node}
System: ${os.type()} ${os.arch()} ${os.release()}
Copyright (c) 2023 xieyuanbin.
All rights reserved.
`;
// macos 特有的菜单
const osxMenu = {
  label: app.getName(),
  submenu: [
    {
      label: `退出历史时间线`,
      accelerator: 'CmdOrCtrl+Q',
      click: () => {
        app.quit();
      }
    }
  ]
};
const menu = [
  {
    label: '帮助',
    submenu: [
      { label: `关于`, click: () => show('关于历史时间线', aboutMessage, 'info') },
      { label: '检查更新', click: () => { autoUpdater.checkForUpdates(); } },
      { label: '调试控制台', role: 'toggleDevTools' }
    ]
  }
];
if (process.platform === 'darwin') {
  menu.unshift(osxMenu);
}
const menuList = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(menuList);

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('time:dynasty', (_, args) => {
  log.info('args::', args)
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

// 自定义方法
function show(title, detail, type = 'info') {
  dialog.showMessageBox({
    icon: join(__dirname, 'public/favicon.png'),
    title: title,
    type: type,
    message: '历史时间线',
    detail: detail
  });
}

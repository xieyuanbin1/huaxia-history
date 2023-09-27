// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, shell, dialog, Menu } = require('electron');
const { readFileSync, statSync } = require('fs');
const { release } = require('node:os');
const { join } = require('path');
const { autoUpdater } = require('electron-updater');
const os = require('os');

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

// 检测更新
// 设置自动下载为false
// autoUpdater.autoDownload = false;
// 检测下载错误
autoUpdater.on('error', (error) => {
  dialog.showErrorBox('下载错误', '更新文件下载错误')
});
// 检测是否需要更新
autoUpdater.on('checking-for-update', () => {
  console.log('[LOG] 检测更新中...');
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
      console.log('[LOG] 更新中...');
    }
  });
  
  // 也可以默认直接更新，二选一即可
  // autoUpdater.downloadUpdate();
  // sendUpdateMessage(message.updateAva);
});
// 检测到不需要更新时
autoUpdater.on('update-not-available', () => {
  // 这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
  console.log('[LOG] 已经是最新版本，不需要更新');
});
// 更新下载进度
autoUpdater.on('download-progress', (progress) => {
  // 直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
  console.log('downloadProgress:', progress);
});
// 当需要更新的内容下载完成后
autoUpdater.on('update-downloaded', () => {
  // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
  dialog.showMessageBox({
      title: '安装更新',
      message: '更新下载完毕，应用将重启并进行安装'
  }).then(() => {
      // 退出并安装应用
      setImmediate(() => autoUpdater.quitAndInstall());
  });
});

// 菜单栏
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
      label: `关于 ${app.getName()}`,
      click: () => show('About', aboutMessage, 'info')
    },
    { type: 'separator' },
    {
      label: `退出 ${app.getName()}`,
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
    submenu: [{ label: '检查更新', click: () => { autoUpdater.checkForUpdates(); } }]
  }
];
if (process.platform === 'darwin') {
  menu.push(osxMenu);
}
const menuList = Menu.buildFromTemplate(menu);
Menu.setApplicationMenu(menuList);

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

// 自定义方法
function show(title, detail, type = 'info') {
  dialog.showMessageBox({
    icon: join(__dirname, 'public/favicon.png'),
    title: title,
    type: type,
    message: 'vMessenger',
    detail: detail
  });
}

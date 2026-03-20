const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let serverProcess = null;
let mainWindow = null; // singleton guard

// Force single instance lock — second launch focuses the existing window
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function startServer() {
  try {
    const appPath = app.getAppPath();
    const unpackedPath = appPath.replace('app.asar', 'app.asar.unpacked');
    const serverPath = path.join(unpackedPath, 'server', 'src', 'server-wrapper.cjs');
    const serverCwd = path.join(unpackedPath, 'server');
    const nodeBin = path.join(unpackedPath, 'server', 'car-rental-logger.exe');

    serverProcess = spawn(nodeBin, [serverPath], {
      cwd: serverCwd,
      env: {
        ...process.env,
        PORT: '3000',
        NODE_ENV: 'production',
      },
      // detached + unref = runs independently, survives main app close
      detached: true,
      stdio: 'ignore',
    });

    serverProcess.unref();
    console.log('[server] car-rental-logger.exe started, PID:', serverProcess.pid);
    serverProcess.on('error', (err) => console.error('[server] spawn error:', err));
  } catch (err) {
    console.error('[server] Failed to start server (non-fatal):', err);
    serverProcess = null;
  }
}

app.on('before-quit', () => {
  // server runs detached — it persists independently after app closes
});

function createSplash() {
  const splash = new BrowserWindow({
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splash.loadFile(path.join(app.getAppPath(), 'electron', 'splash.html'));
  return splash;
}

function createMainWindow() {
  // Never create a second main window
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }

  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(app.getAppPath(), 'electron', 'preload.js'),
    },
    title: 'Car Rental App',
  });

  mainWindow = win;
  win.on('closed', () => { mainWindow = null; });

  // Remove any stale listeners before registering
  ipcMain.removeAllListeners('close-app');
  ipcMain.removeAllListeners('minimize-app');
  ipcMain.removeAllListeners('toggle-maximize');

  ipcMain.on('close-app', () => app.quit());
  ipcMain.on('minimize-app', () => { if (!win.isDestroyed()) win.minimize(); });
  ipcMain.on('toggle-maximize', () => {
    if (win.isDestroyed()) return;
    if (win.isMaximized() || win.isFullScreen()) {
      win.setFullScreen(false);
      win.unmaximize();
    } else {
      win.setFullScreen(true);
    }
  });

  const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
  win.loadFile(indexPath).catch(err => {
    win.loadURL(`data:text/html,<pre>Failed to load: ${indexPath}\n${err}</pre>`);
  });

  return win;
}

app.whenReady().then(() => {
  startServer();
  Menu.setApplicationMenu(null);

  const splash = createSplash();
  const main = createMainWindow();

  main.webContents.once('did-finish-load', () => {
    if (!splash.isDestroyed()) splash.destroy();
    if (!main.isDestroyed()) {
      main.show();
    }
  });

  // macOS only — re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow().show();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

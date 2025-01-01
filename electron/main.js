const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle Windows installation events
if (process.platform === 'win32') {
  const squirrelCommand = process.argv[1];
  if (squirrelCommand) {
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
      let spawnedProcess;
      try {
        spawnedProcess = require('child_process').spawn(command, args, { detached: true });
      } catch(error) {
        console.error(error);
      }
      return spawnedProcess;
    };

    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };

    switch (squirrelCommand) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Install desktop and start menu shortcuts
        spawnUpdate(['--createShortcut', exeName]);
        setTimeout(app.quit, 1000);
        return true;
      case '--squirrel-uninstall':
        // Remove desktop and start menu shortcuts
        spawnUpdate(['--removeShortcut', exeName]);
        setTimeout(app.quit, 1000);
        return true;
      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
  }
}

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // In production, load the bundled app
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // In development, load from the dev server
    mainWindow.loadURL('http://localhost:5173');
  }

  // Create user data directory if it doesn't exist
  const userDataPath = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
}

// IPC handlers
ipcMain.handle('get-app-path', () => app.getAppPath());
ipcMain.handle('get-user-data-path', () => path.join(app.getPath('userData'), 'data'));

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 
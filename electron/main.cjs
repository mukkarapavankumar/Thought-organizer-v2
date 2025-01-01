const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const squirrelStartup = require('electron-squirrel-startup');
const createServer = require('./server.cjs');

// Set up logging
function log(message) {
  const logPath = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath, { recursive: true });
  }
  const logFile = path.join(logPath, 'app.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `${timestamp}: ${message}\n`);
  console.log(message);
}

// Start the server
function startServer() {
  const userDataPath = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  const server = createServer(userDataPath, log);
  const port = 3001;
  server.listen(port, () => {
    log(`Server running on port ${port}`);
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (squirrelStartup) {
  app.quit();
}

let mainWindow;

function createWindow() {
  log('Creating main window...');
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // In production, load the bundled app
  if (app.isPackaged) {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    log(`Loading index from: ${indexPath}`);
    mainWindow.loadFile(indexPath).catch(err => {
      log(`Error loading index: ${err.message}`);
    });
  } else {
    // In development, load from the dev server
    log('Loading from dev server...');
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      log(`Error loading dev server: ${err.message}`);
    });
  }

  // Open DevTools in development or if there's an error
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Log window events
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Failed to load: ${errorDescription} (${errorCode})`);
    mainWindow.webContents.openDevTools();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    log('Page loaded successfully');
  });
}

// IPC handlers
ipcMain.handle('get-app-path', () => {
  const appPath = app.getAppPath();
  log(`Getting app path: ${appPath}`);
  return appPath;
});

ipcMain.handle('get-user-data-path', () => {
  const userDataPath = path.join(app.getPath('userData'), 'data');
  log(`Getting user data path: ${userDataPath}`);
  return userDataPath;
});

app.whenReady().then(() => {
  log('App is ready');
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Log any uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
}); 
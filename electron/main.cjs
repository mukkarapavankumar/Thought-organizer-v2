const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const squirrelStartup = require('electron-squirrel-startup');
const createServer = require('./server.cjs');
const { exec } = require('child_process');
const { promisify } = require('util');
const fetch = require('node-fetch');

const execAsync = promisify(exec);

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

// Check if Ollama is installed and install if needed
async function checkAndInstallOllama() {
  try {
    // Try to run ollama -v to check if it's installed
    await execAsync('ollama -v');
    log('Ollama is already installed');
  } catch (error) {
    log('Ollama is not installed. Installing...');
    try {
      // Download and install Ollama for Windows
      const installerUrl = 'https://ollama.ai/download/windows';
      const installerPath = path.join(app.getPath('temp'), 'ollama-installer.exe');
      
      // Download installer
      const response = await fetch(installerUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(installerPath, Buffer.from(buffer));
      
      // Run installer
      await execAsync(`"${installerPath}" /S`); // Silent install
      log('Ollama installed successfully');
      
      // Clean up installer
      fs.unlinkSync(installerPath);
      
      // Pull the llama2 model
      log('Pulling llama2 model...');
      await execAsync('ollama pull llama2:1b');
      log('Model downloaded successfully');
    } catch (installError) {
      log(`Error installing Ollama: ${installError}`);
      throw new Error('Failed to install Ollama');
    }
  }
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
    const indexPath = path.join(__dirname, '../dist/index.html');
    log(`Loading index from: ${indexPath}`);
    // Set the base directory for loading resources
    mainWindow.loadFile(indexPath).catch(err => {
      log(`Error loading index: ${err.message}`);
      mainWindow.webContents.openDevTools();
    });

    // Log the contents of the dist directory
    const distPath = path.join(__dirname, '../dist');
    fs.readdir(distPath, (err, files) => {
      if (err) {
        log(`Error reading dist directory: ${err.message}`);
      } else {
        log(`Contents of dist directory: ${files.join(', ')}`);
      }
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

app.whenReady().then(async () => {
  log('App is ready');
  try {
    // Check and install Ollama before creating window
    await checkAndInstallOllama();
    
    // Start the server and create window
    startServer();
    createWindow();
  } catch (error) {
    log(`Error during initialization: ${error}`);
    app.quit();
  }
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
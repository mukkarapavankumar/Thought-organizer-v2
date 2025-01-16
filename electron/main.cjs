const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const squirrelStartup = require('electron-squirrel-startup');
const createServer = require('./server.cjs');
const { exec } = require('child_process');
const { promisify } = require('util');

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

// Check if Ollama is installed and guide installation if needed
async function checkAndInstallOllama() {
  try {
    // Try to run ollama -v to check if it's installed
    await execAsync('ollama -v');
    log('Ollama is already installed');
    return true;
  } catch (error) {
    const response = await dialog.showMessageBox({
      type: 'info',
      title: 'Ollama Installation Required',
      message: 'Thought Organizer requires Ollama for local AI processing. Would you like to install it now?\n\nThis will open your browser to download Ollama.',
      detail: 'After downloading, please run the installer and click OK once installation is complete.',
      buttons: ['Download & Install', 'Skip'],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      try {
        // Open browser to Ollama download page
        await shell.openExternal('https://ollama.ai/download');
        
        // Show instructions dialog
        const installResponse = await dialog.showMessageBox({
          type: 'info',
          title: 'Complete Ollama Installation',
          message: '1. Download and run the Ollama installer\n2. Wait for installation to complete\n3. Click OK below once installation is finished',
          buttons: ['OK', 'Cancel'],
          defaultId: 0,
          cancelId: 1,
        });

        if (installResponse.response === 0) {
          try {
            // Verify installation
            await execAsync('ollama -v');
            log('Ollama installation verified');

            // Ask about downloading the model
            const modelResponse = await dialog.showMessageBox({
              type: 'question',
              title: 'Download AI Model',
              message: 'Would you like to download the required AI model now?',
              detail: 'This will download the llama2 model (about 1.5GB)',
              buttons: ['Yes', 'Skip'],
              defaultId: 0,
              cancelId: 1,
            });

            if (modelResponse.response === 0) {
              const progressWindow = new BrowserWindow({
                width: 400,
                height: 150,
                frame: false,
                resizable: false,
                show: false,
                webPreferences: {
                  nodeIntegration: true,
                  contextIsolation: false,
                },
              });

              progressWindow.loadURL(`data:text/html;charset=utf-8,
                <html>
                  <body style="margin: 20px; font-family: Arial; background: white;">
                    <h3 style="margin-bottom: 20px;">Downloading AI Model...</h3>
                    <p>This may take several minutes depending on your internet speed.</p>
                  </body>
                </html>
              `);
              progressWindow.show();

              // Pull the llama2 model
              await execAsync('ollama pull llama2:1b');
              log('Model downloaded successfully');
              
              progressWindow.close();
            }
            return true;
          } catch (verifyError) {
            log(`Error verifying Ollama installation: ${verifyError}`);
            await dialog.showMessageBox({
              type: 'error',
              title: 'Installation Error',
              message: 'Could not verify Ollama installation. Please ensure it was installed correctly.',
              buttons: ['OK'],
            });
            return false;
          }
        }
        return false;
      } catch (installError) {
        log(`Error during Ollama setup: ${installError}`);
        await dialog.showMessageBox({
          type: 'error',
          title: 'Installation Error',
          message: 'Failed to complete Ollama setup. Please try installing it manually from https://ollama.ai/download',
          buttons: ['OK'],
        });
        return false;
      }
    } else {
      await dialog.showMessageBox({
        type: 'warning',
        title: 'Installation Skipped',
        message: 'Ollama is required for local AI processing. Some features may not work without it.',
        buttons: ['OK'],
      });
      return false;
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
    show: false, // Don't show the window until it's ready
  });

  // In production, load the bundled app
  if (app.isPackaged) {
    const indexPath = path.join(__dirname, '../dist/index.html');
    log(`Loading index from: ${indexPath}`);
    // Set the base directory for loading resources
    mainWindow.loadFile(indexPath).catch(err => {
      log(`Error loading index: ${err.message}`);
      dialog.showErrorBox('Loading Error', 'Failed to load the application. Please check the logs for details.');
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
      dialog.showErrorBox('Loading Error', 'Failed to connect to development server. Make sure it is running.');
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development or if there's an error
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Log window events
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    log(`Failed to load: ${errorDescription} (${errorCode})`);
    dialog.showErrorBox('Loading Error', `Failed to load the application: ${errorDescription}`);
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
    // Start the server first
    startServer();
    
    // Create window immediately to show progress
    createWindow();
    
    // Check and install Ollama after window is created
    const ollamaInstalled = await checkAndInstallOllama();
    if (!ollamaInstalled) {
      log('Ollama installation was not completed');
      // The warning dialog will have already been shown to the user
    }
  } catch (error) {
    log(`Error during initialization: ${error}`);
    dialog.showErrorBox('Initialization Error', 
      'An error occurred while starting the application. Some features may not work properly.');
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
  dialog.showErrorBox('Error', 
    'An unexpected error occurred. Please check the logs for details.');
}); 
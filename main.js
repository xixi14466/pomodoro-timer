const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 520,
    resizable: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

const notifySupported = Notification.isSupported();

ipcMain.handle('show-notification', (_, { title, body }) => {
  if (notifySupported) new Notification({ title, body }).show();
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  mainWindow?.minimize();
});

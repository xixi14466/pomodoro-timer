const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pomodoro', {
  notify: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  close: () => ipcRenderer.send('close-app'),
  minimize: () => ipcRenderer.send('minimize-app'),
});

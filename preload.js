const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    saveData: (data) => ipcRenderer.send('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data')
});

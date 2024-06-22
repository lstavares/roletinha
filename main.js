const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('save-data', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog({
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, data);
        return true;
    }
    return false;
});

ipcMain.handle('load-data', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });

    if (filePaths && filePaths[0]) {
        const data = fs.readFileSync(filePaths[0], 'utf-8');
        return data;
    }
    return null;
});

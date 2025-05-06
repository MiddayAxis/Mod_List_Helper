const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    getMods: () => ipcRenderer.invoke('get-mods'),
    addMod: (mod) => ipcRenderer.invoke('add-mod', mod),
    updateMod: (index, mod) => ipcRenderer.invoke('update-mod', { index, mod }),
    deleteMod: (index) => ipcRenderer.invoke('delete-mod', index),
    exportCsv: () => ipcRenderer.invoke('export-csv'),
    importCsv: () => ipcRenderer.invoke('import-csv'),
    exportModZip: (platform) => ipcRenderer.invoke('export-mod-zip', platform)
  }
);

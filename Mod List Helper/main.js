const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

// Initialize the data store
const store = new Store({
  name: 'mod-list-data',
  defaults: {
    mods: []
  }
});

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // DevTools disabled for production use
  // mainWindow.webContents.openDevTools();
  
  // Set up error logging
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}]: ${message}`);
    fs.appendFileSync(path.join(__dirname, 'app-error.log'), `${new Date().toISOString()} [${level}]: ${message}\n`);
  });
  
  // Catch unhandled exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    fs.appendFileSync(path.join(__dirname, 'app-error.log'), `${new Date().toISOString()} [UNCAUGHT]: ${error.stack || error}\n`);
  });
}

// Create window when app is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for data operations
ipcMain.handle('get-mods', async () => {
  return store.get('mods');
});

ipcMain.handle('add-mod', async (event, mod) => {
  const mods = store.get('mods');
  mods.push(mod);
  store.set('mods', mods);
  return mod;
});

ipcMain.handle('update-mod', async (event, { index, mod }) => {
  const mods = store.get('mods');
  mods[index] = mod;
  store.set('mods', mods);
  return mod;
});

ipcMain.handle('delete-mod', async (event, index) => {
  const mods = store.get('mods');
  mods.splice(index, 1);
  store.set('mods', mods);
  return index;
});

ipcMain.handle('export-csv', async () => {
  const mods = store.get('mods');
  
  const saveDialog = await dialog.showSaveDialog({
    title: 'Export Mod List',
    defaultPath: 'mod-list.csv',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });
  
  if (!saveDialog.canceled) {
    const csvContent = [
      'Name,Website,Description',
      ...mods.map(mod => `"${mod.name}","${mod.website}","${mod.description}"`)
    ].join('\n');
    
    fs.writeFileSync(saveDialog.filePath, csvContent);
    return true;
  }
  
  return false;
});

// Export as CurseForge/Modrinth zip (using a more antivirus-friendly approach)
ipcMain.handle('export-mod-zip', async (event, platform) => {
  try {
    const mods = store.get('mods');
    
    if (mods.length === 0) {
      return { success: false, message: 'No mods to export' };
    }
    
    const saveDialog = await dialog.showSaveDialog({
      title: `Export as ${platform} Zip`,
      defaultPath: `${platform.toLowerCase()}-mods.zip`,
      filters: [{ name: 'Zip Files', extensions: ['zip'] }]
    });
    
    if (saveDialog.canceled) {
      return { success: false, message: 'Export canceled' };
    }
    
    // Use a safer approach - create files directly in memory without temp directories
    const JSZip = require('jszip');
    const zip = new JSZip();
    
    // Add files based on platform
    if (platform === 'CurseForge') {
      // CurseForge manifest.json - exactly matching the example format
      const manifest = {
        minecraft: {
          version: '1.20.1',
          modLoaders: [{
            id: 'forge-47.4.0', // Using the version from the example
            primary: true
          }]
        },
        manifestType: 'minecraftModpack',
        manifestVersion: 1,
        name: 'Mod List Export',
        version: '',  // Empty as in the example
        author: '',   // Empty as in the example
        files: mods.map((mod) => ({
          projectID: 0, // We don't have actual project IDs
          fileID: 0,   // We don't have actual file IDs
          required: true
        })),
        overrides: 'overrides'
      };
      
      // Add manifest to zip
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      
      // Create empty overrides folder (required by CurseForge)
      zip.folder('overrides');
      
      // Create modlist.html exactly as in the example
      let modListHtml = '<ul>\n';
      
      mods.forEach(mod => {
        if (mod.website) {
          // If we have a website URL, create a link
          modListHtml += `<li><a href="${mod.website}">${mod.name}</a>${mod.description ? ` (${mod.description})` : ''}</li>\n`;
        } else {
          // If no website, just add the name
          modListHtml += `<li>${mod.name}${mod.description ? ` (${mod.description})` : ''}</li>\n`;
        }
      });
      
      modListHtml += '</ul>';
      
      zip.file('modlist.html', modListHtml);
      
    } else if (platform === 'Modrinth') {
      // Modrinth index.json
      const manifest = {
        formatVersion: 1,
        game: 'minecraft',
        versionId: '1.20.1',
        name: 'Exported Mod Pack',
        summary: 'Exported from Mod List Helper',
        files: mods.map((mod) => ({
          path: `mods/${mod.name.replace(/[^a-zA-Z0-9]/g, '_')}.jar`,
          hashes: { sha1: '0000000000000000000000000000000000000000' },
          env: { client: 'required', server: 'required' },
          downloads: mod.website ? [mod.website] : [],
          fileSize: 0
        })),
        dependencies: {
          'minecraft': '1.20.1',
          'forge': '47.2.0'
        }
      };
      
      // Add manifest to zip
      zip.file('modrinth.index.json', JSON.stringify(manifest, null, 2));
      
      // Add README
      const readmeContent = [
        '# Exported Mod Pack',
        '',
        '## Mod List',
        '',
        ...mods.map(mod => `- **${mod.name}**: ${mod.description || 'No description'} ${mod.website ? `[Link](${mod.website})` : ''}`)
      ].join('\n');
      
      zip.file('README.md', readmeContent);
    }
    
    // Generate zip file
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    // Write zip file directly without streaming (more antivirus-friendly)
    fs.writeFileSync(saveDialog.filePath, zipBuffer);
    
    return { success: true, message: `Successfully exported as ${platform} zip` };
  } catch (error) {
    console.error('Error exporting mod zip:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
});

ipcMain.handle('import-csv', async () => {
  const openDialog = await dialog.showOpenDialog({
    title: 'Import Mod List',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    properties: ['openFile']
  });
  
  if (!openDialog.canceled) {
    try {
      const csvContent = fs.readFileSync(openDialog.filePaths[0], 'utf-8');
      const rows = csvContent.split('\n');
      
      // Skip header row
      const mods = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim()) {
          // Basic CSV parsing (doesn't handle all edge cases)
          const match = rows[i].match(/("([^"]*)"|([^,]*))(,("([^"]*)"|([^,]*)))(,("([^"]*)"|([^,]*)))/);
          if (match) {
            mods.push({
              name: match[2] || match[3] || '',
              website: match[6] || match[7] || '',
              description: match[10] || match[11] || ''
            });
          }
        }
      }
      
      store.set('mods', mods);
      return mods;
    } catch (error) {
      console.error('Error importing CSV:', error);
      return null;
    }
  }
  
  return null;
});

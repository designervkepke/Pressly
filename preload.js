const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  pickFiles:        (filters)          => ipcRenderer.invoke('pick-files', filters),
  pickFolderInput:  ()                 => ipcRenderer.invoke('pick-folder-input'),
  pickFolderOutput: (defaultPath)      => ipcRenderer.invoke('pick-folder-output', defaultPath),
  folderExists:     (p)                => ipcRenderer.invoke('folder-exists', p),
  openFolder:       (p)                => ipcRenderer.invoke('open-folder', p),
  scanFolder:       (p, exts)          => ipcRenderer.invoke('scan-folder', p, exts),
  listDir:          (p)                => ipcRenderer.invoke('list-dir', p),
  listRoots:        ()                 => ipcRenderer.invoke('list-roots'),
  searchFiles:      (p, q, exts)       => ipcRenderer.invoke('search-files', p, q, exts),
  compress:         (opts)             => ipcRenderer.invoke('compress', opts),
  extractAudio:     (opts)             => ipcRenderer.invoke('extract-audio', opts),
  convert:          (opts)             => ipcRenderer.invoke('convert', opts),
  stripMeta:        (opts)             => ipcRenderer.invoke('strip-meta', opts),
  setTheme:         (theme)            => ipcRenderer.invoke('set-theme', theme),
  winMinimize:      ()                 => ipcRenderer.invoke('win-minimize'),
  winMaximize:      ()                 => ipcRenderer.invoke('win-maximize'),
  winClose:         ()                 => ipcRenderer.invoke('win-close'),
})

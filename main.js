const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')
const { exiftool } = require('exiftool-vendored')
const { autoUpdater } = require('electron-updater')

function createWindow() {
  const iconFile = process.platform === 'darwin' ? 'icon.icns'
    : process.platform === 'win32' ? 'icon.ico'
    : 'icon-source.png'

  const icon = nativeImage.createFromPath(path.join(__dirname, iconFile))

  const win = new BrowserWindow({
    width: 820,
    height: 660,
    minWidth: 680,
    minHeight: 560,
    backgroundColor: '#f3f3f3',
    frame: false,
    icon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  win.loadFile('renderer/index.html')
}

app.whenReady().then(() => {
  createWindow()
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => app.quit())

autoUpdater.on('update-available', () => {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents.send('update-available')
})

autoUpdater.on('update-downloaded', () => {
  const win = BrowserWindow.getAllWindows()[0]
  win?.webContents.send('update-downloaded')
})

ipcMain.handle('install-update', () => autoUpdater.quitAndInstall())

// --- Find ffmpeg ---
function findFfmpeg() {
  const candidates = [
    (() => { try { return require('ffmpeg-static') } catch { return null } })(),
    'ffmpeg',
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    path.join(__dirname, 'ffmpeg.exe'),
  ].filter(Boolean)
  for (const c of candidates) {
    try {
      require('child_process').execSync(`"${c}" -version`, { stdio: 'ignore' })
      return c
    } catch {}
  }
  return null
}

function parseResolution(resolution) {
  if (!resolution || resolution === 'Original') return null
  const [w, h] = resolution.split(':')
  const wi = parseInt(w) || 0
  const hi = parseInt(h) || 0
  if (!wi && !hi) return null
  return { w: wi ? String(wi) : '-2', h: hi ? String(hi) : '-2' }
}

// --- Window controls & file dialogs ---
ipcMain.handle('win-minimize', () => BrowserWindow.getAllWindows()[0]?.minimize())
ipcMain.handle('win-maximize', () => {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
})
ipcMain.handle('win-close', () => BrowserWindow.getAllWindows()[0]?.close())

ipcMain.handle('set-theme', (_, theme) => {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  win.setTitleBarOverlay({
    color: theme === 'light' ? '#e8e8e8' : '#202020',
    symbolColor: theme === 'light' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
    height: 40
  })
})

ipcMain.handle('pick-files', async (_, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters
  })
  return result.filePaths
})

ipcMain.handle('pick-folder-input', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.filePaths[0] || null
})

ipcMain.handle('pick-folder-output', async (_, defaultPath) => {
  const opts = { properties: ['openDirectory'] }
  if (defaultPath) opts.defaultPath = defaultPath
  const result = await dialog.showOpenDialog(opts)
  return result.filePaths[0] || null
})

ipcMain.handle('folder-exists', async (_, folderPath) => {
  try { fs.accessSync(folderPath); return true } catch { return false }
})

ipcMain.handle('open-folder', async (_, folderPath) => {
  shell.openPath(folderPath)
})

// --- Extract Audio ---
ipcMain.handle('extract-audio', async (_, { src, format, bitrate, outputDir }) => {
  const ffmpeg = findFfmpeg()
  if (!ffmpeg) throw new Error('ffmpeg not found.')
  const ext  = path.extname(src).toLowerCase()
  const stem = path.basename(src, ext)
  const outDir = outputDir || path.dirname(src)
  const dstPath = path.join(outDir, `${stem}.${format}`)
  fs.mkdirSync(outDir, { recursive: true })
  const args = ['-y', '-i', src, '-vn']
  if (format === 'mp3')  args.push('-c:a', 'libmp3lame', '-b:a', bitrate)
  else if (format === 'aac')  args.push('-c:a', 'aac', '-b:a', bitrate)
  else if (format === 'wav')  args.push('-c:a', 'pcm_s16le')
  else if (format === 'flac') args.push('-c:a', 'flac')
  args.push(dstPath)
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, args)
    proc.stderr.resume()
    proc.on('close', code => {
      if (code === 0) {
        resolve({ dstPath, srcSize: fs.statSync(src).size, dstSize: fs.statSync(dstPath).size })
      } else reject(new Error(`ffmpeg exited with code ${code}`))
    })
    proc.on('error', reject)
  })
})

// --- Format Converter ---
ipcMain.handle('convert', async (_, { src, format, outputDir }) => {
  const ffmpeg = findFfmpeg()
  if (!ffmpeg) throw new Error('ffmpeg not found.')
  const ext  = path.extname(src).toLowerCase()
  const stem = path.basename(src, ext)
  const outDir = outputDir || path.dirname(src)
  const dstPath = path.join(outDir, `${stem}.${format}`)
  fs.mkdirSync(outDir, { recursive: true })
  const args = ['-y', '-i', src]
  if (format === 'mp4') args.push('-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart')
  else if (format === 'mov') args.push('-c:v', 'libx264', '-c:a', 'aac')
  else if (format === 'mkv') args.push('-c:v', 'libx264', '-c:a', 'aac')
  else if (format === 'webm') args.push('-c:v', 'libvpx-vp9', '-c:a', 'libopus')
  else if (['jpg','jpeg'].includes(format)) args.push('-q:v', '2')
  else if (format === 'webp') args.push('-quality', '90')
  else if (format === 'mp3') args.push('-c:a', 'libmp3lame', '-q:a', '2', '-vn')
  else if (format === 'aac') args.push('-c:a', 'aac', '-b:a', '192k', '-vn')
  else if (format === 'wav') args.push('-c:a', 'pcm_s16le', '-vn')
  else if (format === 'flac') args.push('-c:a', 'flac', '-vn')
  args.push(dstPath)
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, args)
    proc.stderr.resume()
    proc.on('close', code => {
      if (code === 0) {
        resolve({ dstPath, srcSize: fs.statSync(src).size, dstSize: fs.statSync(dstPath).size })
      } else reject(new Error(`ffmpeg exited with code ${code}`))
    })
    proc.on('error', reject)
  })
})

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif', '.heic', '.heif'])

// --- Strip Metadata ---
ipcMain.handle('strip-meta', async (_, { src, outputDir }) => {
  const ext    = path.extname(src).toLowerCase()
  const stem   = path.basename(src, ext)
  const outDir = outputDir || path.dirname(src)
  const dstPath = path.join(outDir, `${stem}_clean${ext}`)
  fs.mkdirSync(outDir, { recursive: true })
  const srcSize = fs.statSync(src).size

  if (IMAGE_EXTS.has(ext)) {
    fs.copyFileSync(src, dstPath)
    await exiftool.write(dstPath, {}, ['-all=', '-overwrite_original'])
    return { dstPath, srcSize, dstSize: fs.statSync(dstPath).size }
  }

  const ffmpeg = findFfmpeg()
  if (!ffmpeg) throw new Error('ffmpeg not found.')
  const args = ['-y', '-i', src, '-map_metadata', '-1', '-c', 'copy', dstPath]
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, args)
    proc.stderr.resume()
    proc.on('close', code => {
      if (code === 0) {
        resolve({ dstPath, srcSize, dstSize: fs.statSync(dstPath).size })
      } else reject(new Error(`ffmpeg exited with code ${code}`))
    })
    proc.on('error', reject)
  })
})

// --- List directory (one level) ---
ipcMain.handle('list-dir', async (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    return entries.map(e => ({
      name: e.name,
      fullPath: path.join(dirPath, e.name),
      isDir: e.isDirectory(),
      size: e.isDirectory() ? null : (() => {
        try { return fs.statSync(path.join(dirPath, e.name)).size } catch { return 0 }
      })()
    })).sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  } catch {
    return []
  }
})

// --- Root drives (Windows) ---
ipcMain.handle('list-roots', async () => {
  const roots = []
  for (let i = 65; i <= 90; i++) {
    const drive = String.fromCharCode(i) + ':\\'
    try { fs.accessSync(drive); roots.push({ name: drive, fullPath: drive, isDir: true, size: null }) } catch {}
  }
  return roots
})

// --- Search files by name ---
ipcMain.handle('search-files', async (_, dirPath, query, exts) => {
  const results = []
  const q = query.toLowerCase()
  function walk(dir, depth) {
    if (depth > 4) return
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        walk(full, depth + 1)
      } else if (
        e.name.toLowerCase().includes(q) &&
        exts.includes(path.extname(e.name).toLowerCase())
      ) {
        try {
          results.push({ name: e.name, fullPath: full, isDir: false, size: fs.statSync(full).size })
        } catch {}
      }
      if (results.length >= 100) return
    }
  }
  walk(dirPath, 0)
  return results
})

// --- Scan folder recursively ---
ipcMain.handle('scan-folder', async (_, folderPath, exts) => {
  const results = []
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (exts.includes(path.extname(entry.name).toLowerCase())) results.push(full)
    }
  }
  walk(folderPath)
  return results
})

// --- Compress a single file ---
ipcMain.handle('compress', async (event, { src, mode, quality, resolution, outputDir, outputFormat }) => {
  const ffmpeg = findFfmpeg()
  if (!ffmpeg) throw new Error('ffmpeg not found. Install ffmpeg and add it to PATH.')

  const srcPath = src
  const srcExt = path.extname(srcPath).toLowerCase()
  const stem = path.basename(srcPath, srcExt)
  const outExt = mode === 'video' ? '.mp4'
    : (outputFormat && outputFormat !== 'keep') ? '.' + outputFormat
    : srcExt
  const outName = stem + '_compressed' + outExt
  const ext = outExt
  const outDir = outputDir || path.dirname(srcPath)
  const dstPath = path.join(outDir, outName)

  fs.mkdirSync(outDir, { recursive: true })

  const scale = parseResolution(resolution)
  const args = ['-y', '-i', srcPath]

  if (mode === 'video') {
    if (scale) {
      args.push('-vf', `scale=${scale.w}:${scale.h}:force_original_aspect_ratio=decrease`)
    }
    args.push('-c:v', 'libx264', '-crf', String(quality), '-preset', 'slow',
               '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart')
  } else {
    if (scale) {
      args.push('-vf', `scale=${scale.w}:${scale.h}:force_original_aspect_ratio=decrease`)
    }
    if (['.jpg', '.jpeg'].includes(ext)) {
      const q = Math.max(2, Math.round((100 - quality) / 100 * 31))
      args.push('-q:v', String(q))
    } else if (ext === '.webp') {
      args.push('-quality', String(quality))
    } else if (ext === '.png') {
      const level = Math.max(0, Math.min(9, Math.round((100 - quality) / 11)))
      args.push('-compression_level', String(level))
    }
  }

  args.push(dstPath)

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpeg, args)
    proc.stderr.resume()
    proc.on('close', code => {
      if (code === 0) {
        const srcSize = fs.statSync(srcPath).size
        const dstSize = fs.statSync(dstPath).size
        resolve({ dstPath, srcSize, dstSize })
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`))
      }
    })
    proc.on('error', reject)
  })
})

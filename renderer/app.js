const VIDEO_EXT = ['.mp4', '.mov', '.mkv', '.avi', '.wmv']
const PHOTO_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.bmp']
const AUDIO_EXT = ['.mp3', '.aac', '.wav', '.flac', '.m4a', '.ogg']
const ALL_EXT   = [...VIDEO_EXT, ...PHOTO_EXT, ...AUDIO_EXT]

// Window controls
document.getElementById('btn-minimize').onclick = () => window.api.winMinimize()
document.getElementById('btn-maximize').onclick = () => window.api.winMaximize()
document.getElementById('btn-close').onclick    = () => window.api.winClose()

// Theme toggle
const themeBtn       = document.getElementById('theme-btn')
const themeIconDark  = document.getElementById('theme-icon-dark')
const themeIconLight = document.getElementById('theme-icon-light')
let isLight = true

document.body.classList.add('light')
themeIconDark.style.display  = 'none'
themeIconLight.style.display = ''
window.api.setTheme('light')

themeBtn.onclick = () => {
  isLight = !isLight
  document.body.classList.toggle('light', isLight)
  themeIconDark.style.display  = isLight ? 'none' : ''
  themeIconLight.style.display = isLight ? '' : 'none'
  window.api.setTheme(isLight ? 'light' : 'dark')
}

// Tab state
let currentTab = 'video'

const TAB_CONFIG = {
  video: {
    accept: VIDEO_EXT,
    dropTitle: 'Drop video files here',
    dropSub: 'MP4, MOV, MKV, AVI, WMV',
    btnLabel: 'Compress',
  },
  image: {
    accept: PHOTO_EXT,
    dropTitle: 'Drop image files here',
    dropSub: 'JPG, PNG, WEBP, BMP',
    btnLabel: 'Compress',
  },
  audio: {
    accept: VIDEO_EXT,
    dropTitle: 'Drop video files here',
    dropSub: 'MP4, MOV, MKV, AVI, WMV — audio will be extracted',
    btnLabel: 'Extract Audio',
  },
  convert: {
    accept: ALL_EXT,
    dropTitle: 'Drop files to convert',
    dropSub: 'Video, Image or Audio — pick any output format',
    btnLabel: 'Convert',
  },
  meta: {
    accept: ALL_EXT,
    dropTitle: 'Drop files to strip metadata',
    dropSub: 'Video: MP4, MOV, MKV · Image: JPG, PNG, WEBP',
    btnLabel: 'Strip Metadata',
  },
}

function switchTab(tab) {
  currentTab = tab

  // Active tab button
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab))

  const cfg = TAB_CONFIG[tab]

  // Drop zone hint text
  document.querySelector('.drop-title').textContent = cfg.dropTitle
  document.querySelector('.drop-sub').textContent   = cfg.dropSub

  // Compress button label
  document.getElementById('btn-compress').textContent = cfg.btnLabel

  // Show/hide settings per tab
  const isAudio   = tab === 'audio'
  const isConvert = tab === 'convert'
  const isMeta    = tab === 'meta'
  const isStandard = !isAudio && !isConvert && !isMeta

  document.querySelectorAll('.video-image-only').forEach(el => el.classList.toggle('hidden', !isStandard))
  document.querySelectorAll('.image-only').forEach(el => el.classList.toggle('hidden', tab !== 'image'))
  document.querySelectorAll('.audio-only').forEach(el => el.classList.toggle('hidden', !isAudio))
  document.querySelectorAll('.convert-only').forEach(el => el.classList.toggle('hidden', !isConvert))
  document.querySelectorAll('.meta-only').forEach(el => el.classList.toggle('hidden', !isMeta))

  // Format converter: show video or image formats based on dropped files
  if (isConvert) updateConvertFormats()

  // Clear queue when switching tabs
  files.length = 0
  document.getElementById('file-list').innerHTML = ''
  updateCount()
  showHint()
}

const TAB_ICONS = { video: 'video', image: 'image', audio: 'audio', convert: 'convert', meta: 'shield' }
document.querySelectorAll('.tab').forEach(t => {
  const iconName = TAB_ICONS[t.dataset.tab]
  if (iconName) t.prepend(icon(iconName, 'tab-icon'))
  t.onclick = () => switchTab(t.dataset.tab)
})

function fmt(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function fileMode(name) {
  const e = name.slice(name.lastIndexOf('.')).toLowerCase()
  return VIDEO_EXT.includes(e) ? 'video' : 'photo'
}

function extIconName(name) {
  return fileMode(name) === 'video' ? 'video' : 'image'
}

// Custom select
document.querySelectorAll('.custom-select').forEach(sel => {
  const trigger = sel.querySelector('.cs-trigger')
  const valueEl = sel.querySelector('.cs-value')
  const options = sel.querySelectorAll('.cs-option')

  trigger.onclick = e => {
    e.stopPropagation()
    const isOpen = sel.classList.contains('open')
    document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'))
    if (!isOpen) sel.classList.add('open')
  }

  options.forEach(opt => {
    opt.onclick = () => {
      options.forEach(o => o.classList.remove('selected'))
      opt.classList.add('selected')
      valueEl.textContent = opt.dataset.value
      sel.classList.remove('open')
    }
  })
})

document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select.open').forEach(s => s.classList.remove('open'))
})

// Queue
const files    = []
const listEl   = document.getElementById('file-list')
const countEl  = document.getElementById('file-count')
const hintEl   = document.getElementById('drop-hint')
const bodyEl   = document.getElementById('queue-body')

function showHint()  { hintEl.style.display = ''; bodyEl.style.display = 'none' }
function showQueue() { hintEl.style.display = 'none'; bodyEl.style.display = '' }

function updateCount() {
  countEl.textContent = `${files.length} file${files.length === 1 ? '' : 's'}`
}

function addFile(fullPath, size) {
  const ext = fullPath.slice(fullPath.lastIndexOf('.')).toLowerCase()
  if (!TAB_CONFIG[currentTab].accept.includes(ext)) return
  if (files.includes(fullPath)) return
  files.push(fullPath)
  if (currentTab === 'convert') updateConvertFormats()

  const name  = fullPath.replace(/\\/g, '/').split('/').pop()
  const li    = document.createElement('li')
  li.dataset.path = fullPath

  const iconEl = icon(extIconName(name), 'file-icon')
  const nameEl = document.createElement('span')
  nameEl.className = 'file-name'
  nameEl.title = fullPath
  nameEl.textContent = name
  const sizeEl = document.createElement('span')
  sizeEl.className = 'file-size'
  sizeEl.textContent = fmt(size)
  const rmBtn = document.createElement('button')
  rmBtn.className = 'remove-btn'
  rmBtn.title = 'Remove'
  rmBtn.appendChild(icon('remove'))
  rmBtn.onclick = () => {
    files.splice(files.indexOf(fullPath), 1)
    li.remove()
    updateCount()
    if (!files.length) showHint()
  }

  li.append(iconEl, nameEl, sizeEl, rmBtn)
  listEl.appendChild(li)
  updateCount()
  showQueue()
}

document.getElementById('btn-clear').onclick = () => {
  files.length = 0
  listEl.innerHTML = ''
  showHint()
}

// Browse + Add more
const TAB_FILTERS = {
  video:   [{ name: 'Video', extensions: ['mp4','mov','mkv','avi','wmv'] }],
  image:   [{ name: 'Image', extensions: ['jpg','jpeg','png','webp','bmp'] }],
  audio:   [{ name: 'Video', extensions: ['mp4','mov','mkv','avi','wmv'] }],
  convert: [{ name: 'Media', extensions: ['mp4','mov','mkv','avi','wmv','jpg','jpeg','png','webp','bmp','mp3','aac','wav','flac','m4a','ogg'] }],
  meta:    [{ name: 'Media', extensions: ['mp4','mov','mkv','avi','wmv','jpg','jpeg','png','webp','bmp'] }],
}

async function pickFiles() {
  const paths = await window.api.pickFiles(TAB_FILTERS[currentTab])
  for (const p of paths) addFile(p, null)
}

document.getElementById('btn-browse').onclick = pickFiles
document.getElementById('btn-add').onclick    = pickFiles

// Drag & drop
const dropZone = document.getElementById('drop-zone')

dropZone.addEventListener('dragover', e => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})
dropZone.addEventListener('dragleave', e => {
  if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over')
})
dropZone.addEventListener('drop', e => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')
  for (const f of Array.from(e.dataTransfer.files)) addFile(f.path, f.size)
})

// Compression presets
const PRESETS = { light: 20, balanced: 50, strong: 80 }

const presetBtns  = document.querySelectorAll('#preset-btns .preset-btn')
const advToggle   = document.getElementById('advanced-toggle')
const presetWrap  = document.getElementById('preset-btns')
const advancedWrap = document.getElementById('advanced-wrap')
const slider      = document.getElementById('quality-slider')
const valInput    = document.getElementById('quality-val')

let currentQuality = PRESETS.balanced

presetBtns.forEach(btn => {
  btn.onclick = () => {
    presetBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentQuality = PRESETS[btn.dataset.preset]
    slider.value = currentQuality
    valInput.value = currentQuality
  }
})

slider.oninput = () => {
  currentQuality = parseInt(slider.value)
  valInput.value = currentQuality
}

valInput.onchange = () => {
  let v = Math.max(0, Math.min(100, parseInt(valInput.value) || 0))
  valInput.value = v
  slider.value = v
  currentQuality = v
}

advToggle.onchange = () => {
  if (advToggle.checked) {
    presetWrap.classList.add('hidden')
    advancedWrap.classList.remove('hidden')
    slider.value = currentQuality
    valInput.value = currentQuality
  } else {
    advancedWrap.classList.add('hidden')
    presetWrap.classList.remove('hidden')
  }
}

function getQuality(mode) {
  const v = currentQuality
  return mode === 'video' ? Math.round(35 - ((100 - v) / 100) * 20) : (100 - v)
}

// Audio format descriptions
const AUDIO_FORMAT_DESC = {
  mp3:  'Most widely supported format. Good quality at small file sizes. Works on every device and app.',
  aac:  'Better quality than MP3 at the same bitrate. Used by Apple, YouTube and streaming services.',
  wav:  'Uncompressed audio. Studio quality, large file size. Best for editing and post-production.',
  flac: 'Lossless compression. CD quality with smaller size than WAV. Great for music archiving.',
}

const AUDIO_BITRATE_DESC = {
  '128k': 'Smaller file size. Good enough for voice, podcasts and casual listening.',
  '192k': 'Good balance — clear sound, reasonable file size. Works well for music, podcasts and voiceovers.',
  '320k': 'Highest quality. Ideal for music where every detail matters. Larger file size.',
}

const audioFormatDesc  = document.getElementById('audio-format-desc')
const audioBitrateDesc = document.getElementById('audio-bitrate-desc')

document.querySelectorAll('[data-format]').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('[data-format]').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    if (audioFormatDesc) audioFormatDesc.textContent = AUDIO_FORMAT_DESC[btn.dataset.format] || ''
  }
})

document.querySelectorAll('[data-bitrate]').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('[data-bitrate]').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    if (audioBitrateDesc) audioBitrateDesc.textContent = AUDIO_BITRATE_DESC[btn.dataset.bitrate] || ''
  }
})

// Image output format
let imageOutputFormat = 'keep'

const FORMAT_DESC = {
  keep: 'Keeps the original format — no format conversion applied.',
  jpg:  'Great for photos. Small file size with lossy compression. Best choice when sharing or uploading online.',
  webp: 'Best of both worlds — smaller than JPG with better quality. Ideal for web and modern apps.',
  png:  'Lossless quality — no data is lost. Best for graphics, screenshots or images with transparency.',
}

const imgFormatDesc = document.getElementById('img-format-desc')

document.querySelectorAll('[data-img-format]').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('[data-img-format]').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    imageOutputFormat = btn.dataset.imgFormat
    imgFormatDesc.textContent = FORMAT_DESC[imageOutputFormat]
  }
})

// Format converter
let selectedFormat = 'mp4'

const CONVERT_FORMAT_DESC = {
  mp4:  'Universal video format. Best compatibility across all devices, browsers and platforms.',
  mov:  'Apple\'s format. Excellent quality, great for editing in Final Cut or Premiere. Larger file size.',
  mkv:  'Open container format. Supports multiple audio and subtitle tracks. Great for archiving.',
  webm: 'Optimized for the web. Small file size, open source. Best choice for online streaming.',
  jpg:  'Great for photos. Small file size with lossy compression. Best when sharing or uploading online.',
  png:  'Lossless quality — no data is lost. Best for graphics, screenshots or images with transparency.',
  webp: 'Smaller than JPG with better quality. Ideal for web and modern apps.',
  bmp:  'Uncompressed bitmap. Maximum quality but very large file size. Rarely used today.',
  mp3:  'Most widely supported audio format. Good quality at small file sizes. Works everywhere.',
  aac:  'Better quality than MP3 at the same bitrate. Used by Apple, YouTube and streaming services.',
  wav:  'Uncompressed audio. Studio quality, large file size. Best for editing and post-production.',
  flac: 'Lossless compression. CD quality with smaller size than WAV. Great for music archiving.',
}

const convertFormatDesc = document.getElementById('convert-format-desc')

function updateConvertFormats() {
  const hasVideo = files.some(f => VIDEO_EXT.includes(f.slice(f.lastIndexOf('.')).toLowerCase()))
  const hasImage = files.some(f => PHOTO_EXT.includes(f.slice(f.lastIndexOf('.')).toLowerCase()))
  const hasAudio = files.some(f => AUDIO_EXT.includes(f.slice(f.lastIndexOf('.')).toLowerCase()))
  document.getElementById('convert-video-formats').classList.toggle('hidden', !hasVideo)
  document.getElementById('convert-image-formats').classList.toggle('hidden', !hasImage)
  document.getElementById('convert-audio-formats').classList.toggle('hidden', !hasAudio)
  if (!selectedFormat) selectedFormat = hasVideo ? 'mp4' : hasImage ? 'jpg' : 'mp3'
}

document.querySelectorAll('[data-format-out]').forEach(btn => {
  btn.onclick = () => {
    const group = btn.closest('.preset-btns')
    group.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedFormat = btn.dataset.formatOut
    if (convertFormatDesc) convertFormatDesc.textContent = CONVERT_FORMAT_DESC[selectedFormat] || ''
  }
})

// Resolution collapsible
const resToggle = document.getElementById('res-toggle')
const resBody   = document.getElementById('res-body')
resToggle.onclick = () => {
  const open = resBody.classList.toggle('hidden') === false
  resToggle.classList.toggle('open', open)
}

// Resolution dim logic
const resWInput  = document.getElementById('res-w')
const resHInput  = document.getElementById('res-h')
const resWWrap   = document.getElementById('res-w-wrap')
const resHWrap   = document.getElementById('res-h-wrap')

function updateResDim() {
  const hasW = !!resWInput.value
  const hasH = !!resHInput.value
  resHWrap.classList.toggle('dimmed', hasW)
  resWWrap.classList.toggle('dimmed', hasH && !hasW)
}

resWInput.oninput = () => { if (resWInput.value) resHInput.value = ''; updateResDim() }
resHInput.oninput = () => { if (resHInput.value) resWInput.value = ''; updateResDim() }

function setupResDropdown(btnId, listId, input, otherInput) {
  const btn  = document.getElementById(btnId)
  const list = document.getElementById(listId)

  btn.onclick = e => {
    e.stopPropagation()
    document.querySelectorAll('.res-drop-list.open').forEach(l => l.classList.remove('open'))
    list.classList.toggle('open')
  }

  list.querySelectorAll('li').forEach(li => {
    li.onclick = () => {
      if (li.dataset.value === '') {
        input.value = ''
        otherInput.value = ''
      } else {
        input.value = li.dataset.value
        otherInput.value = ''
      }
      list.classList.remove('open')
      updateResDim()
    }
  })
}

setupResDropdown('res-w-btn', 'res-w-list', resWInput, resHInput)
setupResDropdown('res-h-btn', 'res-h-list', resHInput, resWInput)

document.addEventListener('click', () => {
  document.querySelectorAll('.res-drop-list.open').forEach(l => l.classList.remove('open'))
})

// Output folder
const outDirInput = document.getElementById('out-dir')
const btnOutDir   = document.getElementById('btn-out-dir')
const btnOutClear = document.getElementById('btn-out-clear')

function setOutputFolder(folder) {
  outDirInput.value = folder || ''
  btnOutClear.classList.toggle('hidden', !folder)
  if (folder) localStorage.setItem('pressly-out-dir', folder)
  else localStorage.removeItem('pressly-out-dir')
}

;(async () => {
  const saved = localStorage.getItem('pressly-out-dir')
  if (saved) {
    const exists = await window.api.folderExists(saved)
    if (exists) setOutputFolder(saved)
    else localStorage.removeItem('pressly-out-dir')
  }
})()

btnOutDir.onclick = async () => {
  const folder = await window.api.pickFolderOutput(outDirInput.value.trim() || null)
  if (folder) setOutputFolder(folder)
}

btnOutClear.onclick = () => setOutputFolder(null)

// Compress
const compressBtn  = document.getElementById('btn-compress')
const progressEl   = document.getElementById('progress-bar')
const statusEl     = document.getElementById('status')
const progressWrap = document.getElementById('compress-progress')

compressBtn.onclick = async () => {
  if (!files.length) {
    progressWrap.style.display = ''
    statusEl.textContent = 'Add files to the queue first'
    statusEl.className = 'status error'
    return
  }

  const resW = parseInt(document.getElementById('res-w').value) || null
  const resH = parseInt(document.getElementById('res-h').value) || null
  const resolution = resW ? `${resW}:` : resH ? `:${resH}` : 'Original'
  const outputDir  = document.getElementById('out-dir').value.trim() || null

  progressWrap.style.display = ''
  compressBtn.disabled = true
  compressBtn.textContent = 'Processing…'
  progressEl.style.width = '0%'
  progressEl.classList.remove('done')
  progressEl.classList.add('active')

  const errors = []
  let lastOutDir = null

  for (let i = 0; i < files.length; i++) {
    const src  = files[i]
    const name = src.replace(/\\/g, '/').split('/').pop()
    const mode = fileMode(name)
    statusEl.textContent = `[${i + 1}/${files.length}]  ${name}`
    statusEl.className = 'status'

    try {
      let res
      if (currentTab === 'convert') {
        res = await window.api.convert({ src, format: selectedFormat, outputDir })
      } else if (currentTab === 'meta') {
        res = await window.api.stripMeta({ src, outputDir })
      } else if (currentTab === 'audio') {
        const format  = document.querySelector('[data-format].active')?.dataset.format || 'mp3'
        const bitrate = document.querySelector('[data-bitrate].active')?.dataset.bitrate || '192k'
        res = await window.api.extractAudio({ src, format, bitrate, outputDir })
      } else {
        const quality = getQuality(mode)
        const outputFormat = mode === 'photo' ? imageOutputFormat : 'keep'
        res = await window.api.compress({ src, mode, quality, resolution, outputDir, outputFormat })
      }
      lastOutDir = res.dstPath.replace(/\\/g, '/').split('/').slice(0, -1).join('/')
      const saved = ((1 - res.dstSize / res.srcSize) * 100).toFixed(0)
      const li = listEl.querySelector(`[data-path="${src}"]`)
      if (li) {
        const sz = li.querySelector('.file-size')
        if (sz) sz.textContent = `${fmt(res.srcSize)} → ${fmt(res.dstSize)} (−${saved}%)`
      }
    } catch(e) { errors.push(`${name}: ${e.message}`) }

    progressEl.style.width = `${((i + 1) / files.length) * 100}%`
  }

  compressBtn.disabled = false
  compressBtn.textContent = TAB_CONFIG[currentTab].btnLabel
  progressEl.classList.remove('active')
  progressEl.classList.add('done')

  if (errors.length) {
    statusEl.textContent = `Errors: ${errors.join(' | ')}`
    statusEl.className = 'status error'
  } else {
    statusEl.className = 'status success'
    statusEl.innerHTML = lastOutDir
      ? `✓ Done — ${files.length} file(s). <a href="#" id="open-out">Open folder</a>`
      : `✓ Done — ${files.length} file(s)`
    const link = document.getElementById('open-out')
    if (link) link.onclick = e => { e.preventDefault(); window.api.openFolder(lastOutDir) }
  }
}

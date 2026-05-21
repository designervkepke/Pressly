# Pressly

A clean, fast desktop app for compressing videos, images, extracting audio and converting formats — built with Electron and ffmpeg.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue) ![License](https://img.shields.io/badge/license-GPL--2.0--or--later-blue) ![Electron](https://img.shields.io/badge/electron-42-blue)

## Download

Grab the latest release for your platform from the [Releases](https://github.com/designervkepke/pressly/releases) page.

- **macOS** — `.dmg` (Apple Silicon + Intel)
- **Windows** — `.exe` installer (x64)

The app will notify you when a new version is available and update automatically.

## Features

- **Video Compressor** — compress MP4, MOV, MKV, AVI, WMV with adjustable quality and resolution
- **Image Compressor** — compress JPG, PNG, WEBP, BMP with output format selection
- **Audio Extractor** — extract audio from video files as MP3, AAC, WAV or FLAC with bitrate control
- **Format Converter** — convert between video, image and audio formats
- **Strip Metadata** — remove GPS location, timestamps, camera info and other hidden data from images (lossless, via ExifTool) and video files
- Light / Dark theme
- Drag & drop or browse files
- Batch queue — process multiple files at once
- Custom resolution with auto aspect ratio
- Light / Balanced / Strong compression presets + advanced slider
- Persistent output folder (remembered between sessions)

## Requirements

- [Node.js](https://nodejs.org/) 22+

> ffmpeg and ExifTool are bundled automatically — no manual installation needed.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/designervkepke/pressly.git
cd pressly

# Install dependencies
npm install

# Run the app
npm start
```

## Building

```bash
# Build for current platform
npm run build:mac   # macOS → dist/
npm run build:win   # Windows → dist/
```

Releases are built automatically via GitHub Actions when a version tag is pushed.

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [ffmpeg](https://ffmpeg.org/) via ffmpeg-static
- [ExifTool](https://exiftool.org/) via exiftool-vendored
- [electron-builder](https://www.electron.build/) — packaging & installers
- [electron-updater](https://www.electron.build/auto-update) — auto-updates via GitHub Releases
- Vanilla JS + CSS (no frameworks)

## License

GPL-2.0-or-later © [designervkepke](https://github.com/designervkepke/pressly)

This project is licensed under the [GNU General Public License v2.0 or later](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html), including the bundled ffmpeg binaries.

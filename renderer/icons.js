const ICONS = {
  folder: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 5.5A1.5 1.5 0 013.5 4h3.879a1.5 1.5 0 011.06.44l.622.621A1.5 1.5 0 009.12 5.5H16.5A1.5 1.5 0 0118 7v8.5A1.5 1.5 0 0116.5 17h-13A1.5 1.5 0 012 15.5v-10z"
      fill="currentColor"/>
  </svg>`,

  folderOpen: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6.5A1.5 1.5 0 013.5 5h3.879a1.5 1.5 0 011.06.44l.622.621A1.5 1.5 0 009.12 6.5H16.5A1.5 1.5 0 0118 8v1H2V6.5z" fill="currentColor" opacity=".7"/>
    <path d="M2 9h16l-1.447 6.724A1.5 1.5 0 0115.08 17H4.92a1.5 1.5 0 01-1.473-1.276L2 9z" fill="currentColor"/>
  </svg>`,

  video: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7.5 7.5l5 2.5-5 2.5V7.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
  </svg>`,

  image: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="7" cy="8" r="1.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 13l4-4 3 3 2.5-2.5L18 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  disk: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="16" height="11" rx="2" fill="currentColor" opacity=".15"/>
    <rect x="2" y="6" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M2 9h16" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="5.5" cy="13" r="1" fill="currentColor"/>
    <rect x="8" y="12" width="4" height="2" rx="1" fill="currentColor" opacity=".5"/>
  </svg>`,

  plus: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  chevronRight: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  search: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/>
    <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  close: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  remove: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,

  audio: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 10a5.5 5.5 0 0111 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="2" y="10" width="3.5" height="5" rx="1.75" stroke="currentColor" stroke-width="1.5"/>
    <rect x="14.5" y="10" width="3.5" height="5" rx="1.75" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,

  convert: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h11M14 7l-3-3M14 7l-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 13H6M6 13l3-3M6 13l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  shield: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2L4 5v4c0 3.5 2.5 6.3 6 7.5 3.5-1.2 6-4 6-7.5V5l-6-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M7.5 10.5l2 2 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
}

function icon(name, cls = '') {
  const wrap = document.createElement('span')
  wrap.className = `icon ${cls}`
  wrap.innerHTML = ICONS[name] || ''
  return wrap
}

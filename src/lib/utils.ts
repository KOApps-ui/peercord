import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind sınıf birleştirici */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Kısa, çakışmasız kimlik */
export function uid(prefix = ''): string {
  const body = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  return prefix ? `${prefix}_${body}` : body
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const wrapped = (...args: A) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer)
  }
  return wrapped
}

export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let last = 0
  let queued: ReturnType<typeof setTimeout> | undefined
  return (...args: A) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else if (!queued) {
      queued = setTimeout(() => {
        queued = undefined
        last = Date.now()
        fn(...args)
      }, remaining)
    }
  }
}

/* --------------------------- Avatar & renk ---------------------------- */

/** Tohumdan deterministik HSL hue üretir */
export function seedHue(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % 360
}

/** Avatar için iki duraklı gradyan */
export function avatarGradient(seed: string, hue?: number): string {
  const base = hue ?? seedHue(seed)
  const second = (base + 46) % 360
  return `linear-gradient(140deg, hsl(${base} 78% 62%) 0%, hsl(${second} 82% 52%) 100%)`
}

export function hueColor(hue: number, lightness = 66, saturation = 82): string {
  return `hsl(${hue} ${saturation}% ${lightness}%)`
}

export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/[\s_.-]+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/** Deterministik pastel arka plan tonu */
export function toneFor(seed: string): { bg: string; fg: string } {
  const hue = seedHue(seed)
  return {
    bg: `hsl(${hue} 60% 22%)`,
    fg: `hsl(${hue} 90% 88%)`,
  }
}

/* ------------------------------ Biçimleme ----------------------------- */

const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const pad = (n: number) => String(n).padStart(2, '0')

/** 14:05 */
export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Bugün / Dün / 12 Kasım */
export function formatDayLabel(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000)
  if (diffDays === 0) return 'Bugün'
  if (diffDays === 1) return 'Dün'
  if (diffDays < 7) return `${diffDays} gün önce`
  if (d.getFullYear() === now.getFullYear()) return `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** 3 dk önce */
export function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 45_000) return 'az önce'
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} dk önce`
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} sa önce`
  if (diff < 7 * 86_400_000) return `${Math.round(diff / 86_400_000)} gün önce`
  return formatDayLabel(ts)
}

/** 1,4 MB */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value >= 10 ? 0 : 1).replace('.', ',')} ${units[unit]}`
}

/** Sunucu adından kanal adı üretir */
export function slugifyChannel(name: string): string {
  const map: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    İ: 'i',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  }
  return name
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 32)
}

/** Güvenli URL kopyalama */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Dosya boyutu üst sınırı (200 MB) */
export const MAX_FILE_SIZE = 200 * 1024 * 1024

export function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

export function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}

/** 0..255 ses seviyesinden 0..1 normalize değer */
export function normalizeLevel(rms: number): number {
  return clamp(Math.pow(rms, 0.6) * 2.2, 0, 1)
}

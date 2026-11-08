/* ------------------------------------------------------------------ *
 * PeerCord — Notifications: ToastViewport
 * Sağ alnda cam efektli toast'lar, otomatik kapanma çubuğu
 * ------------------------------------------------------------------ */
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const KIND_ICONS: Record<string, string> = {
  success: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  warning: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 5h-2v4h2v-4zm0 6h-2v2h2v-2z',
}

const KIND_BG: Record<string, string> = {
  success: 'bg-[hsl(var(--pc-success))/0.15] border-[hsl(var(--pc-success))/0.3]',
  error: 'bg-[hsl(var(--pc-danger))/0.15] border-[hsl(var(--pc-danger))/0.3]',
  warning: 'bg-[hsl(var(--pc-warning))/0.15] border-[hsl(var(--pc-warning))/0.3]',
  info: 'bg-[hsl(var(--pc-accent-soft))/0.15] border-[hsl(var(--pc-accent))/0.3]',
}

const KIND_ACCENT: Record<string, string> = {
  success: 'text-[hsl(var(--pc-success))]',
  error: 'text-[hsl(var(--pc-danger))]',
  warning: 'text-[hsl(var(--pc-warning))]',
  info: 'text-[hsl(var(--pc-accent))]',
}

interface ToastMessageInternal {
  id: string
  kind: 'info' | 'success' | 'error' | 'warning'
  title: string
  description?: string
  duration?: number
  createdAt?: number
}

export function ToastViewport() {
  const toasts = useAppStore((s) => s.toasts)
  const dismissToast = useAppStore((s) => s.actions.dismissToast)
  const containerRef = useRef<HTMLDivElement>(null)

  // Temizlik: bileşen olduğunda tüm toast'ları DOM'dan kaldır
  useEffect(() => {
    const possible = document.querySelectorAll('[data-toast]')
    return () => {
      possible.forEach((el) => el.remove())
    }
  }, [])

  if (!toasts || toasts.length === 0) {
    return (
      <div
        ref={containerRef}
        className="fixed bottom-20 right-4 lg:right-[260px] z-[70] w-[360px] flex flex-col gap-2 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xs text-[hsl(var(--pc-text-muted))] px-3 py-2 rounded-full bg-[hsl(var(--pc-surface-hover))]"
            >
              Yeni bildirim yok
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 lg:right-[260px] z-[70] w-[360px] flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const t = toast as ToastMessageInternal
          const createdAt = t.createdAt || Date.now()
          const remainingTime = t.duration ? Math.max(0, t.duration - (Date.now() - createdAt)) : 0
          const progress = t.duration ? (remainingTime / t.duration) * 100 : 100

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              data-toast
              className={cn(
                'relative flex items-start gap-3 p-3 rounded-xl shadow-lg w-full max-w-[360px]',
                'border bg-[hsl(var(--pc-surface))]',
                KIND_BG[t.kind]
              )}
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              {/* İkon */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                  KIND_ACCENT[t.kind]
                )}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={KIND_ICONS[t.kind]} />
                </svg>
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-[hsl(var(--pc-text))] text-sm truncate"
                >
                  {t.title}
                </motion.p>
                {t.description && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-[hsl(var(--pc-text-muted))] mt-0.5 truncate"
                  >
                    {t.description}
                  </motion.p>
                )}
              </div>

              {/* Kapat butonu */}
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className={cn(
                  'absolute top-2 right-2 rounded-full p-1 transition-colors',
                  'text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-surface-hover))]'
                )}
                aria-label="Bildirimi kapat"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="6 6 18 6" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Otomatik kapanma çubuğu */}
              {t.duration && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-current/30 w-full rounded-b-xl overflow-hidden">
                  <motion.div
                    className="h-full w-full transition-all duration-150"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: t.kind === 'success' ? 'hsl(var(--pc-success))' :
                                       t.kind === 'error' ? 'hsl(var(--pc-danger))' :
                                       t.kind === 'warning' ? 'hsl(var(--pc-warning))' :
                                       'hsl(var(--pc-accent))',
                    }}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
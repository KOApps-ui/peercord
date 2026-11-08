import { useEffect, useRef, useCallback } from 'react'
import { Maximize2, X, Monitor, Loader2 } from 'lucide-react'
import { Button } from '@/ui/primitives'
import { useAppStore } from '@/lib/store'

interface ScreenShareViewProps {
  peerId: string
  name: string
  onClose: () => void
}

export function ScreenShareView({ peerId, name, onClose }: ScreenShareViewProps) {
  const remoteScreenStreams = useAppStore((s) => s.remoteScreenStreams)

  const videoRef = useRef<HTMLVideoElement>(null)
  const stream = remoteScreenStreams[peerId]
  const isFullscreen = useRef(false)

  // Stream değiştiğinde video elementini güncelle
  useEffect(() => {
    const video = videoRef.current
    if (video && stream) {
      video.srcObject = stream
      video.play().catch((err) => {
        console.error('Ekran paylaşımı oynatma hatası:', err)
      })
    } else if (video) {
      video.srcObject = null
    }
  }, [stream])

  // Stream bittiğinde (kullanıcı tarayıcıdan durdurduğunda) kapat
  useEffect(() => {
    if (!stream && videoRef.current) {
      onClose()
    }
  }, [stream, onClose])

  const handleFullscreen = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!isFullscreen.current) {
        await video.requestFullscreen()
        isFullscreen.current = true
      } else {
        await document.exitFullscreen()
        isFullscreen.current = false
      }
    } catch (err) {
      console.error('Tam ekran hatası:', err)
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen.current) {
        document.exitFullscreen()
        isFullscreen.current = false
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('fullscreenchange', () => {
      isFullscreen.current = document.fullscreenElement === videoRef.current
    })
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[hsl(var(--pc-bg-deep))]"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} ekranını paylaşıyor`}
    >
      {/* Üst bar */}
      <header className="flex items-center justify-between px-4 py-3 pc-glass-strong border-b border-[hsl(var(--pc-border-soft))]">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-[hsl(var(--pc-cyan))]" />
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-[hsl(var(--pc-text-muted))]">Ekran paylaşıyor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            aria-label={isFullscreen.current ? 'Tam ekrandan çık' : 'Tam ekran'}
            className="text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))]"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Ekran paylaşımını kapat"
            className="text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger)/0.1)]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Video alanı */}
      <main className="flex-1 relative overflow-hidden">
        {stream ? (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-[hsl(var(--pc-text-muted))]">
            <Loader2 className="w-10 h-10 text-[hsl(var(--pc-accent))] animate-spin" />
            <p>Yayın bekleniyor...</p>
            <p className="text-xs">Paylaşan kullanıcı ekranını hazırlıyor</p>
          </div>
        )}

        {/* Kullanıcı tarayıcı paylaşımını durdurduğunda bildirim */}
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--pc-bg-deep)/0.95)]">
            <div className="text-center px-6">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--pc-text-subtle))]" />
              <h3 className="text-lg font-medium mb-2">Yayın sona erdi</h3>
              <p className="text-[hsl(var(--pc-text-muted))] mb-6">{name} ekran paylaşımını durdurdu</p>
              <Button variant="secondary" onClick={onClose}>
                Kapat
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
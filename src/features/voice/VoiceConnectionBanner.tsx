import { useMemo } from 'react'
import { Wifi, Loader2, AlertCircle, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/primitives'
import { useAppStore } from '@/lib/store'

export function VoiceConnectionBanner() {
  const connection = useAppStore((s) => s.connection)
  const activeVoiceChannelId = useAppStore((s) => s.activeVoiceChannelId)

  if (!activeVoiceChannelId || connection.status === 'connected') return null

  const isConnecting = connection.status === 'connecting' || connection.status === 'reconnecting'
  const hasError = connection.status === 'error'

  const { icon, label, description, actionLabel, variant } = useMemo(() => {
    if (isConnecting) {
      return {
        icon: Loader2,
        label: 'Bağlanıyor...',
        description: 'Sesli kanala katılım sağlanıyor',
        actionLabel: null,
        variant: 'default' as const,
      }
    }
    if (hasError) {
      return {
        icon: AlertCircle,
        label: 'Bağlantı hatası',
        description: connection.error ?? 'Sesli kanala bağlanırken bir hata oluştu',
        actionLabel: 'Tekrar dene',
        variant: 'danger' as const,
      }
    }
    return {
      icon: Wifi,
      label: 'Bağlantı kesildi',
      description: 'Sesli kanala yeniden bağlanılıyor',
      actionLabel: 'Yeniden bağlan',
      variant: 'secondary' as const,
    }
  }, [connection.status, connection.error])

  const handleAction = () => {
    // joinVoice tekrar çağrılır (store zaten channelId'yi biliyor)
    // Bu basit bir tekrar deneme tetikleyicisi
    window.dispatchEvent(new CustomEvent('peer-cord:voice-reconnect'))
  }

  const Icon = icon

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-2 animate-slide-down',
        'bg-[hsl(var(--pc-surface)/0.98)] backdrop-blur-md border-b border-[hsl(var(--pc-border-soft))]'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Bağlantı durumu: ${label}`}
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              isConnecting && 'bg-[hsl(var(--pc-warning)/0.2)] text-[hsl(var(--pc-warning))]',
              hasError && 'bg-[hsl(var(--pc-danger)/0.2)] text-[hsl(var(--pc-danger))]'
            )}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-[hsl(var(--pc-text-muted))]">{description}</p>
          </div>
        </div>
        {actionLabel && (
          <Button variant={variant} size="sm" onClick={handleAction} className="gap-1">
            <RotateCcw className="w-3 h-3" />
            {actionLabel}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Kapat butonu - sadece banner'ı gizle, bağlantıyı etkileme
            // Gerçek kapatma VoiceControls'tan yapılır
          }}
          aria-label="Bu bildirimi gizle"
          className="text-[hsl(var(--pc-text-subtle))]"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
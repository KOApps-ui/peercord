import { Mic, MicOff, Headphones, VolumeX, Monitor, MonitorOff, Settings, LogOut, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/primitives'
import { Tooltip, TooltipProvider } from '@/ui/primitives'
import { useAppStore } from '@/lib/store'
import { useActions } from '@/lib/store'

export function VoiceControls() {
  const localMuted = useAppStore((s) => s.localMuted)
  const localDeafened = useAppStore((s) => s.localDeafened)
  const localSpeaking = useAppStore((s) => s.localSpeaking)
  const localLevel = useAppStore((s) => s.localLevel)
  const selfScreenSharing = useAppStore((s) => s.selfScreenSharing)
  const activeVoiceChannelId = useAppStore((s) => s.activeVoiceChannelId)
  const { toggleMute, toggleDeafen, startScreenShare, stopScreenShare, leaveVoice, pushToast } = useActions()

  const handleScreenShareToggle = async () => {
    if (selfScreenSharing) {
      await stopScreenShare()
    } else {
      try {
        await startScreenShare()
      } catch (err) {
        pushToast({
          kind: 'error',
          title: 'Ekran paylaşılamadı',
          description: err instanceof Error ? err.message : 'Tarayıcı izni reddedildi veya paylaşım iptal edildi',
        })
      }
    }
  }

  const handleLeave = async () => {
    await leaveVoice()
  }

  const handleMuteError = async () => {
    try {
      await toggleMute()
    } catch (err) {
      pushToast({
        kind: 'error',
        title: 'Mikrofon açılamadı',
        description: 'Tarayıcı mikrofon iznini reddetti. Sadece dinlemek ister misiniz?',
      })
    }
  }

  if (!activeVoiceChannelId) return null

  return (
    <TooltipProvider>
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 animate-slide-up"
        role="toolbar"
        aria-label="Sesli kanal kontrolleri"
      >
        <div className="max-w-screen-2xl mx-auto flex items-center justify-center gap-3">
          {/* Mikrofon */}
          <Tooltip label={localMuted ? 'Mikrofonu aç (Ctrl+Shift+M)' : 'Mikrofonu kapat (Ctrl+Shift+M)'}>
            <Button
              variant={localMuted ? 'secondary' : 'primary'}
              size="lg"
              className={cn(
                'relative transition-all duration-200',
                localMuted && 'bg-[hsl(var(--pc-danger)/0.2)] border-[hsl(var(--pc-danger)/0.5)] text-[hsl(var(--pc-danger))]',
                localSpeaking && 'animate-pc-pulse-ring'
              )}
              onClick={handleMuteError}
              aria-label={localMuted ? 'Mikrofonu aç' : 'Mikrofonu kapat'}
              aria-pressed={localMuted}
            >
              <div className="flex items-center gap-2">
                {localSpeaking && localLevel > 0.01 && (
                  <div
                    className="absolute inset-0 rounded-full animate-pc-pulse-ring pointer-events-none"
                    style={{
                      boxShadow: '0 0 0 0 hsl(var(--pc-success)/0.55)',
                    } as React.CSSProperties}
                    aria-hidden="true"
                  />
                )}
                {localMuted ? (
                  <MicOff className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </div>
            </Button>
          </Tooltip>

          {/* Kulaklık (Deafen) */}
          <Tooltip label={localDeafened ? 'Kulaklığı aç (Ctrl+Shift+D)' : 'Kulaklığı kapat (Ctrl+Shift+D)'}>
            <Button
              variant={localDeafened ? 'secondary' : 'primary'}
              size="lg"
              className={cn(
                'transition-all duration-200',
                localDeafened && 'bg-[hsl(var(--pc-warning)/0.2)] border-[hsl(var(--pc-warning)/0.5)] text-[hsl(var(--pc-warning))]'
              )}
              onClick={toggleDeafen}
              aria-label={localDeafened ? 'Kulaklığı aç' : 'Kulaklığı kapat'}
              aria-pressed={localDeafened}
            >
              {localDeafened ? <VolumeX className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
            </Button>
          </Tooltip>

          {/* Ekran paylaşımı */}
          <Tooltip label={selfScreenSharing ? 'Ekran paylaşımını durdur' : 'Ekran paylaşımı başlat'}>
            <Button
              variant={selfScreenSharing ? 'secondary' : 'primary'}
              size="lg"
              className={cn(
                'transition-all duration-200',
                selfScreenSharing && 'bg-[hsl(var(--pc-cyan)/0.2)] border-[hsl(var(--pc-cyan)/0.5)] text-[hsl(var(--pc-cyan))]'
              )}
              onClick={handleScreenShareToggle}
              aria-label={selfScreenSharing ? 'Ekran paylaşımını durdur' : 'Ekran paylaşımı başlat'}
              aria-pressed={selfScreenSharing}
            >
              {selfScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>
          </Tooltip>

          {/* Kamera (gelecek için placeholder - devre dışı) */}
          <Tooltip label="Kamera henüz desteklenmiyor">
            <Button
              variant="ghost"
              size="lg"
              disabled
              className="text-[hsl(var(--pc-text-subtle))]"
              aria-label="Kamera (yakında)"
            >
              <X className="w-5 h-5" />
            </Button>
          </Tooltip>

          {/* Ayarlar */}
          <Tooltip label="Ses ayarları">
            <Button variant="ghost" size="lg" className="text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))]">
              <Settings className="w-5 h-5" />
            </Button>
          </Tooltip>

          {/* Ayrıl (Kırmızı) */}
          <Tooltip label="Sesli kanaldan ayrıl">
            <Button
              variant="danger"
              size="lg"
              className="ml-2 px-6 gap-2 font-medium"
              onClick={handleLeave}
              aria-label="Sesli kanaldan ayrıl"
            >
              <LogOut className="w-5 h-5" />
              <span>Ayrıl</span>
            </Button>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
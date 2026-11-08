import { useEffect, useMemo, useCallback } from 'react'
import { Users, Wifi, WifiOff, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/primitives'
import { VoiceTile } from './VoiceTile'
import { useRemoteAudio } from './useRemoteAudio'
import { useVoiceMembers, useAppStore, useMe, useActions } from '@/lib/store'
import type { Channel } from '@/types'

interface VoiceStageProps {
  channel: Channel | null
  onClose?: () => void
}

export function VoiceStage({ channel, onClose }: VoiceStageProps) {
  const voiceMembers = useVoiceMembers()
  const me = useMe()
  const activeVoiceChannelId = useAppStore((s) => s.activeVoiceChannelId)
  const connection = useAppStore((s) => s.connection)
  const localMuted = useAppStore((s) => s.localMuted)
  const localDeafened = useAppStore((s) => s.localDeafened)
  const localSpeaking = useAppStore((s) => s.localSpeaking)
  const localLevel = useAppStore((s) => s.localLevel)
  const selfScreenSharing = useAppStore((s) => s.selfScreenSharing)
  const { joinVoice, leaveVoice, toggleMute, toggleDeafen, pushToast } =
    useActions()

  // Uzak ses akışlarını yönet
  useRemoteAudio()

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key === 'M') {
          e.preventDefault()
          toggleMute()
        } else if (e.key === 'D') {
          e.preventDefault()
          toggleDeafen()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleMute, toggleDeafen])

  // Sesli kanala katılma/ayrılma effect'i
  useEffect(() => {
    if (channel && activeVoiceChannelId !== channel.id) {
      joinVoice(channel.id).catch((err) => {
        pushToast({
          kind: 'error',
          title: 'Kanala bağlanılamadı',
          description: err instanceof Error ? err.message : 'Bilinmeyen hata',
        })
      })
    } else if (!channel && activeVoiceChannelId) {
      leaveVoice()
    }
  }, [channel, activeVoiceChannelId, joinVoice, leaveVoice, pushToast])

  // Sıralama: konuşanlar önce, sonra isim sırası
  const sortedMembers = useMemo(() => {
    return [...voiceMembers].sort((a, b) => {
      if (a.speaking !== b.speaking) return b.speaking ? 1 : -1
      return a.name.localeCompare(b.name)
    })
  }, [voiceMembers])

  // Grid kolon sayısı
  const gridCols = useMemo(() => {
    const count = sortedMembers.length
    if (count <= 1) return 'grid-cols-1'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 9) return 'grid-cols-3'
    return 'grid-cols-4'
  }, [sortedMembers.length])

  // Görünen üyeler (maks 12)
  const visibleMembers = sortedMembers.slice(0, 12)
  const remainingCount = sortedMembers.length - 12

  const handleLeave = useCallback(async () => {
    await leaveVoice()
    onClose?.()
  }, [leaveVoice, onClose])

  if (!channel) {
    return (
      <div className="flex h-full items-center justify-center pc-panel rounded-[var(--radius-xl)]">
        <div className="text-center px-6">
          <Users className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--pc-text-subtle))]" />
          <h3 className="text-lg font-medium mb-2">Sesli kanalda değilsiniz</h3>
          <p className="text-[hsl(var(--pc-text-muted))]">Bir sesli kanala tıklayarak katılın</p>
        </div>
      </div>
    )
  }

  const isConnecting = connection.status === 'connecting' || connection.status === 'reconnecting'
  const hasError = connection.status === 'error'

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Aurora arka plan */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(40rem 25rem at 20% 10%, hsl(var(--pc-accent)/0.12), transparent 60%),
            radial-gradient(35rem 22rem at 80% 90%, hsl(var(--pc-violet)/0.1), transparent 65%),
            radial-gradient(30rem 20rem at 50% 50%, hsl(var(--pc-cyan)/0.06), transparent 70%)
          `,
        } as React.CSSProperties}
      />

      {/* Üst bar */}
      <header className="flex items-center justify-between gap-4 px-4 py-3 pc-glass-strong border-b border-[hsl(var(--pc-border-soft))] relative z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--pc-accent)) 0%, hsl(var(--pc-violet)) 100%)' } as React.CSSProperties}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold truncate">{channel.name}</h2>
            <div className="flex items-center gap-3 text-xs text-[hsl(var(--pc-text-muted))]">
              <span className="flex items-center gap-1">
                {connection.status === 'connected' ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    {connection.peerCount > 0 ? `${connection.peerCount}ms` : 'Bağlı'}
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    {isConnecting ? 'Bağlanıyor...' : hasError ? 'Hata' : 'Bağlantı yok'}
                  </>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {voiceMembers.length} {voiceMembers.length === 1 ? 'kişi' : 'kişi'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnecting && (
            <span className="text-xs text-[hsl(var(--pc-warning))] flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Yeniden bağlanıyor...
            </span>
          )}
          {hasError && (
            <Button
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--pc-danger))] gap-1"
              onClick={() => channel && joinVoice(channel.id)}
            >
              <WifiOff className="w-3 h-3" />
              Tekrar dene
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger)/0.1)]"
            onClick={handleLeave}
            aria-label="Sahneden ayrıl"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Orta: Katılımcı ızgarası */}
      <main className="flex-1 overflow-auto p-4 relative z-10">
        {voiceMembers.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center px-6">
              <Users className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--pc-text-subtle))]" />
              <h3 className="text-lg font-medium mb-2">Kimse yok</h3>
              <p className="text-[hsl(var(--pc-text-muted))] mb-6">Arkadaşını davet et ve konuşmaya başla</p>
              <Button variant="secondary" onClick={() => navigator.share?.({ title: channel.name })}>
                <ChevronDown className="w-4 h-4 mr-2" />
                Davet bağlantısı kopyala
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'grid gap-3 max-w-6xl mx-auto',
              gridCols,
              visibleMembers.length === 1 && 'place-items-center max-w-md'
            )}
            role="list"
            aria-label={`Sesli kanal katılımcıları, ${voiceMembers.length} kişi`}
          >
            {visibleMembers.map((member) => (
              <VoiceTile
                key={member.peerId}
                member={member}
                isSelf={member.peerId === me?.id}
                localLevel={localLevel}
                onMuteLocal={toggleMute}
              />
            ))}
            {remainingCount > 0 && (
              <div className="pc-panel rounded-[var(--radius-lg)] flex items-center justify-center p-4 col-span-full">
                <span className="text-[hsl(var(--pc-text-muted))] font-medium">
                  +{remainingCount} {remainingCount === 1 ? 'kişi daha' : 'kişi daha'}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Alt: Kendi durum özeti (mobil/ Küçük ekranlarda) */}
      <footer className="px-4 py-3 pc-glass-strong border-t border-[hsl(var(--pc-border-soft))] relative z-10">
        <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <span className={cn('w-2 h-2 rounded-full', localMuted ? 'bg-[hsl(var(--pc-danger))]' : 'bg-[hsl(var(--pc-success))]')} />
            <span className="text-[hsl(var(--pc-text-muted))]">
              {localMuted ? 'Mikrofon kapalı' : localSpeaking ? 'Konuşuyorsunuz' : 'Dinleniyor'}
            </span>
            {localDeafened && (
              <>
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--pc-warning))]" />
                <span className="text-[hsl(var(--pc-warning))]">Kulaklık kapalı</span>
              </>
            )}
            {selfScreenSharing && (
              <>
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--pc-cyan))] animate-pc-float" />
                <span className="text-[hsl(var(--pc-cyan))]">Ekran paylaşıyorsunuz</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--pc-text-subtle))]">
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--pc-surface-hover))] rounded text-[hsl(var(--pc-text-muted))]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--pc-surface-hover))] rounded text-[hsl(var(--pc-text-muted))]">Shift</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--pc-surface-hover))] rounded text-[hsl(var(--pc-text-muted))]">M</kbd>
            <span className="mx-2">/</span>
            <kbd className="px-1.5 py-0.5 bg-[hsl(var(--pc-surface-hover))] rounded text-[hsl(var(--pc-text-muted))]">D</kbd>
          </div>
        </div>
      </footer>
    </div>
  )
}
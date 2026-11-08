import { useMemo } from 'react'
import { Mic, Headphones, VolumeX, Wifi, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/ui/primitives'
import { useAppStore, useVoiceMembers } from '@/lib/store'
import { useActions } from '@/lib/store'
import type { Channel } from '@/types'

interface VoiceBarProps {
  channel: Channel | null
  onNavigate?: () => void
}

export function VoiceBar({ channel, onNavigate }: VoiceBarProps) {
  const voiceMembers = useVoiceMembers()
  const connection = useAppStore((s) => s.connection)
  const activeVoiceChannelId = useAppStore((s) => s.activeVoiceChannelId)
  const localMuted = useAppStore((s) => s.localMuted)
  const localDeafened = useAppStore((s) => s.localDeafened)
  const { leaveVoice, toggleMute, toggleDeafen } = useActions()

  if (!channel || !activeVoiceChannelId) return null

  const memberCount = voiceMembers.length
  const pingText = useMemo(() => {
    if (connection.status !== 'connected') return 'Bağlanıyor...'
    if (connection.peerCount > 0) return `${connection.peerCount} ms`
    return 'P2P'
  }, [connection.status, connection.peerCount])

  const handleLeave = () => {
    leaveVoice()
  }

  const handleNavigate = () => {
    onNavigate?.()
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40 px-4 py-2 animate-slide-down',
        'bg-[hsl(var(--pc-surface)/0.95)] backdrop-blur-md border-b border-[hsl(var(--pc-border-soft))]'
      )}
      role="status"
      aria-live="polite"
      aria-label="Sesli kanal bağlantısı aktif"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Sol: Kanal bilgisi */}
        <button
          type="button"
          onClick={handleNavigate}
          className="flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-md)] pc-panel transition-all hover:shadow-[var(--shadow-float)] group"
          aria-label={`Sesli kanala git: ${channel.name}`}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              connection.status === 'connected' ? 'bg-[hsl(var(--pc-success))]' : 'bg-[hsl(var(--pc-warning))] animate-pulse'
            )}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate max-w-[200px]">{channel.name}</p>
            <p className="text-xs text-[hsl(var(--pc-text-muted))] flex items-center gap-1">
              <span>{memberCount} {memberCount === 1 ? 'kişi' : 'kişi'}</span>
              <span className="text-[hsl(var(--pc-border))]">·</span>
              <Wifi className="w-3 h-3" />
              <span>{pingText}</span>
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[hsl(var(--pc-text-subtle))] group-hover:text-[hsl(var(--pc-text))] transition-colors" />
        </button>

        {/* Sağ: Hızlı kontroller */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn('transition-colors', localMuted && 'text-[hsl(var(--pc-danger))] bg-[hsl(var(--pc-danger)/0.1)]')}
            onClick={toggleMute}
            aria-label={localMuted ? 'Mikrofonu aç (Ctrl+Shift+M)' : 'Mikrofonu kapat (Ctrl+Shift+M)'}
            aria-pressed={localMuted}
          >
            {localMuted ? <Mic className="w-4 h-4" strokeWidth={2.5} /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('transition-colors', localDeafened && 'text-[hsl(var(--pc-warning))] bg-[hsl(var(--pc-warning)/0.1)]')}
            onClick={toggleDeafen}
            aria-label={localDeafened ? 'Kulaklığı aç (Ctrl+Shift+D)' : 'Kulaklığı kapat (Ctrl+Shift+D)'}
            aria-pressed={localDeafened}
          >
            {localDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger)/0.1)]"
            onClick={handleLeave}
            aria-label="Sesli kanaldan ayrıl"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
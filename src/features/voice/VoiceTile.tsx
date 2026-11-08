import { useMemo } from 'react'
import { MicOff, Monitor, UserCheck, VolumeX } from 'lucide-react'
import { cn, avatarGradient } from '@/lib/utils'
import { Avatar } from '@/ui/primitives'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/primitives'
import { Button } from '@/ui/primitives'
import type { VoiceMemberState } from '@/types'

interface VoiceTileProps {
  member: VoiceMemberState
  isSelf: boolean
  localLevel: number
  onMuteLocal: () => void
}

export function VoiceTile({ member, isSelf, localLevel, onMuteLocal }: VoiceTileProps) {
  const { name, avatarSeed, accentHue, muted, deafened, speaking, screensharing, level } = member

  const gradient = useMemo(() => avatarGradient(avatarSeed, accentHue), [avatarSeed, accentHue])
  const displayLevel = isSelf ? localLevel : level
  const isSpeaking = isSelf ? speaking : speaking
  const showSpeakingRing = isSpeaking && displayLevel > 0.01

  return (
    <Popover>
      <PopoverTrigger>
        <div
          className={cn(
            'relative flex flex-col items-center gap-2 pc-panel rounded-[var(--radius-lg)] p-3 min-w-0 transition-all duration-200',
            'hover:shadow-[var(--shadow-float)] hover:border-[hsl(var(--pc-border))]',
            isSelf && 'ring-2 ring-[hsl(var(--pc-accent)/0.5)]',
            showSpeakingRing && 'animate-pc-pulse-ring'
          )}
          style={{
            '--avatar-gradient': gradient,
          } as React.CSSProperties}
        >
          {/* Avatar */}
          <div className="relative">
            <Avatar
              seed={avatarSeed}
              name={name}
              size={48}
              className="relative z-10"
              style={{
                background: gradient,
                boxShadow: showSpeakingRing ? '0 0 0 3px hsl(var(--pc-success)/0.6)' : 'none',
              } as React.CSSProperties}
            />
            {/* Konuşma halkası animasyonu */}
            {showSpeakingRing && (
              <div
                className="absolute -inset-1 rounded-full animate-pc-pulse-ring pointer-events-none"
                style={{
                  boxShadow: '0 0 0 0 hsl(var(--pc-success)/0.55)',
                  background: 'transparent',
                } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
            {/* "Sen" etiketi */}
            {isSelf && (
              <span className="absolute -bottom-1 -right-1 bg-[hsl(var(--pc-accent))] text-[hsl(var(--pc-accent-text))] text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap">
                Sen
              </span>
            )}
          </div>

          {/* İsim */}
          <span className="text-sm font-medium truncate max-w-full text-center" title={name}>
            {name}
          </span>

          {/* Durum ikonları */}
          <div className="flex items-center gap-1.5">
            {muted && (
              <MicOff
                className="w-4 h-4 text-[hsl(var(--pc-text-muted))] shrink-0"
                aria-label="Mikrofon kapalı"
              />
            )}
            {deafened && (
              <VolumeX
                className="w-4 h-4 text-[hsl(var(--pc-warning))] shrink-0"
                aria-label="Kulaklık kapalı (sağırlaştırılmış)"
              />
            )}
            {screensharing && (
              <Monitor
                className="w-4 h-4 text-[hsl(var(--pc-cyan))] shrink-0 animate-pc-float"
                aria-label="Ekran paylaşıyor"
              />
            )}
            {isSelf && (
              <UserCheck
                className="w-4 h-4 text-[hsl(var(--pc-success))] shrink-0"
                aria-label="Sen"
              />
            )}
          </div>

          {/* Ses seviyesi çubuğu */}
          <div
            className="w-full h-1.5 bg-[hsl(var(--pc-surface-hover))] rounded-full overflow-hidden"
            role="img"
            aria-label={`Ses seviyesi ${Math.round(displayLevel * 100)}%`}
          >
            <div
              className="h-full rounded-full transition-all duration-100 ease-out"
              style={{
                width: `${displayLevel * 100}%`,
                background: `linear-gradient(90deg, hsl(var(--pc-success)) 0%, hsl(var(--pc-accent)) 100%)`,
                boxShadow: displayLevel > 0.1 ? '0 0 8px hsl(var(--pc-success)/0.6)' : 'none',
              } as React.CSSProperties}
            />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="center" className="w-64 pc-panel p-3">
        <div className="flex items-center gap-3">
          <Avatar seed={avatarSeed} name={name} size={48} style={{ background: gradient } as React.CSSProperties} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{name}</p>
            <p className="text-xs text-[hsl(var(--pc-text-muted))]">Katılımcı</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[hsl(var(--pc-border-soft))] flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={onMuteLocal}
            disabled={isSelf && !muted}
          >
            {muted ? 'Mikrofonu Aç' : 'Sesi Kıs (Yerel)'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
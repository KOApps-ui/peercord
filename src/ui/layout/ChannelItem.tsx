import { motion, AnimatePresence } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Channel, ID, VoiceMemberState } from '@/types'
import { useAppStore, useVoiceMembers } from '@/lib/store'
import { Avatar, IconButton, Dot, Badge } from '@/ui/primitives'
import { Hash, Speaker, MoreHorizontal, Lock, Clock } from 'lucide-react'

export interface ChannelItemProps {
  channel: Channel
  isActive: boolean
  onSelect: (channelId: ID) => void
  onSettings: (channelId: ID) => void
}

export function ChannelItem({
  channel,
  isActive,
  onSelect,
  onSettings,
}: ChannelItemProps): ReactNode {
  const { reads, lastActivity } = useAppStore((s) => ({
    reads: s.reads,
    lastActivity: s.lastActivity,
  }))
  const voiceMembers = useVoiceMembers()

  const unread =
    reads[channel.id] != null &&
    lastActivity[channel.id] != null &&
    lastActivity[channel.id] > reads[channel.id]

  const inVoice = voiceMembers.filter(
    (m) => (m as unknown as { voiceChannelId: ID }).voiceChannelId === channel.id,
  )

  const handleClick = () => onSelect(channel.id)

  return (
    <motion.button
      whileHover={{ backgroundColor: 'hsl(var(--pc-surface-hover))' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      aria-label={channel.name}
      aria-current={isActive ? 'true' : 'false'}
      tabIndex={0}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]',
        isActive
          ? 'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent-text))]'
          : 'text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))]',
      )}
    >
      {channel.type === 'text' ? (
        <Hash className="shrink-0 h-4 w-4" />
      ) : (
        <Speaker className="shrink-0 h-4 w-4" />
      )}
      <span className="truncate">{channel.name}</span>
      {unread && <Dot status="online" className="h-1.5 w-1.5" />}
      {channel.locked && (
        <Lock className="shrink-0 h-3.5 w-3.5 opacity-60" />
      )}

      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="ml-auto shrink-0"
          >
            <Badge tone="neutral" className="px-2 py-0.5">
              <Clock className="mr-1 h-3 w-3" />
              <span className="text-[10px]">Şimdi</span>
            </Badge>
          </motion.span>
        )}
      </AnimatePresence>

      {channel.type === 'voice' && inVoice.length > 0 && (
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <AvatarStackMini
            members={inVoice.slice(0, 6)}
            speaking={new Set(inVoice.filter((m) => m.speaking).map((m) => m.userId))}
          />
        </div>
      )}

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute right-2.5 flex h-6 w-6 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconButton
              aria-label={`${channel.name} ayarları`}
              tooltip="Kanal ayarları"
              onClick={(e) => {
                e.stopPropagation()
                onSettings(channel.id)
              }}
              size="sm"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

interface AvatarStackMiniProps {
  members: VoiceMemberState[]
  speaking: Set<string>
}

function AvatarStackMini({
  members,
  speaking,
}: AvatarStackMiniProps): ReactNode {
  if (members.length === 0) return null
  const size = 24
  const overlap = size * 0.45
  return (
    <div className="relative inline-flex shrink-0">
      {members.map((m, i) => {
        const isSpeaking = speaking.has(m.userId)
        return (
          <motion.div
            key={m.userId}
            whileHover={{ scale: 1.1 }}
            className="relative z-10"
            style={{
              left: -i * overlap,
              zIndex: members.length - i,
            }}
          >
            <Avatar
              seed={m.avatarSeed}
              name={m.name}
              size={size}
              hue={m.accentHue}
              status="online"
              ring={isSpeaking ? 'speaking' : 'none'}
            />
          </motion.div>
        )
      })}
      {members.length > 6 && (
        <div
          className="flex h-full w-full items-center justify-center rounded-full border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] text-[hsl(var(--pc-text-muted))] text-xs font-medium"
          style={{
            width: size,
            height: size,
            left: -(Math.min(members.length, 6) - 1) * overlap,
            position: 'relative',
            zIndex: 0,
          }}
        >
          +{members.length - 6}
        </div>
      )}
    </div>
  )
}

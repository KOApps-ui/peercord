import { motion } from 'motion/react'
import { cn, avatarGradient, initials } from '@/lib/utils'
import type { CSSProperties } from 'react'

type Ring = 'none' | 'speaking' | 'accent'

export interface AvatarProps {
  seed: string
  name: string
  size?: number
  hue?: number
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  ring?: Ring
  className?: string
  style?: CSSProperties
}

const STATUS_COLOR: Record<string, string> = {
  online: 'hsl(var(--pc-online))',
  idle: 'hsl(var(--pc-idle))',
  dnd: 'hsl(var(--pc-dnd))',
  offline: 'hsl(var(--pc-offline))',
}

export function Avatar({
  seed,
  name,
  size = 40,
  hue,
  status,
  ring = 'none',
  className,
  style,
}: AvatarProps) {
  const grad = avatarGradient(seed, hue)
  const statusColor = status ? STATUS_COLOR[status] : 'hsl(var(--pc-offline))'

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0',
        ring === 'speaking' && 'ring-2 ring-[hsl(var(--pc-success))] ring-offset-2 ring-offset-[hsl(var(--pc-surface))]',
        ring === 'accent' && 'ring-2 ring-[hsl(var(--pc-accent))] ring-offset-2 ring-offset-[hsl(var(--pc-surface))]',
        className
      )}
      style={{ width: size, height: size, ...style }}
    >
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full overflow-hidden border border-white/60 bg-[hsl(var(--pc-surface-hover))]',
          status === 'online' && 'shadow-[0_0_0_12px_hsl(var(--pc-online)/0.25)]'
        )}
        style={{ width: size, height: size, backgroundImage: grad }}
      >
        {initials(name)}
      </div>
      {status && status !== 'offline' && (
        <span
          className="absolute right-0 bottom-0 flex h-3 w-3 items-center justify-center rounded-full border border-[hsl(var(--pc-surface))] bg-[hsl(var(--pc-bg))]"
          style={{ width: size * 0.25, height: size * 0.25 }}
        >
          <span
            className="flex h-full w-full rounded-full animate-pulse"
            style={{
              backgroundColor: statusColor,
              width: size * 0.15,
              height: size * 0.15,
            }}
          />
        </span>
      )}
    </div>
  )
}

export interface AvatarStackProps {
  members: Array<{ seed: string; name: string; status?: 'online' | 'idle' | 'dnd' | 'offline' }>
  max?: number
  size?: number
  className?: string
}

export function AvatarStack({
  members,
  max = 5,
  size = 28,
  className,
}: AvatarStackProps) {
  const visible = members.slice(0, max)
  const overflow = members.length - max
  const overlap = size * 0.4

  return (
    <div className={cn('inline-flex', className)} style={{ position: 'relative' }}>
      {visible.map((member, i) => (
        <Avatar
          key={member.seed}
          seed={member.seed}
          name={member.name}
          size={size}
          status={member.status}
          ring="none"
          className="relative z-10"
          style={{
            position: 'relative',
            left: -i * overlap,
            zIndex: visible.length - i,
          }}
        />
      ))}
      {overflow > 0 && (
        <div
          className="flex h-full w-full items-center justify-center rounded-full border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] text-[hsl(var(--pc-text-muted))] text-xs font-medium"
          style={{
            width: size,
            height: size,
            position: 'relative',
            left: -(visible.length - 1) * overlap,
            zIndex: 0,
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}

export interface GuildIconProps {
  seed: string
  name: string
  size: number
  active?: boolean
  onClick?: () => void
  className?: string
}

export function GuildIcon({
  seed,
  name,
  size,
  active = false,
  onClick,
  className,
}: GuildIconProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={name}
      className={cn(
        'relative flex h-full w-full items-center justify-center rounded-[var(--radius-md)] overflow-hidden border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] transition-all duration-150 hover:border-[hsl(var(--pc-accent))/0.6] hover:shadow-[0_0_24px_hsl(var(--pc-accent)/0.35)]',
        active &&
          'border-[hsl(var(--pc-accent))] shadow-[0_0_24px_hsl(var(--pc-accent)/0.45)]',
        className
      )}
      style={{ width: size, height: size }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] overflow-hidden" style={{ backgroundImage: avatarGradient(seed) }}>
        {initials(name)}
      </div>
      {active && (
        <span className="absolute -right-1 -bottom-1 flex h-3 w-3 items-center justify-center rounded-full border border-[hsl(var(--pc-bg))] bg-[hsl(var(--pc-success))]" />
      )}
    </motion.button>
  )
}

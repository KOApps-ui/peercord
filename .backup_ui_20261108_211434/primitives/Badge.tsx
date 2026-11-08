import * as React from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'accent' | 'neutral' | 'success' | 'danger' | 'warning'

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: React.ReactNode
}

function badgeTone(tone: BadgeTone) {
  switch (tone) {
    case 'accent':
      return 'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent-text))] border-[hsl(var(--pc-accent))/0.4]'
    case 'neutral':
      return 'bg-[hsl(var(--pc-surface-hover))] text-[hsl(var(--pc-text-muted))] border-[hsl(var(--pc-border))]'
    case 'success':
      return 'bg-[hsl(var(--pc-success))/0.15] text-[hsl(var(--pc-success))] border-[hsl(var(--pc-success))/0.4]'
    case 'danger':
      return 'bg-[hsl(var(--pc-danger))/0.15] text-[hsl(var(--pc-danger))] border-[hsl(var(--pc-danger))/0.4]'
    case 'warning':
      return 'bg-[hsl(var(--pc-warning))/0.15] text-[hsl(var(--pc-warning))] border-[hsl(var(--pc-warning))/0.4]'
  }
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-md)] border border-transparent px-2.5 py-0.5 text-[10px] font-medium leading-none uppercase tracking-wider',
        badgeTone(tone),
        className
      )}
    >
      {children}
    </span>
  )
}

interface PillProps {
  value: string
  removable?: boolean
  onRemove?: (value: string) => void
  className?: string
}

export function Pill({ value, removable = false, onRemove, className }: PillProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] px-2.5 py-0.5 text-xs text-[hsl(var(--pc-text-muted))]', className)}>
      {value}
      {removable && onRemove && (
        <button
          type="button"
          aria-label="Kaldır"
          onClick={() => onRemove(value)}
          className="flex h-3 w-3 items-center justify-center rounded-full text-[hsl(var(--pc-text-subtle))] hover:text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-border))] transition-colors duration-150"
        >
          ✕
        </button>
      )}
    </span>
  )
}

interface KbdProps {
  className?: string
  children: React.ReactNode
}

export function Kbd({ className, children }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center rounded-[var(--radius-xs)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-1.5 py-0.5 text-[11px] font-medium text-[hsl(var(--pc-text-muted))] shadow-[0_1px_2px_hsl(0,0%,0%/0.3)]',
        className
      )}
    >
      {children}
    </kbd>
  )
}

interface DotProps {
  status?: 'online' | 'idle' | 'dnd' | 'offline'
  className?: string
}

const DOT_COLOR: Record<string, string> = {
  online: 'hsl(var(--pc-online))',
  idle: 'hsl(var(--pc-idle))',
  dnd: 'hsl(var(--pc-dnd))',
  offline: 'hsl(var(--pc-offline))',
}

export function Dot({ status = 'online', className }: DotProps) {
  return (
    <span
      className={cn('flex h-2 w-2 rounded-full animate-pulse', className)}
      style={{ backgroundColor: DOT_COLOR[status] }}
    />
  )
}

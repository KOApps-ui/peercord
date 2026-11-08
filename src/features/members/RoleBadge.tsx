/* ------------------------------------------------------------------ *
 * PeerCord — Members: RoleBadge
 * Rol rengiyle (hueColor) hap şeklinde etiket. Küçük ve koyu
 * (solid) varyantları vardır.
 * ------------------------------------------------------------------ */
import { cn, hueColor } from '@/lib/utils'
import type { Role } from '@/types'

export type RoleBadgeSize = 'sm' | 'md'
export type RoleBadgeTone = 'soft' | 'solid'

export interface RoleBadgeProps {
  role: Role
  /** Küçük/küçük-orta boyut */
  size?: RoleBadgeSize
  /** `solid` = koyu dolgulu varyant */
  tone?: RoleBadgeTone
  className?: string
  /** Rozet üzerine gelindiğinde ipucu */
  title?: string
}

export function RoleBadge({
  role,
  size = 'sm',
  tone = 'soft',
  className,
  title,
}: RoleBadgeProps) {
  const base = hueColor(role.hue)
  const solid = tone === 'solid'

  return (
    <span
      title={title ?? `${role.name} rolü`}
      className={cn(
        'inline-flex max-w-[120px] items-center gap-1 rounded-full border font-medium leading-none',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
      style={{
        color: solid ? `hsl(${role.hue} 72% 14%)` : base,
        backgroundColor: solid ? base : `hsl(${role.hue} 62% 42% / 0.16)`,
        borderColor: `hsl(${role.hue} 62% 50% / ${solid ? 0 : 0.4})`,
      }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: solid ? `hsl(${role.hue} 72% 20%)` : base }}
      />
      <span className="truncate">{role.name}</span>
    </span>
  )
}

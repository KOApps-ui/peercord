/* ------------------------------------------------------------------ *
 * PeerCord — Guild: GuildBadge
 * Sunucu kartı küçük özeti: ikon, ad, üye ve çevrimiçi sayısı,
 * şifreli ise kilit ikonu. Sunucu ayarlarında kullanılır.
 * ------------------------------------------------------------------ */
import { Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGuild, useMe, useMembers } from '@/lib/store'
import { GuildIcon } from '@/ui/primitives'
import type { Guild } from '@/types'

export interface GuildBadgeProps {
  /** Verilmezse store'daki aktif sunucu kullanılır */
  guild?: Guild | null
  className?: string
}

export function GuildBadge({ guild: guildProp, className }: GuildBadgeProps) {
  const storeGuild = useGuild()
  const me = useMe()
  const members = useMembers()

  const guild = guildProp ?? storeGuild

  if (!guild) {
    return (
      <div
        className={cn(
          'pc-panel flex items-center gap-3 rounded-[var(--radius-lg)] p-3',
          className
        )}
      >
        <p className="text-sm text-[hsl(var(--pc-text-subtle))]">Sunucu seçili değil</p>
      </div>
    )
  }

  /* Kendim dahil: peer listesi + yerel profil */
  const memberCount = members.length + (me ? 1 : 0)
  const onlineCount = members.filter((m) => m.status !== 'offline').length + (me ? 1 : 0)

  return (
    <div
      className={cn(
        'pc-panel flex items-center gap-3 rounded-[var(--radius-lg)] p-3',
        className
      )}
    >
      <GuildIcon seed={guild.iconSeed} name={guild.name} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-[hsl(var(--pc-text))]">
            {guild.name}
          </h3>
          {guild.encrypted && (
            <Lock
              size={12}
              aria-label="Uçtan uca şifreli"
              className="shrink-0 text-[hsl(var(--pc-success))]"
            />
          )}
        </div>

        {guild.description && (
          <p className="mt-0.5 truncate text-xs text-[hsl(var(--pc-text-muted))]">
            {guild.description}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[hsl(var(--pc-text-subtle))]">
          <span className="flex items-center gap-1">
            <Users size={11} aria-hidden="true" className="shrink-0" />
            <span className="tabular-nums">{memberCount} üye</span>
          </span>
          <span className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--pc-online))]"
            />
            <span className="tabular-nums">{onlineCount} çevrimiçi</span>
          </span>
          {guild.encrypted && (
            <span className="text-[hsl(var(--pc-success))]">Şifreli</span>
          )}
        </div>
      </div>
    </div>
  )
}

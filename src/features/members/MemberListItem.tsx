/* ------------------------------------------------------------------ *
 * PeerCord — Members: MemberListItem
 * Avatar + durum noktası + rol renkli isim + özel durum satırı.
 * Sesli kanaldaysa hoparlör, ekran paylaşıyorsa ekran ikonu;
 * hover'da "mesaj" ve "daha fazla" butonları; konuşan üyenin
 * avatarı çevresinde nabız halkası.
 * ------------------------------------------------------------------ */
import { cn, hueColor } from '@/lib/utils'
import { useActions, useActiveChannel, useChannels, useGuild } from '@/lib/store'
import { Avatar, IconButton } from '@/ui/primitives'
import { MessageSquare, ScreenShare, Speaker, VolumeX } from 'lucide-react'
import type { KeyboardEvent, ReactNode } from 'react'
import type { PeerInfo, Role } from '@/types'
import { highestRole, mentionMember, presenceColor, presenceLabel } from './memberHelpers'
import { MemberMenuDropdown } from './MemberContextMenu'

export interface MemberListItemProps {
  member: PeerInfo
  /** Rol listesi verilmezse store'dan alınır */
  roles?: Role[]
  /** Seçili / profil kartı açık */
  active?: boolean
  onSelect?: (member: PeerInfo) => void
  onContextMenu?: (member: PeerInfo, event: React.MouseEvent) => void
  onShowProfile?: (member: PeerInfo) => void
  /** Sağ tarafa ekstra içerik (üye sayısı, ping vb.) */
  trailing?: ReactNode
  className?: string
}

export function MemberListItem({
  member,
  roles: rolesProp,
  active = false,
  onSelect,
  onContextMenu,
  onShowProfile,
  trailing,
  className,
}: MemberListItemProps) {
  const actions = useActions()
  const guild = useGuild()
  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const roles = rolesProp ?? guild?.roles ?? []

  const top = highestRole(member.roleIds, roles)
  const nameColor = top ? hueColor(top.hue) : 'hsl(var(--pc-text))'

  const voiceChannel = member.voiceChannelId
    ? channels.find((c) => c.id === member.voiceChannelId)
    : undefined

  const handleActivate = () => onSelect?.(member)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleActivate()
    }
  }

  const handleMessage = () => {
    void mentionMember(member, channels, activeChannel?.id ?? null, actions)
  }

  /* Alt satır: özel durum > sesli kanal > presence etiketi */
  const subline = member.customStatus ? (
    <span className="truncate italic">{member.customStatus}</span>
  ) : voiceChannel ? (
    <span className="flex items-center gap-1 truncate text-[hsl(var(--pc-accent-text))]">
      {member.muted ? (
        <VolumeX size={11} aria-hidden="true" className="shrink-0" />
      ) : (
        <Speaker size={11} aria-hidden="true" className="shrink-0" />
      )}
      <span className="truncate">{voiceChannel.name}</span>
      {member.screensharing && (
        <ScreenShare size={11} aria-hidden="true" className="shrink-0" />
      )}
      {member.deafened && (
        <span className="shrink-0 text-[10px]">kulaklık kapalı</span>
      )}
    </span>
  ) : (
    <span className="truncate">{presenceLabel(member.status)}</span>
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      onContextMenu={(event) => onContextMenu?.(member, event)}
      aria-label={`${member.name} — ${presenceLabel(member.status)}`}
      aria-pressed={active}
      className={cn(
        'pc-focus-ring group relative flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left',
        'transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]',
        active && 'bg-[hsl(var(--pc-surface-active))]',
        member.status === 'offline' && 'opacity-60',
        className
      )}
    >
      {/* Avatar + durum noktası (+ konuşma halkası) */}
      <span
        className={cn(
          'relative flex shrink-0 rounded-full',
          member.speaking && 'animate-[pc-pulse-ring_1.8s_ease-out_infinite]'
        )}
      >
        <Avatar
          seed={member.avatarSeed}
          name={member.name}
          size={32}
          hue={member.accentHue}
        />
        <span
          aria-hidden="true"
          title={presenceLabel(member.status)}
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[hsl(var(--pc-surface))]"
          style={{ backgroundColor: presenceColor(member.status) }}
        />
      </span>

      {/* İsim + alt satır */}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className="truncate text-[13px] font-medium leading-tight"
            style={{ color: nameColor }}
          >
            {member.name}
          </span>
          {member.isSelf && (
            <span className="shrink-0 rounded-full bg-[hsl(var(--pc-surface-hover))] px-1.5 text-[9px] font-medium uppercase tracking-wide text-[hsl(var(--pc-text-subtle))]">
              sen
            </span>
          )}
          {member.screensharing && !voiceChannel && (
            <ScreenShare
              size={11}
              aria-hidden="true"
              className="shrink-0 text-[hsl(var(--pc-cyan))]"
            />
          )}
        </span>
        <span className="mt-0.5 block truncate text-[11px] leading-tight text-[hsl(var(--pc-text-subtle))]">
          {subline}
        </span>
      </span>

      {trailing}

      {/* Hover eylemleri */}
      <span
        className="absolute right-1.5 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100"
        onClick={(event) => event.stopPropagation()}
      >
        <IconButton
          size="sm"
          aria-label={`${member.name} üyesine mesaj gönder`}
          tooltip="Mesaj gönder"
          onClick={handleMessage}
        >
          <MessageSquare size={14} aria-hidden="true" />
        </IconButton>
        <MemberMenuDropdown
          member={member}
          onShowProfile={onShowProfile}
          side="left"
          align="end"
          className="p-1"
        />
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * PeerCord — Members: MemberProfileCard
 * Üyeye tıklayınca açılan profil kartı (Popover): gradyan banner,
 * avatar, ad + rol rozetleri, özel durum, hakkında, katılma tarihi,
 * "Mesaj gönder" ve yöneticilere özel "Rol ver".
 * ------------------------------------------------------------------ */
import { useState, type ReactNode } from 'react'
import { Calendar, MessageSquare, Send, Smile, UserCog } from 'lucide-react'
import { cn, avatarGradient, formatDayLabel, formatRelative, hueColor } from '@/lib/utils'
import { useActions, useActiveChannel, useChannels, useGuild, useMe } from '@/lib/store'
import { Avatar, Button, Popover, PopoverContent, PopoverTrigger } from '@/ui/primitives'
import type { PeerInfo } from '@/types'
import { highestRole, memberRoles, mentionMember, presenceColor, presenceLabel } from './memberHelpers'
import { RoleBadge } from './RoleBadge'

export interface MemberProfileCardProps {
  member: PeerInfo
  /** Kartı açan tetikleyici (genelde MemberListItem) */
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function MemberProfileCard({
  member,
  children,
  side = 'left',
  align = 'center',
  className,
}: MemberProfileCardProps) {
  const actions = useActions()
  const guild = useGuild()
  const me = useMe()
  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const [rolePickerOpen, setRolePickerOpen] = useState(false)

  const roles = guild?.roles ?? []
  const isSelf = member.isSelf && me?.id === member.userId
  const top = highestRole(member.roleIds, roles)
  const nameColor = top ? hueColor(top.hue) : 'hsl(var(--pc-text))'
  const visibleRoles = memberRoles(member.roleIds, roles).slice(0, 3)
  const hiddenRoleCount = memberRoles(member.roleIds, roles).length - visibleRoles.length

  const canManageRoles = actions.can('manage_guild')
  const assignable = roles.filter(
    (role) => role.name !== '@everyone' && !member.roleIds.includes(role.id)
  )

  const bio = isSelf ? me?.bio : undefined

  const handleMessage = () => {
    void mentionMember(member, channels, activeChannel?.id ?? null, actions)
  }

  const handleAssign = (roleId: string, roleName: string) => {
    void actions.assignRole(member.userId, roleId)
    actions.pushToast({
      kind: 'success',
      title: 'Rol verildi',
      description: `${member.name} üyesine "${roleName}" rolü atandı.`,
      duration: 2600,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={12}
        aria-label={`${member.name} profil kartı`}
        className={cn('w-80 overflow-hidden p-0', className)}
      >
        {/* Banner */}
        <div
          className="h-20 w-full"
          style={{ backgroundImage: avatarGradient(member.avatarSeed, member.accentHue) }}
        >
          <div className="h-full w-full bg-gradient-to-t from-[hsl(var(--pc-surface))] via-transparent to-transparent" />
        </div>

        <div className="px-4 pb-4">
          {/* Avatar + durum */}
          <div className="-mt-9 flex items-end justify-between">
            <span className="relative flex rounded-full">
              <span
                className={cn(
                  'flex rounded-full',
                  member.speaking && 'animate-[pc-pulse-ring_1.8s_ease-out_infinite]'
                )}
              >
                <Avatar
                  seed={member.avatarSeed}
                  name={member.name}
                  size={64}
                  hue={member.accentHue}
                  className="border-4 border-[hsl(var(--pc-surface))]"
                />
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[hsl(var(--pc-surface))]"
                style={{ backgroundColor: presenceColor(member.status) }}
              />
            </span>
            {member.latencyMs !== undefined && (
              <span className="mb-1 text-[10px] tabular-nums text-[hsl(var(--pc-text-subtle))]">
                {member.latencyMs} ms
              </span>
            )}
          </div>

          {/* Ad + rol rozetleri */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <h3 className="text-base font-semibold leading-tight" style={{ color: nameColor }}>
              {member.name}
            </h3>
            {isSelf && (
              <span className="rounded-full bg-[hsl(var(--pc-surface-hover))] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[hsl(var(--pc-text-subtle))]">
                sen
              </span>
            )}
          </div>

          {visibleRoles.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              {visibleRoles.map((role) => (
                <RoleBadge key={role.id} role={role} size="sm" />
              ))}
              {hiddenRoleCount > 0 && (
                <span className="text-[10px] text-[hsl(var(--pc-text-subtle))]">
                  +{hiddenRoleCount}
                </span>
              )}
            </div>
          )}

          {/* Özel durum */}
          {member.customStatus && (
            <p className="mt-2 flex items-center gap-1.5 text-[13px] italic text-[hsl(var(--pc-text-muted))]">
              <Smile size={13} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{member.customStatus}</span>
            </p>
          )}

          {/* Hakkında */}
          {bio && (
            <div className="mt-3 rounded-[var(--radius-md)] bg-[hsl(var(--pc-surface-raised))] p-2.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
                Hakkında
              </p>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-[hsl(var(--pc-text-muted))]">
                {bio}
              </p>
            </div>
          )}

          {/* Meta bilgiler */}
          <dl className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[12px]">
              <dt className="flex items-center gap-1.5 text-[hsl(var(--pc-text-subtle))]">
                <Calendar size={12} aria-hidden="true" />
                {isSelf ? 'Katılma tarihi' : 'Son görülme'}
              </dt>
              <dd className="ml-auto text-[hsl(var(--pc-text-muted))]">
                {isSelf && me
                  ? formatDayLabel(me.createdAt)
                  : formatRelative(member.lastSeen)}
              </dd>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <dt className="text-[hsl(var(--pc-text-subtle))]">Durum</dt>
              <dd className="ml-auto flex items-center gap-1.5 text-[hsl(var(--pc-text-muted))]">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: presenceColor(member.status) }}
                />
                {presenceLabel(member.status)}
              </dd>
            </div>
          </dl>

          {/* Eylemler */}
          <div className="mt-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              leftIcon={<MessageSquare size={14} aria-hidden="true" />}
              onClick={handleMessage}
            >
              Mesaj gönder
            </Button>

            {canManageRoles && (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                leftIcon={<UserCog size={14} aria-hidden="true" />}
                onClick={() => setRolePickerOpen((v) => !v)}
                aria-expanded={rolePickerOpen}
              >
                Rol ver
              </Button>
            )}

            {canManageRoles && rolePickerOpen && (
              <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface-raised))] p-1.5">
                <p className="px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
                  Atanabilir roller
                </p>
                {assignable.length === 0 && (
                  <p className="px-1.5 py-1 text-[12px] text-[hsl(var(--pc-text-subtle))]">
                    Atanabilir rol yok
                  </p>
                )}
                {assignable.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleAssign(role.id, role.name)}
                    className="pc-focus-ring flex items-center gap-2 rounded-[var(--radius-sm)] px-1.5 py-1.5 text-left text-[12px] text-[hsl(var(--pc-text-muted))] transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))]"
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: hueColor(role.hue) }}
                    />
                    <span className="flex-1 truncate">{role.name}</span>
                    <Send size={11} aria-hidden="true" className="shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

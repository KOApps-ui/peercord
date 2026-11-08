import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { useGuild, useMembers } from '@/lib/store'
import type { Role, ID } from '@/types'
import { Avatar, Dot, Badge } from '@/ui/primitives'
import { User, ShieldCheck, Clock, UserX, Sliders } from 'lucide-react'

export function MemberSidebar(): JSX.Element {
  const guild = useGuild()
  const members = useMembers()
  useAppStore((s) => s.ready)

  if (!guild) return null

  const onlineMembers = members.filter(
    (m) => m.status === 'online',
  )
  const offlineMembers = members.filter(
    (m) => m.status !== 'online',
  )

  const hoistedRoles = guild.roles.filter((r) => r.hoist).sort((a, b) => b.position - a.position)
  const roleMemberMap = new Map<ID, { role: Role; members: typeof members }>()
  hoistedRoles.forEach((role) => {
    const roleMembers = members.filter((m) => m.roleIds.includes(role.id))
    if (roleMembers.length > 0) {
      roleMemberMap.set(role.id, { role, members: roleMembers })
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-full w-[var(--pc-members-w)] flex-col shrink-0',
        'bg-[hsl(var(--pc-surface))] border-l border-[hsl(var(--pc-border-soft))]',
      )}
    >
      <div className="flex h-[var(--pc-header-h)] shrink-0 items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[hsl(var(--pc-accent))]" />
          <p className="text-sm font-semibold text-[hsl(var(--pc-text))]">
            Üyeler ({members.length})
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Badge tone="neutral">
            <UserX className="mr-1 h-3 w-3" /> Çevrimdışı
          </Badge>
          <Badge tone="success">
            <Dot status="online" className="mr-1 h-2 w-2" /> Çevrimiçi
          </Badge>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="px-2 py-2 space-y-3">
          {Array.from(roleMemberMap.entries()).map(([roleId, { role, members: roleMembers }]) => (
            <motion.div
              key={roleId}
              layout
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span
                  className="flex h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: `hsl(${role.hue} 82% 52%)` }}
                />
                <p className="text-xs font-semibold text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">
                  {role.name}
                </p>
                <span className="ml-auto text-[10px] text-[hsl(var(--pc-text-subtle))]">
                  {roleMembers.length}
                </span>
              </div>
              <AnimatePresence>
                {roleMembers.map((m, i) => (
                  <MemberRow
                    key={m.userId}
                    member={m}
                    delay={i * 0.04}
                    accentHue={role.hue}
                    showRole={false}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ))}

          <motion.div
            key="everyone"
            layout
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 px-2 py-1.5">
              <span
                className="flex h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: 'hsl(var(--pc-offline))' }}
              />
              <p className="text-xs font-semibold text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">
                @everyone
              </p>
            </div>
            <AnimatePresence>
              {onlineMembers.map((m, i) => (
                <MemberRow
                  key={m.userId}
                  member={m}
                  delay={i * 0.04}
                  accentHue={m.accentHue}
                  showRole={false}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {offlineMembers.length > 0 && (
            <motion.div
              key="offline"
              layout
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <span
                  className="flex h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: 'hsl(var(--pc-offline))' }}
                />
                <p className="text-xs font-semibold text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">
                  Çevrimdışı
                </p>
                <span className="ml-auto text-[10px] text-[hsl(var(--pc-text-subtle))]">
                  {offlineMembers.length}
                </span>
              </div>
              <AnimatePresence>
                {offlineMembers.map((m, i) => (
                  <MemberRow
                    key={m.userId}
                    member={m}
                    delay={i * 0.04}
                    accentHue={m.accentHue}
                    showRole={false}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex h-[var(--pc-header-h)] shrink-0 items-center justify-between px-3 border-t border-[hsl(var(--pc-border-soft))]">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[hsl(var(--pc-text-muted))]" />
          <p className="text-xs text-[hsl(var(--pc-text-muted))]">Ayarlar</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] transition-colors">
          <User className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  )
}

interface MemberRowProps {
  member: ReturnType<typeof useMembers>[number]
  delay: number
  accentHue: number
  showRole: boolean
}

function MemberRow({
  member,
  delay,
  accentHue,
  showRole,
}: MemberRowProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.18, delay }}
      className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] transition-colors hover:bg-[hsl(var(--pc-surface-hover))]"
    >
      <Avatar
        seed={member.avatarSeed}
        name={member.name}
        size={28}
        hue={member.accentHue}
        status={member.status === 'offline' ? 'offline' : member.status}
        ring={member.speaking ? 'speaking' : 'none'}
      />
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            'text-sm font-medium truncate',
            showRole && `text-[hsl(${accentHue} 82% 52%)]`,
            !showRole && 'text-[hsl(var(--pc-text))]',
          )}
          title={member.name}
        >
          {member.name}
        </span>
        {member.customStatus && (
          <span className="text-[11px] text-[hsl(var(--pc-text-muted))] truncate">
            {member.customStatus}
          </span>
        )}
        <Dot
          status={member.status === 'offline' ? 'offline' : member.status}
          className="h-2 w-2"
        />
      </div>
      {member.muted && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full text-[hsl(var(--pc-danger))] bg-[hsl(var(--pc-danger))/10]">
          <UserX className="h-3 w-3" />
        </span>
      )}
      {member.deafened && (
        <span className="flex h-6 w-6 items-center justify-center rounded-full text-[hsl(var(--pc-danger))] bg-[hsl(var(--pc-danger))/10]">
          <Clock className="h-3 w-3" />
        </span>
      )}
    </motion.div>
  )
}

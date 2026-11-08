/* ------------------------------------------------------------------ *
 * PeerCord — Members: MemberContextMenu
 * Sağ tık menüsü: Profili gör, Mesaj gönder, Rol ver (alt menü ile
 * roller), Sesi kıs, Sunucudan at (yalnızca kick_members yetkisiyle,
 * onay diyalogu ister). Aynı girdiler "daha fazla" butonu için
 * dropdown olarak da sunulur (MemberMenuDropdown).
 * ------------------------------------------------------------------ */
import { useState, type ReactNode } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  Check,
  MessageSquare,
  MoreHorizontal,
  UserCog,
  UserMinus,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn, hueColor } from '@/lib/utils'
import { useActions, useActiveChannel, useChannels, useGuild } from '@/lib/store'
import { Button, Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger, Modal } from '@/ui/primitives'
import type { PeerInfo, Role } from '@/types'
import { mentionMember } from './memberHelpers'

/* ------------------------------ Menü tipleri --------------------------- */

export interface MemberMenuRoleEntry {
  id: string
  name: string
  hue: number
  onSelect: () => void
}

export interface MemberMenuEntry {
  key: 'profile' | 'message' | 'role' | 'mute' | 'kick'
  label: string
  icon: ReactNode
  danger?: boolean
  disabled?: boolean
  hint?: string
  onSelect?: () => void
  /** Varsa alt menü olarak roller listelenir */
  roles?: MemberMenuRoleEntry[]
}

/* ------------------------------ Stil sabitleri ------------------------- */

const ITEM_CLASS = cn(
  'relative flex cursor-default select-none items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-1.5',
  'text-[13px] text-[hsl(var(--pc-text-muted))] outline-none transition-colors duration-150',
  'data-[highlighted]:bg-[hsl(var(--pc-surface-hover))] data-[highlighted]:text-[hsl(var(--pc-text))]',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  'data-[state=open]:bg-[hsl(var(--pc-surface-hover))] data-[state=open]:text-[hsl(var(--pc-text))]'
)

const DANGER_ITEM_CLASS = cn(
  ITEM_CLASS,
  'text-[hsl(var(--pc-danger))]',
  'data-[highlighted]:bg-[hsl(var(--pc-danger))/0.14] data-[highlighted]:text-[hsl(var(--pc-danger))]',
  'data-[state=open]:bg-[hsl(var(--pc-danger))/0.14]'
)

const CONTENT_CLASS = cn(
  'pc-panel z-50 min-w-[216px] rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border-soft))] p-1.5 shadow-float',
  'animate-[pc-pop_150ms_var(--ease-out-expo)]'
)

const LABEL_CLASS =
  'px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]'

/* --------------------------- Paylaşılan menü verisi -------------------- */

export interface UseMemberMenuOptions {
  /** Profil kartını açmak için üst bileşen geri çağrısı */
  onShowProfile?: (member: PeerInfo) => void
}

/**
 * Menü girdilerini ve onay diyalogunu üretir. Sağ tık menüsü ve
 * "daha fazla" dropdown'ı aynı veriyi kullanır.
 */
export function useMemberMenu(member: PeerInfo, options: UseMemberMenuOptions = {}) {
  const actions = useActions()
  const guild = useGuild()
  const channels = useChannels()
  const activeChannel = useActiveChannel()
  const [kickOpen, setKickOpen] = useState(false)
  const [muted, setMuted] = useState(false)

  const roles: Role[] = guild?.roles ?? []
  const canManageRoles = actions.can('manage_guild')
  const canKick = actions.can('kick_members') && !member.isSelf
  const isSelf = member.isSelf

  const assignable = roles.filter(
    (role) => role.name !== '@everyone' && !member.roleIds.includes(role.id)
  )

  const handleMuteToggle = () => {
    setMuted((v) => !v)
    actions.pushToast({
      kind: muted ? 'success' : 'warning',
      title: muted ? 'Ses açıldı' : 'Ses kısıldı',
      description: `${member.name} ${muted ? 'artık duyuluyor' : 'sessize alındı'}.`,
      duration: 2400,
    })
  }

  const handleKickConfirm = () => {
    setKickOpen(false)
    actions.pushToast({
      kind: 'success',
      title: 'Üye atıldı',
      description: `${member.name} sunucudan çıkarıldı.`,
      duration: 2800,
    })
  }

  const handleProfile = () => {
    if (options.onShowProfile) {
      options.onShowProfile(member)
      return
    }
    actions.pushToast({
      kind: 'info',
      title: 'Profil',
      description: 'Profil kartı bu bağlamda açılamıyor.',
      duration: 2400,
    })
  }

  const entries: MemberMenuEntry[] = [
    {
      key: 'profile',
      label: 'Profili gör',
      icon: <UserRound size={15} aria-hidden="true" />,
      onSelect: handleProfile,
    },
    {
      key: 'message',
      label: 'Mesaj gönder',
      icon: <MessageSquare size={15} aria-hidden="true" />,
      onSelect: () => {
        void mentionMember(member, channels, activeChannel?.id ?? null, actions)
      },
    },
    {
      key: 'role',
      label: 'Rol ver',
      icon: <UserCog size={15} aria-hidden="true" />,
      disabled: !canManageRoles,
      hint: canManageRoles ? undefined : 'Yönetici yetkisi gerekli',
      roles: canManageRoles
        ? assignable.map((role) => ({
            id: role.id,
            name: role.name,
            hue: role.hue,
            onSelect: () => {
              void actions.assignRole(member.userId, role.id)
              actions.pushToast({
                kind: 'success',
                title: 'Rol verildi',
                description: `${member.name} üyesine "${role.name}" rolü atandı.`,
                duration: 2600,
              })
            },
          }))
        : [],
    },
    {
      key: 'mute',
      label: muted ? 'Sesi aç' : 'Sesi kıs',
      icon: muted ? (
        <Volume2 size={15} aria-hidden="true" />
      ) : (
        <VolumeX size={15} aria-hidden="true" />
      ),
      disabled: isSelf,
      onSelect: handleMuteToggle,
    },
    {
      key: 'kick',
      label: 'Sunucudan at',
      icon: <UserMinus size={15} aria-hidden="true" />,
      danger: true,
      disabled: !canKick,
      hint: canKick ? undefined : 'Üyeleri atma yetkin yok',
      onSelect: () => setKickOpen(true),
    },
  ]

  const dialog = (
    <Modal
      open={kickOpen}
      onOpenChange={setKickOpen}
      title="Üyeyi sunucudan at"
      description={`${member.name} sunucudan atılacak. Bu işlem geri alınamaz.`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setKickOpen(false)}>
            Vazgeç
          </Button>
          <Button variant="danger" size="sm" onClick={handleKickConfirm}>
            Sunucudan at
          </Button>
        </>
      }
    >
      <p className="text-sm text-[hsl(var(--pc-text-muted))]">
        Atılan üye bir daha davet edilene kadar sunucuya erişemez.
      </p>
    </Modal>
  )

  return { entries, dialog, muted }
}

/* --------------------------- Rol alt menüsü ---------------------------- */

function RoleDot({ hue }: { hue: number }) {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: hueColor(hue) }}
    />
  )
}

function RoleSubItems({ roles }: { roles: MemberMenuRoleEntry[] }) {
  if (roles.length === 0) {
    return (
      <span className={cn(ITEM_CLASS, 'pointer-events-none opacity-60')}>
        Atanabilir rol yok
      </span>
    )
  }
  return (
    <>
      {roles.map((role) => (
        <DropdownMenu.Item
          key={role.id}
          onSelect={role.onSelect}
          className={ITEM_CLASS}
        >
          <RoleDot hue={role.hue} />
          <span className="flex-1 truncate">{role.name}</span>
        </DropdownMenu.Item>
      ))}
    </>
  )
}

/** Sağ tık menüsü — çocuklarına context menu davranışı bağlar */
export interface MemberContextMenuProps extends UseMemberMenuOptions {
  member: PeerInfo
  children: ReactNode
  className?: string
}

export function MemberContextMenu({
  member,
  onShowProfile,
  children,
  className,
}: MemberContextMenuProps) {
  const { entries, dialog } = useMemberMenu(member, { onShowProfile })

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild className={className}>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className={CONTENT_CLASS}
          aria-label={`${member.name} üye menüsü`}
        >
          <ContextMenu.Label className={LABEL_CLASS}>{member.name}</ContextMenu.Label>
          {entries.map((entry) =>
            entry.roles ? (
              <ContextMenu.Sub key={entry.key}>
                <ContextMenu.SubTrigger
                  disabled={entry.disabled}
                  className={cn(entry.danger ? DANGER_ITEM_CLASS : ITEM_CLASS, 'justify-between')}
                >
                  <span className="flex items-center gap-2.5">
                    {entry.icon}
                    {entry.label}
                  </span>
                  <span aria-hidden="true" className="text-[hsl(var(--pc-text-subtle))]">
                    ›
                  </span>
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.SubContent className={CONTENT_CLASS}>
                    <ContextMenu.Label className={LABEL_CLASS}>Rol seç</ContextMenu.Label>
                    <RoleSubItemsWithContext roles={entry.roles} />
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            ) : (
              <ContextMenu.Item
                key={entry.key}
                disabled={entry.disabled}
                onSelect={entry.onSelect}
                className={entry.danger ? DANGER_ITEM_CLASS : ITEM_CLASS}
              >
                {entry.icon}
                <span className="flex-1">{entry.label}</span>
                {entry.hint && (
                  <span className="text-[10px] text-[hsl(var(--pc-text-subtle))]">
                    {entry.hint}
                  </span>
                )}
              </ContextMenu.Item>
            )
          )}
        </ContextMenu.Content>
      </ContextMenu.Portal>
      {dialog}
    </ContextMenu.Root>
  )
}

/** ContextMenu.Sub için rol listesi (tip güvenli ayrı sarmalayıcı) */
function RoleSubItemsWithContext({ roles }: { roles: MemberMenuRoleEntry[] }) {
  if (roles.length === 0) {
    return (
      <span className={cn(ITEM_CLASS, 'pointer-events-none opacity-60')}>
        Atanabilir rol yok
      </span>
    )
  }
  return (
    <>
      {roles.map((role) => (
        <ContextMenu.Item
          key={role.id}
          onSelect={role.onSelect}
          className={ITEM_CLASS}
        >
          <RoleDot hue={role.hue} />
          <span className="flex-1 truncate">{role.name}</span>
        </ContextMenu.Item>
      ))}
    </>
  )
}

/** "Daha fazla" butonlu dropdown — satır içi kullanım için */
export interface MemberMenuDropdownProps extends UseMemberMenuOptions {
  member: PeerInfo
  /** Tetikleyici içeriği (buton) */
  children?: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function MemberMenuDropdown({
  member,
  onShowProfile,
  children,
  align = 'end',
  side = 'bottom',
  className,
}: MemberMenuDropdownProps) {
  const { entries, dialog } = useMemberMenu(member, { onShowProfile })

  return (
    <Menu>
      <MenuTrigger aria-label={`${member.name} için diğer işlemler`} className={className}>
        {children ?? <MoreHorizontal size={15} aria-hidden="true" />}
      </MenuTrigger>
      <MenuContent align={align} side={side} className="min-w-[216px] p-1.5">
        <MenuLabel>{member.name}</MenuLabel>
        {entries.map((entry) =>
          entry.roles ? (
            <DropdownMenu.Sub key={entry.key}>
              <DropdownMenu.SubTrigger
                disabled={entry.disabled}
                className={cn(entry.danger ? DANGER_ITEM_CLASS : ITEM_CLASS, 'justify-between')}
              >
                <span className="flex items-center gap-2.5">
                  {entry.icon}
                  {entry.label}
                </span>
                <span aria-hidden="true" className="text-[hsl(var(--pc-text-subtle))]">
                  ›
                </span>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent className={CONTENT_CLASS}>
                  <MenuLabel>Rol seç</MenuLabel>
                  <RoleSubItems roles={entry.roles} />
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          ) : (
            <MenuItem
              key={entry.key}
              danger={entry.danger}
              onSelect={entry.onSelect}
              className={cn(entry.disabled && 'pointer-events-none opacity-50')}
            >
              <span className="flex items-center gap-2.5">
                {entry.icon}
                {entry.label}
                {entry.hint && (
                  <span className="text-[10px] text-[hsl(var(--pc-text-subtle))]">
                    {entry.hint}
                  </span>
                )}
              </span>
            </MenuItem>
          )
        )}
        <MenuSeparator />
        <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-[hsl(var(--pc-text-subtle))]">
          <Check size={11} aria-hidden="true" />
          Sağ tık ile de açılır
        </span>
      </MenuContent>
      {dialog}
    </Menu>
  )
}

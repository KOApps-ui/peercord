/* ------------------------------------------------------------------ *
 * PeerCord — Members: MemberContextMenu
 * Sağ tık menüsü: Profili gör, Mesaj gönder, Rol ver (alt menü ile
 * roller), Sesi kıs, Sunucudan at (yalnızca kick_members yetkisiyle,
 * onay diyalogu ister). Aynı girdiler "daha fazla" butonu için
 * dropdown olarak da sunulur (MemberMenuDropdown).
 * ------------------------------------------------------------------ */
import type { ReactNode } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, MoreHorizontal } from 'lucide-react'
import { cn, hueColor } from '@/lib/utils'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from '@/ui/primitives'
import type { PeerInfo } from '@/types'
import {
  CONTENT_CLASS,
  DANGER_ITEM_CLASS,
  ITEM_CLASS,
  LABEL_CLASS,
  useMemberMenu,
  type MemberMenuRoleEntry,
  type UseMemberMenuOptions,
} from './memberMenu'

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

/** ContextMenu.Sub için rol listesi */
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

/** DropdownMenu.Sub için rol listesi */
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

/** "Daha fazla" butonlu dropdown — satır içi kullanım için */
export interface MemberMenuDropdownProps extends UseMemberMenuOptions {
  member: PeerInfo
  /** Tetikleyici içeriği (buton); verilmezse ⋯ ikonu */
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
      <MenuTrigger
        aria-label={`${member.name} için diğer işlemler`}
        className={className}
      >
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

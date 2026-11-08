/* ------------------------------------------------------------------ *
 * PeerCord — Members: memberMenu
 * Üye menüsünün paylaşılan verisi: menü girdileri, onay diyalogu ve
 * stilleri. (Component dosyası fast-refresh için sadece component
 * export eder; hook ve sabitler burada tutulur.)
 * ------------------------------------------------------------------ */
import { useState, type ReactNode } from 'react'
import {
  MessageSquare,
  UserCog,
  UserMinus,
  UserRound,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActions, useActiveChannel, useChannels, useGuild } from '@/lib/store'
import { Button, Modal } from '@/ui/primitives'
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

export interface UseMemberMenuOptions {
  /** Profil kartını açmak için üst bileşen geri çağrısı */
  onShowProfile?: (member: PeerInfo) => void
}

/* ------------------------------ Stil sabitleri ------------------------- */

export const ITEM_CLASS = cn(
  'relative flex cursor-default select-none items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-1.5',
  'text-[13px] text-[hsl(var(--pc-text-muted))] outline-none transition-colors duration-150',
  'data-[highlighted]:bg-[hsl(var(--pc-surface-hover))] data-[highlighted]:text-[hsl(var(--pc-text))]',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  'data-[state=open]:bg-[hsl(var(--pc-surface-hover))] data-[state=open]:text-[hsl(var(--pc-text))]'
)

export const DANGER_ITEM_CLASS = cn(
  ITEM_CLASS,
  'text-[hsl(var(--pc-danger))]',
  'data-[highlighted]:bg-[hsl(var(--pc-danger))/0.14] data-[highlighted]:text-[hsl(var(--pc-danger))]',
  'data-[state=open]:bg-[hsl(var(--pc-danger))/0.14]'
)

export const CONTENT_CLASS = cn(
  'pc-panel z-50 min-w-[216px] rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border-soft))] p-1.5 shadow-float',
  'animate-[pc-pop_150ms_var(--ease-out-expo)]'
)

export const LABEL_CLASS =
  'px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]'

/* --------------------------- Paylaşılan menü verisi -------------------- */

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

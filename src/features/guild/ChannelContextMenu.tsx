/* ------------------------------------------------------------------ *
 * PeerCord — Guild: ChannelContextMenu
 * Kanal sağ tık menüsü: Kanalı düzenle, Bağlantıyı kopyala,
 * Okundu işaretle ve (onaylı) Kanalı sil.
 * ------------------------------------------------------------------ */
import { useState, type ReactNode } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { Check, Copy, Hash, Pencil, Trash2, Volume2 } from 'lucide-react'
import { cn, copyToClipboard } from '@/lib/utils'
import { useActions } from '@/lib/store'
import { Button, Modal } from '@/ui/primitives'
import type { Channel } from '@/types'

const ITEM_CLASS = cn(
  'relative flex cursor-default select-none items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-1.5',
  'text-[13px] text-[hsl(var(--pc-text-muted))] outline-none transition-colors duration-150',
  'data-[highlighted]:bg-[hsl(var(--pc-surface-hover))] data-[highlighted]:text-[hsl(var(--pc-text))]',
  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
)

const DANGER_ITEM_CLASS = cn(
  ITEM_CLASS,
  'text-[hsl(var(--pc-danger))]',
  'data-[highlighted]:bg-[hsl(var(--pc-danger))/0.14] data-[highlighted]:text-[hsl(var(--pc-danger))]'
)

const CONTENT_CLASS = cn(
  'pc-panel z-50 min-w-[208px] rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border-soft))] p-1.5 shadow-float',
  'animate-[pc-pop_150ms_var(--ease-out-expo)]'
)

const LABEL_CLASS =
  'flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]'

export interface ChannelContextMenuProps {
  channel: Channel
  children: ReactNode
  className?: string
}

export function ChannelContextMenu({ channel, children, className }: ChannelContextMenuProps) {
  const { openModal, inviteLink, markChannelRead, deleteChannel, pushToast } = useActions()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const channelLabel = channel.type === 'voice' ? 'Sesli' : 'Metin'
  const ChannelIcon = channel.type === 'voice' ? Volume2 : Hash

  const handleCopyLink = () => {
    const link = `${inviteLink()}#${channel.name}`
    void copyToClipboard(link).then((ok) => {
      pushToast({
        kind: ok ? 'success' : 'error',
        title: ok ? 'Bağlantı kopyalandı' : 'Kopyalanamadı',
        description: ok ? link : 'Panoya erişilemedi.',
        duration: 2600,
      })
    })
  }

  const handleMarkRead = () => {
    markChannelRead(channel.id)
    pushToast({
      kind: 'success',
      title: 'Okundu işaretlendi',
      description: `#${channel.name} kanalı okundu olarak işaretlendi.`,
      duration: 2200,
    })
  }

  const handleDelete = () => {
    setConfirmOpen(false)
    void deleteChannel(channel.id)
    pushToast({
      kind: 'success',
      title: 'Kanal silindi',
      description: `#${channel.name} kanalı silindi.`,
      duration: 2600,
    })
  }

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild className={className}>
        {children}
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className={CONTENT_CLASS}
          aria-label={`${channel.name} kanal menüsü`}
        >
          <ContextMenu.Label className={LABEL_CLASS}>
            <ChannelIcon size={11} aria-hidden="true" className="shrink-0" />
            <span className="truncate">
              {channel.name} · {channelLabel}
            </span>
          </ContextMenu.Label>

          <ContextMenu.Item
            className={ITEM_CLASS}
            onSelect={() => openModal('channel-settings', { channel })}
          >
            <Pencil size={15} aria-hidden="true" />
            <span className="flex-1">Kanalı düzenle</span>
          </ContextMenu.Item>

          <ContextMenu.Item className={ITEM_CLASS} onSelect={handleCopyLink}>
            <Copy size={15} aria-hidden="true" />
            <span className="flex-1">Bağlantıyı kopyala</span>
          </ContextMenu.Item>

          <ContextMenu.Item className={ITEM_CLASS} onSelect={handleMarkRead}>
            <Check size={15} aria-hidden="true" />
            <span className="flex-1">Okundu işaretle</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="my-1.5 h-px bg-[hsl(var(--pc-border))]" />

          <ContextMenu.Item
            className={DANGER_ITEM_CLASS}
            onSelect={() => setConfirmOpen(true)}
          >
              <Trash2 size={15} aria-hidden="true" />
              <span className="flex-1">Kanalı sil</span>
            </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>

      <Modal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Kanalı sil"
        description={`#${channel.name} kanı ve tüm mesajları kalıcı olarak silinecek.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Sil
            </Button>
          </>
        }
      >
        <p className="text-sm text-[hsl(var(--pc-text-muted))]">
          Bu işlem geri alınamaz. Emin misiniz?
        </p>
      </Modal>
    </ContextMenu.Root>
  )
}

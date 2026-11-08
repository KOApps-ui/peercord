/* ------------------------------------------------------------------ *
 * PeerCord — Notifications: NotificationCenter
 * Zil ikonu + okunmamış rozeti; açılınca cam panelde son
 * bahsedilmeler (mention) ve okunmamış kanallar listelenir.
 * Okunma verisi `reads`, aktivite `lastActivity` üzerinden
 * hesaplanır; "Tümünü okundu işaretle" ile sıfırlanır.
 * ------------------------------------------------------------------ */
import { useMemo, useState } from 'react'
import { AtSign, Bell, BellOff, CheckCheck, Hash } from 'lucide-react'
import { cn, formatRelative, hueColor } from '@/lib/utils'
import { useActions, useAppStore, useChannels, useMe } from '@/lib/store'
import { Avatar, Popover, PopoverContent, PopoverTrigger } from '@/ui/primitives'
import type { ID, Message } from '@/types'
import { openMessage } from '@/features/members'

export interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const { markChannelRead, selectChannel, pushToast } = useActions()
  const { messages, reads, lastActivity } = useAppStore()
  const channels = useChannels()
  const me = useMe()

  const [flashId, setFlashId] = useState<ID | null>(null)

  const unreadChannels = useMemo(
    () =>
      channels.filter(
        (channel) => (lastActivity[channel.id] ?? 0) > (reads[channel.id] ?? 0)
      ),
    [channels, lastActivity, reads]
  )

  /* Okunmamış mesaj sayısı (kanal başına) */
  const unreadCount = useMemo(() => {
    let total = 0
    for (const channel of unreadChannels) {
      const read = reads[channel.id] ?? 0
      const list = messages[channel.id] ?? []
      total += list.filter((m) => m.createdAt > read && !m.deletedAt && !m.system).length
    }
    return total
  }, [unreadChannels, messages, reads])

  /* Okunmamış bahsedilmeler; yoksa son bahsedilmeler */
  const mentions = useMemo(() => {
    if (!me) return [] as Message[]
    const all: Message[] = []
    for (const list of Object.values(messages)) {
      for (const msg of list) {
        if (msg.deletedAt || msg.system) continue
        if (!msg.mentions.includes(me.id)) continue
        all.push(msg)
      }
    }
    all.sort((a, b) => b.createdAt - a.createdAt)
    const unread = all.filter((msg) => msg.createdAt > (reads[msg.channelId] ?? 0))
    return (unread.length > 0 ? unread : all).slice(0, 8)
  }, [messages, me, reads])

  const channelName = (id: ID) => channels.find((c) => c.id === id)?.name ?? 'bilinmeyen kanal'

  const handleOpenMention = (msg: Message) => {
    setFlashId(msg.id)
    openMessage(msg.id, msg.channelId, { selectChannel, pushToast })
  }

  const handleOpenChannel = (channelId: ID, name: string) => {
    setFlashId(null)
    selectChannel(channelId)
    markChannelRead(channelId)
    pushToast({
      kind: 'info',
      title: `#${name} kanalına geçildi`,
      duration: 2000,
    })
  }

  const handleMarkAllRead = () => {
    for (const channel of unreadChannels) markChannelRead(channel.id)
    pushToast({
      kind: 'success',
      title: 'Tümü okundu',
      description: 'Okunmamış kanallar okundu olarak işaretlendi.',
      duration: 2400,
    })
  }

  const badgeCount = unreadChannels.length

  return (
    <Popover>
      <PopoverTrigger className={cn('fixed top-4 right-4 z-40 lg:right-[260px]', className)}>
        <span className="relative flex items-center">
          <Bell size={16} aria-hidden="true" />
          {badgeCount > 0 && (
            <span
              aria-label={`${badgeCount} okunmamış kanal`}
              className={cn(
                'absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center',
                'rounded-full bg-[hsl(var(--pc-danger))] px-1 text-[9px] font-bold leading-none text-white'
              )}
            >
              {badgeCount > 99 ? '99+' : badgeCount}
            </span>
          )}
        </span>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={8}
        aria-label="Bildirim merkezi"
        className="max-h-[420px] w-80 overflow-y-auto p-0"
      >
        {/* Başlık */}
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2.5">
          <h2 className="flex-1 text-sm font-semibold text-[hsl(var(--pc-text))]">Bildirimler</h2>
          {badgeCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              aria-label="Tümünü okundu işaretle"
              className="pc-focus-ring flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-1 text-[11px] font-medium text-[hsl(var(--pc-accent-text))] transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]"
            >
              <CheckCheck size={12} aria-hidden="true" />
              Tümünü okundu işaretle
            </button>
          )}
        </header>

        {/* Bahsedilmeler */}
        {mentions.length > 0 && (
          <section className="px-1.5 py-1.5" aria-label="Bahsedilmeler">
            <h3 className="flex items-center gap-1.5 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
              <AtSign size={10} aria-hidden="true" className="shrink-0" />
              Bahsedilenler
            </h3>
            <div className="flex flex-col gap-0.5">
              {mentions.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => handleOpenMention(msg)}
                  aria-label={`${msg.authorName} bahsetmiş — ${channelName(msg.channelId)}`}
                  className={cn(
                    'pc-focus-ring flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-1.5 py-2 text-left',
                    'transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]',
                    flashId === msg.id && 'bg-[hsl(var(--pc-surface-active))]'
                  )}
                >
                  <Avatar
                    seed={msg.authorId}
                    name={msg.authorName}
                    size={28}
                    hue={msg.authorHue}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[11px] leading-none">
                      <span
                        className="max-w-[45%] truncate font-medium"
                        style={{ color: hueColor(msg.authorHue) }}
                      >
                        {msg.authorName}
                      </span>
                      <span className="flex min-w-0 items-center gap-0.5 text-[hsl(var(--pc-text-subtle))]">
                        <Hash size={10} aria-hidden="true" className="shrink-0" />
                        <span className="truncate">{channelName(msg.channelId)}</span>
                      </span>
                      <span className="ml-auto shrink-0 tabular-nums text-[hsl(var(--pc-text-subtle))]">
                        {formatRelative(msg.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-[hsl(var(--pc-text-muted))]">
                      {msg.content}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Okunmamış kanallar */}
        {unreadChannels.length > 0 && (
          <section className="px-1.5 py-1.5" aria-label="Okunmamış kanallar">
            <h3 className="flex items-center gap-1.5 px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
              <Bell size={10} aria-hidden="true" className="shrink-0" />
              Okunmamış kanallar
              <span className="ml-auto tabular-nums">{unreadCount} mesaj</span>
            </h3>
            <div className="flex flex-col gap-0.5">
              {unreadChannels.map((channel) => {
                const read = reads[channel.id] ?? 0
                const count = (messages[channel.id] ?? []).filter(
                  (m) => m.createdAt > read && !m.deletedAt && !m.system
                ).length
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => handleOpenChannel(channel.id, channel.name)}
                    aria-label={`#${channel.name} — ${count} okunmamış mesaj`}
                    className="pc-focus-ring flex items-center gap-2 rounded-[var(--radius-md)] px-1.5 py-1.5 text-left transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]"
                  >
                    {channel.type === 'voice' ? (
                      <Bell size={13} aria-hidden="true" className="shrink-0 text-[hsl(var(--pc-text-subtle))]" />
                    ) : (
                      <Hash size={13} aria-hidden="true" className="shrink-0 text-[hsl(var(--pc-text-subtle))]" />
                    )}
                    <span className="flex-1 truncate text-[13px] text-[hsl(var(--pc-text))]">
                      {channel.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-[hsl(var(--pc-accent-soft))] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-[hsl(var(--pc-accent-text))]">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Boş durum */}
        {mentions.length === 0 && unreadChannels.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <BellOff size={26} aria-hidden="true" className="text-[hsl(var(--pc-text-subtle))]" />
            <p className="text-sm font-medium text-[hsl(var(--pc-text-muted))]">Bildirim yok</p>
            <p className="text-xs text-[hsl(var(--pc-text-subtle))]">
              Yeni bahsedilmeler ve okunmamış kanallar burada görünür.
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

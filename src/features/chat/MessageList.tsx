import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useActions, useMe, useMessages } from '@/lib/store'
import { DateDivider } from './DateDivider'
import { EmptyState } from './EmptyState'
import { MessageItem } from './MessageItem'
import type { Message } from '@/types'

type MessageListProps = {
  channelId?: string
  className?: string
}

interface MessageGroup {
  messages: Message[]
  showDivider: boolean
}

const dayKey = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export function MessageList({ channelId, className }: MessageListProps) {
  // Reaktif seçici: mağaza güncellenince liste de yenilenir
  const messages = useMessages(channelId ?? null)
  const me = useMe()
  const actions = useActions()

  const groups = useMemo<MessageGroup[]>(() => {
    if (messages.length === 0) return []

    const result: MessageGroup[] = []
    let current: Message[] = []
    let prev: Message | undefined

    for (const msg of messages) {
      const newDay = prev ? dayKey(prev.createdAt) !== dayKey(msg.createdAt) : true
      const gap = prev ? msg.createdAt - prev.createdAt : Infinity
      const sameAuthor = prev ? msg.authorId === prev.authorId : false

      const startsNewGroup = !prev || newDay || !sameAuthor || gap > 5 * 60 * 1000

      if (startsNewGroup && current.length > 0) {
        result.push({ messages: current, showDivider: false })
        current = []
      }
      current.push(msg)
      prev = msg
    }
    if (current.length > 0) result.push({ messages: current, showDivider: false })

    // Her yeni günün ilk grubunda tarih ayırıcısı
    return result.map((group, index) => ({
      ...group,
      showDivider:
        index === 0 ||
        dayKey(group.messages[0]!.createdAt) !==
          dayKey(result[index - 1]!.messages[result[index - 1]!.messages.length - 1]!.createdAt),
    }))
  }, [messages])

  return (
    <div
      className={cn(
        'pc-scroll-fade flex-1 min-h-0 w-full overflow-y-auto px-4 py-3',
        className,
      )}
      role="log"
      aria-live="polite"
      aria-label="Mesajlar"
    >
      {messages.length === 0 ? (
        <EmptyState
          title="Henüz mesaj yok"
          description="Mesajlaşmaya başlayın veya bir kanala geçin."
        />
      ) : (
        <div className="mx-auto w-full max-w-[var(--pc-composer-max)] space-y-1">
          {groups.map((group, gi) => (
            <Fragment key={group.messages[0]!.id ?? gi}>
              {group.showDivider && (
                <DateDivider timestamp={group.messages[0]!.createdAt} />
              )}
              {group.messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  myUserId={me?.id ?? ''}
                  onReply={() => {
                    /* yanıt durumu composer tarafından yönetiliyor */
                  }}
                  onEdit={async (id, content) => {
                    await actions.editMessage(id, content)
                  }}
                  onDelete={async (id) => {
                    await actions.deleteMessage(id)
                  }}
                  onReact={async (id, emoji) => {
                    await actions.toggleReaction(id, emoji)
                  }}
                  onSave={async (id, content) => {
                    await actions.editMessage(id, content)
                  }}
                  onCancel={() => {
                    /* düzenleme iptali MessageItem içinde */
                  }}
                />
              ))}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

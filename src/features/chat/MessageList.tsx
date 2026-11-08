import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { DateDivider } from './DateDivider'
import { EmptyState } from './EmptyState'
import { MessageItem } from './MessageItem'

type MessageListProps = {
  channelId?: string
}

export function MessageList({ channelId }: MessageListProps) {
  const { messages } = useAppStore.getState()
  const myUserId = useAppStore.getState().me?.id ?? ''

  // Get messages for the active channel
  const channelMessages = channelId ? messages[channelId] || [] : []

  // Group consecutive messages from same author within 5 minutes
  const groupedMessages = React.useMemo(() => {
    if (channelMessages.length === 0) return []

    const groups: Array<{
      messages: typeof channelMessages
      showDivider: boolean
    }> = []

    let currentGroup: typeof channelMessages = [channelMessages[0]]
    const fiveMin = 5 * 60 * 1000

    for (let i = 1; i < channelMessages.length; i++) {
      const prev = channelMessages[i - 1]
      const curr = channelMessages[i]

      const timeDiff = curr.createdAt - prev.createdAt
      const sameAuthor = curr.authorId === prev.authorId

      if (sameAuthor && timeDiff <= fiveMin) {
        currentGroup.push(curr)
      } else {
        groups.push({
          messages: currentGroup,
          showDivider:
            groups.length > 0 &&
            new Date().getTime() - new Date(currentGroup[0].createdAt).getTime() >
              fiveMin,
        })
        currentGroup = [curr]
      }
    }
    groups.push({ messages: currentGroup, showDivider: false })

    return groups
  }, [channelMessages])

  return (
    <div className="pc-scroll-fade flex-1 w-full space-y-1">
      {channelMessages.length === 0 ? (
        <EmptyState
          title='Henüz mesaj yok'
          description='Mesajlaşmaya başlayın veya bir kanala geçin.'
        />
      ) : (
        <div className="space-y-1">
          {groupedMessages.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.showDivider && (
                <DateDivider
                  timestamp={new Date(group.messages[0].createdAt).getTime()}
                />
              )}
              {group.messages.map((msg, mi) => (
                <MessageItem
                  key={mi}
                  message={msg}
                  myUserId={myUserId}
                  onReply={() => {}}
                  onEdit={async () => {}}
                  onDelete={async () => {}}
                  onReact={async () => {}}
                />
              ))}
              {group.showDivider && group.messages.length > 0 && (
                <DateDivider
                  timestamp={new Date(
                    group.messages[group.messages.length - 1].createdAt
                  ).getTime()}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
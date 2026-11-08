import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { Menu, MenuTrigger, MenuContent, MenuItem } from '@/ui/primitives'
import { AttachmentCard } from './AttachmentCard'
import { Reactions } from './Reactions'

type MarkdownPart =
  | { type: 'text' | 'bold' | 'italic' | 'code' | 'code-block' | 'quote' | 'emoji' | 'mention'; content: string }
  | { type: 'link'; content: string; rawUrl: string }

type MessageItemProps = {
  message: import('@/types').Message
  myUserId: string
  onReply?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => Promise<void>
  onDelete?: (messageId: string) => Promise<void>
  onReact?: (messageId: string, emoji: string) => Promise<void>
  isEditing?: boolean
  onSave?: (messageId: string, content: string) => Promise<void>
  onCancel?: () => void
}

function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null

  // Tokenize: split into segments by applying markdown patterns
  const parts: MarkdownPart[] = []
  let remaining = text
  let pos = 0

  while (pos < remaining.length) {
    // Check for code block ``` ```
    const codeBlockMatch = remaining.slice(pos).match(/^```[\s\S]*?^```/m)
    if (codeBlockMatch) {
      const endPos = pos + codeBlockMatch[0].length
      parts.push({
        type: 'code-block',
        content: codeBlockMatch[0].replace(/^```|```$/g, '').trim(),
      })
      pos = endPos
      continue
    }

    // Check for quote >
    if (remaining[pos] === '>') {
      const lineEnd = remaining.indexOf('\n', pos)
      const line = lineEnd === -1 ? remaining.slice(pos) : remaining.slice(pos, lineEnd)
      parts.push({
        type: 'quote',
        content: line.replace(/^>\s?/, ''),
      })
      pos = lineEnd !== -1 ? lineEnd + 1 : remaining.length
      continue
    }

    // Check for inline code ` `
    if (remaining[pos] === '`' && remaining[pos + 1] === '`') {
      // Skip ``` and find closing ```
      const end = remaining.indexOf('```', pos + 2)
      if (end !== -1) {
        const codeContent = remaining.slice(pos + 2, end).trim()
        parts.push({ type: 'code-block', content: codeContent })
        pos = end + 3
        continue
      }
    }

    if (remaining[pos] === '`') {
      const end = remaining.indexOf('`', pos + 1)
      if (end !== -1) {
        const codeContent = remaining.slice(pos + 1, end)
        parts.push({ type: 'code', content: codeContent })
        pos = end + 1
        continue
      }
    }

    // Check for **bold**
    if (remaining.slice(pos, pos + 2) === '**') {
      const end = remaining.indexOf('**', pos + 2)
      if (end !== -1) {
        parts.push({
          type: 'bold',
          content: remaining.slice(pos + 2, end),
        })
        pos = end + 2
        continue
      }
    }

    // Check for *italic* (single, not **)
    if (remaining[pos] === '*' && remaining[pos + 1] !== '*') {
      const end = remaining.indexOf('*', pos + 1)
      if (end !== -1 && remaining[end - 1] !== '*') {
        parts.push({
          type: 'italic',
          content: remaining.slice(pos + 1, end),
        })
        pos = end + 1
        continue
      }
    }

    // Check for auto link
    if (
      remaining.slice(pos, pos + 7).match(/^https?:\/\//) ||
      remaining.slice(pos, pos + 4).match(/^www\./)
    ) {
      const end = remaining.indexOf(' ', pos)
      const urlEnd = end !== -1 ? end : remaining.length
      const url = remaining.slice(pos, urlEnd)
      parts.push({
        type: 'link',
        content: url,
        rawUrl: url,
      })
      pos = urlEnd
      continue
    }

    // Check for @mention
    if (remaining[pos] === '@') {
      const end = remaining.indexOf(' ', pos)
      const mentionEnd = end !== -1 ? end : remaining.length
      const mention = remaining.slice(pos + 1, mentionEnd)
      parts.push({
        type: 'mention',
        content: mention,
      })
      pos = mentionEnd
      continue
    }

    // Check for :emoji: or emoji standalone
    if (remaining[pos] === ':') {
      const end = remaining.indexOf(':', pos + 1)
      if (end !== -1) {
        const emojiCode = remaining.slice(pos + 1, end)
        // Check if it's a known emoji shortcode
        const emojiMap: Record<string, string> = {
          ':)': '🙂',
          ':(': '🙁',
          ':D': '😀',
          ':P': '😛',
          ':O': '😮',
          ':X': '😱',
          ':|': '😐',
          ':*)': '😌',
          ':@@': '🤔',
          ': heart:': '❤️',
          ':+)': '😄',
        }
        const emoji = emojiMap[emojiCode] || `:${emojiCode}:`
        parts.push({ type: 'emoji', content: emoji })
        pos = end + 1
        continue
      }
    }

    // Düz metin — bir sonraki markdown karakterine kadar ilerle.
    // NOT: Boşluklar metnin parçasıdır; eskiden boşlukta `pos` ilerlemediği
    // için markdown ayrıştırıcısı sonsuz döngüye girip sekmeyi kilitliyordu.
    const nextMarkdown = remaining.slice(pos).search(/[*`>\n@:#]/)
    let nextPos = nextMarkdown === -1 ? remaining.length : pos + nextMarkdown
    if (nextPos <= pos) nextPos = pos + 1

    const text = remaining.slice(pos, nextPos)
    if (text) {
      parts.push({ type: 'text', content: text })
    }
    pos = nextPos
  }

  // Convert parts to React nodes
  return (
    <div className="prose max-w-none break-words space-y-1">
      {parts.map((part, i) => {
        switch (part.type) {
          case 'bold':
            return (
              <strong key={i} className="font-bold">
                {part.content}
              </strong>
            )
          case 'italic':
            return (
              <em key={i} className="italic">
                {part.content}
              </em>
            )
          case 'code':
            return (
              <code key={i} className="text-muted-foreground bg-surface/50 rounded-sm px-1 py-0.5">
                {part.content}
              </code>
            )
          case 'code-block':
            return (
              <pre key={i} className="text-xs text-muted-foreground rounded-sm bg-surface/50 p-2 overflow-x-auto">
                {part.content}
              </pre>
            )
          case 'quote':
            return (
              <blockquote key={i} className="pl-2 border-l-2 border-border-soft bg-surface/50 italic text-muted-foreground">
                {part.content}
              </blockquote>
            )
          case 'link':
            return (
              <a
                key={i}
                href={part.rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-accent"
              >
                {part.content}
              </a>
            )
          case 'mention':
            return (
              <span
                key={i}
                className="pc-focus-ring rounded-md px-1.5 py-0.5 text-[var(--pc-accent)] bg-surface/30 text-sm font-medium"
              >
                @{part.content}
              </span>
            )
          case 'emoji':
            return (
              <span key={i} className="self-emoji h-3.5 w-3.5">
                {part.content}
              </span>
            )
          case 'text':
            return <span key={i}>{part.content}</span>
        }
      })}
    </div>
  )
}

export function MessageItem({
  message,
  myUserId,
  onReply: _onReply,
  onEdit,
  onDelete,
  onReact,
  isEditing: initialIsEditing = false,
  onSave,
  onCancel,
}: MessageItemProps) {
  const authorId = message.authorId
  const isOwnMessage = authorId === myUserId

  // Determine user accent hue
  const user = useAppStore(state => state.members[authorId])
  const accentHue = user?.accentHue ?? message.authorHue
  const avatarGradientStyle = `linear-gradient(140deg, hsl(${accentHue} 78% 62%) 0%, hsl(${(accentHue + 46) % 360} 82% 52%) 100%)`

  // Inline editing state
  const [editing, setEditing] = React.useState(initialIsEditing)
  const [editContent, setEditContent] = React.useState(message.content)

  const handleSave = async () => {
    if (!editContent.trim()) return
    await onSave?.(message.id, editContent)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditing(false)
    onCancel?.()
  }

  // Render deleted message
  if (message.deletedAt) {
    return (
      <div
        id={`msg-${message.id}`}
        className="pc-scroll-fade opacity-50 text-muted-foreground line-through"
      >
        <div className="py-2">
          <span>Silinmiş mesaj</span>
        </div>
      </div>
    )
  }

  return (
    <div
      id={`msg-${message.id}`}
      className="pc-scroll-fade relative [&>*:last-child]:mb-0"
    >
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: avatarGradientStyle } as React.CSSProperties}
        >
          {message.authorName[0]!.toUpperCase()}
        </div>

        {/* Message content column */}
        <div className="flex-1 min-w-0 gap-1.5 whitespace-pre-wrap flex flex-col">

          {/* Reply preview (if this message is a reply) */}
          {message.replyTo && (
            <div
              className="pc-scroll-fade rounded-md bg-surface/30 p-2.5 text-xs text-muted-foreground mb-1.5"
            >
              <div className="font-medium truncate">
                Yanıtla: {message.authorName}
              </div>
              <div className="pt-0.5 truncate">
                {message.content.length > 60
                  ? message.content.slice(0, 60) + '...'
                  : message.content}
              </div>
            </div>
          )}

          {/* Main content - markdown parsed */}
          <div className="prose max-w-none break-words flex-1">{parseMarkdown(message.content)}</div>

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {message.attachments.map((att, _i) => (
                <AttachmentCard
                  key={att.id}
                  attachment={att}
                  canCancel={isOwnMessage}
                />
              ))}
            </div>
          )}

          {/* Reactions */}
          <Reactions
            reactions={message.reactions}
            myUserId={myUserId}
            onToggleReaction={async (emoji: string) => { await onReact?.(message.id, emoji); }}
          />

        </div>

        {/* Editing textarea (for own messages) */}
        {isOwnMessage && editing && (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              } else if (e.key === 'Escape') {
                handleCancel()
              }
            }}
            className="w-full rounded-md border p-2 text-sm resize-none min-h-[32px] pc-focus-ring:outline-none pc-focus-ring:focus-visible:outline-2 pc-focus-ring:focus-visible:outline-[var(--pc-accent)]"
            placeholder="Mesajı yaz..."
          />
        )}

        {/* Hover toolbar for own messages */}
        {isOwnMessage && (
          <div className="absolute right-0 top-0 pt-1 hidden">
            <Menu>
              <MenuTrigger aria-label="Daha fazla" className="pc-focus-rounded p-1">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </MenuTrigger>
              <MenuContent>
                <MenuItem onSelect={() => onEdit?.(message.id, message.content)}>
                  <span>Düzenle</span>
                </MenuItem>
                <MenuItem onSelect={() => onDelete?.(message.id)}>
                  <span>Sil</span>
                </MenuItem>
              </MenuContent>
            </Menu>
          </div>
        )}
      </div>
    </div>
  )
}
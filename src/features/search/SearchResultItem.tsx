/* ------------------------------------------------------------------ *
 * PeerCord — Search: SearchResultItem
 * Arama sonucu satırı: yazar avatarı, kanal + zaman bilgisi ve
 * eşleşen metnin token renkle vurgulandığı içerik özeti.
 * ------------------------------------------------------------------ */
import { AtSign, Hash } from 'lucide-react'
import { cn, formatRelative, hueColor } from '@/lib/utils'
import { Avatar } from '@/ui/primitives'
import type { Message } from '@/types'

export interface SearchResultItemProps {
  message: Message
  /** Vurgulanacak arama metni */
  query: string
  channelName?: string
  /** Mesajda bana atıfta bulunuluyor mu */
  mention?: boolean
  active?: boolean
  onSelect: (message: Message) => void
  className?: string
}

/** Eşleşen parçaları <mark> ile sarar (token rengi) */
function highlight(text: string, query: string) {
  const needle = query.trim()
  if (!needle) return text

  const lowerText = text.toLowerCase()
  const lowerNeedle = needle.toLowerCase()
  const nodes = []
  let cursor = 0
  let index = lowerText.indexOf(lowerNeedle)

  while (index !== -1) {
    if (index > cursor) nodes.push(text.slice(cursor, index))
    nodes.push(
      <mark
        key={`${index}-${cursor}`}
        className="rounded-[3px] bg-[hsl(var(--pc-accent))/0.32] px-0.5 text-[hsl(var(--pc-accent-text))]"
      >
        {text.slice(index, index + lowerNeedle.length)}
      </mark>
    )
    cursor = index + lowerNeedle.length
    index = lowerText.indexOf(lowerNeedle, cursor)
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

export function SearchResultItem({
  message,
  query,
  channelName,
  mention = false,
  active = false,
  onSelect,
  className,
}: SearchResultItemProps) {
  const content = message.content.trim() || '(boş mesaj)'

  return (
    <button
      type="button"
      onClick={() => onSelect(message)}
      aria-label={`${message.authorName} — ${content}`}
      className={cn(
        'pc-focus-ring flex w-full items-start gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left',
        'transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]',
        active && 'bg-[hsl(var(--pc-surface-active))]',
        message.pending && 'opacity-70',
        className
      )}
    >
      <Avatar
        seed={message.authorId}
        name={message.authorName}
        size={28}
        hue={message.authorHue}
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[11px] leading-none">
          <span
            className="max-w-[40%] truncate font-medium"
            style={{ color: hueColor(message.authorHue) }}
          >
            {message.authorName}
          </span>
          {channelName && (
            <span className="flex min-w-0 items-center gap-0.5 text-[hsl(var(--pc-text-subtle))]">
              <Hash size={10} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{channelName}</span>
            </span>
          )}
          {mention && (
            <span
              title="Senden bahsediyor"
              className="flex shrink-0 items-center gap-0.5 rounded-full bg-[hsl(var(--pc-accent-soft))] px-1.5 py-0.5 text-[9px] font-medium text-[hsl(var(--pc-accent-text))]"
            >
              <AtSign size={9} aria-hidden="true" />
              mention
            </span>
          )}
          <span className="ml-auto shrink-0 tabular-nums text-[hsl(var(--pc-text-subtle))]">
            {formatRelative(message.createdAt)}
          </span>
        </span>

        <span className="mt-1 line-clamp-2 block text-[13px] leading-snug text-[hsl(var(--pc-text-muted))]">
          {highlight(content, query)}
        </span>
      </span>
    </button>
  )
}

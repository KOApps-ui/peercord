import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { Textarea, Button } from '@/ui/primitives'
import { EmojiPicker } from './EmojiPicker'

type MessageComposerProps = {
  channelId?: string
}

export function MessageComposer({ channelId }: MessageComposerProps) {
  const { sendMessage } = useAppStore.getState().actions
  const [emojiOpen, setEmojiOpen] = React.useState(false)

  if (!channelId) {
    return null
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return
    await sendMessage(channelId, content)
  }

  return (
    <div className="flex shrink-0 border-t border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface-raised))] px-4 pb-4">
      {/* Tek satır, ortalanmış, maksimum 900px: emoji — input — Gönder */}
      <div className="max-w-[900px] mx-auto w-full flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Emoji"
          onClick={() => setEmojiOpen(true)}
          className="h-9 w-9 rounded-[var(--radius-md)]"
        >
          <svg
            className="h-5 w-5 text-[hsl(var(--pc-text-muted))]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </Button>

        <EmojiPicker
          onSelect={(emoji: string) => {
            const textarea = document.querySelector(
              'textarea'
            ) as HTMLTextAreaElement | null
            if (textarea) {
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              textarea.value =
                textarea.value.substring(0, start) +
                emoji +
                textarea.value.substring(end)
              textarea.selectionStart = textarea.selectionEnd = start + emoji.length
            }
            setEmojiOpen(false)
          }}
          initialFocus={emojiOpen}
        />

        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="Mesajınız…"
            value=""
            onChange={() => {}}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const content = (e.target as HTMLTextAreaElement).value
                handleSend(content)
              }
            }}
            className="flex w-full min-w-0 rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] placeholder-[hsl(var(--pc-text-subtle))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9] focus-visible:border-transparent resize-none"
            data-composer-input
            rows={1}
            autoGrow
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={false}
          className="h-9 whitespace-nowrap"
        >
          Gönder
        </Button>
      </div>
    </div>
  )
}

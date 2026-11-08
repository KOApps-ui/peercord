import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { Textarea, Button } from '@/ui/primitives'
import { EmojiPicker } from './EmojiPicker'

type MessageComposerProps = {
  channelId?: string
}

export function MessageComposer({ channelId }: MessageComposerProps) {
  const { sendMessage } = useAppStore.getState().actions
  const [draft, setDraft] = React.useState('')

  if (!channelId) {
    return null
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return
    await sendMessage(channelId, content)
    setDraft('') // Gönderildikten sonra temizle
  }

  return (
    <div className="flex shrink-0 border-t border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface-raised))] px-4 pb-4">
      {/* Tek satır, ortalanmış, maksimum 900px: emoji — input — Gönder */}
      <div className="max-w-[900px] mx-auto w-full flex items-center gap-3">
        <EmojiPicker
          onSelect={(emoji: string) => {
            setDraft((prev) => prev + emoji)
          }}
        />

        <div className="flex-1 min-w-0">
          <Textarea
            placeholder="Mesajınız…"
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(draft)
              }
            }}
            className="flex w-full min-w-0 h-11 rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-3 text-sm text-[hsl(var(--pc-text))] placeholder-[hsl(var(--pc-text-subtle))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9] focus-visible:border-transparent resize-none"
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
          className="h-11 whitespace-nowrap px-3"
        >
          Gönder
        </Button>
      </div>
    </div>
  )
}

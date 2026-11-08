import * as React from 'react'
import { useAppStore } from '@/lib/store'
import { Textarea } from '@/ui/primitives'
import { EmojiPicker } from './EmojiPicker'
import { Button } from '@/ui/primitives'

type MessageComposerProps = {
  channelId?: string
}

export function MessageComposer({ channelId }: MessageComposerProps) {
  const { sendMessage, setTyping } = useAppStore.getState().actions
  const [typing, setTypingState] = React.useState(false)
  const [emojiOpen, setEmojiOpen] = React.useState(false)

  // Throttled typing indicator
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const throttle = 3000
    const sendTyping = () => {
      setTypingState(true)
      timer = setTimeout(() => setTypingState(false), throttle)
      setTyping(channelId!)
    }
    const handleKeyDown = () => {
      if (!typing) {
        setTypingState(true)
        timer = setTimeout(sendTyping, throttle)
      }
    }
    const handleKeyUp = () => {
      clearTimeout(timer)
      setTypingState(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [channelId, typing, setTyping])

  if (!channelId) {
    return null
  }

  const handleSend = async (content: string) => {
    if (!content.trim()) return
    await sendMessage(channelId, content, {
      replyTo: useAppStore.getState().activeChannelId
        ? /* reply reference */ undefined
        : undefined,
    })
    // Clear textarea after send
    // (handled by parent state)
  }

  return (
    <div className="pc-scroll-fade w-full border-t border-border-soft pt-2 bg-background">
      <div className="flex items-start gap-3 max-w-[900px] mx-auto">

        {/* Emoji button */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Emoji"
          onClick={() => setEmojiOpen(true)}
          className="pc-focus-rounded p-1.5"
        >
          <svg
            className="h-4 w-4 text-muted-foreground"
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
            // Insert emoji at cursor position
            const textarea = document.querySelector(
              'textarea'
            ) as HTMLTextAreaElement
            if (textarea) {
              const start = textarea.selectionStart
              const end = textarea.selectionEnd
              textarea.value =
                textarea.value.substring(0, start) +
                emoji +
                textarea.value.substring(end)
              textarea.selectionStart = textarea.selectionEnd = start + emoji.length
              setEmojiOpen(false)
            }
          }}
          initialFocus={emojiOpen}
        />

        {/* Textarea */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <Textarea
            placeholder="Mesajınız..."
            value=""
            onChange={() => {}}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) {
                  // Insert newline
                  return
                } else {
                  e.preventDefault()
                  const content = /* get content from state */ ''
                  handleSend(content)
                }
              }
            }}
            className="flex-1 rounded-none rounded-tl-md bg-transparent border-b border-border-soft resize-none pc-focus-ring:outline-none pc-focus-ring:focus-visible:outline-2 pc-focus-ring:focus-visible:outline-[var(--pc-accent)]"
            rows={1}
            autoGrow
          />
        </div>

        {/* Attach button */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Dosya ekle"
          className="pc-focus-rounded p-1.5"
        >
          <svg
            className="h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </Button>

        {/* Send button */}
        <Button
          type="submit"
          disabled={false}
          className="pc-focus-rounded bg-accent px-3 py-1.5 text-sm text-inverse hover:bg-accent-hover transition-colors"
        >
          Gönder
        </Button>
      </div>
    </div>
  )
}
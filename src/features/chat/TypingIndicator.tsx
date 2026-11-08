import { useTyping } from '@/lib/store'

export function TypingIndicator({ channelId }: { channelId: string }) {
  const typingUsers = useTyping(channelId)

  if (typingUsers.length === 0) {
    return null
  }

  const first = typingUsers[0]
  const others = typingUsers.slice(1).length

  if (others === 0) {
    return (
      <div className="pc-scroll-fade text-xs text-muted-foreground">
        {first.name} yazıyor...
      </div>
    )
  }

  return (
    <div className="pc-scroll-fade text-xs text-muted-foreground">
      {first.name} ve {others} lainnya yazıyor...
    </div>
  )
}
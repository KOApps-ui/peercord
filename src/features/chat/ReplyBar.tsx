export function ReplyBar({
  replyToMessage,
}: {
  replyToMessage: { id: string; authorName: string } | null
}) {
  if (!replyToMessage) {
    return null
  }

  return (
    <div className="pc-scroll-fade border-b border-border-soft bg-surface raised mb-2">
      <div className="flex items-start gap-3 py-2">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          {replyToMessage.authorName[0]!.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">
            Yanıtla: {replyToMessage.authorName}
          </div>
          <div className="text-[var(--pc-text-muted)] text-xs">
            Mesaj #{replyToMessage.id}
          </div>
        </div>
      </div>
    </div>
  )
}
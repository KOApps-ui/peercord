import type { Reaction } from '@/types'

interface ReactionsProps {
  reactions: Reaction[]
  myUserId: string
  onToggleReaction: (emoji: string) => Promise<void>
}

export function Reactions({ reactions, myUserId, onToggleReaction }: ReactionsProps) {
  const totalReactions = reactions.reduce(
    (sum, r) => sum + r.userIds.length,
    0
  )

  const myReaction = reactions.find((r) =>
    r.userIds.includes(myUserId)
  )

  return (
    <div className="pc-scroll-fade text-xs text-muted-foreground gap-1">
      {reactions.map((reaction) => (
        <ReactionCard
          key={reaction.emoji}
          reaction={reaction}
          myUserId={myUserId}
          onToggle={onToggleReaction}
        />
      ))}
      {myReaction && (
        <span className="ml-1 pc-focus-ring rounded-sm px-1.5 py-0.5 text-[var(--pc-accent)] text-[1px] opacity-0 hover:opacity-100 transition-opacity">
          {myReaction.emoji}
        </span>
      )}
      {totalReactions > 0 && (
        <div className="text-[var(--pc-text-muted)]">
          {totalReactions > 1 ? `${totalReactions} tepki` : '1 tepki'}
        </div>
      )}
    </div>
  )
}

function ReactionCard({
  reaction,
  myUserId,
  onToggle,
}: {
  reaction: Reaction
  myUserId: string
  onToggle: (emoji: string) => Promise<void>
}) {
  const isMyReaction = reaction.userIds.includes(myUserId)
  const count = reaction.userIds.length

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[var(--pc-emoji)]">
        {reaction.emoji}
      </span>
      {isMyReaction && (
        <span className="text-[var(--pc-accent)] font-medium">
          {count > 1 ? `${count}` : ''}
        </span>
      )}
      {!isMyReaction && count > 0 && (
        <span
          onClick={() => onToggle(reaction.emoji)}
          className="pc-focus-ring rounded-sm px-1.5 py-0.5 text-[var(--pc-accent)] text-[1px] opacity-0 hover:opacity-40 transition-opacity cursor-pointer"
        >
          {count > 1 ? `${count}` : ''}
        </span>
      )}
    </div>
  )
}
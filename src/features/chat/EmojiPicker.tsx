import { Popover, PopoverTrigger, PopoverContent } from '@/ui/primitives'
import { useSettings } from '@/lib/store'

const TOTAL_EMOJIS = 260

const EMOJIS = [...Array(TOTAL_EMOJIS)].map((_, i) => {
  const emojiSet = [
    // Smileys & Emotion
    '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😉', '😊', '😋',
    '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '😛', '😜', '😝',
    '🤑', '🤗', '🤠', '🤡', '🤢', '🤣', '🤤', '🥵', '🥶', '🥷',
    // People & Body
    '👀', '👁️‍🗨️', '👂', '👃', '👄', '👅', '👆', '👇', '👈', '👉',
    '👊', '👋', '👍', '👎', '👏', '👑', '💋', '💌', '💐', '💓',
    // Animals & Nature
    '🐀', '🐁', '🐂', '🐃', '🐄', '🐅', '🐆', '🐇', '🐈', '🐉',
    '🐊', '🐋', '🐌', '🐍', '🐎', '🐏', '🐐', '🐑', '🐒', '🐓',
    '🐘', '🐕', '🐖', '🐗', '🐘', '🐙', '🐚', '🐛', '🐜', '🐝',
    '🐞', '🐟', '🐠', '🐡', '🐢', '🐡', '🐤', '🐥', '🐦', '🐧',
    '🐨', '🐪', '🐫', '🐬', '🐭', '🐮', '🐯', '🐰', '🐱', '🐲',
    // Food & Drink
    '🍀', '🍁', '🍂', '🍃', '🍄', '🥑', '🍆', '🍇', '🍈', '🍉',
    '🍊', '🍋', '🍌', '🍍', '🍎', '🍏', '🥭', '🥝', '🥥', '🥦',
    // Activity
    '⚽', '⚾', '🎾', '🏀', '🏐', '🏈', '🏓', '🥊',
    // Travel & Places
    '🚗', '🚖', '🚕', '🚙', '🚌', '🚐', '🚑', '🚒', '🚓', '🚔',
    '🚕', '🚗', '🏎️', '🚀', '✈️', '🛫', '🛬', '🚁', '🚂', '🚊',
    // Objects
    '💻', '📱', '💾', '💿', '📓', '📔', '📚', '📖', '📝', '🗒️',
    '📋', '📌', '📍', '🗛', '🗜️', '⌨️', '🖱️', '🖥️', '🖨️', '💽',
    // Clothing
    '👕', '👖', '🥻', '👘', '🥽', '🎩', '🎓', '👓', '🧢', '🧤',
    // More emojis to reach 260
    '💯', '💠', '💡', '💢', '💦', '💧', '💨', '🕊️', '🕋', '🕌',
    '⛪', '🕍', '🕎', '⛩️', '⛲', '🗻', '🏔️', '🏕️', '🏖️', '🏝️',
    '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨',
    '🏩', '💒', '⛺', '🏯', '🏰', '🗿', '😺', '😸', '😹', '😻',
    '😼', '😽', '😾', '😿', '😸', '😹', '😺', '🐵', '🐒', '🐴',
    '🐮', '🐷', '🐸', '🐔', '🐧', '🐦', '🐥', '🐣', '🐒', '🐁',
  ]
  return emojiSet[i % emojiSet.length]
})

const CATEGORIES = [
  { key: 'recent', name: 'Son kullanılan', emojis: [] },
  { key: 'smileys', name: 'Gülümler & Duygular', emojis: EMOJIS.slice(0, 30) },
  { key: 'people', name: 'İnsanlar & Vücut', emojis: EMOJIS.slice(30, 60) },
  { key: 'animals', name: 'Hayvanlar & Doğa', emojis: EMOJIS.slice(60, 120) },
  { key: 'food', name: 'Yemek & İçecek', emojis: EMOJIS.slice(120, 150) },
  { key: 'activity', name: 'Etkinlik', emojis: EMOJIS.slice(150, 160) },
  { key: 'travel', name: 'Seyahat & Yerin', emojis: EMOJIS.slice(160, 200) },
  { key: 'objects', name: 'Nesneler', emojis: EMOJIS.slice(200, TOTAL_EMOJIS) },
]

export function EmojiPicker({
  onSelect,
  initialFocus: _initialFocus = false,
}: {
  onSelect: (emoji: string) => void
  initialFocus?: boolean
}) {
  const settings = useSettings()
  const recentEmojis = settings.recentEmojis || []

  return (
    <Popover>
      <PopoverTrigger>
        <button
          aria-label="Emoji picker"
          className="pc-focus-ring inline-flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 text-sm text-foreground hover:bg-surface-opacity-20 transition-colors"
        >
          😀
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-1 w-96">
        {/* Search area */}
        <div className="pc-scroll-fade mb-1.5">
          {/* Recent */}
          <div className="flex gap-2 flex-wrap mb-2">
            {recentEmojis.slice(0, 16).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="pc-focus-ring inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs hover:bg-surface-opacity-20 transition-colors select-none"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Category buttons */}
          <div className="flex gap-1 mb-1">
            {CATEGORIES.slice(1).map((cat) => (
              <button
                key={cat.key}
                onClick={() => {}}
                className="pc-focus-rounded text-xs text-muted-foreground hover/active text-foreground capitalize transition-colors"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji grid grid */}
        <div className="grid grid-cols-7 gap-0.5 py-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="pc-focus-rounded rounded-sm px-1.5 py-0.5 text-xs hover:bg-surface-opacity-20 transition-colors select-none"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
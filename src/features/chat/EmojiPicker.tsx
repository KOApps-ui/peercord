/* ------------------------------------------------------------------ *
 * PeerCord — EmojiPicker (onarılmış)
 * ------------------------------------------------------------------ */
import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/ui/primitives'
import { useSettings, useActions } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'

const EMOJI_CATEGORIES = [
  { key: 'recent', name: 'Son kullanılan', emojis: [] as string[] },
  { key: 'smileys', name: 'Gülümler & Duygular', emojis: [
    '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😉', '😊', '😋',
    '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '😛', '😜', '😝',
    '🤑', '🤗', '🤠', '🤡', '🤢', '🤣', '🤤', '🥵', '🥶', '🥷',
    '🤭', '🤫', '🤔', '🤐', '🤨', '🤥', '😶', '😐', '😑', '😬',
    '🙄', '😯', '😦', '😧', '😮', '😲', '😴', '🤤', '😪', '😵',
    '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠',
  ]},
  { key: 'people', name: 'İnsanlar & Vücut', emojis: [
    '👀', '👁️', '👂', '👃', '👄', '👅', '👆', '👇', '👈', '👉',
    '👊', '👋', '👍', '👎', '👏', '👑', '💋', '💌', '💐', '💓',
    '💔', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '💜', '🖤',
    '🤎', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣',
    '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋',
    '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
    '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀',
    '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦',
    '👧', '🧑', '👱', '👨', '👩', '🧓', '👴', '👵', '🙍', '🙎',
    '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '🧑‍🦽', '👨‍🦽',
  ]},
  { key: 'animals', name: 'Hayvanlar & Doğa', emojis: [
    '🐀', '🐁', '🐂', '🐃', '🐄', '🐅', '🐆', '🐇', '🐈', '🐉',
    '🐊', '🐋', '🐌', '🐍', '🐎', '🐏', '🐐', '🐑', '🐒', '🐓',
    '🐘', '🐕', '🐖', '🐗', '🐘', '🐙', '🐚', '🐛', '🐜', '🐝',
    '🐞', '🐟', '🐠', '🐡', '🐢', '🐡', '🐤', '🐥', '🐦', '🐧',
    '🐨', '🐪', '🐫', '🐬', '🐭', '🐮', '🐯', '🐰', '🐱', '🐲',
    '🐳', '🐴', '🐵', '🐶', '🐷', '🐸', '🐹', '🐺', '🐻', '🐻‍❄️',
    '🐼', '🐽', '🐾', '🦁', '🦂', '🦃', '🦄', '🦅', '🦆', '🦇',
    '🦈', '🦉', '🦊', '🦋', '🦌', '🦍', '🦎', '🦏', '🦐', '🦑',
    '🦒', '🦓', '🦔', '🦕', '🦖', '🦗', '🦘', '🦙', '🦚', '🦛',
    '🦜', '🦝', '🦞', '🦟', '🦠', '🦡', '🦢', '🦣', '🦤', '🦥',
    '🦦', '🦧', '🦨', '🦩', '🦪', '🦫', '🦬', '🦭', '🦮', '🦯',
  ]},
  { key: 'food', name: 'Yemek & İçecek', emojis: [
    '🍀', '🍁', '🍂', '🍃', '🍄', '🥑', '🍆', '🍇', '🍈', '🍉',
    '🍊', '🍋', '🍌', '🍍', '🍎', '🍏', '🥭', '🥝', '🥥', '🥦',
    '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐',
    '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇',
    '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪',
    '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲',
    '🍛', '🍣', '🍤', '🍥', '🥮', '🍡', '🍢', '🍘', '🍙', '🍚',
    '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮',
  ]},
  { key: 'activity', name: 'Etkinlik', emojis: [
    '⚽', '⚾', '🎾', '🏀', '🏐', '🏈', '🏓', '🥊',
    '🥋', '🥅', '🏒', '🏑', '🥍', '🏏', '🏹', '🎣',
    '🤿', '🥽', '🛷', '⛸️', '🎿', '🛹', '🛷', '🥌',
    '🎯', '🎱', '🔮', '🧿', '🎮', '🕹️', '🎰', '🎲',
    '🧩', '🎴', '🃏', '🀄', '🎭', '🖼️', '🎨', '🎪',
    '🎟️', '🎫', '🎪', '🤹', '🎪', '🎭', '🎨', '🎤',
    '🎧', '🎼', '🎵', '🎶', '🎷', '🎸', '🎻', '🪕',
    '🥁', '🪘', '📯', '🎹', '🪗', '🪕', '🪗', '🪘',
  ]},
  { key: 'travel', name: 'Seyahat & Yerler', emojis: [
    '🚗', '🚖', '🚕', '🚙', '🚌', '🚐', '🚑', '🚒', '🚓', '🚔',
    '🚕', '🚗', '🏎️', '🚀', '✈️', '🛫', '🛬', '🚁', '🚂', '🚊',
    '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓',
    '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜',
    '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔',
    '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚕', '🚖', '🚗', '🚘',
    '🚙', '🛻', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍',
    '🛸', '🛰️', '🚀', '🛸', '🛸', '🛰️', '🚀', '🛸', '🛰️', '🚀',
  ]},
  { key: 'objects', name: 'Nesneler', emojis: [
    '💻', '📱', '💾', '💿', '📓', '📔', '📚', '📖', '📝', '🗒️',
    '📋', '📌', '📍', '🗜️', '⌨️', '🖱️', '🖥️', '🖨️', '💽', '📀',
    '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠',
    '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '⌛',
    '⏳', '🔍', '🔎', '🔬', '🔭', '📡', '🕯️', '💡', '🔦', '🏮',
    '🪔', '📔', '📕', '📗', '📘', '📙', '📚', '📓', '📒', '📃',
    '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️', '💰', '💴', '💵',
    '💶', '💷', '💸', '💳', '🧾', '💹', '✉️', '📧', '📨', '📩',
    '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️', '✏️',
    '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝', '💼', '📁', '📂', '🗂️',
  ]},
  { key: 'symbols', name: 'Semboller', emojis: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈯', '🉐', '㊗️', '㊙️', '🈳', '🈲',
    '🅰️', '🅱️', '🆎', '🆑', '🆒', '🆓', '🆔', '🆕', '🆖', '🆗',
    '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈸', '🈹', '🈺', '🉑',
    '💮', '💯', '💢', '♨️', '🚸', '💠', '⭕', '🔴', '🟠', '🟡',
    '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩',
    '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️',
    '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳',
    '🔲', '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨',
  ]},
  { key: 'flags', name: 'Bayraklar', emojis: [
    '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶',
    '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩',
    '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴',
    '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨',
    '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴',
    '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬',
    '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭',
    '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷',
    '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲',
    '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰',
    '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲',
    '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵',
    '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾',
    '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺',
    '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰',
    '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺',
    '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬',
    '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪',
    '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹',
    '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧',
    '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲',
    '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦',
    '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳',
    '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳',
    '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺',
    '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼',
  ]},
]

export function EmojiPicker({
  onSelect,
  initialFocus = false,
}: {
  onSelect: (emoji: string) => void
  initialFocus?: boolean
}) {
  const settings = useSettings()
  const { updateSettings } = useActions()
  const recentEmojis = settings.recentEmojis || []
  const [activeCategory, setActiveCategory] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const popoverContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialFocus && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [initialFocus])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('')
        setShowSearchResults(false)
        if (searchInputRef.current) {
          searchInputRef.current.blur()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredCategories = EMOJI_CATEGORIES.map(cat => ({
    ...cat,
    emojis: cat.key === 'recent' 
      ? recentEmojis.slice(0, 48)
      : searchQuery 
        ? cat.emojis.filter(e => getEmojiName(e).includes(searchQuery.toLowerCase()))
        : cat.emojis
  })).filter(cat => cat.emojis.length > 0)

  const handleEmojiClick = (emoji: string) => {
    // Update recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 50)
    updateSettings({ recentEmojis: newRecent })
    onSelect(emoji)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const getEmojiName = (emoji: string): string => {
    const names: Record<string, string> = {
      '😀': 'grinning', '😁': 'grin', '😂': 'joy', '😃': 'smiley', '😄': 'smile', '😅': 'sweat_smile',
      '😆': 'laughing', '😉': 'wink', '😊': 'blush', '😋': 'yum', '😎': 'sunglasses', '😍': 'heart_eyes',
      '😘': 'kissing_heart', '🥰': 'kissing_smiling_eyes', '😗': 'kissing', '😙': 'kissing_smiling_eyes',
      '😚': 'kissing_closed_eyes', '😛': 'stuck_out_tongue', '😜': 'stuck_out_tongue_winking_eye',
      '😝': 'stuck_out_tongue_closed_eyes', '🤑': 'money_mouth', '🤗': 'hugs', '🤠': 'cowboy',
      '🤡': 'clown', '🤢': 'nauseated', '🤣': 'rofl', '🤤': 'drooling', '🥵': 'hot', '🥶': 'cold',
      '🥷': 'ninja', '👀': 'eyes', '👁️': 'eye', '👂': 'ear', '👃': 'nose', '👄': 'lips', '👅': 'tongue',
      '👆': 'point_up', '👇': 'point_down', '👈': 'point_left', '👉': 'point_right', '👊': 'punch',
      '👋': 'wave', '👍': 'thumbsup', '👎': 'thumbsdown', '👏': 'clap', '👑': 'crown', '💋': 'kiss',
      '💌': 'love_letter', '💐': 'bouquet', '💓': 'heartbeat', '🐀': 'rat', '🐁': 'mouse', '🐂': 'ox',
      '🐃': 'water_buffalo', '🐄': 'cow', '🐅': 'tiger', '🐆': 'leopard', '🐇': 'rabbit', '🐈': 'cat',
      '🐉': 'dragon', '🐊': 'crocodile', '🐋': 'whale', '🐌': 'snail', '🐍': 'snake', '🐎': 'horse',
      '🐏': 'ram', '🐐': 'goat', '🐑': 'sheep', '🐒': 'monkey', '🐓': 'rooster', '🐘': 'elephant',
      '🐕': 'dog', '🐖': 'pig', '🐗': 'boar', '🐘': 'elephant', '🐙': 'octopus', '🐚': 'shell',
      '🐛': 'bug', '🐜': 'ant', '🐝': 'bee', '🐞': 'ladybug', '🐟': 'fish', '🐠': 'tropical_fish',
      '🐡': 'blowfish', '🐢': 'turtle', '🐤': 'chick', '🐥': 'hatching_chick', '🐦': 'bird', '🐧': 'penguin',
      '🐨': 'koala', '🐪': 'camel', '🐫': 'two_hump_camel', '🐬': 'dolphin', '🐭': 'mouse2', '🐮': 'cow2',
      '🐯': 'tiger2', '🐰': 'rabbit2', '🐱': 'cat2', '🐲': 'dragon_face', '🍀': 'four_leaf_clover',
      '🍁': 'maple_leaf', '🍂': 'fallen_leaf', '🍃': 'leaves', '🍄': 'mushroom', '🥑': 'avocado',
      '🍆': 'eggplant', '🍇': 'grapes', '🍈': 'melon', '🍉': 'watermelon', '🍊': 'tangerine',
      '🍋': 'lemon', '🍌': 'banana', '🍍': 'pineapple', '🍎': 'red_apple', '🍏': 'green_apple',
      '🥭': 'mango', '🥝': 'kiwi', '🥥': 'coconut', '🥦': 'broccoli', '⚽': 'soccer', '⚾': 'baseball',
      '🎾': 'tennis', '🏀': 'basketball', '🏐': 'volleyball', '🏈': 'football', '🏓': 'ping_pong',
      '🥊': 'boxing_glove', '🚗': 'car', '🚖': 'taxi', '🚕': 'taxi', '🚙': 'suv', '🚌': 'bus',
      '🚐': 'minibus', '🚑': 'ambulance', '🚒': 'fire_engine', '🚓': 'police_car', '🚔': 'oncoming_police_car',
      '🏎️': 'racing_car', '🚀': 'rocket', '✈️': 'airplane', '🛫': 'airplane_departure',
      '🛬': 'airplane_arrival', '🚁': 'helicopter', '🚂': 'steam_locomotive', '🚊': 'tram',
      '💻': 'computer', '📱': 'phone', '💾': 'floppy_disk', '💿': 'cd', '📓': 'notebook',
      '📔': 'notebook_with_decorative_cover', '📚': 'books', '📖': 'open_book', '📝': 'memo',
      '🗒️': 'spiral_notepad', '📋': 'clipboard', '📌': 'pushpin', '📍': 'round_pushpin',
      '🗜️': 'clamp', '⌨️': 'keyboard', '🖱️': 'mouse', '🖥️': 'desktop', '🖨️': 'printer',
      '💽': 'minidisc', '👕': 'shirt', '👖': 'jeans', '🥻': 'sari', '👘': 'kimono',
      '🥽': 'goggles', '🎩': 'tophat', '🎓': 'graduation_cap', '👓': 'glasses', '🧢': 'cap',
      '🧤': 'gloves', '💯': '100', '💠': 'diamond', '💡': 'bulb', '💢': 'anger', '💦': 'sweat',
      '💧': 'droplet', '💨': 'dash', '🕊️': 'dove', '🕌': 'mosque', '⛪': 'church',
      '🕍': 'synagogue', '🕎': 'menorah', '⛩️': 'shinto_shrine', '⛲': 'fountain',
      '🗻': 'mount_fuji', '🏔️': 'mountain', '🏕️': 'camping', '🏖️': 'beach', '🏝️': 'desert_island',
      '🏘️': 'houses', '🏚️': 'derelict_house', '🏠': 'house', '🏡': 'house_with_garden',
      '🏢': 'office', '🏣': 'japanese_post_office', '🏤': 'post_office', '🏥': 'hospital',
      '🏦': 'bank', '🏨': 'hotel', '🏩': 'love_hotel', '💒': 'wedding', '⛺': 'tent',
      '🏯': 'japanese_castle', '🏰': 'castle', '🗿': 'moai',
    }
    return names[emoji] || emoji
  }

  return (
    <Popover>
      <PopoverTrigger aria-label="Emoji seçici" className="h-9 w-9 rounded-[var(--radius-md)] text-lg">
        😀
      </PopoverTrigger>

      <PopoverContent
        ref={popoverContentRef}
        className={cn(
          'p-0',
          'w-[340px]',
          'max-h-[380px]',
          'overflow-hidden',
          'flex flex-col'
        )}
        sideOffset={8}
        align="end"
        style={{ maxHeight: '380px' } as React.CSSProperties}
      >
        {/* Search header */}
        <div className="flex items-center gap-2 p-2 border-b border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] flex-shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--pc-text-muted))]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Emoji ara..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSearchResults(e.target.value.length > 0)
                setActiveCategory('smileys')
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full h-8 pl-9 pr-8 rounded-[var(--radius-md)] bg-[hsl(var(--pc-surface-hover))] text-sm text-[hsl(var(--pc-text))] placeholder-[hsl(var(--pc-text-muted))] border-none outline-none focus:ring-1 focus:ring-[hsl(var(--pc-accent))]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setShowSearchResults(false)
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))]"
                aria-label="Temizle"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-0.5 px-2 py-1 border-b border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] overflow-x-auto scrollbar-hide flex-shrink-0">
          {filteredCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key)
                setShowSearchResults(false)
              }}
              className={cn(
                'px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium whitespace-nowrap transition-colors',
                'hover:bg-[hsl(var(--pc-surface-hover))]',
                activeCategory === cat.key
                  ? 'bg-[hsl(var(--pc-accent))] text-[hsl(var(--pc-accent-text))]'
                  : 'text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))]'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="flex-1 overflow-y-auto pc-scroll-fade p-2 max-h-[300px]">
          {filteredCategories
            .filter(cat => cat.key === activeCategory || (searchQuery && cat.emojis.length > 0))
            .map((cat) => (
              <div key={cat.key} className="mb-3">
                {(searchQuery || cat.key === 'recent') && cat.key !== 'recent' && (
                  <h4 className="px-1 py-1 text-xs font-medium text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">
                    {cat.name}
                  </h4>
                )}
                <div className="grid grid-cols-7 gap-1">
                  {cat.emojis.map((emoji, idx) => (
                    <button
                      key={`${cat.key}-${idx}`}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className={cn(
                        'w-8 h-8 rounded-[var(--radius-md)] text-base flex items-center justify-center transition-all',
                        'hover:scale-110 hover:bg-[hsl(var(--pc-surface-hover))]',
                        'active:scale-95',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pc-accent))]'
                      )}
                      title={getEmojiName(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          {searchQuery && filteredCategories.every(cat => cat.emojis.length === 0) && (
            <div className="flex items-center justify-center h-24 text-[hsl(var(--pc-text-muted))] text-sm">
              Emoji bulunamadı
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
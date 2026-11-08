/* ------------------------------------------------------------------ *
 * PeerCord — CommandPalette
 * Fuzzy filtre, klavye navigasyonu (↑↓ Enter Esc), grupları, motion ile fade+scale.
 * Kanallar da kanal komutu olarak listelenir.
 * ------------------------------------------------------------------ */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { useActions, useAppStore, useChannels } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Kbd } from '@/ui/primitives'

const RECENT_KEY = 'peercord:command_palette_recent'

interface Command {
  key: string
  title: string
  description: string
  group: string
  icon?: string
  channelId?: string
  channelType?: 'text' | 'voice'
}

// Statik komutlar
const staticCommands: Command[] = [
  { key: 'new-guild', title: 'Sunucu Oluştur', description: 'Yeni bir PeerCord odası oluştur', group: 'sunucu', icon: 'plus' },
  { key: 'settings', title: 'Ayarlar', description: 'Kullanıcı ayarlarını aç', group: 'ayarlar', icon: 'settings' },
  { key: 'theme', title: 'Tema Değiştir', description: 'Geçerli temayı değiştir', group: 'ayarlar', icon: 'palette' },
  { key: 'copy-invite', title: 'Davet Linkini Kopyala', description: 'Sunucu davet linkini panele kopyala', group: 'davet', icon: 'link' },
  { key: 'help', title: ' Yardım', description: 'Kullanım kılavuzu ve kısayollar', group: 'diğer', icon: 'help' },
]

function useRecentCommands(): [string[], (key: string) => void] {
  const [recent, setRecent] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const addRecent = useCallback((key: string) => {
    const filtered = recent.filter((k) => k !== key)
    const updated = [key, ...filtered].slice(0, 5)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    } catch {}
    setRecent(updated)
  }, [recent])

  return [recent, addRecent]
}

export function CommandPalette() {
  const { setCommandPaletteOpen, openModal, pushToast, selectChannel, joinVoice } = useActions()
  const state = useAppStore()
  const channels = useChannels()
  const activeChannelId = state.activeChannelId
  const activeVoiceChannelId = state.activeVoiceChannelId
  const commandPaletteOpen = state.commandPaletteOpen
  const [recent, addRecent] = useRecentCommands()
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Kapatma/araç tamamlandığında focus sıfırla
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('')
      setFocusedIndex(0)
    }
  }, [commandPaletteOpen])

  // Focus'u açık olduğunda inputa ver
  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [commandPaletteOpen])

  // Kanal komutları - metin ve sesli kanallar
  const channelCommands = channels.map((ch): Command => ({
    key: `channel-${ch.id}`,
    title: ch.type === 'voice' ? 'Katıl: ' + ch.name : 'Git: #' + ch.name,
    description: ch.topic || (ch.type === 'voice' ? 'Sesli kanal' : 'Metin kanalı'),
    group: ch.type === 'voice' ? 'kanallar-voice' : 'kanallar',
    channelId: ch.id,
    channelType: ch.type,
  }))

  // Tüm komutlar: statik + kanal komutları + son kullanımlar
  const allCommands = [...staticCommands, ...channelCommands]

  // Filtrelenmiş komutlar
  const filtered = allCommands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.key.toLowerCase().includes(query.toLowerCase())
  )

  // Gruplara göre sınıflandır
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = []
    acc[cmd.group].push(cmd)
    return acc
  }, {} as Record<string, Command[]>)

  // Son kullanılanlar (sadece statik komutlar)
  const recentCommands = recent
    .map((k) => staticCommands.find((c) => c.key === k))
    .filter((c): c is Command => c !== undefined && !filtered.includes(c))

  // Komut seçimi
  const handleSelect = useCallback(
    (cmd: Command) => {
      addRecent(cmd.key)
      setCommandPaletteOpen(false)

      // Kanal komutları
      if (cmd.key.startsWith('channel-') && cmd.channelId) {
        if (cmd.channelType === 'voice') {
          // Sesli kanal - katıl
          joinVoice(cmd.channelId).catch(() => {
            pushToast({
              kind: 'error',
              title: 'Sesli Kanal',
              description: 'Sesli kanala katılamadınız.',
              duration: 3000,
            })
          })
        } else {
          // Metin kanal - git
          selectChannel(cmd.channelId)
        }
        pushToast({
          kind: 'success',
          title: cmd.channelType === 'voice' ? 'Sesli Kanala Katıldınız' : 'Kanala Geçildi',
          description: cmd.title,
          duration: 2000,
        })
        return
      }

      // Eylemi yürüt
      switch (cmd.key) {
        case 'new-guild':
          openModal('create-guild')
          break
        case 'settings':
          openModal('user-settings')
          break
        case 'theme':
          pushToast({
            kind: 'info',
            title: 'Tema Değiştir',
            description: 'Ayarlar > Görünüm sekmesinden tema değiştirebilirsiniz.',
            duration: 3000,
          })
          break
        case 'copy-invite':
          pushToast({
            kind: 'success',
            title: 'Kopyalandı',
            description: 'Davet linki kopyalandı.',
            duration: 2000,
          })
          break
        case 'help':
          pushToast({
            kind: 'info',
            title: ' Yardım',
            description: 'Ctrl+K: Komut paletini aç / kapat • ↑↓: Navigasyon • Enter: Seç • Esc: Kapat',
            duration: 5000,
          })
          break
      }
    },
    [addRecent, setCommandPaletteOpen, openModal, pushToast, selectChannel, joinVoice]
  )

  // Klavinge kontrolü
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        setCommandPaletteOpen(false)
        return
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        const allResults = [...Object.values(grouped).flat(), ...recentCommands]
        if (allResults[focusedIndex]) {
          handleSelect(allResults[focusedIndex]!)
        }
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const allResults = [...Object.values(grouped).flat(), ...recentCommands]
        setFocusedIndex((prev) => (prev + 1) % allResults.length)
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const allResults = [...Object.values(grouped).flat(), ...recentCommands]
        setFocusedIndex((prev) => (prev - 1 + allResults.length) % allResults.length)
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, grouped, recentCommands, focusedIndex, handleSelect])

  if (!commandPaletteOpen) return null

  // Grupların erişilebilirliği için sıralı gösterim
  const groupOrder = ['sunucu', 'kanallar', 'kanallar-voice', 'ayarlar', 'davet', 'sessiz', 'diğer']
  const sortedGroups = groupOrder.filter((g) => grouped[g]).concat(Object.keys(grouped).filter((g) => !groupOrder.includes(g)))

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Arka plan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[hsl(var(--pc-bg-deep))/0.6] backdrop-blur-sm pointer-events-auto"
        onClick={() => setCommandPaletteOpen(false)}
      />

      <div className="absolute inset-0 z-50 flex items-start pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="flex-1 max-w-2xl mx-4 mt-6"
          style={{ maxHeight: '80vh' }}
        >
          {/* Başlık */}
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[hsl(var(--pc-text))]">Komut Paleti</h2>
            <p className="text-xs text-[hsl(var(--pc-text-muted))]">
              Komut ara, ↑↓ ile gezin, Enter ile seçin, Esc ile kapatın
            </p>
          </div>

          {/* Arama kutusu */}
          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Komut ara..."
              className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-4 py-2 text-sm text-[hsl(var(--pc-text))] placeholder:text-[hsl(var(--pc-text-muted))] focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none"
              aria-label="komut ara"
            />
            <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">
              ⌘K
            </Kbd>
          </div>

          {/* Sonuçlar */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Gruplandırılmış sonuçlar */}
            {sortedGroups.map((group) => (
              <div key={group}>
                <h3 className="text-xs font-medium text-[hsl(var(--pc-text-muted))] uppercase tracking-wider px-1">
                  {group === 'kanallar' ? 'Kanallar' : group === 'kanallar-voice' ? 'Sesli Kanallar' : group}
                </h3>
                <div className="space-y-1">
                  {grouped[group].map((cmd, idx) => {
                    const isFocused = idx === 0
                    const isActive = cmd.channelId && (cmd.channelId === activeChannelId || cmd.channelId === activeVoiceChannelId) ? true : false
                    return (
                      <motion.button
                        key={cmd.key}
                        whileHover={{ backgroundColor: 'hsl(var(--pc-surface-hover))' }}
                        className={cn(
                          'w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                          isFocused && 'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent-text))]',
                          !isFocused && 'text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-surface-hover))]',
                          isActive && 'ring-1 ring-[hsl(var(--pc-accent))]'
                        )}
                        onClick={() => handleSelect(cmd)}
                      >
                        <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-[hsl(var(--pc-border-soft))]">
                          {cmd.channelType === 'voice' ? '🔊' : '#'}
                        </span>
                        <span className="flex-1">
                          <div className="font-medium truncate">{cmd.title}</div>
                          <div className="text-xs text-[hsl(var(--pc-text-muted))] truncate">{cmd.description}</div>
                        </span>
                        {isActive && <span className="text-[11px] text-[hsl(var(--pc-accent))]">• Aktif</span>}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Son kullanımlar */}
            {recentCommands.length > 0 && !query.trim() && (
              <div>
                <h3 className="text-xs font-medium text-[hsl(var(--pc-text-muted))] uppercase tracking-wider px-1 mb-2">
                  Son kullanımlar
                </h3>
                {recentCommands.map((cmd) => (
                  <motion.button
                    key={cmd.key}
                    whileHover={{ backgroundColor: 'hsl(var(--pc-surface-hover))' }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-surface-hover))]"
                    onClick={() => handleSelect(cmd)}
                  >
                    <Kbd>{cmd.key.split('-')[0]?.toUpperCase()?.[0] || '#'}</Kbd>
                    <span className="flex-1">{cmd.title}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Sonuç yok */}
            {filtered.length === 0 && query.trim() && (
              <div className="text-center py-4 text-[hsl(var(--pc-text-muted))]">
                <p>Bulunamadı</p>
                <p className="text-xs mt-1">Başka bir arama yapın veya <kbd className="ml-1">Esc</kbd> tuşuna basın</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
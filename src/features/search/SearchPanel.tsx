/* ------------------------------------------------------------------ *
 * PeerCord — Search: SearchPanel
 * Sağdan açılan cam panel: arama girdisi (otomatik odak), sonuç
 * sayısı, kanal filtresi, tarih filtresi (Bugün / 7 gün / Tümü),
 * kanala göre gruplanmış sonuçlar, eşleşen metin vurgusu, sonuca
 * tıklayınca kanala git + mesaja scroll + 1.2 sn geçici vurgu.
 * ------------------------------------------------------------------ */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Hash, Inbox, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActions, useAppStore, useChannels, useMe } from '@/lib/store'
import { IconButton, Skeleton } from '@/ui/primitives'
import type { ID, Message } from '@/types'
import { SearchResultItem } from './SearchResultItem'

type DateFilter = 'today' | '7d' | 'all'

const DATE_OPTIONS: Array<{ key: DateFilter; label: string }> = [
  { key: 'today', label: 'Bugün' },
  { key: '7d', label: '7 gün' },
  { key: 'all', label: 'Tümü' },
]

const DAY_MS = 86_400_000

function matchesDateFilter(ts: number, filter: DateFilter): boolean {
  if (filter === 'all') return true
  if (filter === '7d') return ts >= Date.now() - 7 * DAY_MS
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  return ts >= startOfDay.getTime()
}

export interface SearchPanelProps {
  open: boolean
  onClose: () => void
  className?: string
}

export function SearchPanel({ open, onClose, className }: SearchPanelProps) {
  const { searchMessages, selectChannel, pushToast } = useActions()
  const { messages } = useAppStore()
  const channels = useChannels()
  const me = useMe()

  const [query, setQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState<ID | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Message[]>([])
  const [flashId, setFlashId] = useState<ID | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  /* Panel açılınca girdiye odaklan */
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  /* Esc ile kapat */
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  /* Arama (kısa gecikmeli — iskelet gösterimi için) */
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = window.setTimeout(() => {
      const found = searchMessages(
        trimmed,
        channelFilter === 'all' ? undefined : channelFilter
      )
        .filter((msg) => !msg.deletedAt && matchesDateFilter(msg.createdAt, dateFilter))
        .slice(0, 80)
      setResults(found)
      setLoading(false)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [query, channelFilter, dateFilter, searchMessages, messages])

  /* Kanala göre gruplama (kanal sırasını koru) */
  const groups = useMemo(() => {
    const map = new Map<ID, Message[]>()
    for (const msg of results) {
      const bucket = map.get(msg.channelId)
      if (bucket) bucket.push(msg)
      else map.set(msg.channelId, [msg])
    }
    return channels
      .filter((channel) => map.has(channel.id))
      .map((channel) => ({
        channel,
        items: map.get(channel.id) ?? [],
      }))
  }, [results, channels])

  const channelName = (id: ID) => channels.find((c) => c.id === id)?.name

  /* Sonuca tıkla: kanala git + mesaja scroll + geçici vurgu */
  const handleSelect = (message: Message) => {
    selectChannel(message.channelId)
    setFlashId(message.id)
    requestAnimationFrame(() => {
      const el = document.getElementById(`msg-${message.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (el) {
        el.classList.add('pc-search-flash')
        el.style.transition = 'box-shadow 160ms ease, background-color 160ms ease'
        el.style.boxShadow = '0 0 0 2px hsl(var(--pc-accent) / 0.9)'
        el.style.backgroundColor = 'hsl(var(--pc-accent) / 0.14)'
        window.setTimeout(() => {
          el.classList.remove('pc-search-flash')
          el.style.boxShadow = ''
          el.style.backgroundColor = ''
        }, 1200)
      } else {
        pushToast({
          kind: 'info',
          title: 'Mesaj bulunamadı',
          description: 'Mesaj ekranda görüntülenemiyor olabilir.',
          duration: 2600,
        })
      }
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Mesaj arama"
          className={cn(
            'pc-glass-strong fixed right-0 top-0 z-40 flex h-full w-[380px] max-w-full flex-col',
            'border-l border-[hsl(var(--pc-border-soft))] shadow-float',
            className
          )}
        >
          {/* Başlık */}
          <header className="flex items-center gap-2 border-b border-[hsl(var(--pc-border-soft))] px-4 py-3">
            <Search size={15} aria-hidden="true" className="shrink-0 text-[hsl(var(--pc-text-subtle))]" />
            <h2 className="flex-1 text-sm font-semibold text-[hsl(var(--pc-text))]">Mesaj Ara</h2>
            <IconButton aria-label="Aramayı kapat" tooltip="Kapat" size="sm" onClick={onClose}>
              <X size={15} aria-hidden="true" />
            </IconButton>
          </header>

          {/* Arama girdisi */}
          <div className="px-4 pt-3">
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 text-[hsl(var(--pc-text-subtle))]">
                <Search size={14} aria-hidden="true" />
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Mesajlarda ara…"
                aria-label="Arama metni"
                className="w-full rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] py-2 pl-9 pr-8 text-sm text-[hsl(var(--pc-text))] transition-colors duration-150 placeholder-[hsl(var(--pc-text-subtle))] focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]"
              />
              {query && (
                <span className="absolute right-2 flex items-center">
                  <IconButton
                    aria-label="Aramayı temizle"
                    size="sm"
                    className="p-0.5"
                    onClick={() => {
                      setQuery('')
                      inputRef.current?.focus()
                    }}
                  >
                    <X size={13} aria-hidden="true" />
                  </IconButton>
                </span>
              )}
            </div>
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              aria-label="Kanal filtresi"
              className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-2.5 py-1.5 text-xs text-[hsl(var(--pc-text))] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]"
            >
              <option value="all">Tüm kanallar</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  #{channel.name}
                </option>
              ))}
            </select>

            <div
              role="group"
              aria-label="Tarih filtresi"
              className="flex shrink-0 items-center gap-0.5 rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] p-0.5"
            >
              {DATE_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={dateFilter === option.key}
                  onClick={() => setDateFilter(option.key)}
                  className={cn(
                    'pc-focus-ring rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium transition-colors duration-150',
                    dateFilter === option.key
                      ? 'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent-text))]'
                      : 'text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))]'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sonuç sayısı */}
          <div className="flex items-center justify-between px-4 pb-2">
            <p aria-live="polite" className="text-[11px] text-[hsl(var(--pc-text-subtle))]">
              {loading
                ? 'Aranıyor…'
                : query.trim()
                  ? `${results.length} sonuç`
                  : 'Aramak için bir metin yazın'}
            </p>
            {flashId !== null && (
              <span className="text-[11px] text-[hsl(var(--pc-accent-text))]">Vurgulandı</span>
            )}
          </div>

          {/* Sonuç listesi */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {loading && (
              <div className="flex flex-col gap-2 px-2 py-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2">
                    <Skeleton width={28} height={28} rounded="full" />
                    <div className="flex-1">
                      <Skeleton width="45%" height={10} />
                      <div className="mt-1.5">
                        <Skeleton width="90%" height={10} />
                        <div className="mt-1">
                          <Skeleton width="60%" height={10} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox size={28} aria-hidden="true" className="text-[hsl(var(--pc-text-subtle))]" />
                <p className="text-sm font-medium text-[hsl(var(--pc-text-muted))]">Sonuç bulunamadı</p>
                <p className="text-xs text-[hsl(var(--pc-text-subtle))]">
                  Farklı bir anahtar kelime deneyin veya filtreleri gevşetin.
                </p>
              </div>
            )}

            {!loading && !query.trim() && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Search size={28} aria-hidden="true" className="text-[hsl(var(--pc-text-subtle))]" />
                <p className="text-sm font-medium text-[hsl(var(--pc-text-muted))]">Mesajlarda ara</p>
                <p className="text-xs text-[hsl(var(--pc-text-subtle))]">
                  Sonuçlara tıklayarak ilgili kanala ve mesaja gidebilirsiniz.
                </p>
              </div>
            )}

            {!loading &&
              groups.map((group) => (
                <section key={group.channel.id} className="mb-2" aria-label={`${group.channel.name} kanalı sonuçları`}>
                  <h3 className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
                    <Hash size={11} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{group.channel.name}</span>
                    <span className="ml-auto shrink-0 tabular-nums">— {group.items.length}</span>
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((message) => (
                      <SearchResultItem
                        key={message.id}
                        message={message}
                        query={query.trim()}
                        channelName={channelName(message.channelId)}
                        mention={me ? message.mentions.includes(me.id) : false}
                        active={flashId === message.id}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </section>
              ))}

            {/* Kanal listesinde olmayan sonuçlar (ör. silinmiş kanal) */}
            {!loading &&
              results.some((msg) => !channels.some((c) => c.id === msg.channelId)) && (
                <section className="mb-2" aria-label="Diğer sonuçlar">
                  <h3 className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]">
                    <Hash size={11} aria-hidden="true" className="shrink-0" />
                    Diğer
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    {results
                      .filter((msg) => !channels.some((c) => c.id === msg.channelId))
                      .map((message) => (
                        <SearchResultItem
                          key={message.id}
                          message={message}
                          query={query.trim()}
                          mention={me ? message.mentions.includes(me.id) : false}
                          active={flashId === message.id}
                          onSelect={handleSelect}
                        />
                      ))}
                  </div>
                </section>
              )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  useActions,
  useChannelGroups,
  useGuild,
  useActiveChannel,
} from '@/lib/store'
import { Input, ScrollArea } from '@/ui/primitives'
import {
  Plus,
  Users,
  Mail,
} from 'lucide-react'
import { ChannelItem } from './ChannelItem'
import { UserPanel } from './UserPanel'

export function ChannelSidebar(): React.ReactNode {
  const guild = useGuild()
  const activeChannel = useActiveChannel()
  const groups = useChannelGroups()
  const { openModal, selectChannel, createChannel, toggleMembers } = useActions()

  const [newChannelName, setNewChannelName] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim() || !guild) return
    setCreating(true)
    try {
      await createChannel({
        name: newChannelName.trim(),
        type: 'text',
        categoryId: null,
      })
      setNewChannelName('')
    } finally {
      setCreating(false)
    }
  }

  if (!guild) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-full w-[var(--pc-sidebar-w)] flex-col shrink-0',
        'bg-[hsl(var(--pc-surface))] border-r border-[hsl(var(--pc-border-soft))]',
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => openModal('guild-settings')}
          aria-label={`${guild.name} sunucu ayarları`}
          className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] transition-colors hover:bg-[hsl(var(--pc-surface-hover))]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] overflow-hidden" style={{ backgroundImage: `linear-gradient(140deg, hsl(${seedHue(guild.iconSeed)} 78% 62%) 0%, hsl(${(seedHue(guild.iconSeed) + 46) % 360} 82% 52%) 100%)` }}>
            <span className="text-[hsl(var(--pc-text-inverse))] text-xs font-semibold leading-none">
              {guild.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[hsl(var(--pc-text))] truncate" title={guild.name}>
              {guild.name}
            </p>
            <p className="text-[11px] text-[hsl(var(--pc-text-subtle))] truncate">
              {guild.channels.length} üye
            </p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => openModal('invite')}
          aria-label="Davet linki oluştur"
          title="Sunucuya davet et"
          className="flex w-full items-center justify-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[hsl(var(--pc-accent))] hover:bg-[hsl(var(--pc-accent-soft))] transition-colors duration-150"
        >
          <Mail className="h-3.5 w-3.5" /> Davet et
        </motion.button>

        <div className="flex h-px w-full bg-[hsl(var(--pc-border-soft))] my-1" />
      </div>

      <ScrollArea className="flex-1 min-h-0 px-1">
        <div className="flex flex-col gap-1 px-1">
          {groups.groups.map((group) => (
            <motion.div
              key={group.category.id}
              layout
              className="flex flex-col gap-1 mb-2 px-1"
            >
              <p className="px-2 py-1 text-[10px] font-bold text-[hsl(var(--pc-text-subtle))] uppercase tracking-wider">
                {group.category.name}
              </p>
              {group.channels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  isActive={activeChannel?.id === ch.id}
                  onSelect={selectChannel}
                  onSettings={() => openModal('channel-settings')}
                />
              ))}
            </motion.div>
          ))}

          {groups.uncategorized.length > 0 && (
            <motion.div
              key="uncategorized"
              layout
              className="flex flex-col gap-1 mb-2 px-1"
            >
              {groups.uncategorized.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  isActive={activeChannel?.id === ch.id}
                  onSelect={selectChannel}
                  onSettings={() => openModal('channel-settings')}
                />
              ))}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleCreate}
            whileTap={{ scale: 0.98 }}
            className="mt-2 px-1"
          >
            <div className="relative">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Yeni kanal adı…"
                className="text-xs pl-8 pr-24"
              />
              <button
                type="submit"
                disabled={creating || !newChannelName.trim()}
                aria-label="Kanal oluştur"
                className={cn(
                  'absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full',
                  'text-[hsl(var(--pc-accent))] hover:bg-[hsl(var(--pc-accent-soft))]/50 transition-colors duration-150',
                  'disabled:opacity-50 disabled:pointer-events-none',
                )}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </motion.form>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => toggleMembers()}
            aria-label="Üye listesini aç/kapa"
            title="Üye listesi"
            className="flex w-full items-center justify-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))] transition-colors duration-150"
          >
            <Users className="h-3.5 w-3.5" /> Üyeler
          </motion.button>
        </div>
      </ScrollArea>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="px-2 py-2 border-t border-[hsl(var(--pc-border-soft))]"
      >
        <UserPanel />
      </motion.div>
    </motion.div>
  )
}

function seedHue(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % 360
}

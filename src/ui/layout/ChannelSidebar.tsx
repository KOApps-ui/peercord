import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  useActions,
  useChannelGroups,
  useGuild,
  useActiveChannel,
  useMembers,
} from '@/lib/store'
import { ScrollArea } from '@/ui/primitives'
import { Plus, Mail, ChevronRight, Users, Hash, Volume2 } from 'lucide-react'
import { ChannelItem } from './ChannelItem'
import { UserPanel } from './UserPanel'

export function ChannelSidebar(): React.ReactNode {
  const guild = useGuild()
  const members = useMembers()
  const activeChannel = useActiveChannel()
  const groups = useChannelGroups()
  const { openModal, selectChannel, toggleMembers } = useActions()

  if (!guild) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-full w-[var(--pc-sidebar-w)] flex-col shrink-0 min-h-0',
        'bg-[hsl(var(--pc-surface))] border-r border-[hsl(var(--pc-border-soft))]',
      )}
      data-sidebar
    >
      {/* Sabit üst başlık: 56px — sunucu adı, üye sayısı, sağda chevron */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5 h-[56px]">
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
              {members.length} üye
            </p>
          </div>
          <ChevronRight className="ml-auto shrink-0 h-3.5 w-3.5 text-[hsl(var(--pc-text-subtle))]" />
        </motion.button>
      </div>

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

      <ScrollArea className="flex-1 min-h-0 px-1">
        <div className="flex flex-col gap-1 px-1">
          {groups.groups.map((group) => (
            <motion.div
              key={group.category.id}
              layout
              className="flex flex-col gap-1 mb-2 px-1"
            >
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-[10px] font-bold text-[hsl(var(--pc-text-subtle))] uppercase tracking-wider">
                  {group.category.name}
                </p>
                <button
                  type="button"
                  onClick={() => openModal('create-channel', { categoryId: group.category.id, defaultType: 'text' })}
                  className="p-1 rounded-[var(--radius-sm)] text-[hsl(var(--pc-text-subtle))] hover:text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-surface-hover))] transition-colors"
                  aria-label={`${group.category.name} kategorisine kanal ekle`}
                  title="Kanal ekle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
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
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-[10px] font-bold text-[hsl(var(--pc-text-subtle))] uppercase tracking-wider">Diğer</p>
                <button
                  type="button"
                  onClick={() => openModal('create-channel', { categoryId: null, defaultType: 'text' })}
                  className="p-1 rounded-[var(--radius-sm)] text-[hsl(var(--pc-text-subtle))] hover:text-[hsl(var(--pc-text))] hover:bg-[hsl(var(--pc-surface-hover))] transition-colors"
                  aria-label="Kategorisiz kanala ekle"
                  title="Kanal ekle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {groups.uncategorized.map((ch) => {
                // Her kanal yalnızca bir kez görünsün: grouped kategorilerde
                // zaten yer alan kanalı tekrar uncategorized'da gösterme.
                const inGroup = groups.groups.some(g => g.channels.some(c => c.id === ch.id))
                if (inGroup) return null
                return (
                  <ChannelItem
                    key={ch.id}
                    channel={ch}
                    isActive={activeChannel?.id === ch.id}
                    onSelect={selectChannel}
                    onSettings={() => openModal('channel-settings')}
                  />
                )
              })}
            </motion.div>
          )}

        </div>
      </ScrollArea>

      {/* Üyeler butonu — kanal listesinin hemen altında, UserPanel'e yapışık */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => toggleMembers()}
        aria-label="Üye listesini aç/kapa"
        title="Üye listesi"
        className="flex w-full items-center justify-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))] transition-colors duration-150 mx-1 mb-1"
      >
        <Users className="h-3.5 w-3.5" /> Üyeler
      </motion.button>

      {/* Alt banda: UserPanel (sidebar içinde, rail'de değil) — 64px */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="flex shrink-0 border-t border-[hsl(var(--pc-border-soft))] px-2"
      >
        <div className="flex h-[64px] w-full items-center justify-between">
          <UserPanel />
        </div>
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
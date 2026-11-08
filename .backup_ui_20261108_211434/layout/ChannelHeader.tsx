import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types'
import { useAppStore, useActions } from '@/lib/store'
import { Input, IconButton } from '@/ui/primitives'
import { Search, Users, Bell, Sliders } from 'lucide-react'

interface ChannelHeaderProps {
  channel: Channel | null
}

export function ChannelHeader({ channel }: ChannelHeaderProps): JSX.Element {
  const { searchQuery } = useAppStore((s) => ({
    searchQuery: s.searchQuery,
  }))
  const {
    setSearchQuery,
    toggleMembers,
    pushToast,
  } = useActions()

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-[var(--pc-header-h)] w-full shrink-0 items-center justify-between gap-2 px-3',
        'pc-glass-strong border-b border-[hsl(var(--pc-border-soft))]',
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {channel && (
          <div className="flex flex-col leading-tight min-w-0">
            <p
              className="text-sm font-semibold text-[hsl(var(--pc-text))] truncate"
              title={channel.name}
            >
              #{channel.name}
            </p>
            {channel.topic && (
              <p className="text-xs text-[hsl(var(--pc-text-muted))] truncate">
                {channel.topic}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--pc-text-subtle))] pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ara…"
            className="w-[200px] text-xs pl-8"
          />
        </div>
        <IconButton
          aria-label="Üye listesini aç/kapa"
          tooltip="Üye listesi"
          onClick={() => toggleMembers()}
          size="sm"
        >
          <Users className="h-4 w-4" />
        </IconButton>
        <IconButton
          aria-label="Bildirimler"
          tooltip="Bildirimler"
          onClick={() => pushToast({ kind: 'info', title: 'Bildirimler', description: 'Henüz bildirim yok.' })}
          size="sm"
        >
          <Bell className="h-4 w-4" />
        </IconButton>
        <IconButton
          aria-label="Kanal ayarları"
          tooltip="Kanal ayarları"
          size="sm"
        >
          <Sliders className="h-4 w-4" />
        </IconButton>
      </div>
    </motion.div>
  )
}

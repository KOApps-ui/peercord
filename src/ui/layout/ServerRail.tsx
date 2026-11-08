import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { useAppStore, useActions, useMe } from '@/lib/store'
import { Tooltip } from '@/ui/primitives'
import { GuildIcon, Avatar } from '@/ui/primitives'
import { ShieldCheck, Plus, Settings } from 'lucide-react'

interface ServerRailProps {
  className?: string
}

export function ServerRail({ className }: ServerRailProps): ReactNode {
  const guild = useAppStore((s) => s.guild)
  const me = useMe()
  const { openModal } = useActions()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-full w-[var(--pc-rail-w)] flex-col shrink-0 items-center gap-2 py-3',
        'bg-[hsl(var(--pc-surface-raised))] border-r border-[hsl(var(--pc-border-soft))]',
        className,
      )}
      data-rail
    >
      <div className="flex flex-col gap-2 p-2 pt-1">
        {/* PeerCord logosu (40px) */}
        <Tooltip label="PeerCord" side="right">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => openModal('guild-settings')}
            aria-label="Sunucu ayarları"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
              'bg-[hsl(var(--pc-surface-hover))] hover:bg-[hsl(var(--pc-surface-active))]',
              'transition-colors duration-150',
            )}
          >
            <div
              className="flex h-full w-full items-center justify-center rounded-[var(--radius-md)] overflow-hidden"
              style={{
                backgroundImage: 'linear-gradient(135deg, hsl(var(--pc-accent)) 0%, hsl(var(--pc-violet)) 100%)',
              }}
            >
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
          </motion.button>
        </Tooltip>

        {/* Sunucu simgesi (44px) */}
        <AnimatePresence>
          {guild && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="mb-2"
            >
              <Tooltip label={guild.name} side="right">
                <GuildIcon
                  seed={guild.iconSeed}
                  name={guild.name}
                  size={44}
                  active={true}
                  onClick={() => openModal('guild-settings')}
                />
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Yeni sunucu (40px) */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => openModal('create-guild')}
          aria-label="Yeni sunucu oluştur"
          title="Yeni sunucu oluştur"
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
            'bg-[hsl(var(--pc-surface-hover))] hover:bg-[hsl(var(--pc-accent-soft))] hover:text-[hsl(var(--pc-accent))]',
            'transition-colors duration-150',
          )}
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="flex-1" />

      {/* Alta bağlı: avatar + ayarlar + çıkış (ikiside ikon, yazı yok) */}
      <div className="mt-auto flex flex-col gap-2">
        <AnimatePresence>
          {me && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="mb-1"
            >
              <Tooltip label={me.name} side="right">
                <Avatar
                  seed={me.avatarSeed}
                  name={me.name}
                  size={40}
                  hue={me.accentHue}
                  status={me.status === 'offline' ? 'offline' : me.status}
                  className="cursor-pointer"
                />
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => openModal('user-settings')}
          aria-label="Kullanıcı ayarları"
          title="Ayarlar"
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
            'bg-[hsl(var(--pc-surface-hover))] hover:bg-[hsl(var(--pc-surface-active))]',
            'transition-colors duration-150',
          )}
        >
          <Settings className="h-5 w-5" />
        </motion.button>

      </div>
    </motion.div>
  </>
  )
}

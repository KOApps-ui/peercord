import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  useAppStore,
  useMe,
  useActions,
  useConnection,
} from '@/lib/store'
import {
  Avatar,
  IconButton,
  Dot,
  Menu,
  MenuTrigger,
  MenuItem,
  MenuSeparator,
  MenuContent,
} from '@/ui/primitives'
import { Mic, MicOff, VolumeX, Headphones, Settings, User, Clock, CircleDot } from 'lucide-react'
import type { PresenceStatus } from '@/types'import type { UserProfile } from '@/types'

export function UserPanel(): ReactNode {
  const me = useMe()
  const { localMuted, localDeafened, localSpeaking } = useAppStore(
    (s) => ({
      localMuted: s.localMuted,
      localDeafened: s.localDeafened,
      localSpeaking: s.localSpeaking,
    }),
  )
  const { status } = useConnection()
  const { setStatus, toggleMute, toggleDeafen, openModal } = useActions()

  if (!me) return null

  const statusLabel: Record<PresenceStatus, string> = {
    online: 'Çevrimiçi',
    idle: 'Boşta',
    dnd: 'Rahatsız etmeyin',
    offline: 'Çevrimdışı',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex h-[var(--pc-header-h)] w-full items-center gap-3 px-3 shrink-0',
        'bg-[hsl(var(--pc-surface-raised))] border-y border-[hsl(var(--pc-border-soft))]',
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar
          seed={me.avatarSeed}
          name={me.name}
          size={32}
          hue={me.accentHue}
          status={me.status === 'offline' ? 'offline' : me.status}
          ring={localSpeaking ? 'speaking' : 'none'}
          className="shrink-0"
        />
        <div className="flex flex-col leading-tight min-w-0">
          <p
            className="text-sm font-medium text-[hsl(var(--pc-text))] truncate"
            title={me.name}
          >
            {me.name}
          </p>
          <div className="flex items-center gap-1.5">
            <Dot status={me.status === 'offline' ? 'offline' : me.status} />
            <span className="text-[11px] text-[hsl(var(--pc-text-muted))] truncate">
              {me.customStatus ??
                (status === 'reconnecting'
                  ? 'Yeniden bağlanılıyor'
                  : statusLabel[me.status as PresenceStatus] ?? 'Çevrimiçi')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <IconButton
          aria-label={localMuted ? 'Mikrofonu aç' : 'Mikrofonu kapat'}
          tooltip={localMuted ? 'Mikrofon kapalı' : 'Mikrofon açık'}
          variant={localMuted ? 'danger' : 'ghost'}
          active={localMuted}
          onClick={toggleMute}
          size="sm"
        >
          {localMuted ? (
            <MicOff className="h-4 w-4 text-[hsl(var(--pc-danger))]" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </IconButton>
        <IconButton
          aria-label={localDeafened ? 'Kulaklığı aç' : 'Kulaklığı kapat'}
          tooltip={localDeafened ? 'Kulaklık kapalı' : 'Kulaklık açık'}
          variant={localDeafened ? 'danger' : 'ghost'}
          active={localDeafened}
          onClick={toggleDeafen}
          size="sm"
        >
          {localDeafened ? (
            <VolumeX className="h-4 w-4 text-[hsl(var(--pc-danger))]" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </IconButton>
        <Menu>
          <MenuTrigger>
            <IconButton
              aria-label="Kullanıcı ayarları"
              tooltip="Ayarlar"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </IconButton>
          </MenuTrigger>
          <MenuContent>
            <MenuItem
              onClick={() => {
                openModal('user-settings')
              }}
            >
              Ayarları aç
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => setStatus('online')}>
              <User className="mr-2 h-4 w-4" /> Çevrimiçi olarak ayarla
            </MenuItem>
            <MenuItem onClick={() => setStatus('idle')}>
              <Clock className="mr-2 h-4 w-4" /> Boşta olarak ayarla
            </MenuItem>
            <MenuItem onClick={() => setStatus('dnd')}>
              <CircleDot className="mr-2 h-4 w-4" /> Rahatsız etmeyin
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => setStatus('offline')}>
              <User className="mr-2 h-4 w-4" /> Görünmez
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </motion.div>
  )
}

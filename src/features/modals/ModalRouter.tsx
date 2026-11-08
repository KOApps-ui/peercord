/* ------------------------------------------------------------------ *
 * PeerCord — Modals: ModalRouter
 * ------------------------------------------------------------------ */
import { useAppStore } from '@/lib/store'
import { CreateGuildModal } from './CreateGuildModal'
import { JoinGuildModal } from './JoinGuildModal'
import { InviteModal } from './InviteModal'
import { UserSettingsModal } from './UserSettingsModal'
import { GuildSettingsModal } from './GuildSettingsModal'
import { ChannelProfileModal } from './ChannelProfileModal'
import { CreateChannelModal } from './CreateChannelModal'
import { CreateCategoryModal } from './CreateCategoryModal'
import type { ModalKind } from '@/types'

export function ModalRouter() {
  const { modal, modalPayload } = useAppStore()

  const renderModal = (kind: ModalKind) => {
    switch (kind) {
      case 'create-guild':
        return <CreateGuildModal />
      case 'join-guild':
        return <JoinGuildModal />
      case 'invite':
        return <InviteModal />
      case 'user-settings':
        return <UserSettingsModal />
      case 'guild-settings':
        return <GuildSettingsModal />
      case 'channel-profile':
        return <ChannelProfileModal />
      case 'create-channel':
        return <CreateChannelModal />
      case 'create-category':
        return <CreateCategoryModal />
      case 'command-palette':
        return null // CommandPalette ayrı olarak render edilir
      case 'image-preview':
        return null // Gerekirse sonradan eklenir
      default:
        return null
    }
  }

  if (!modal) return null

  return <>{renderModal(modal)}</>
}
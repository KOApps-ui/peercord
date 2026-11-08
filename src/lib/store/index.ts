/**
 * PeerCord — Store Public API
 * UI katmanı yalnızca bu dosyadan import eder
 */

// Types (contract'tan re-export)
export type {
  AppStore,
  AppStoreState,
  AppStoreActions,
  SendMessageOptions,
  ChannelDraft,
  CreateGuildOptions,
  JoinGuildOptions,
  ChannelGroups,
  GroupChannels,
} from './contracts'

// Store instance
export { useAppStore } from './store'

// Selectors (hooks)
export {
  useActions,
  useMe,
  useGuild,
  useChannels,
  useChannelGroups,
  useActiveChannel,
  useMessages,
  useMembers,
  useVoiceMembers,
  useTyping,
  useSettings,
  useConnection,
  useGroupChannels,
  // Ek seçiciler
  useTheme,
  useDensity,
  useToasts,
  useModal,
  useSidebarOpen,
  useMembersOpen,
  useCommandPaletteOpen,
  useSearchQuery,
  useReady,
  useError,
  useActiveVoiceChannel,
  useLocalVoiceState,
  useRemoteStreams,
  useRemoteScreenStreams,
  useTransfers,
  useCategories,
  useReads,
  useLastActivity,
  // Composed hooks
  useSidebarChannels,
  useMessageCompose,
  useVoiceControls,
} from './selectors'

// Seed (test/başlangıç verileri)
export {
  DEFAULT_ROLES,
  createDefaultCategories,
  createDefaultChannels,
  createDefaultGuild,
  ensureEveryoneRole,
  getDefaultPermissions,
} from './seed'

// Yjs yönetimi
export {
  createYjsManager,
  type YjsManager,
  ensureProfileInYjs,
  addMessageToYjs,
  updateMessageInYjs,
  deleteMessageInYjs,
  toggleReactionInYjs,
  getMessagesFromYjs,
  getProfileFromYjs,
  getAllProfilesFromYjs,
  updateReadInYjs,
  getReadFromYjs,
  setGuildInYjs,
} from './yjs'

// Audio yönetimi
export {
  createAudioManager,
  type AudioManager,
  createAudioManagerForStore,
} from './audio'
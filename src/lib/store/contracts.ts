/* ------------------------------------------------------------------ *
 * PeerCord — uygulama mağazası sözleşmesi
 * ORKESTRA dosyası. UI katmanı yalnızca bu API'yi kullanır.
 * ------------------------------------------------------------------ */

import type {
  Channel,
  ChannelType,
  ConnectionInfo,
  Density,
  Guild,
  ID,
  Message,
  ModalKind,
  PeerInfo,
  Permission,
  PresenceStatus,
  Settings,
  ThemeName,
  ToastMessage,
  TypingState,
  UnixMs,
  UserProfile,
  VoiceMemberState,
} from '@/types'

/** Zustand unsubscribe tipi */
export type Unsubscribe = () => void

export type { 
  Channel,
  ChannelType,
  ConnectionInfo,
  Density,
  Guild,
  ID,
  Message,
  ModalKind,
  PeerInfo,
  Permission,
  PresenceStatus,
  Settings,
  ThemeName,
  ToastMessage,
  TypingState,
  UnixMs,
  UserProfile,
  VoiceMemberState,
} from '@/types'

import type { FileTransferHandle } from '../p2p/contracts'
export type { FileTransferHandle } from '../p2p/contracts'

/* ------------------------------ Yardımcı ------------------------------- */

export interface SendMessageOptions {
  replyTo?: string
  attachments?: File[]
  /** Sistem mesajı olarak gönder */
  system?: boolean
  mentions?: string[]
}

export interface ChannelDraft {
  name: string
  type: ChannelType
  categoryId?: string | null
  topic?: string
}

export interface CreateGuildOptions {
  name: string
  /** Oda sırrı (E2E şifreleme) */
  secret?: string
  encrypted?: boolean
}

export interface JoinGuildOptions {
  /** Davet kodu veya URL */
  invite: string
  secret?: string
  /** Görünen ad */
  name?: string
}

/* -------------------------------- Durum -------------------------------- */

export interface AppStoreState {
  /* Oturum */
  me: UserProfile | null
  guild: Guild | null
  connection: ConnectionInfo
  roomId: string | null

  /* Kanallar */
  activeChannelId: ID | null
  activeVoiceChannelId: ID | null
  /** Kategori id -> kanal listesi zaten guild içinde; bu hızlı erişim */
  channels: Channel[]
  categories: Guild['categories']

  /* Mesajlar (kanal id -> sıralı mesajlar) */
  messages: Record<ID, Message[]>
  /** Kanal id -> son okunma zamanı */
  reads: Record<ID, UnixMs>
  /** Kanal id -> en son yazma zamanı (bildirim noktası için) */
  lastActivity: Record<ID, UnixMs>

  /* Üyeler & varlık */
  members: Record<ID, PeerInfo>
  peers: PeerInfo[]
  typing: Record<ID, TypingState[]>
  voiceMembers: VoiceMemberState[]

  /* Medya */
  localMuted: boolean
  localDeafened: boolean
  localSpeaking: boolean
  localLevel: number
  selfScreenSharing: boolean
  /** peerId -> MediaStream (sesli kanal) */
  remoteStreams: Record<string, MediaStream>
  remoteScreenStreams: Record<string, MediaStream>

  /* UI */
  settings: Settings
  theme: ThemeName
  density: Density
  toasts: ToastMessage[]
  modal: ModalKind
  modalPayload: unknown
  sidebarOpen: boolean
  membersOpen: boolean
  commandPaletteOpen: boolean
  searchQuery: string
  /** Uygulama hazır mı (ilk yükleme bitti) */
  ready: boolean
  /** Global hata bandı */
  error: string | null
  /** Toast gönder / iptal et */
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: ID) => void

  /* Aktarımlar */
  transfers: Record<string, { name: string; progress: number; direction: 'send' | 'receive' }>
}

/* ------------------------------- Eylemler ------------------------------ */

export interface AppStoreActions {
  /* Yaşam döngüsü */
  bootstrap: () => Promise<void>
  createGuild: (options: CreateGuildOptions) => Promise<void>
  joinGuild: (options: JoinGuildOptions) => Promise<void>
  leaveGuild: () => Promise<void>
  inviteLink: () => string

  /* Kanal */
  selectChannel: (channelId: ID) => void
  createChannel: (draft: ChannelDraft) => Promise<Channel>
  updateChannel: (channelId: ID, patch: Partial<Channel>) => Promise<void>
  deleteChannel: (channelId: ID) => Promise<void>
  reorderChannel: (channelId: ID, toIndex: number) => Promise<void>
  createCategory: (name: string) => Promise<void>

  /* Mesaj */
  sendMessage: (channelId: ID, content: string, options?: SendMessageOptions) => Promise<void>
  editMessage: (messageId: ID, content: string) => Promise<void>
  deleteMessage: (messageId: ID) => Promise<void>
  toggleReaction: (messageId: ID, emoji: string) => Promise<void>
  pinMessage?: (messageId: ID) => Promise<void>
  searchMessages: (query: string, channelId?: ID) => Message[]

  /* Varlık & yazma */
  setTyping: (channelId: ID) => void
  setStatus: (status: PresenceStatus) => Promise<void>
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'customStatus' | 'bio' | 'accentHue' | 'avatarSeed'>>) => Promise<void>
  assignRole: (userId: ID, roleId: ID) => Promise<void>

  /* Ses */
  joinVoice: (channelId: ID) => Promise<void>
  leaveVoice: () => Promise<void>
  toggleMute: () => Promise<void>
  toggleDeafen: () => Promise<void>
  startScreenShare: () => Promise<void>
  stopScreenShare: () => Promise<void>

  /* Dosya */
  sendFile: (channelId: ID, file: File) => Promise<FileTransferHandle | null>

  /* Ayar & UI */
  updateSettings: (patch: Partial<Settings>) => Promise<void>
  setTheme: (theme: ThemeName) => void
  setDensity: (density: Density) => void
  openModal: (modal: ModalKind, payload?: unknown) => void
  closeModal: () => void
  toggleSidebar: (open?: boolean) => void
  toggleMembers: (open?: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: ID) => void
  markChannelRead: (channelId: ID) => void
  can: (permission: Permission) => boolean
  clearError: () => void
}

export type AppStore = AppStoreState & { actions: AppStoreActions }

/* ------------------ PUBLIC API (src/lib/store/index.ts) ---------------- *
 * UI SADECE şunları import eder:
 *   useAppStore        — zustand bound store (AppStore)
 *   useActions()       — AppStoreActions (referansı sabit)
 *   useMe()            — UserProfile | null
 *   useGuild()         — Guild | null
 *   useChannels()      — Channel[]
 *   useChannelGroups() — ChannelGroups
 *   useActiveChannel() — Channel | null
 *   useMessages(channelId: ID | null) — Message[]
 *   useMembers()       — PeerInfo[]
 *   useVoiceMembers()  — VoiceMemberState[]
 *   useTyping(channelId: ID) — TypingState[]
 *   useSettings()      — Settings
 *   useConnection()    — ConnectionInfo
 *   useGroupChannels    — GroupChannels
 * ---------------------------------------------------------------------- */

/* ------------------------------ Seçiciler ------------------------------ */

export interface ChannelGroups {
  uncategorized: Channel[]
  groups: Array<{ category: Guild['categories'][number]; channels: Channel[] }>
}

/** Kanal listesini kategoriye göre gruplar (UI kenar çubuğu kullanır) */
export type GroupChannels = (channels: Channel[], categories: Guild['categories']) => ChannelGroups
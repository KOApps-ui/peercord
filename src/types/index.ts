/* ------------------------------------------------------------------ *
 * PeerCord — kanonik alan modeli sözleşmeleri
 * Bu dosya ORKESTRA tarafından yönetilir. Alt ajanlar DEĞİŞTİRMEZ,
 * sadece import eder.
 * ------------------------------------------------------------------ */

export type ID = string
export type UnixMs = number
export type Unsubscribe = () => void

/* ----------------------------- Kimlik ----------------------------- */

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline'

export interface UserProfile {
  /** ed25519 açık anahtarının kısaltılmış hex'i — ağ üzerinde kalıcı kimlik */
  id: ID
  name: string
  /** Avatar gradyanı için tohum (deterministik üretim) */
  avatarSeed: string
  /** HSL hue 0..360 */
  accentHue: number
  status: PresenceStatus
  customStatus?: string
  bio?: string
  /** Bu kullanıcıya atanmış rol id'leri */
  roleIds: ID[]
  createdAt: UnixMs
}

/* ----------------------------- Sunucu ----------------------------- */

export interface Role {
  id: ID
  name: string
  /** HSL hue 0..360 */
  hue: number
  hoist: boolean
  mentionable: boolean
  permissions: Permission[]
  position: number
}

export type Permission =
  | 'manage_guild'
  | 'manage_channels'
  | 'manage_messages'
  | 'send_messages'
  | 'attach_files'
  | 'add_reactions'
  | 'connect_voice'
  | 'speak'
  | 'share_screen'
  | 'kick_members'

export interface Category {
  id: ID
  name: string
  position: number
}

export type ChannelType = 'text' | 'voice'

export interface Channel {
  id: ID
  name: string
  type: ChannelType
  categoryId: ID | null
  topic?: string
  position: number
  /** Saniye; 0 = kapalı */
  slowmodeSec: number
  locked: boolean
}

export interface Guild {
  id: ID
  name: string
  /** Sunucu ikonu için tohum */
  iconSeed: string
  description?: string
  ownerId: ID
  createdAt: UnixMs
  /** Uçtan uca şifreli oda mı */
  encrypted: boolean
  roles: Role[]
  categories: Category[]
  channels: Channel[]
  /** Odaya giriş için paylaşılan sır — asla düz metin olarak saklanmaz */
  inviteSecret?: string
}

/* ----------------------------- Mesajlar --------------------------- */

export interface Attachment {
  id: ID
  name: string
  size: number
  mime: string
  width?: number
  height?: number
  /** Yerel blob URL (varsa) */
  url?: string
  /** P2P transfer durumu */
  transfer?: TransferState
}

export interface TransferState {
  status: 'queued' | 'transferring' | 'done' | 'failed'
  /** 0..1 */
  progress: number
  peerId?: string
  error?: string
  bytesPerSecond?: number
}

export interface Reaction {
  /** Unicode emoji veya ":kisa_kod:" */
  emoji: string
  userIds: ID[]
}

export interface Message {
  id: ID
  channelId: ID
  authorId: ID
  /** Çevrimdışı görünüm için yazar adı anlık görüntüsü */
  authorName: string
  authorHue: number
  content: string
  createdAt: UnixMs
  editedAt?: UnixMs
  deletedAt?: UnixMs
  /** Sistem mesajı (katılma, kanal oluşturma...) */
  system?: boolean
  replyTo?: ID
  attachments: Attachment[]
  reactions: Reaction[]
  mentions: ID[]
  /** Yerel iyimser gönderim bayrağı */
  pending?: boolean
  failed?: boolean
}

/* ----------------------------- Varlık ----------------------------- */

export interface PeerInfo {
  /** Trystero peer id */
  peerId: string
  /** Uygulama düzeyi kullanıcı id'si */
  userId: ID
  name: string
  avatarSeed: string
  accentHue: number
  status: PresenceStatus
  customStatus?: string
  roleIds: ID[]
  /** Bulunulan sesli kanal (yoksa null) */
  voiceChannelId: ID | null
  muted: boolean
  deafened: boolean
  speaking: boolean
  screensharing: boolean
  /** Aynı oda içinde mi (presence alındı mı) */
  lastSeen: UnixMs
  latencyMs?: number
  isSelf: boolean
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface ConnectionInfo {
  status: ConnectionStatus
  peerCount: number
  roomId: string | null
  error?: string
  /** Sinyalleşme stratejisi */
  strategy?: SignalingStrategy
}

export type SignalingStrategy = 'nostr' | 'mqtt' | 'bittorrent' | 'firebase' | 'ipfs' | 'supabase'

/* ----------------------------- Ayarlar ---------------------------- */

export type ThemeName = 'dark' | 'light' | 'amoled'
export type Density = 'cozy' | 'compact'

export interface Settings {
  theme: ThemeName
  density: Density
  reduceMotion: boolean
  /** 0..1 */
  inputVolume: number
  /** 0..1 */
  outputVolume: number
  soundsEnabled: boolean
  notificationsEnabled: boolean
  /** Enter gönderir, Shift+Enter satır atlar */
  enterToSend: boolean
  showMembers: boolean
  /** Emoji picker'da son kullanılanlar */
  recentEmojis: string[]
  /** Otomatik güncelleme: yeni sürüm çıkınca kendiliğinden yenile */
  autoUpdate: boolean
  /** Sinyalleşme için özel relay adresleri */
  customRelays: string[]
  preferredStrategy: SignalingStrategy
  /** Güncelleme kontrolü için zaman aşımı ayarı */
  autoUpdateTimeoutMs?: number
}

/* --------------------------- UI yardımcı -------------------------- */

export interface TypingState {
  channelId: ID
  userId: ID
  name: string
  until: UnixMs
}

export interface VoiceMemberState {
  userId: ID
  peerId: string
  name: string
  avatarSeed: string
  accentHue: number
  muted: boolean
  deafened: boolean
  speaking: boolean
  screensharing: boolean
  /** Yerel ses seviyesi 0..1 */
  level: number
}

export interface ToastMessage {
  id: ID
  kind: 'info' | 'success' | 'error' | 'warning'
  title: string
  description?: string
  /** ms */
  duration?: number
}

export type ModalKind =
  | 'create-guild'
  | 'join-guild'
  | 'guild-settings'
  | 'user-settings'
  | 'invite'
  | 'channel-settings'
  | 'command-palette'
  | 'image-preview'
  | null

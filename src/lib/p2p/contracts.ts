/* ------------------------------------------------------------------ *
 * PeerCord — P2P taşıma katmanı sözleşmesi
 * ORKESTRA dosyası. Alt ajanlar DEĞİŞTİRMEZ.
 * Uygulama katmanı (store, UI) yalnızca bu arayüze bağımlıdır.
 * ------------------------------------------------------------------ */
import type {
  Attachment,
  ConnectionInfo,
  Guild,
  PeerInfo,
  SignalingStrategy,
  UserProfile,
} from '@/types'

/* ---------------------------- Tel protokolü ---------------------------- */

export const WIRE_VERSION = 1 as const

export interface WireEnvelope<T = unknown> {
  v: typeof WIRE_VERSION
  /** Örn. 'hello' | 'presence' | 'typing' | 'voice' | 'ping' | 'pong' | 'file' */
  type: string
  id: string
  ts: number
  payload: T
}

export interface HelloPayload {
  profile: UserProfile
  guildId: string
  /** İstemci sürümü */
  client: string
}

export interface PresencePayload {
  profile: UserProfile
  voiceChannelId: string | null
  muted: boolean
  deafened: boolean
  screensharing: boolean
}

export interface TypingPayload {
  channelId: string
  until: number
  name: string
}

export interface VoiceStatePayload {
  channelId: string | null
  muted: boolean
  deafened: boolean
  speaking: boolean
  screensharing: boolean
  /** 0..1 mikrofon seviyesi */
  level: number
}

export interface PingPayload {
  nonce: number
  sentAt: number
}

export interface PongPayload {
  nonce: number
  sentAt: number
  replyAt: number
}

/* --------------------------- Dosya transferi --------------------------- */

export interface IncomingFileOffer {
  transferId: string
  peerId: string
  fromUserId: string
  fromName: string
  name: string
  size: number
  mime: string
}

export interface FileTransferProgress {
  transferId: string
  peerId: string
  direction: 'send' | 'receive'
  transferred: number
  total: number
  /** 0..1 */
  progress: number
  bytesPerSecond: number
}

export interface FileTransferHandle {
  id: string
  /** Tamamlanınca yerel blob URL'li Attachment döner */
  promise: Promise<Attachment>
  onProgress: (cb: (p: FileTransferProgress) => void) => () => void
  cancel: () => void
}

/* ----------------------------- Yapılandırma ---------------------------- */

export interface P2PTransportConfig {
  roomId: string
  profile: UserProfile
  /** Oda meta verisi; yeni katılanlara Yjs üzerinden akar */
  guild: Guild
  /** Oda paylaşılan sırrı (varsa AES-GCM için) */
  roomSecret?: string
  strategy?: SignalingStrategy
  relayUrls?: string[]
  /** Uygulama ad alanı — sinyalleşme kanalı ayrımı */
  appId?: string
}

/* ------------------------------- Arayüz -------------------------------- */

/**
 * Tek bir odanın mesh taşıması. Aynı anda birden fazla örnek
 * (örn. metin odası + sesli kanal odası) yaşayabilir.
 */
export interface P2PTransport {
  readonly roomId: string
  /** Sinyalleşme sonrası atanan kendi peer id'miz */
  readonly selfPeerId: string
  readonly peers: ReadonlyMap<string, PeerInfo>

  join(config: P2PTransportConfig): Promise<void>
  leave(): Promise<void>

  /** Tüm eşlere yayınla (şifreliyse otomatik şifreler) */
  broadcast<T>(type: string, payload: T): Promise<void>
  /** Tek eşe gönder */
  sendTo<T>(peerId: string, type: string, payload: T): Promise<void>
  /** Bilinen tüm eşlere tek tek gönder */
  broadcastExcept<T>(exceptPeerId: string, type: string, payload: T): Promise<void>

  onMessage(handler: (message: WireEnvelope, fromPeerId: string) => void): () => void
  onPeersChanged(handler: (peers: PeerInfo[]) => void): () => void
  onPeerLeft(handler: (peerId: string) => void): () => void
  onConnectionChanged(handler: (info: ConnectionInfo) => void): () => void

  /** Periyodik presence yayınını hemen tetikle */
  publishPresence(payload: PresencePayload): Promise<void>
  /** Mesaj sırasında "yazıyor" yayını */
  publishTyping(payload: TypingPayload): Promise<void>

  /** Sesli kanal için yerel medya akışı (tek akış: mikrofon + ekran ayrı) */
  setLocalStream(stream: MediaStream | null): Promise<void>
  setLocalScreenStream(stream: MediaStream | null): Promise<void>
  onRemoteStream(handler: (peerId: string, stream: MediaStream) => void): () => void
  onRemoteScreenStream(handler: (peerId: string, stream: MediaStream) => void): () => void

  /** Dosya gönderimi (chunked, geri basınçlı) */
  sendFile(peerId: string, file: File): FileTransferHandle
  /** Gelen dosya teklifleri */
  onIncomingFile(handler: (offer: IncomingFileOffer) => void): () => void
  acceptFile(transferId: string): void
  rejectFile(transferId: string): void
  /** Transfer ilerlemeleri (gönderen + alan taraf) */
  onFileProgress(handler: (progress: FileTransferProgress) => void): () => void

  ping(peerId: string): Promise<number>

  destroy(): void
}

/* --------------------- PUBLIC API (src/lib/p2p/index.ts) --------------- *
 * Uygulama katmanı SADECE şunları import eder:
 *   createTransport(): P2PTransport
 *   deriveRoomId(invite: string): string
 *   parseInvite(input: string): { roomId: string; secret?: string } | null
 *   makeInviteLink(roomId: string, secret?: string): string
 *   createIdentity(name?: string): UserProfile
 *   loadIdentity(): UserProfile
 *   saveIdentity(profile: UserProfile): void
 *   encryptBytes / decryptBytes (opsiyonel dahili)
 * ---------------------------------------------------------------------- */

/* ------------------------- Yjs doküman şeması -------------------------- */

/**
 * Tüm eşler arasında paylaşılan CRDT şeması.
 * - `meta`         : Y.Map — anahtar `guild` => Guild (kanallar, roller, kategoriler)
 * - `profiles`     : Y.Map — anahtar userId => UserProfile
 * - `messages`     : Y.Array per kanal, ad: `messages:<channelId>` => Message[]
 * - `reads`        : Y.Map — anahtar userId => Record<channelId, lastReadTs>
 */
export const YJS_KEYS = {
  meta: 'meta',
  guild: 'guild',
  profiles: 'profiles',
  reads: 'reads',
  messageArray: (channelId: string) => `messages:${channelId}`,
} as const

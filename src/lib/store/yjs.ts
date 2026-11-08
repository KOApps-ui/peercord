/**
 * PeerCord — Yjs CRDT yönetimi
 * Belge oluşturma, IndexedDB kalıcılığı, ağ senkronizasyonu
 */
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { Guild, Message, UserProfile, ID, UnixMs } from '@/types'
import { YJS_KEYS } from '@/lib/p2p/contracts'
import type { P2PTransport } from '@/lib/p2p/contracts'

/* ------------------------------ Tipler ------------------------------- */

export interface YjsManager {
  doc: Y.Doc
  persistence: IndexeddbPersistence
  metaMap: Y.Map<unknown>
  profilesMap: Y.Map<unknown>
  readsMap: Y.Map<unknown>
  guild: Guild | null
  messageArrays: Map<ID, Y.Array<unknown>>
  sync: (transport: P2PTransport) => void
  destroy: () => void
  getMessageArray: (channelId: ID) => Y.Array<unknown>
  applyRemoteUpdate: (update: Uint8Array) => void
  getStateAsUpdate: () => Uint8Array
}

/* --------------------------- Yardımcılar ----------------------------- */

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/* -------------------------- Mesaj dönüştürme ------------------------- */

function messageFromYjs(yMsg: unknown): Message | null {
  const m = yMsg as Record<string, unknown>
  if (!m || !m.id) return null
  return {
    id: m.id as string,
    channelId: m.channelId as string,
    authorId: m.authorId as string,
    authorName: m.authorName as string,
    authorHue: m.authorHue as number,
    content: m.content as string,
    createdAt: m.createdAt as number,
    editedAt: m.editedAt as number | undefined,
    deletedAt: m.deletedAt as number | undefined,
    system: m.system as boolean | undefined,
    replyTo: m.replyTo as string | undefined,
    attachments: (m.attachments as Message['attachments']) ?? [],
    reactions: (m.reactions as Message['reactions']) ?? [],
    mentions: (m.mentions as string[]) ?? [],
    pending: m.pending as boolean | undefined,
    failed: m.failed as boolean | undefined,
  }
}

function messageToYjs(msg: Message): Record<string, unknown> {
  return {
    id: msg.id,
    channelId: msg.channelId,
    authorId: msg.authorId,
    authorName: msg.authorName,
    authorHue: msg.authorHue,
    content: msg.content,
    createdAt: msg.createdAt,
    editedAt: msg.editedAt,
    deletedAt: msg.deletedAt,
    system: msg.system,
    replyTo: msg.replyTo,
    attachments: msg.attachments,
    reactions: msg.reactions,
    mentions: msg.mentions,
    pending: msg.pending,
    failed: msg.failed,
  }
}

/* ----------------------------- Yjs Oluşturucu -------------------------- */

export function createYjsManager(roomId: string): YjsManager {
  const doc = new Y.Doc()
  const persistence = new IndexeddbPersistence(`peercord:${roomId}`, doc)

  const metaMap = doc.getMap(YJS_KEYS.meta)
  const profilesMap = doc.getMap(YJS_KEYS.profiles)
  const readsMap = doc.getMap(YJS_KEYS.reads)

  const messageArrays = new Map<ID, Y.Array<unknown>>()

  let guild: Guild | null = null
  let transport: P2PTransport | null = null
  let debouncedBroadcast: ((update: Uint8Array) => void) | null = null
  let synced = false

  // Guild meta verisini oku
  const guildData = metaMap.get(YJS_KEYS.guild)
  if (guildData) {
    guild = guildData as Guild
  }

  // Debounced broadcast fonksiyonu
  const broadcastUpdate = (update: Uint8Array) => {
    if (transport && synced) {
      transport.broadcast('yjs', toBase64(update)).catch(console.error)
    }
  }

  // 120ms debounce
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  debouncedBroadcast = (update: Uint8Array) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      broadcastUpdate(update)
    }, 120)
  }

  // Yjs güncellemelerini dinle
  const updateHandler = (update: Uint8Array) => {
    debouncedBroadcast!(update)
  }
  doc.on('update', updateHandler)

  // Mesaj dizisi alma/oluşturma
  function getMessageArray(channelId: ID): Y.Array<unknown> {
    let arr = messageArrays.get(channelId)
    if (!arr) {
      arr = doc.getArray(YJS_KEYS.messageArray(channelId))
      messageArrays.set(channelId, arr)
    }
    return arr
  }

  // Uzak güncelleme uygula
  function applyRemoteUpdate(update: Uint8Array): void {
    Y.applyUpdate(doc, update)
  }

  // Tam state'i update olarak al (yeni katılanlar için)
  function getStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(doc)
  }

  // Transport ile senkronize et
  function sync(t: P2PTransport): void {
    transport = t
    synced = true

    // Mevcut state'i yeni katılanlara gönder
    const stateUpdate = getStateAsUpdate()
    if (stateUpdate.length > 0) {
      transport.broadcast('yjs', toBase64(stateUpdate)).catch(console.error)
    }

    // Gelen yjs mesajlarını dinle
    transport.onMessage((envelope, _fromPeerId) => {
      if (envelope.type === 'yjs') {
        try {
          const update = fromBase64(envelope.payload as string)
          applyRemoteUpdate(update)
        } catch (e) {
          console.error('[Yjs] Uzak güncelleme uygulanamadı:', e)
        }
      }
    })

    // Yeni eş katıldığında ona güncel dokümanın tamamını gönder.
    // (Yalnızca doc.on('update') yayını yeterli değil: yeni gelen eş
    //  o ana kadarki geçmişi alamıyordu.)
    transport.onPeersChanged((peers) => {
      if (peers.length === 0) return
      const update = Y.encodeStateAsUpdate(doc)
      transport?.broadcast('yjs', toBase64(update)).catch(console.error)
    })
  }

  // Temizlik
  function destroy(): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    doc.off('update', updateHandler)
    persistence.destroy()
    doc.destroy()
    messageArrays.clear()
  }

  return {
    doc,
    persistence,
    metaMap,
    profilesMap,
    readsMap,
    guild,
    messageArrays,
    sync,
    destroy,
    getMessageArray,
    applyRemoteUpdate,
    getStateAsUpdate,
  }
}

/* --------------------------- Yüksek Seviye İşlemler --------------------------- */

export async function ensureProfileInYjs(
  yjs: YjsManager,
  profile: UserProfile
): Promise<void> {
  const existing = yjs.profilesMap.get(profile.id) as UserProfile | undefined
  if (!existing) {
    yjs.profilesMap.set(profile.id, profile)
  } else if (existing.name !== profile.name || existing.customStatus !== profile.customStatus) {
    // Profil güncellemesi
    yjs.profilesMap.set(profile.id, { ...existing, ...profile })
  }
}

export function addMessageToYjs(yjs: YjsManager, channelId: ID, message: Message): void {
  const arr = yjs.getMessageArray(channelId)
  arr.push([messageToYjs(message)])
}

export function updateMessageInYjs(yjs: YjsManager, channelId: ID, messageId: ID, patch: Partial<Message>): void {
  const arr = yjs.getMessageArray(channelId)
  for (let i = 0; i < arr.length; i++) {
    const item = arr.get(i) as Record<string, unknown> | undefined
    if (item?.id === messageId) {
      const updated = { ...item, ...patch }
      arr.delete(i)
      arr.insert(i, [updated])
      break
    }
  }
}

export function deleteMessageInYjs(yjs: YjsManager, channelId: ID, messageId: ID): void {
  const arr = yjs.getMessageArray(channelId)
  for (let i = 0; i < arr.length; i++) {
    const item = arr.get(i) as Record<string, unknown> | undefined
    if (item?.id === messageId) {
      arr.delete(i)
      break
    }
  }
}

export function toggleReactionInYjs(
  yjs: YjsManager,
  channelId: ID,
  messageId: ID,
  emoji: string,
  userId: ID
): void {
  const arr = yjs.getMessageArray(channelId)
  for (let i = 0; i < arr.length; i++) {
    const item = arr.get(i)
    if (item && typeof item === 'object' && item !== null) {
      const msg = item as Record<string, unknown>
      if (msg.id === messageId) {
        const reactions = (msg.reactions as Message['reactions']) ?? []
        const reactionIndex = reactions.findIndex((r: { emoji: string }) => r.emoji === emoji)
        let updatedReactions: Message['reactions']

        if (reactionIndex >= 0) {
          const reaction = reactions[reactionIndex]
          const userIndex = reaction.userIds.indexOf(userId)
          if (userIndex >= 0) {
            // Kaldır
            const newUserIds = reaction.userIds.filter((id: string) => id !== userId)
            if (newUserIds.length === 0) {
              updatedReactions = reactions.filter((r: { emoji: string }) => r.emoji !== emoji)
            } else {
              updatedReactions = reactions.map((r: { emoji: string; userIds: string[] }, idx: number) =>
                idx === reactionIndex ? { ...r, userIds: newUserIds } : r
              )
            }
          } else {
            // Ekle
            updatedReactions = reactions.map((r: { emoji: string; userIds: string[] }, idx: number) =>
              idx === reactionIndex ? { ...r, userIds: [...r.userIds, userId] } : r
            )
          }
        } else {
          // Yeni reaksiyon
          updatedReactions = [...reactions, { emoji, userIds: [userId] }]
        }

        const updated = { ...msg, reactions: updatedReactions }
        arr.delete(i)
        arr.insert(i, [updated])
        break
      }
    }
  }
}

export function getMessagesFromYjs(yjs: YjsManager, channelId: ID): Message[] {
  const arr = yjs.getMessageArray(channelId)
  const messages: Message[] = []
  for (let i = 0; i < arr.length; i++) {
    const msg = messageFromYjs(arr.get(i))
    if (msg) messages.push(msg)
  }
  return messages
}

export function getProfileFromYjs(yjs: YjsManager, userId: ID): UserProfile | undefined {
  return yjs.profilesMap.get(userId) as UserProfile | undefined
}

export function getAllProfilesFromYjs(yjs: YjsManager): Map<ID, UserProfile> {
  const map = new Map<ID, UserProfile>()
  yjs.profilesMap.forEach((value, key) => {
    map.set(key, value as UserProfile)
  })
  return map
}

export function updateReadInYjs(yjs: YjsManager, userId: ID, channelId: ID, timestamp: UnixMs): void {
  const userReads = (yjs.readsMap.get(userId) as Record<ID, UnixMs>) || {}
  userReads[channelId] = timestamp
  yjs.readsMap.set(userId, userReads)
}

export function getReadFromYjs(yjs: YjsManager, userId: ID, channelId: ID): UnixMs | undefined {
  const userReads = yjs.readsMap.get(userId) as Record<ID, UnixMs> | undefined
  return userReads?.[channelId]
}

export function setGuildInYjs(yjs: YjsManager, guild: Guild): void {
  yjs.metaMap.set(YJS_KEYS.guild, guild)
  yjs.guild = guild
}
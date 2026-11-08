/**
 * PeerCord — Ana Zustand Mağazası
 * Tüm uygulama durumu ve eylemleri
 */
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  AppStore,
  AppStoreState,
  AppStoreActions,
  Channel,
  ID,
  Message,
  PeerInfo,
  PresenceStatus,
  Settings,
  ThemeName,
  Density,
  ToastMessage,
  ModalKind,
  TypingState,
  VoiceMemberState,
  UserProfile,
  ConnectionInfo,
  ChannelDraft,
  CreateGuildOptions,
  JoinGuildOptions,
  SendMessageOptions,
  Permission,
  Unsubscribe,
  FileTransferHandle,
} from '@/lib/store/contracts'
import {
  createYjsManager,
  type YjsManager,
  ensureProfileInYjs,
  addMessageToYjs,
  updateMessageInYjs,
  deleteMessageInYjs,
  toggleReactionInYjs,
  getProfileFromYjs,
  getMessagesFromYjs,
  updateReadInYjs,
  setGuildInYjs,
} from './yjs'
import { createAudioManager, type AudioManager } from './audio'
import {
  createTransport,
  parseInvite,
  makeInviteLink,
  createIdentity,
  loadIdentity,
  updateIdentityName,
  getUserId,
  generateAccentHue,
} from '@/lib/p2p'
import { createDefaultGuild, ensureEveryoneRole } from './seed'
import { uid } from '@/lib/utils'
import type { P2PTransport } from '@/lib/p2p/contracts'

/* --------------------------- Varsayılan Ayarlar --------------------------- */

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  density: 'cozy',
  reduceMotion: false,
  inputVolume: 1,
  outputVolume: 1,
  soundsEnabled: true,
  notificationsEnabled: true,
  enterToSend: true,
  showMembers: true,
  recentEmojis: [],
  autoUpdate: true,
  customRelays: [],
  preferredStrategy: 'nostr',
}

const SETTINGS_KEY = 'peercord.settings.v1'

/* --------------------------- Yardımcılar --------------------------- */

function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) return { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
  } catch { }
  return DEFAULT_SETTINGS
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

function applyTheme(theme: ThemeName): void {
  document.documentElement.dataset.theme = theme
}

function applyDensity(density: Density): void {
  document.documentElement.dataset.density = density
}

/* --------------------------- Initial State --------------------------- */

const initialState: AppStoreState = {
  me: null,
  guild: null,
  connection: {
    status: 'idle',
    peerCount: 0,
    roomId: null,
    strategy: 'nostr',
  },
  roomId: null,
  activeChannelId: null,
  activeVoiceChannelId: null,
  channels: [],
  categories: [],
  messages: {},
  reads: {},
  lastActivity: {},
  members: {},
  peers: [],
  typing: {},
  voiceMembers: [],
  localMuted: false,
  localDeafened: false,
  localSpeaking: false,
  localLevel: 0,
  selfScreenSharing: false,
  remoteStreams: {},
  remoteScreenStreams: {},
  settings: loadSettings(),
  theme: 'dark',
  density: 'cozy',
  toasts: [],
  modal: null,
  modalPayload: undefined,
  sidebarOpen: true,
  membersOpen: true,
  commandPaletteOpen: false,
  searchQuery: '',
  ready: false,
  error: null,
  pushToast: (_toast) => {},
  dismissToast: () => {},
  transfers: {},
}

/* --------------------------- Toast Helper --------------------------- */

let toastId = 0
function makeToast(kind: ToastMessage['kind'], title: string, description?: string, duration = 4000): ToastMessage {
  return {
    id: `toast_${++toastId}_${uid()}`,
    kind,
    title,
    description,
    duration,
  }
}

/* --------------------------- Store Oluşturucu --------------------------- */

type StoreWithInternals = AppStore & {
  _yjs: YjsManager | null
  _audio: AudioManager | null
  _textTransport: P2PTransport | null
  _voiceTransport: P2PTransport | null
  _unsubs: Unsubscribe[]
  _typingTimers: Map<ID, ReturnType<typeof setTimeout>>
  _pendingMessages: Map<ID, Message>
  _ensureProfile: (profile?: Partial<UserProfile>) => Promise<UserProfile>
  _updatePeerList: (peers: PeerInfo[]) => void
  _handleIncomingMessage: (envelope: any, fromPeerId: string) => void
  _handlePeersChanged: (peers: PeerInfo[]) => void
  _handlePeerLeft: (peerId: string) => void
  _handleConnectionChanged: (info: ConnectionInfo) => void
  _handleRemoteStream: (peerId: string, stream: MediaStream) => void
  _handleRemoteScreenStream: (peerId: string, stream: MediaStream) => void
  _handleVoiceState: (peerId: string, state: any) => void
  _handleTyping: (peerId: string, payload: any) => void
  _handleIncomingFile: (offer: any) => void
  _handleFileProgress: (progress: any) => void
}

export const useAppStore = create<StoreWithInternals>()(
  devtools(
    (set, get) => {
      // --- İç Durum ---
      let _yjs: YjsManager | null = null
      let _audio: AudioManager | null = null
      let _textTransport: P2PTransport | null = null
      let _voiceTransport: P2PTransport | null = null
      const _unsubs: Unsubscribe[] = []
      const _typingTimers = new Map<ID, ReturnType<typeof setTimeout>>()
      const _pendingMessages = new Map<ID, Message>()

      // --- Profil Yardımcısı ---
      async function _ensureProfile(patch?: Partial<UserProfile>): Promise<UserProfile> {
        const state = get()
        let profile = state.me

        if (!profile) {
          // Kimliği yükle veya oluştur
          const identity = loadIdentity()
          if (identity) {
            const userId = getUserId(identity.publicKey)
            const avatarSeed = userId
            const accentHue = generateAccentHue(userId)
            profile = {
              id: userId,
              name: identity.name,
              avatarSeed,
              accentHue,
              status: 'online',
              roleIds: [],
              createdAt: Date.now(),
            }
          } else {
            // Yeni kimlik oluştur
            const { profile: newProfile } = await createIdentity()
            profile = newProfile
          }
        }

        if (patch) {
          profile = { ...profile!, ...patch }
          // Identity güncelle (isim değişikliği için)
          if (patch.name) {
            const identity = loadIdentity()
            if (identity) {
              profile = updateIdentityName(patch.name, identity.secretKey, identity.publicKey)
            }
          }
        }

        set({ me: profile })
        return profile!
      }

      // --- Peer Listesi Güncelleme ---
      function _updatePeerList(peers: PeerInfo[]): void {
        const me = get().me
        const members: Record<ID, PeerInfo> = {}
        peers.forEach(p => {
          members[p.userId] = p
        })

        // Kendi profili de ekle
        if (me) {
          const selfPeerId = _textTransport?.selfPeerId
          if (selfPeerId) {
            members[me.id] = {
              peerId: selfPeerId,
              userId: me.id,
              name: me.name,
              avatarSeed: me.avatarSeed,
              accentHue: me.accentHue,
              status: me.status,
              customStatus: me.customStatus,
              roleIds: me.roleIds,
              voiceChannelId: get().activeVoiceChannelId,
              muted: get().localMuted,
              deafened: get().localDeafened,
              speaking: get().localSpeaking,
              screensharing: get().selfScreenSharing,
              lastSeen: Date.now(),
              isSelf: true,
            }
          }
        }

        set({ peers, members })
      }

      // --- Mesaj İşleyici ---
      function _handleIncomingMessage(envelope: any, fromPeerId: string): void {
        const { type, payload } = envelope

        switch (type) {
          case 'hello': {
            // Eş profilini kaydet
            if (_yjs && payload.profile) {
              ensureProfileInYjs(_yjs, payload.profile)
            }
            break
          }
          case 'presence': {
            // Presence güncellemesi _handlePeersChanged ile yapılıyor
            break
          }
          case 'typing': {
            _handleTyping(fromPeerId, payload)
            break
          }
          case 'voice': {
            _handleVoiceState(fromPeerId, payload)
            break
          }
          case 'yjs': {
            if (_yjs) {
              try {
                const update = Uint8Array.from(atob(payload), c => c.charCodeAt(0))
                _yjs.applyRemoteUpdate(update)
              } catch (e) {
                console.error('[Store] Yjs update decode hatası:', e)
              }
            }
            break
          }
          case 'message': {
            // Gelen mesajı Yjs'e ve store'a ekle
            const message = payload as import('@/types').Message
            if (_yjs) {
              addMessageToYjs(_yjs, message.channelId, message)
            }
            // Store'da da güncelle (UI görünmesi için)
            set(state => ({
              messages: {
                ...state.messages,
                [message.channelId]: [...(state.messages[message.channelId] || []), message],
              },
              lastActivity: { ...state.lastActivity, [message.channelId]: message.createdAt },
            }))
            break
          }
        }
      }

      // --- Peer Değişiklikleri ---
      function _handlePeersChanged(peers: PeerInfo[]): void {
        _updatePeerList(peers)
      }

      function _handlePeerLeft(peerId: string): void {
        const { peers, members } = get()
        const newPeers = peers.filter((p: PeerInfo) => p.peerId !== peerId)
        const userId = Object.entries(members).find(([, v]: [string, PeerInfo]) => v.peerId === peerId)?.[0]
        const newMembers = { ...members }
        if (userId) delete newMembers[userId]
        set({ peers: newPeers, members: newMembers })
      }

      function _handleConnectionChanged(info: ConnectionInfo): void {
        set({ connection: info })
      }

      // --- Ses/Uzak Akış ---
      function _handleRemoteStream(peerId: string, stream: MediaStream): void {
        set(state => ({
          remoteStreams: { ...state.remoteStreams, [peerId]: stream },
        }))
      }

      function _handleRemoteScreenStream(peerId: string, stream: MediaStream): void {
        set(state => ({
          remoteScreenStreams: { ...state.remoteScreenStreams, [peerId]: stream },
        }))
      }

      // --- Voice State ---
      function _handleVoiceState(peerId: string, payload: any): void {
        const { peers, members } = get()
        const peer = peers.find((p: PeerInfo) => p.peerId === peerId)
        if (!peer) return

        const updatedPeer = { ...peer, ...payload, lastSeen: Date.now() }
        const newPeers = peers.map((p: PeerInfo) => p.peerId === peerId ? updatedPeer : p)
        const newMembers = { ...members }
        if (newMembers[peer.userId]) {
          newMembers[peer.userId] = updatedPeer
        }

        // Sesli üye listesini güncelle
        const voiceMembers: VoiceMemberState[] = newPeers
          .filter((p: PeerInfo) => p.voiceChannelId === get().activeVoiceChannelId)
          .map((p: PeerInfo) => ({
            userId: p.userId,
            peerId: p.peerId,
            name: p.name,
            avatarSeed: p.avatarSeed,
            accentHue: p.accentHue,
            muted: p.muted,
            deafened: p.deafened,
            speaking: p.speaking,
            screensharing: p.screensharing,
            level: 0, // Level ayrı güncellenir
          }))

        set({ peers: newPeers, members: newMembers, voiceMembers })
      }

      // --- Typing ---
      function _handleTyping(peerId: string, payload: { channelId: ID; until: number; name: string }): void {
        const { channelId, until, name } = payload
        const userId = get().peers.find((p: PeerInfo) => p.peerId === peerId)?.userId
        if (!userId) return

        set((state: AppStoreState) => {
          const existing = state.typing[channelId] || []
          const filtered = existing.filter((t: TypingState) => t.userId !== userId)
          const updated = [...filtered, { channelId, userId, name, until }]
          return { typing: { ...state.typing, [channelId]: updated } }
        })

        // Timer ile temizle
        const timer = _typingTimers.get(channelId)
        if (timer) clearTimeout(timer)
        const newTimer = setTimeout(() => {
          set((state: AppStoreState) => {
            const existing = state.typing[channelId] || []
            const filtered = existing.filter((t: TypingState) => t.userId !== userId)
            return { typing: { ...state.typing, [channelId]: filtered } }
          })
          _typingTimers.delete(channelId)
        }, until - Date.now() + 1000)
        _typingTimers.set(channelId, newTimer)
      }

      // --- Dosya Transferi ---
      function _handleIncomingFile(offer: {
        transferId: string
        peerId: string
        fromUserId: string
        fromName: string
        name: string
        size: number
        mime: string
      }): void {
        const { transferId, name } = offer

        // Otomatik kabul
        if (_textTransport) {
          _textTransport.acceptFile(transferId)
        }

        // Transfer durumunu takip et
        set({
          transfers: {
            ...(globalThis as any).transfers || {},
            [transferId]: { name, progress: 0, direction: 'receive' },
          },
        })

        // Progress dinle
        _textTransport?.onFileProgress((p: {
          transferId: string
          progress: number
          bytesPerSecond: number
        }) => {
          if (p.transferId === transferId) {
            set(state => ({
              transfers: {
                ...state.transfers,
                [transferId]: { ...state.transfers[transferId], progress: p.progress, bytesPerSecond: p.bytesPerSecond },
              },
            }))
          }
        })

        // Tamamlandığında attachment oluştur
        // Not: Gerçek implementasyonda transfer modülünden blob alınır
      }

      function _handleFileProgress(progress: {
  transferId: string
  direction: 'send' | 'receive'
  transferred: number
  total: number
  progress: number
  bytesPerSecond: number
}): void {
  const { transferId, direction, progress: prog } = progress
  set((state: AppStoreState) => ({
    transfers: {
      ...state.transfers,
      [transferId]: {
        name: state.transfers[transferId]?.name || '',
        progress: prog,
        direction,
      },
    },
  }))
}

      // --- Actions Nesnesi ---
      const actions: AppStoreActions = {
        /* Yaşam Döngüsü */
        bootstrap: async () => {
          const state = get()
          if (state.ready) return

          try {
            // Ayarları uygula
            const settings = loadSettings()
            applyTheme(settings.theme)
            applyDensity(settings.density)
            set({ settings, theme: settings.theme, density: settings.density })

            // Profil sağla
            await _ensureProfile()

            // Hash'ten oda bilgisini çöz
            // Desteklenen formatlar:
            // - #/oda/<roomId>?s=<secret>
            // - #<roomId>?s=<secret> (eski format)
            let roomId: string | null = null
            let secret: string | undefined

            const hash = location.hash // "#/oda/xxx" veya "#xxx"
            const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash // "#/oda/xxx" -> "/oda/xxx"
            const normalizedHash = cleanHash.startsWith('/') ? cleanHash.slice(1) : cleanHash

            if (normalizedHash.startsWith('oda/') || normalizedHash.startsWith('oda?')) {
              const withoutPrefix = normalizedHash.slice(4) // "oda/" sonrası
              const [parsedRoomId, ...secretParts] = withoutPrefix.split('?')
              roomId = parsedRoomId.replace(/^\//, '')
              if (secretParts.length > 0) {
                const params = new URLSearchParams(secretParts.join('?'))
                secret = params.get('s') || undefined
              }
            } else if (normalizedHash.length > 0 && !normalizedHash.startsWith('/')) {
              // Eskiden: #roomId?secret=...
              const [parsedRoomId, ...secretParts] = normalizedHash.split('?')
              roomId = parsedRoomId
              if (secretParts.length > 0) {
                const params = new URLSearchParams(secretParts.join('?'))
                secret = params.get('s') || undefined
              }
            } else {
              // localStorage'dan son oda
              roomId = localStorage.getItem('peercord.lastRoom')
              secret = localStorage.getItem('peercord.lastSecret') || undefined
            }

            if (roomId) {
              // Odaya bağlan
              await actions.joinGuild({ invite: roomId, secret })
              // Eğer joinGuild başarısızsa (ör. eski oda), bootstrap tamam
              if (!get().ready) set({ ready: true })
            } else {
              set({ ready: true })
            }
          } catch (error) {
            console.error('[Store] Bootstrap hatası:', error)
            const errMsg = error instanceof Error ? error.message : 'Başlatma hatası'
            set({ error: errMsg, ready: true })
            get().pushToast(makeToast('error', 'Başlatma Hatası', errMsg))
          }
        },

        createGuild: async (options: CreateGuildOptions) => {
          const { name, secret, encrypted = false } = options
          const me = await _ensureProfile()

          const guild = createDefaultGuild(name, me.id, secret, encrypted)
          const roomId = uid('room')

          // Yjs yöneticisi oluştur
          _yjs = createYjsManager(roomId)
          setGuildInYjs(_yjs, guild)

          // Text transport
          _textTransport = createTransport(roomId)
          await _textTransport.join({
            roomId,
            profile: me,
            guild,
            roomSecret: secret,
            appId: 'peercord-v1',
          })

          // Event listener'ları kur
          _unsubs.push(
            _textTransport.onMessage((env, peerId) => _handleIncomingMessage(env, peerId)),
            _textTransport.onPeersChanged(_handlePeersChanged),
            _textTransport.onPeerLeft(_handlePeerLeft),
            _textTransport.onConnectionChanged(_handleConnectionChanged),
          )

          // Yjs sync
          _yjs.sync(_textTransport)

          // Hash ve localStorage güncelle
          location.hash = `#/oda/${roomId}${secret ? `?s=${secret}` : ''}`
          localStorage.setItem('peercord.lastRoom', roomId)
          if (secret) localStorage.setItem('peercord.lastSecret', secret)

          // Kanalları ayarla
          const firstTextChannel = guild.channels.find(c => c.type === 'text')

          // Yjs'den mesajları yükle (IndexedDB'den - yeni oda için boş)
          const messagesByChannel: Record<ID, Message[]> = {}
          for (const ch of guild.channels) {
            const channelMessages = getMessagesFromYjs(_yjs, ch.id)
            if (channelMessages.length > 0) {
              messagesByChannel[ch.id] = channelMessages
            }
          }

          set({
            guild: ensureEveryoneRole(guild),
            roomId,
            channels: guild.channels,
            categories: guild.categories,
            activeChannelId: firstTextChannel?.id || null,
            messages: messagesByChannel,
            connection: { status: 'connected', peerCount: 0, roomId, strategy: 'nostr' },
            ready: true,
            me: { ...me, roleIds: [guild.roles[1]?.id || ''] }, // Owner rolü
            _yjs,  // Store'a ekle
            _textTransport,  // Store'a ekle
          })

          // Üye listesine kendimizi ekle (sayaç ve liste için)
          _updatePeerList(get().peers)

          // Kendi profilini Yjs'e kaydet
          await ensureProfileInYjs(_yjs, get().me!)

          // Modal kapat
          actions.closeModal()
          
          get().pushToast(makeToast('success', 'Sunucu Oluşturuldu', `"${name}" sunucusu hazır.`))
        },

        joinGuild: async (options: JoinGuildOptions) => {
          const { invite, secret, name } = options
          const me = await _ensureProfile()

          if (name) {
            await _ensureProfile({ name })
          }

          // Invite parse et
          const parsed = parseInvite(invite)
          if (!parsed) {
            throw new Error('Geçersiz davet kodu')
          }
          const roomId = parsed.roomId
          const roomSecret = secret ?? parsed.secret

          // Text transport
          _textTransport = createTransport(roomId)

          // Önce katılıp guild bilgisini almak için join
          await _textTransport.join({
            roomId,
            profile: me,
            guild: { id: '', name: '', ownerId: '', createdAt: Date.now(), encrypted: false, roles: [], categories: [], channels: [], iconSeed: '' },
            roomSecret,
            appId: 'peercord-v1',
          })

          // Yjs yöneticisi oluştur
          _yjs = createYjsManager(roomId)

          // Event listener'ları kur
          _unsubs.push(
            _textTransport.onMessage((env, peerId) => _handleIncomingMessage(env, peerId)),
            _textTransport.onPeersChanged(_handlePeersChanged),
            _textTransport.onPeerLeft(_handlePeerLeft),
            _textTransport.onConnectionChanged(_handleConnectionChanged),
          )

          // Yjs sync (guild state gelene kadar bekle)
          _yjs.sync(_textTransport)

          // Guild state'in gelmesini bekle (basit polling)
          let attempts = 0
          while (attempts < 200) {
            await new Promise(r => setTimeout(r, 100))
            if (_yjs.guild) break
            attempts++
          }

          if (!_yjs.guild) {
            throw new Error('Sunucu bilgisi alınamadı. Davet kodunu kontrol edin.')
          }

          const guild = _yjs.guild

          // Kanalları ayarla
          const firstTextChannel = guild.channels.find(c => c.type === 'text')

          // Yjs'den mesajları yükle (IndexedDB'den)
          const messagesByChannel: Record<ID, Message[]> = {}
          for (const ch of guild.channels) {
            const channelMessages = getMessagesFromYjs(_yjs, ch.id)
            if (channelMessages.length > 0) {
              messagesByChannel[ch.id] = channelMessages
            }
          }

          set({
            guild: ensureEveryoneRole(guild),
            roomId,
            channels: guild.channels,
            categories: guild.categories,
            activeChannelId: firstTextChannel?.id || null,
            messages: messagesByChannel,
            connection: { status: 'connected', peerCount: 0, roomId, strategy: 'nostr' },
            ready: true,
            _yjs,  // Store'a ekle
            _textTransport,  // Store'a ekle
          })

          // Üye listesine kendimizi ekle (sayaç ve liste için)
          _updatePeerList(get().peers)

          // Kendi profilini Yjs'e kaydet
          await ensureProfileInYjs(_yjs, get().me!)

          // Hash ve localStorage güncelle
          location.hash = `#/oda/${roomId}${roomSecret ? `?s=${roomSecret}` : ''}`
          localStorage.setItem('peercord.lastRoom', roomId)
          if (roomSecret) localStorage.setItem('peercord.lastSecret', roomSecret)

          get().pushToast(makeToast('success', 'Sunucuya Katıldınız', `"${guild.name}" sunucusuna hoş geldiniz!`))
        },

        leaveGuild: async () => {
          // Sesli kanaldan çık
          if (get().activeVoiceChannelId) {
            await actions.leaveVoice()
          }

          // Transport'ları kapat
          if (_textTransport) {
            await _textTransport.leave()
            _textTransport.destroy()
            _textTransport = null
          }
          if (_voiceTransport) {
            await _voiceTransport.leave()
            _voiceTransport.destroy()
            _voiceTransport = null
          }

          // Yjs temizle
          if (_yjs) {
            _yjs.destroy()
            _yjs = null
          }

          // Audio temizle
          if (_audio) {
            _audio.destroy()
            _audio = null
          }

          // Unsub'lar
          _unsubs.forEach(u => u())
          _unsubs.length = 0

          // Hash temizle
          location.hash = ''
          localStorage.removeItem('peercord.lastRoom')
          localStorage.removeItem('peercord.lastSecret')

          set({
            guild: null,
            roomId: null,
            channels: [],
            categories: [],
            activeChannelId: null,
            messages: {},
            reads: {},
            lastActivity: {},
            members: {},
            peers: [],
            typing: {},
            voiceMembers: [],
            connection: { status: 'idle', peerCount: 0, roomId: null, strategy: 'nostr' },
            ready: true,
          })

          get().pushToast(makeToast('info', 'Sunucudan Çıkıldı', 'Tekrar görüşmek üzere!'))
        },

        inviteLink: () => {
          const { roomId, guild } = get()
          if (!roomId || !guild) return ''
          return makeInviteLink(roomId, guild.inviteSecret)
        },

        /* Kanal */
        selectChannel: (channelId: ID) => {
          set({ activeChannelId: channelId })
          // Okundu olarak işaretle
          actions.markChannelRead(channelId)
        },

        createChannel: async (draft: ChannelDraft) => {
          const { guild, me } = get()
          if (!guild || !me || !_yjs) throw new Error('Sunucu yok')

          const newChannel: Channel = {
            id: uid('ch'),
            name: draft.name,
            type: draft.type,
            categoryId: draft.categoryId ?? null,
            topic: draft.topic,
            position: guild.channels.filter(c => c.categoryId === draft.categoryId).length,
            slowmodeSec: 0,
            locked: false,
          }

          const updatedGuild = {
            ...guild,
            channels: [...guild.channels, newChannel],
          }

          setGuildInYjs(_yjs, updatedGuild)
          set({ guild: updatedGuild, channels: updatedGuild.channels })

          if (draft.type === 'text' && !get().activeChannelId) {
            set({ activeChannelId: newChannel.id })
          }

          get().pushToast(makeToast('success', 'Kanal Oluşturuldu', `#${newChannel.name}`))
          return newChannel
        },

        updateChannel: async (channelId: ID, patch: Partial<Channel>) => {
          const { guild, _yjs: yjs } = get()
          if (!guild || !yjs) return

          const updatedGuild = {
            ...guild,
            channels: guild.channels.map(c => c.id === channelId ? { ...c, ...patch } : c),
          }
          setGuildInYjs(yjs, updatedGuild)
          set({ guild: updatedGuild, channels: updatedGuild.channels })
        },

        deleteChannel: async (channelId: ID) => {
          const { guild, _yjs: yjs, activeChannelId } = get()
          if (!guild || !yjs) return

          const updatedGuild = {
            ...guild,
            channels: guild.channels.filter(c => c.id !== channelId),
          }
          setGuildInYjs(yjs, updatedGuild)
          set({ guild: updatedGuild, channels: updatedGuild.channels })

          if (activeChannelId === channelId) {
            const firstText = updatedGuild.channels.find(c => c.type === 'text')
            set({ activeChannelId: firstText?.id || null })
          }
        },

        reorderChannel: async (channelId: ID, toIndex: number) => {
          const { guild, _yjs: yjs } = get()
          if (!guild || !yjs) return

          const channels = [...guild.channels]
          const idx = channels.findIndex(c => c.id === channelId)
          if (idx === -1) return

          const [channel] = channels.splice(idx, 1)
          channels.splice(toIndex, 0, channel)

          // Pozisyonları güncelle
          channels.forEach((c, i) => { c.position = i })

          const updatedGuild = { ...guild, channels }
          setGuildInYjs(yjs, updatedGuild)
          set({ guild: updatedGuild, channels })
        },

        createCategory: async (name: string) => {
          const { guild, _yjs: yjs } = get()
          if (!guild || !yjs) return

          const newCategory = { id: uid('cat'), name, position: guild.categories.length }
          const updatedGuild = {
            ...guild,
            categories: [...guild.categories, newCategory],
          }
          setGuildInYjs(yjs, updatedGuild)
          set({ guild: updatedGuild, categories: updatedGuild.categories })
        },

        /* Mesaj */
        sendMessage: async (channelId: ID, content: string, options: SendMessageOptions = {}) => {
          const { me, guild, _yjs: yjs, _textTransport: transport } = get()
          if (!me || !guild || !yjs || !transport) return

          const message: Message = {
            id: uid('msg'),
            channelId,
            authorId: me.id,
            authorName: me.name,
            authorHue: me.accentHue,
            content,
            createdAt: Date.now(),
            system: options.system,
            replyTo: options.replyTo,
            attachments: [],
            reactions: [],
            mentions: options.mentions ?? [],
            pending: true,
          }

          // İyimser ekleme
          set(state => ({
            messages: {
              ...state.messages,
              [channelId]: [...(state.messages[channelId] || []), message],
            },
            lastActivity: { ...state.lastActivity, [channelId]: Date.now() },
          }))
          _pendingMessages.set(message.id, message)

          // Yjs'e ekle
          addMessageToYjs(yjs, channelId, message)

          // Dosya ekleri varsa gönder
          if (options.attachments?.length) {
            for (const file of options.attachments) {
              const handle = await actions.sendFile(channelId, file)
              if (handle) {
                const attachment = await handle.promise
                // Mesajı güncelle
                updateMessageInYjs(yjs, channelId, message.id, { attachments: [attachment] })
              }
            }
          }

          // Broadcast (Yjs update zaten gider ama mesaj bildirimi için)
          try {
            await transport.broadcast('message', message)
          } catch (e) {
            console.error('[Store] broadcast hatası:', e)
          }

          // Pending kaldır
          setTimeout(() => {
            _pendingMessages.delete(message.id)
            updateMessageInYjs(yjs, channelId, message.id, { pending: false })
          }, 1000)
        },

        editMessage: async (messageId: ID, content: string) => {
          const { _yjs: yjs, activeChannelId } = get()
          if (!yjs || !activeChannelId) return

          updateMessageInYjs(yjs, activeChannelId, messageId, {
            content,
            editedAt: Date.now(),
          })
        },

        deleteMessage: async (messageId: ID) => {
          const { _yjs: yjs, activeChannelId } = get()
          if (!yjs || !activeChannelId) return

          deleteMessageInYjs(yjs, activeChannelId, messageId)
        },

        toggleReaction: async (messageId: ID, emoji: string) => {
          const { me, _yjs: yjs, activeChannelId } = get()
          if (!me || !yjs || !activeChannelId) return

          toggleReactionInYjs(yjs, activeChannelId, messageId, emoji, me.id)
        },

        searchMessages: (query: string, channelId?: ID) => {
          const { messages } = get()
          const targetChannels = channelId ? [channelId] : Object.keys(messages)
          const lowerQuery = query.toLocaleLowerCase('tr')

          const results: Message[] = []
          for (const chId of targetChannels) {
            const chMessages = messages[chId] || []
            for (const msg of chMessages) {
              if (msg.content.toLocaleLowerCase('tr').includes(lowerQuery)) {
                results.push(msg)
              }
            }
          }
          return results.sort((a, b) => b.createdAt - a.createdAt)
        },

        /* Varlık & Yazma */
        setTyping: (channelId: ID) => {
          const { me, _textTransport: transport, roomId } = get()
          if (!me || !transport || !roomId) return

          const until = Date.now() + 3000
          transport.publishTyping({ channelId, until, name: me.name }).catch(console.error)
        },

        setStatus: async (status: PresenceStatus) => {
          const { me, _textTransport: transport } = get()
          if (!me || !transport) return

          const updated = { ...me, status }
          await _ensureProfile(updated)
          await transport.publishPresence({
            profile: updated,
            voiceChannelId: get().activeVoiceChannelId,
            muted: get().localMuted,
            deafened: get().localDeafened,
            screensharing: get().selfScreenSharing,
          })
        },

        updateProfile: async (patch) => {
          await _ensureProfile(patch)
          const { me, _textTransport: transport, _yjs: yjs } = get()
          if (!me || !transport || !yjs) return

          await ensureProfileInYjs(yjs, me)
          await transport.publishPresence({
            profile: me,
            voiceChannelId: get().activeVoiceChannelId,
            muted: get().localMuted,
            deafened: get().localDeafened,
            screensharing: get().selfScreenSharing,
          })
        },

        assignRole: async (userId: ID, roleId: ID) => {
          const { guild, _yjs: yjs, me } = get()
          if (!guild || !yjs || !me || me.id !== guild.ownerId) return

          // Basit implementasyon: profil roleIds güncelle
          const profile = getProfileFromYjs(yjs, userId)
          if (profile && !profile.roleIds.includes(roleId)) {
            const updated = { ...profile, roleIds: [...profile.roleIds, roleId] }
            yjs.profilesMap.set(userId, updated)
          }
        },

        /* Ses */
        joinVoice: async (channelId: ID) => {
          const { me, guild, roomId, _textTransport: textTransport } = get()
          if (!me || !guild || !roomId || !textTransport) return

          const voiceRoomId = `${roomId}:voice:${channelId}`

          // Voice transport
          _voiceTransport = createTransport(voiceRoomId)
          await _voiceTransport.join({
            roomId: voiceRoomId,
            profile: me,
            guild,
            appId: 'peercord-v1',
          })

          // Audio manager
          _audio = createAudioManager()
          await _audio.init(_voiceTransport, channelId)

          // Level callbacks
          _audio.setLevelCallbacks({
            onLevelChange: (level) => set({ localLevel: level, localSpeaking: level > 0.01 }),
            onSpeakingChange: (speaking) => {
              set({ localSpeaking: speaking })
              if (_voiceTransport) {
                _voiceTransport.broadcast('voice', {
                  channelId,
                  muted: get().localMuted,
                  deafened: get().localDeafened,
                  speaking,
                  screensharing: get().selfScreenSharing,
                  level: speaking ? get().localLevel : 0,
                }).catch(console.error)
              }
            },
          })

          // Remote stream handlers
          _unsubs.push(
            _voiceTransport.onRemoteStream(_handleRemoteStream),
            _voiceTransport.onRemoteScreenStream(_handleRemoteScreenStream),
          )

          // Mikrofon başlat
          try {
            await _audio.startCapture()
          } catch (error) {
            get().pushToast(makeToast('error', 'Mikrofon Hatası', error instanceof Error ? error.message : 'Mikrofon başlatılamadı'))
            await actions.leaveVoice()
            return
          }

          set({
            activeVoiceChannelId: channelId,
            localMuted: false,
            localDeafened: false,
          })

          // Presence güncelle
          await textTransport.publishPresence({
            profile: me,
            voiceChannelId: channelId,
            muted: false,
            deafened: false,
            screensharing: false,
          })

          get().pushToast(makeToast('success', 'Sesli Kanala Katıldınız', `#${guild.channels.find(c => c.id === channelId)?.name}`))
        },

        leaveVoice: async () => {
          const { _voiceTransport: voiceTransport, _audio: audio, _textTransport: textTransport, me, activeVoiceChannelId } = get()

          if (audio) {
            audio.destroy()
            _audio = null
          }

          if (voiceTransport) {
            await voiceTransport.leave()
            voiceTransport.destroy()
            _voiceTransport = null
          }

          if (textTransport && me && activeVoiceChannelId) {
            await textTransport.publishPresence({
              profile: me,
              voiceChannelId: null,
              muted: false,
              deafened: false,
              screensharing: false,
            })
          }

          set({
            activeVoiceChannelId: null,
            localMuted: false,
            localDeafened: false,
            localSpeaking: false,
            localLevel: 0,
            selfScreenSharing: false,
            remoteStreams: {},
            remoteScreenStreams: {},
            voiceMembers: [],
          })
        },

        toggleMute: async () => {
          const { _audio: audio, _voiceTransport: transport, activeVoiceChannelId } = get()
          if (!audio || !transport || !activeVoiceChannelId) return

          const muted = audio.toggleMute()
          set({ localMuted: muted })
        },

        toggleDeafen: async () => {
          const { _audio: audio, _voiceTransport: transport, activeVoiceChannelId } = get()
          if (!audio || !transport || !activeVoiceChannelId) return

          const deafened = audio.toggleDeafen()
          set({ localDeafened: deafened, localMuted: deafened })
        },

        startScreenShare: async () => {
          const { _audio: audio, _voiceTransport: transport, activeVoiceChannelId } = get()
          if (!audio || !transport || !activeVoiceChannelId) return

          try {
            await audio.startScreenShare()
            set({ selfScreenSharing: true })
            await transport.broadcast('voice', {
              channelId: activeVoiceChannelId,
              muted: get().localMuted,
              deafened: get().localDeafened,
              speaking: get().localSpeaking,
              screensharing: true,
              level: get().localLevel,
            })
          } catch (error) {
            get().pushToast(makeToast('error', 'Ekran Paylaşımı Hatası', error instanceof Error ? error.message : 'Başlatılamadı'))
          }
        },

        stopScreenShare: async () => {
          const { _audio: audio, _voiceTransport: transport, activeVoiceChannelId } = get()
          if (!audio || !transport || !activeVoiceChannelId) return

          audio.stopScreenShare()
          set({ selfScreenSharing: false })
          await transport.broadcast('voice', {
            channelId: activeVoiceChannelId,
            muted: get().localMuted,
            deafened: get().localDeafened,
            speaking: get().localSpeaking,
            screensharing: false,
            level: get().localLevel,
          })
        },

        /* Dosya */
        sendFile: async (_channelId: ID, file: File): Promise<FileTransferHandle | null> => {
          const { _textTransport: transport, peers, me } = get()
          if (!transport || !me) return null

          // İlk bağlı peer'a gönder (basit: broadcast yapar)
          const targetPeer = peers.find(p => !p.isSelf)
          if (!targetPeer) {
            get().pushToast(makeToast('warning', 'Eş Bulunamadı', 'Dosya göndermek için en az bir eş bağlı olmalı'))
            return null
          }

          const handle = transport.sendFile(targetPeer.peerId, file)

          set(state => ({
            transfers: {
              ...state.transfers,
              [handle.id]: { name: file.name, progress: 0, direction: 'send' },
            },
          }))

          // Progress dinle
          const unsubProgress = handle.onProgress(p => {
            set(state => ({
              transfers: {
                ...state.transfers,
                [p.transferId]: { ...state.transfers[p.transferId], progress: p.progress, bytesPerSecond: p.bytesPerSecond },
              },
            }))
          })

          try {
            await handle.promise
            unsubProgress()

            set(state => ({
              transfers: {
                ...state.transfers,
                [handle.id]: { ...state.transfers[handle.id], progress: 1 },
              },
            }))

            return handle
          } catch (error) {
            unsubProgress()
            set(state => {
              const next = { ...state.transfers }
              next[handle.id] = { ...next[handle.id], progress: 0 }
              return { transfers: next }
            })
            throw error
          }
        },

        /* Ayar & UI */
        updateSettings: async (patch: Partial<Settings>) => {
          const { settings } = get()
          const updated = { ...settings, ...patch }
          saveSettings(updated)
          applyTheme(updated.theme)
          applyDensity(updated.density)
          set({ settings: updated, theme: updated.theme, density: updated.density })
        },

        setTheme: (theme: ThemeName) => {
          applyTheme(theme)
          actions.updateSettings({ theme })
        },

        setDensity: (density: Density) => {
          applyDensity(density)
          actions.updateSettings({ density })
        },

        openModal: (modal: ModalKind, payload?: unknown) => {
          set({ modal, modalPayload: payload })
        },

        closeModal: () => {
          set({ modal: null, modalPayload: undefined })
        },

        toggleSidebar: (open?: boolean) => {
          set(state => ({ sidebarOpen: open ?? !state.sidebarOpen }))
        },

        toggleMembers: (open?: boolean) => {
          set(state => ({ membersOpen: open ?? !state.membersOpen }))
        },

        setCommandPaletteOpen: (open: boolean) => {
          set({ commandPaletteOpen: open })
        },

        setSearchQuery: (query: string) => {
          set({ searchQuery: query })
        },

        pushToast: (toast: Omit<ToastMessage, 'id'>) => {
          const newToast = makeToast(toast.kind, toast.title, toast.description, toast.duration)
          set(state => ({ toasts: [...state.toasts, newToast] }))

          if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
              get().dismissToast(newToast.id)
            }, newToast.duration)
          }
        },

        dismissToast: (id: ID) => {
          set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
        },

        markChannelRead: (channelId: ID) => {
          const { me, _yjs: yjs } = get()
          if (!me || !yjs) return

          const timestamp = Date.now()
          set(state => ({
            reads: { ...state.reads, [channelId]: timestamp },
            lastActivity: { ...state.lastActivity, [channelId]: timestamp },
          }))
          updateReadInYjs(yjs, me.id, channelId, timestamp)
        },

        can: (permission: Permission) => {
          const { me, guild } = get()
          if (!me || !guild) return false

          // Owner her şeyi yapabilir
          if (me.id === guild.ownerId) return true

          // Roller kontrolü
          const userRoles = guild.roles.filter(r => me.roleIds.includes(r.id))
          return userRoles.some(r => r.permissions.includes(permission))
        },

        clearError: () => {
          set({ error: null })
        },
      }

      // --- Store Nesnesi ---
      return {
        ...initialState,
        actions,
        // İç değişkenler state'e de ekle (actions'dan erişim için)
        _yjs,
        _audio,
        _textTransport,
        _voiceTransport,
        _unsubs,
        _typingTimers,
        _pendingMessages,
        _ensureProfile,
        _updatePeerList,
        _handleIncomingMessage,
        _handlePeersChanged,
        _handlePeerLeft,
        _handleConnectionChanged,
        _handleRemoteStream,
        _handleRemoteScreenStream,
        _handleVoiceState,
        _handleTyping,
        _handleIncomingFile,
        _handleFileProgress,
      }
    },
    { name: 'peercord-store' }
  )
)

/* --------------------------- Seçiciler (store içinde tanımlandı, selectors.ts export eder) --------------------------- */

// Seçiciler selectors.ts'de tanımlanacak
/**
 * PeerCord — Zustand Seçicileri (Hooks)
 * Contract'taki tüm public API hook'ları
 */
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from './store'
import type {
  Channel,
  ChannelGroups,
  GroupChannels,
  ID,
  Message,
  PeerInfo,
  Settings,
  ThemeName,
  Density,
  ToastMessage,
  TypingState,
  UserProfile,
  Guild,
  ConnectionInfo,
  VoiceMemberState,
  ModalKind,
} from '@/lib/store/contracts'

/* --------------------------- Yardımcılar --------------------------- */

/** Kanalları kategorilere göre grupla */
export const groupChannels: GroupChannels = (channels, categories) => {
  const categorized = new Map<ID | null, Channel[]>()

  channels.forEach(ch => {
    const key = ch.categoryId
    if (!categorized.has(key)) categorized.set(key, [])
    categorized.get(key)!.push(ch)
  })

  const groups = categories.map(cat => ({
    category: cat,
    channels: categorized.get(cat.id) || [],
  }))

  const uncategorized = categorized.get(null) || []

  return { uncategorized, groups }
}

/* --------------------------- Hook'lar --------------------------- */

/** Tüm actions nesnesi (kararlı referans) */
export function useActions() {
  return useAppStore(useShallow(state => state.actions))
}

/** Kullanıcı profili */
export function useMe(): UserProfile | null {
  return useAppStore(state => state.me)
}

/** Aktif sunucu */
export function useGuild(): Guild | null {
  return useAppStore(state => state.guild)
}

/** Tüm kanallar (düz liste) */
export function useChannels(): Channel[] {
  return useAppStore(state => state.channels)
}

/** Kanallar kategoriye göre gruplanmış */
export function useChannelGroups(): ChannelGroups {
  const channels = useAppStore(state => state.channels)
  const categories = useAppStore(state => state.categories)
  // groupChannels her çağrıda yeni referans üretir; useMemo olmadan
  // React "getSnapshot should be cached" sonsuz döngüsüne girer.
  return useMemo(() => groupChannels(channels, categories), [channels, categories])
}

/** Aktif kanal */
export function useActiveChannel(): Channel | null {
  return useAppStore(state => {
    if (!state.activeChannelId) return null
    return state.channels.find(c => c.id === state.activeChannelId) || null
  })
}

/** Boş dizi sabiti — selector her render'da yeni referans üretmemeli */
const EMPTY_MESSAGES: Message[] = []
const EMPTY_TYPING: TypingState[] = []

/** Kanal mesajları */
export function useMessages(channelId: ID | null): Message[] {
  return useAppStore(state => (channelId ? state.messages[channelId] ?? EMPTY_MESSAGES : EMPTY_MESSAGES))
}

/** Tüm üyeler (PeerInfo listesi — members record'ından, kendi kullanıcı dahil) */
export function useMembers(): PeerInfo[] {
  // useShallow: Object.values her çağrıda yeni dizi üretir; sarmalanmazsa
  // React "getSnapshot should be cached" sonsuz döngüsüne girer.
  return useAppStore(useShallow(state => Object.values(state.members)))
}

/** Sesli kanaldaki üyeler */
export function useVoiceMembers(): VoiceMemberState[] {
  return useAppStore(state => state.voiceMembers)
}

/** Yazma durumu */
export function useTyping(channelId: ID): TypingState[] {
  return useAppStore(state => state.typing[channelId] ?? EMPTY_TYPING)
}

/** Ayarlar */
export function useSettings(): Settings {
  return useAppStore(state => state.settings)
}

/** Bağlantı durumu */
export function useConnection(): ConnectionInfo {
  return useAppStore(state => state.connection)
}

/** Kanal grupları (alias) */
export function useGroupChannels(): ChannelGroups {
  return useChannelGroups()
}

/* --------------------------- Ek Seçiciler (UI için) --------------------------- */

/** Tema */
export function useTheme(): ThemeName {
  return useAppStore(state => state.theme)
}

/** Yoğunluk */
export function useDensity(): Density {
  return useAppStore(state => state.density)
}

/** Toasts */
export function useToasts(): ToastMessage[] {
  return useAppStore(state => state.toasts)
}

/** Modal */
export function useModal(): { kind: ModalKind; payload: unknown } {
  return useAppStore(useShallow(state => ({ kind: state.modal, payload: state.modalPayload })))
}

/** Sidebar açık mı */
export function useSidebarOpen(): boolean {
  return useAppStore(state => state.sidebarOpen)
}

/** Üyeler paneli açık mı */
export function useMembersOpen(): boolean {
  return useAppStore(state => state.membersOpen)
}

/** Komut paleti açık mı */
export function useCommandPaletteOpen(): boolean {
  return useAppStore(state => state.commandPaletteOpen)
}

/** Arama sorgusu */
export function useSearchQuery(): string {
  return useAppStore(state => state.searchQuery)
}

/** Hazır mı */
export function useReady(): boolean {
  return useAppStore(state => state.ready)
}

/** Global hata */
export function useError(): string | null {
  return useAppStore(state => state.error)
}

/** Aktif ses kanalı */
export function useActiveVoiceChannel(): Channel | null {
  return useAppStore(state => {
    if (!state.activeVoiceChannelId) return null
    return state.channels.find(c => c.id === state.activeVoiceChannelId) || null
  })
}

/** Yerel mute/deafen */
export function useLocalVoiceState(): { muted: boolean; deafened: boolean; speaking: boolean; level: number; screenSharing: boolean } {
  return useAppStore(useShallow(state => ({
    muted: state.localMuted,
    deafened: state.localDeafened,
    speaking: state.localSpeaking,
    level: state.localLevel,
    screenSharing: state.selfScreenSharing,
  })))
}

/** Uzak ses akışları */
export function useRemoteStreams(): Record<string, MediaStream> {
  return useAppStore(state => state.remoteStreams)
}

/** Uzak ekran akışları */
export function useRemoteScreenStreams(): Record<string, MediaStream> {
  return useAppStore(state => state.remoteScreenStreams)
}

/** Transferler */
export function useTransfers(): Record<string, { name: string; progress: number; direction: 'send' | 'receive' }> {
  return useAppStore(state => state.transfers)
}

/** Kategoriler */
export function useCategories(): Guild['categories'] {
  return useAppStore(state => state.categories)
}

/** Okunma zamanları */
export function useReads(): Record<ID, number> {
  return useAppStore(state => state.reads)
}

/** Son aktivite */
export function useLastActivity(): Record<ID, number> {
  return useAppStore(state => state.lastActivity)
}

/* --------------------------- Composed Hooks --------------------------- */

/** Kanal listesi + grup seçici (sidebar için) */
export function useSidebarChannels(): { groups: ChannelGroups; activeChannelId: ID | null; selectChannel: (id: ID) => void } {
  const groups = useChannelGroups()
  const activeChannelId = useAppStore(state => state.activeChannelId)
  const selectChannel = useAppStore(state => state.actions.selectChannel)
  return { groups, activeChannelId, selectChannel }
}

/** Mesaj alanı için compose state */
export function useMessageCompose(channelId: ID | null) {
  const sendMessage = useAppStore(state => state.actions.sendMessage)
  const setTyping = useAppStore(state => state.actions.setTyping)
  const messages = useMessages(channelId!)
  const typing = useTyping(channelId!)

  return {
    messages,
    typing,
    sendMessage: channelId ? (content: string, options?: any) => sendMessage(channelId, content, options) : undefined,
    setTyping: channelId ? () => setTyping(channelId) : undefined,
  }
}

/** Ses kontrolü için compose state */
export function useVoiceControls() {
  const joinVoice = useAppStore(state => state.actions.joinVoice)
  const leaveVoice = useAppStore(state => state.actions.leaveVoice)
  const toggleMute = useAppStore(state => state.actions.toggleMute)
  const toggleDeafen = useAppStore(state => state.actions.toggleDeafen)
  const startScreenShare = useAppStore(state => state.actions.startScreenShare)
  const stopScreenShare = useAppStore(state => state.actions.stopScreenShare)
  const activeVoiceChannelId = useAppStore(state => state.activeVoiceChannelId)
  const { muted, deafened, speaking, level, screenSharing } = useLocalVoiceState()
  const voiceMembers = useVoiceMembers()

  return {
    activeVoiceChannelId,
    voiceMembers,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
    startScreenShare,
    stopScreenShare,
    muted,
    deafened,
    speaking,
    level,
    screenSharing,
  }
}
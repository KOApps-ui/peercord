/**
 * PeerCord - P2PTransport tam implementasyonu
 * Trystero 0.26 API (nostr stratejisi)
 */
import { joinRoom, selfId } from 'trystero/nostr';
import type {
  ConnectionInfo,
  PeerInfo,
  UserProfile,
  Guild,
} from '@/types';
import { deriveKey, encryptBytes, decryptBytes } from './crypto';
import { uid } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/utils';
import { bytesToHex } from '@noble/ciphers/utils.js';
import type { P2PTransport } from './contracts';
import type {
  P2PTransportConfig,
  PresencePayload,
  TypingPayload,
  IncomingFileOffer,
  FileTransferProgress,
  FileTransferHandle,
} from './contracts';
import type { Room, MessageAction } from './trystero-types';

// Sabitler
const APP_ID = 'peercord-v1';
const PRESENCE_INTERVAL = 10_000; // 10 saniyede bir presence
const PRESENCE_TIMEOUT = 35_000; // 35 saniyede offline işaretle
const CHUNK_SIZE = 64 * 1024; // 64 KB chunk boyutu

// Varsayılan nostr relay'leri
const DEFAULT_NOSTR_RELAYS = [
  'wss://nos.lol',
  'wss://nostr.wine',
  'wss://nostr.mom',
  'wss://relay.snort.social',
  'wss://relay.nostr.net',
  'wss://nostr-pub.wellorder.net',
];

// Wire envelope tipi (internal kullanım)
interface WireEnvelope<T = unknown> {
  v: 1;
  type: string;
  id: string;
  ts: number;
  payload: T;
}

// Dosya transfer payload tipleri
interface FileChunkPayload {
  transferId: string;
  chunk: ArrayBuffer;
  isLast: boolean;
}

interface FileCompletePayload {
  transferId: string;
}

interface ScreenStatePayload {
  isScreenSharing: boolean;
  peerId: string;
}

interface HelloPayload {
  profile: UserProfile;
  guildId: string;
  client: string;
}

/**
 * P2PTransport implementasyonu - Trystero 0.26 API
 */
export class P2PTransportImpl implements P2PTransport {
  public readonly roomId: string;
  public readonly selfPeerId: string = selfId; // Trystero 0.26: selfId modül export'u
  
  private room: Room | null = null;
  private _profile?: UserProfile;
  private _guild?: Guild;

  // PeerInfo haritası
  private _peers = new Map<string, PeerInfo>();
  public get peers(): ReadonlyMap<string, PeerInfo> {
    return this._peers;
  }

  // Presence yönetimi
  private lastPresenceTime = new Map<string, number>();
  private presenceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private presenceIntervalId: ReturnType<typeof setInterval> | null = null;

  // Callback'ler
  private messageHandlers = new Set<(message: WireEnvelope, fromPeerId: string) => void>();
  private peersChangedHandlers = new Set<(peers: PeerInfo[]) => void>();
  private peerLeftHandlers = new Set<(peerId: string) => void>();
  private connectionChangedHandlers = new Set<(info: ConnectionInfo) => void>();

  // Stream yönetimi
  private localStream: MediaStream | null = null;
  private localScreenStream: MediaStream | null = null;
  private remoteStreamHandler: ((peerId: string, stream: MediaStream) => void) | null = null;
  private remoteScreenStreamHandler: ((peerId: string, stream: MediaStream) => void) | null = null;
  private screenState = new Map<string, boolean>(); // peerId -> isScreenSharing

  // Actions (tek 'msg' action'ı için tüm tel protokolü)
  private msgAction: MessageAction | null = null;

  // File transfer
  private incomingFileHandlers = new Set<(offer: IncomingFileOffer) => void>();
  private fileProgressHandlers = new Set<(p: FileTransferProgress) => void>();
  private pendingFileOffers = new Map<string, IncomingFileOffer>(); // transferId -> offer
  private incomingChunks = new Map<string, { buffers: ArrayBuffer[]; totalSize: number; received: number }>();

  // AES-GCM anahtarı
  private roomKey: Uint8Array | null = null;

  constructor(roomId: string = '') {
    this.roomId = roomId;
  }

  /**
   * Odaya katıl (nostr stratejisi ile)
   */
  async join(config: P2PTransportConfig): Promise<void> {
    // Room ID'yi güncelle
    if (config.roomId && this.roomId !== config.roomId) {
      // roomId readonly olduğu için constructor'da verilen değer kullanılır
      // join() tekrar çağrılırsa yeni bir instance oluşturulmalı
    }

    this._profile = config.profile;
    this._guild = config.guild;

    // Oda şifresi varsa AES-GCM anahtarı türet
    this.roomKey = config.roomSecret ? deriveKey(config.roomSecret) : null;

    // Relay URL'lerini belirle
    let relayUrls: string[] | undefined;
    if (config.relayUrls && config.relayUrls.length > 0) {
      relayUrls = config.relayUrls;
    } else {
      relayUrls = DEFAULT_NOSTR_RELAYS;
    }

    // Trystero 0.26 joinRoom config
    const joinConfig = {
      appId: config.appId ?? APP_ID,
      password: config.roomSecret,
      relayConfig: {
        urls: relayUrls,
        warnOnRelayFailure: false,
      },
    };

    try {
      this.room = joinRoom(joinConfig, this.roomId);
      this.setupRoomHandlers();
      this.setupMsgAction();

      // Kendi presence'ımızı hemen gönder (hello)
      await this.sendHello();

      // Periyodik presence başlat
      this.startPresenceInterval();

      // Bağlantı durumunu bildir (katılım anında connected)
      this.notifyConnectionChanged({
        status: 'connected',
        peerCount: this._peers.size,
        roomId: this.roomId,
        strategy: 'nostr',
      });
    } catch (error) {
      this.notifyConnectionChanged({
        status: 'error',
        peerCount: 0,
        roomId: this.roomId,
        error: (error as Error)?.message || 'Oda katılamadı',
        strategy: 'nostr',
      });
      throw error;
    }
  }

  /**
   * Room event handler'larını kur
   */
  private setupRoomHandlers(): void {
    if (!this.room) return;

    const room = this.room;
    const self = this;

    // Peer katıldığında
    room.onPeerJoin = (peerId: string) => {
      self.handlePeerJoin(peerId);
    };

    // Peer ayrıldığında
    room.onPeerLeave = (peerId: string) => {
      self.handlePeerLeave(peerId);
    };

    // Uzak stream geldiğinde
    room.onPeerStream = (stream: MediaStream, peerId: string, metadata?: unknown) => {
      self.handlePeerStream(stream, peerId, metadata);
    };

    // Uzak track geldiğinde (opsiyonel)
    room.onPeerTrack = (_track: MediaStreamTrack, _stream: MediaStream, _peerId: string, _metadata?: unknown) => {
      // stream handler zaten onPeerStream ile yönetiliyor
    };
  }

  /**
   * 'msg' action'ını kur - tüm tel protokolü tek action üzerinden
   */
  private setupMsgAction(): void {
    if (!this.room) return;

    this.msgAction = this.room.makeAction('msg', {
      kind: 'message',
      onMessage: (data: unknown, context: { peerId: string; metadata?: unknown }) => {
        this.handleIncomingMessage(data, context.peerId);
      },
    } as import('./trystero-types').MessageActionConfig);
  }

  /**
   * Peer katıldığında - hello gönder ve peer bilgisi oluştur
   */
  private async handlePeerJoin(peerId: string): Promise<void> {
    // PeerInfo oluştur (hello/presence gelince güncellenecek)
    const peerInfo: PeerInfo = {
      peerId,
      userId: peerId.slice(0, 16), // geçici, hello'da güncellenecek
      name: 'Yükleniyor...',
      avatarSeed: '0',
      accentHue: 0,
      status: 'online',
      customStatus: undefined,
      roleIds: [],
      voiceChannelId: null,
      muted: false,
      deafened: false,
      speaking: false,
      screensharing: false,
      lastSeen: Date.now(),
      latencyMs: 0,
      isSelf: false,
    };
    this._peers.set(peerId, peerInfo);
    this.notifyPeersChanged();

    // Karşılama hello gönder
    if (this._profile) {
      await this.sendHelloTo(peerId);
    }
  }

  /**
   * Peer ayrıldığında
   */
  private handlePeerLeave(peerId: string): void {
    this._peers.delete(peerId);
    this.cleanupPeerTimers(peerId);
    this.screenState.delete(peerId);
    this.pendingFileOffers.delete(peerId);
    this.incomingChunks.delete(peerId);
    
    this.notifyPeersChanged();
    this.peerLeftHandlers.forEach((cb) => cb(peerId));
  }

  /**
   * Uzak stream geldiğinde
   */
  private handlePeerStream(stream: MediaStream, peerId: string, metadata?: unknown): void {
    const meta = metadata as Record<string, unknown> | undefined;
    const isScreen = meta?.kind === 'screen' || this.screenState.get(peerId) === true;

    if (isScreen) {
      this.remoteScreenStreamHandler?.(peerId, stream);
    } else {
      this.remoteStreamHandler?.(peerId, stream);
    }
  }

  /**
   * Gelen mesajları işler (şifreli/şifresiz)
   */
  private handleIncomingMessage(data: unknown, peerId: string): void {
    // Presence timeout kontrolü
    this.checkPresenceTimeout(peerId);

    // Şifreli oda ise çöz
    let envelope: WireEnvelope;

    if (typeof data === 'string' && this.roomKey) {
      const decrypted = decryptBytes(data, bytesToHex(this.roomKey));
      if (!decrypted) return;
      try {
        envelope = JSON.parse(decrypted) as WireEnvelope;
      } catch {
        return;
      }
    } else if (typeof data === 'object' && data !== null) {
      envelope = data as WireEnvelope;
    } else {
      // Binary data (file-chunk için Uint8Array gelebilir) - action config'te onMessage string/object bekler
      return;
    }

    const { type, payload } = envelope;

    // Mesaj türüne göre işle
    switch (type) {
      case 'hello':
        this.handleHello(peerId, payload as HelloPayload);
        break;
      case 'presence':
        this.handlePresence(peerId, payload as PresencePayload);
        break;
      case 'typing':
        // typing handler'lara ilet
        break;
      case 'voice':
        // voice handler'lara ilet
        break;
      case 'screen-state':
        this.handleScreenState(peerId, payload as ScreenStatePayload);
        break;
      case 'file-offer':
        this.handleFileOffer(peerId, payload as IncomingFileOffer);
        break;
      case 'file-chunk':
        this.handleFileChunk(peerId, payload as FileChunkPayload);
        break;
      case 'file-complete':
        this.handleFileComplete(peerId, payload as FileCompletePayload);
        break;
      case 'file-accept':
      case 'file-reject':
        // Transfer modülü handle eder
        break;
      case 'message':
        // Yjs mesajları burada hanser edilir
        break;
    }

    // Diğer handler'lara ilet
    this.messageHandlers.forEach((cb) => cb(envelope, peerId));
  }

  /**
   * Hello mesajını işler
   */
  private handleHello(peerId: string, payload: HelloPayload): void {
    const now = Date.now();

    this._peers.set(peerId, {
      peerId,
      userId: payload.profile.id,
      name: payload.profile.name,
      avatarSeed: payload.profile.avatarSeed,
      accentHue: payload.profile.accentHue,
      customStatus: payload.profile.customStatus,
      roleIds: payload.profile.roleIds ?? [],
      voiceChannelId: payload.guildId ? payload.guildId : null,
      muted: false,
      deafened: false,
      speaking: false,
      screensharing: false,
      status: 'online',
      lastSeen: now,
      latencyMs: 0,
      isSelf: false,
    });

    // Presence timer başlat
    this.startPresenceTimer(peerId);
    this.notifyPeersChanged();
  }

  /**
   * Presence mesajını işler
   */
  private handlePresence(peerId: string, payload: PresencePayload): void {
    const now = Date.now();
    this.lastPresenceTime.set(peerId, now);

    // Timer yenile
    const existingTimer = this.presenceTimers.get(peerId);
    if (existingTimer) clearTimeout(existingTimer);
    this.startPresenceTimer(peerId);

    // PeerInfo güncelle
    const existing = this._peers.get(peerId);
    if (existing) {
      this._peers.set(peerId, {
        ...existing,
        name: payload.profile.name,
        avatarSeed: payload.profile.avatarSeed,
        accentHue: payload.profile.accentHue,
        customStatus: payload.profile.customStatus,
        roleIds: payload.profile.roleIds ?? existing.roleIds,
        voiceChannelId: payload.voiceChannelId,
        muted: payload.muted,
        deafened: payload.deafened,
        speaking: false,
        screensharing: payload.screensharing,
        status: 'online',
        lastSeen: now,
      });
    } else {
      // Hello gelmeden presence gelebilir
      this._peers.set(peerId, {
        peerId,
        userId: payload.profile.id,
        name: payload.profile.name,
        avatarSeed: payload.profile.avatarSeed,
        accentHue: payload.profile.accentHue,
        customStatus: payload.profile.customStatus,
        roleIds: payload.profile.roleIds ?? [],
        voiceChannelId: payload.voiceChannelId,
        muted: payload.muted,
        deafened: payload.deafened,
        speaking: false,
        screensharing: payload.screensharing,
        status: 'online',
        lastSeen: now,
        latencyMs: 0,
        isSelf: false,
      });
    }

    this.notifyPeersChanged();
  }

  /**
   * Screen state mesajını işler
   */
  private handleScreenState(peerId: string, payload: ScreenStatePayload): void {
    this.screenState.set(peerId, payload.isScreenSharing);
    
    const existing = this._peers.get(peerId);
    if (existing) {
      this._peers.set(peerId, { ...existing, screensharing: payload.isScreenSharing });
      this.notifyPeersChanged();
    }
  }

  /**
   * Dosya teklifi geldiğinde
   */
  private handleFileOffer(_peerId: string, offer: IncomingFileOffer): void {
    // Teklifi sakla (accept/reject için)
    this.pendingFileOffers.set(offer.transferId, offer);
    
    // Callback'leri tetikle
    this.incomingFileHandlers.forEach((cb) => cb(offer));
  }

  /**
   * Dosya chunk'u geldiğinde
   */
  private handleFileChunk(peerId: string, payload: FileChunkPayload): void {
    const { transferId, chunk, isLast } = payload;

    // Chunk'ları biriktir
    let state = this.incomingChunks.get(transferId);
    if (!state) {
      const offer = this.pendingFileOffers.get(transferId);
      state = {
        buffers: [],
        totalSize: offer?.size ?? 0,
        received: 0,
      };
      this.incomingChunks.set(transferId, state);
    }

    state.buffers.push(chunk);
    state.received += chunk.byteLength;

    // Progress bildir (alan taraf)
    this.fileProgressHandlers.forEach((cb) =>
      cb({
        transferId,
        peerId,
        direction: 'receive',
        transferred: state.received,
        total: state.totalSize,
        progress: state.totalSize > 0 ? state.received / state.totalSize : 0,
        bytesPerSecond: 0, // TODO: hesapla
      })
    );

    // Son chunk gelince complete et
    if (isLast) {
      this.handleFileComplete(peerId, { transferId });
    }
  }

  /**
   * Dosya tamamlandığında
   */
  private handleFileComplete(_peerId: string, _payload: FileCompletePayload): void {
    // Chunk'ları temizle (transfer.ts completeTransfer zaten blob URL oluşturur)
    // Burada sadece state temizliği
    // this.incomingChunks.delete(transferId); // transfer.ts halleder
  }

  /**
   * Presence timeout kontrolü
   */
  private checkPresenceTimeout(peerId: string): void {
    const now = Date.now();
    const lastSeen = this.lastPresenceTime.get(peerId);

    if (!lastSeen || now - lastSeen > PRESENCE_TIMEOUT) {
      const state = this._peers.get(peerId);
      if (state?.status !== 'offline') {
        if (state) {
          this._peers.set(peerId, { ...state, status: 'offline', lastSeen: now });
          this.notifyPeersChanged();
        }
      }
    }
  }

  /**
   * Peer için presence timer başlat (35 sn sonra offline)
   */
  private startPresenceTimer(peerId: string): void {
    const timer = setTimeout(() => {
      const state = this._peers.get(peerId);
      if (state?.status !== 'offline') {
        if (state) {
          this._peers.set(peerId, { ...state, status: 'offline', lastSeen: Date.now() });
          this.notifyPeersChanged();
        }
      }
      this.presenceTimers.delete(peerId);
    }, PRESENCE_TIMEOUT);

    this.presenceTimers.set(peerId, timer);
  }

  /**
   * Peer timer'larını temizle
   */
  private cleanupPeerTimers(peerId: string): void {
    const timer = this.presenceTimers.get(peerId);
    if (timer) clearTimeout(timer);
    this.presenceTimers.delete(peerId);
    this.lastPresenceTime.delete(peerId);
  }

  /**
   * Hello mesajı gönder (broadcast)
   */
  private async sendHello(): Promise<void> {
    if (!this._profile || !this._guild) return;

    await this.broadcast('hello', {
      profile: this._profile,
      guildId: this._guild.id,
      client: 'peercord-web',
    } as HelloPayload);
  }

  /**
   * Hello mesajı tek eşe gönder
   */
  private async sendHelloTo(peerId: string): Promise<void> {
    if (!this._profile || !this._guild) return;

    await this.sendTo(peerId, 'hello', {
      profile: this._profile,
      guildId: this._guild.id,
      client: 'peercord-web',
    } as HelloPayload);
  }

  /**
   * Periyodik presence interval'ini başlat
   */
  private startPresenceInterval(): void {
    this.presenceIntervalId = setInterval(async () => {
      if (!this._profile || !this._guild) return;

      await this.broadcast('presence', {
        profile: this._profile,
        voiceChannelId: this._guild?.id ?? null,
        muted: false,
        deafened: false,
        screensharing: this.screenState.get(this.selfPeerId) ?? false,
      } as PresencePayload);
    }, PRESENCE_INTERVAL);
  }

  /**
   * Şifreli/şifresiz payload hazırla
   */
  private preparePayload<T>(envelope: WireEnvelope<T>): string | WireEnvelope<T> {
    if (this.roomKey) {
      return encryptBytes(JSON.stringify(envelope), bytesToHex(this.roomKey));
    }
    return envelope;
  }

  /**
   * Tüm eşlere yayınla
   */
  async broadcast<T>(type: string, payload: T): Promise<void> {
    if (!this.msgAction) return;

    const envelope: WireEnvelope<T> = {
      v: 1,
      type,
      id: uid('msg'),
      ts: Date.now(),
      payload,
    };

    const sendPayload = this.preparePayload(envelope);
    await this.msgAction.send(sendPayload as import('./trystero-types').DataPayload);
  }

  /**
   * Tek eşe gönder
   */
  async sendTo<T>(peerId: string, type: string, payload: T): Promise<void> {
    if (!this.msgAction) return;

    const envelope: WireEnvelope<T> = {
      v: 1,
      type,
      id: uid('msg'),
      ts: Date.now(),
      payload,
    };

    const sendPayload = this.preparePayload(envelope);
    await this.msgAction.send(sendPayload as import('./trystero-types').DataPayload, { target: peerId });
  }

  /**
   * Bilinen tüm eşlere tek tek gönder (hariç tutulan hariç)
   */
  async broadcastExcept<T>(exceptPeerId: string, type: string, payload: T): Promise<void> {
    const peers = Array.from(this._peers.keys()).filter((p) => p !== exceptPeerId);
    for (const peerId of peers) {
      await this.sendTo(peerId, type, payload);
    }
  }

  /**
   * Mesaj dinleyicisi ekle
   */
  onMessage(handler: (message: WireEnvelope, fromPeerId: string) => void): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Peer değişikliklerini dinle
   */
  onPeersChanged(handler: (peers: PeerInfo[]) => void): () => void {
    this.peersChangedHandlers.add(handler);
    return () => this.peersChangedHandlers.delete(handler);
  }

  /**
   * Peer ayrıldığını dinle
   */
  onPeerLeft(handler: (peerId: string) => void): () => void {
    this.peerLeftHandlers.add(handler);
    return () => this.peerLeftHandlers.delete(handler);
  }

  /**
   * Bağlantı durumu değişikliklerini dinle
   */
  onConnectionChanged(handler: (info: ConnectionInfo) => void): () => void {
    this.connectionChangedHandlers.add(handler);
    return () => this.connectionChangedHandlers.delete(handler);
  }

  /**
   * Presence yayınla
   */
  async publishPresence(payload: PresencePayload): Promise<void> {
    await this.broadcast('presence', payload);
  }

  /**
   * Mesaj sırasında "yazıyor" yayını
   */
  async publishTyping(payload: TypingPayload): Promise<void> {
    await this.broadcast('typing', payload);
  }

  /**
   * Yerel medya akışını ayarla (mikrofon)
   */
  async setLocalStream(stream: MediaStream | null): Promise<void> {
    if (!this.room) return;

    if (stream && !this.localStream) {
      this.localStream = stream;
      const promises = this.room.addStream(stream, { metadata: { kind: 'mic' } });
      await Promise.all(promises);
    } else if (!stream && this.localStream) {
      this.room.removeStream(this.localStream);
      this.localStream = null;
    }
  }

  /**
   * Yerel ekran akışını ayarla
   */
  async setLocalScreenStream(stream: MediaStream | null): Promise<void> {
    if (!this.room) return;

    if (stream && !this.localScreenStream) {
      this.localScreenStream = stream;
      this.screenState.set(this.selfPeerId, true);
      
      // Ekran paylaşımını bildir
      await this.broadcast('screen-state', { isScreenSharing: true, peerId: this.selfPeerId });
      
      const promises = this.room.addStream(stream, { metadata: { kind: 'screen' } });
      await Promise.all(promises);
    } else if (!stream && this.localScreenStream) {
      this.room.removeStream(this.localScreenStream);
      this.localScreenStream = null;
      this.screenState.set(this.selfPeerId, false);
      await this.broadcast('screen-state', { isScreenSharing: false, peerId: this.selfPeerId });
    }
  }

  /**
   * Uzak stream'i dinle (mikrofon)
   */
  onRemoteStream(handler: (peerId: string, stream: MediaStream) => void): () => void {
    this.remoteStreamHandler = handler;
    return () => { this.remoteStreamHandler = null; };
  }

  /**
   * Uzak ekran paylaşımını dinle
   */
  onRemoteScreenStream(handler: (peerId: string, stream: MediaStream) => void): () => void {
    this.remoteScreenStreamHandler = handler;
    return () => { this.remoteScreenStreamHandler = null; };
  }

  /**
   * Dosya gönderimi (chunked, geri basınçlı)
   */
  sendFile(peerId: string, file: File): FileTransferHandle {
    if (file.size > MAX_FILE_SIZE) {
      return {
        id: uid('transfer'),
        promise: Promise.reject(new Error('Dosya çok büyük. Maksimum 200 MB')),
        onProgress: () => () => {},
        cancel: () => {},
      };
    }

    const transferId = uid('transfer');
    let cancelled = false;
    let offset = 0;

    // Dosya teklifini gönder
    this.sendFileOffer(peerId, {
      transferId,
      peerId: this.selfPeerId,
      fromUserId: this._peers.get(this.selfPeerId)?.userId ?? this.selfPeerId.slice(0, 16),
      fromName: this._peers.get(this.selfPeerId)?.name ?? 'Bilinmeyen',
      name: file.name,
      size: file.size,
      mime: file.type,
    });

    const progressCallbacks = new Set<(p: FileTransferProgress) => void>();

    const promise = new Promise<import('@/types').Attachment>(async (resolve, reject) => {
      const chunks: ArrayBuffer[] = [];

      const sendNextChunk = async (): Promise<void> => {
        if (cancelled || offset >= file.size) return;

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const buffer = await slice.arrayBuffer();
        chunks.push(buffer);

        await this.sendTo(peerId, 'file-chunk', {
          transferId,
          chunk: buffer,
          isLast: offset + CHUNK_SIZE >= file.size,
        });

        offset += buffer.byteLength;

        // Progress bildir (gönderen taraf)
        progressCallbacks.forEach((cb) =>
          cb({
            transferId,
            peerId,
            direction: 'send',
            transferred: offset,
            total: file.size,
            progress: offset / file.size,
            bytesPerSecond: 0,
          })
        );

        await new Promise((r) => setTimeout(r, 0));
        if (!cancelled) sendNextChunk();
      };

      try {
        await sendNextChunk();

        // Tamamlanmayı bekle (receiver file-complete gönderince)
        // Polling ile kontrol et
        const checkComplete = setInterval(() => {
          if (offset >= file.size && !cancelled) {
            clearInterval(checkComplete);
            const blob = new Blob(chunks, { type: file.type });
            resolve({
              id: transferId,
              name: file.name,
              size: file.size,
              mime: file.type,
              url: URL.createObjectURL(blob),
            });
          }
        }, 100);
      } catch (error) {
        reject(error);
      }
    });

    return {
      id: transferId,
      promise,
      onProgress: (cb: (p: FileTransferProgress) => void) => {
        progressCallbacks.add(cb);
        return () => progressCallbacks.delete(cb);
      },
      cancel: () => {
        cancelled = true;
      },
    };
  }

  /**
   * Dosya teklifini gönder
   */
  private async sendFileOffer(peerId: string, offer: IncomingFileOffer): Promise<void> {
    await this.sendTo(peerId, 'file-offer', offer);
  }

  /**
   * Gelen dosya tekliflerini dinle
   */
  onIncomingFile(handler: (offer: IncomingFileOffer) => void): () => void {
    this.incomingFileHandlers.add(handler);
    return () => this.incomingFileHandlers.delete(handler);
  }

  /**
   * Dosya gönderimini kabul et
   */
  acceptFile(transferId: string): void {
    const offer = this.pendingFileOffers.get(transferId);
    if (!offer) return;

    // Alıcı chunk'ları topluyor, complete olduğunda file-complete gönderir
    // Bu fonksiyon sadece UI onayı için, chunk'lar zaten geliyor
    // file-complete geldiğinde transfer.ts completeTransfer çağrılır
  }

  /**
   * Dosya gönderimini reddet
   */
  rejectFile(transferId: string): void {
    const offer = this.pendingFileOffers.get(transferId);
    if (!offer) return;

    // Gönderen'e reject bildir
    this.sendTo(offer.peerId, 'file-reject', { transferId });
    
    // State temizle
    this.pendingFileOffers.delete(transferId);
    this.incomingChunks.delete(transferId);
  }

  /**
   * Transfer ilerlemelerini dinle
   */
  onFileProgress(handler: (progress: FileTransferProgress) => void): () => void {
    this.fileProgressHandlers.add(handler);
    return () => this.fileProgressHandlers.delete(handler);
  }

  /**
   * Ping (latency ölç)
   */
  async ping(peerId: string): Promise<number> {
    if (!this.room) return 0;

    try {
      return await this.room.ping(peerId);
    } catch {
      return 0;
    }
  }

  /**
   * Bağlantı durumunu bildir
   */
  private notifyConnectionChanged(info: ConnectionInfo): void {
    this.connectionChangedHandlers.forEach((cb) => cb(info));
  }

  /**
   * Peer değişikliğini bildir
   */
  private notifyPeersChanged(): void {
    const peers = Array.from(this._peers.values());
    this.peersChangedHandlers.forEach((cb) => cb(peers));
  }

  /**
   * Odadan çık
   */
  async leave(): Promise<void> {
    if (this.room) {
      await this.room.leave();
      this.room = null;
    }

    // Timer'ları temizle
    if (this.presenceIntervalId) {
      clearInterval(this.presenceIntervalId);
      this.presenceIntervalId = null;
    }
    this.presenceTimers.forEach((timer) => clearTimeout(timer));
    this.presenceTimers.clear();
    this.lastPresenceTime.clear();
    this.screenState.clear();
    this.incomingChunks.clear();
    this.pendingFileOffers.clear();

    this._peers.clear();
  }

  /**
   * Temizlik
   */
  destroy(): void {
    this.leave();
    this.messageHandlers.clear();
    this.peersChangedHandlers.clear();
    this.peerLeftHandlers.clear();
    this.connectionChangedHandlers.clear();
    this.incomingFileHandlers.clear();
    this.fileProgressHandlers.clear();
    this.msgAction = null;
  }
}

/**
 * Room ID türet
 */
export function deriveRoomId(input: string): string {
  return input;
}

/**
 * Invite link parse et
 * Desteklediği formatlar:
 * - http(s)://<host>/#/oda/<roomId>?s=<secret>
 * - peercord://<roomId>?secret=<secret>
 * - peercord://<roomId>
 * - #<roomId>?s=<secret> (eski format)
 * - sadece <roomId>
 */
export function parseInvite(input: string): { roomId: string; secret?: string } | null {
  try {
    // Web URL formatı: http(s)://<host>/#/oda/<roomId>?s=<secret>
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const url = new URL(input);
      const hash = url.hash.slice(1) || '';
      if (hash.startsWith('oda/')) {
        const [, roomPart] = hash.split('/');
        const [roomIdRaw, ...secretParts] = (roomPart || '').split('?');
        const roomId = roomIdRaw || input;
        const secret = secretParts.length > 0
          ? new URLSearchParams(secretParts.join('?')).get('s') || undefined
          : undefined;
        return { roomId, secret };
      }
      return { roomId: hash || input, secret: undefined };
    }

    // peercord:// protokolü
    if (input.startsWith('peercord://')) {
      const url = new URL(input);
      const roomId = url.pathname.slice(1) || url.hostname || url.pathname || input;
      const secret = url.searchParams.get('secret') || undefined;
      return { roomId, secret };
    }

    // # hash formatı (eski): #<roomId>?s=<secret>
    if (input.startsWith('#')) {
      const hash = input.slice(1);
      if (hash.startsWith('oda/')) {
        const [, roomPart] = hash.split('/');
        const [roomIdRaw, ...secretParts] = (roomPart || '').split('?');
        const roomId = roomIdRaw || input;
        const secret = secretParts.length > 0
          ? new URLSearchParams(secretParts.join('?')).get('s') || undefined
          : undefined;
        return { roomId, secret };
      }
      const [roomId, ...secretParts] = hash.split('?');
      const secret = secretParts.length > 0
        ? new URLSearchParams(secretParts.join('?')).get('s') || undefined
        : undefined;
      return { roomId: roomId || input, secret };
    }

    // Çıplak roomId
    return { roomId: input };
  } catch {
    return null;
  }
}

/**
 * Invite link oluştur
 * Web formatı: http://<host>/#/oda/<roomId>?s=<secret>
 */
export function makeInviteLink(roomId: string, secret?: string): string {
  const host = typeof window !== 'undefined'
    ? window.location.host
    : 'localhost:5180';
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? 'https://'
    : 'http://';

  if (secret) {
    return `${protocol}${host}/#/oda/${roomId}?s=${secret}`;
  }
  return `${protocol}${host}/#/oda/${roomId}`;
}
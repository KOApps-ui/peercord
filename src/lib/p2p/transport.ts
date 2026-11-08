/**
 * PeerCord - P2PTransport tam implementasyonu
 * Trystero WebRTC data channel
 */
import { joinRoom, type Room as TrysteroRoom, selfId } from 'trystero';
import type {
  ConnectionInfo,
  PeerInfo,
  UserProfile,
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

// Import tipleri
import type { Action as TrysteroAction } from './trystero-types';
import type { SignalingStrategy } from '@/types';
import type { Guild } from '@/types';
import * as TransferModule from './transfer';

// Sabitler
const APP_ID = 'peercord-v1';
const PRESENCE_INTERVAL = 10_000; // 10 saniyede bir presence
const PRESENCE_TIMEOUT = 35_000; // 35 saniyede offline işaretle

// Strateji öncelik sırası
const STRATEGY_PRIORITY: SignalingStrategy[] = ['nostr', 'mqtt', 'bittorrent'];

// Chunk boyutu
const CHUNK_SIZE = 64 * 1024;

// Wire envelope tipi
interface WireEnvelope<T = unknown> {
  v: 1;
  type: string;
  id: string;
  ts: number;
  payload: T;
}

/**
 * P2PTransport implementasyonu
 */
export class P2PTransportImpl implements P2PTransport {
  public roomId: string;
  public readonly selfPeerId: string = selfId;
  private room: TrysteroRoom | null = null;
  private currentStrategy: SignalingStrategy | undefined = undefined;
  private _profile?: UserProfile;
  private _guild?: Guild;
  
  // PeerInfo haritası
  private _peers = new Map<string, PeerInfo>();
  get peers(): ReadonlyMap<string, PeerInfo> {
    return this._peers;
  }
  private lastPresenceTime = new Map<string, number>();
  private presenceTimers = new Map<string, number>();
  private presenceIntervalId: number | null = null;
  
  // Callback'ler
  private messageHandlers = new Set<(msg: WireEnvelope, fromPeerId: string) => void>();
  private peersChangedHandlers = new Set<(peers: PeerInfo[]) => void>();
  private peerLeftHandlers = new Set<(peerId: string) => void>();
  private connectionChangedHandlers = new Set<(info: ConnectionInfo) => void>();
  
  // Stream yönetimi
  private localStream: MediaStream | null = null;
  private localScreenStream: MediaStream | null = null;
  private remoteStreamHandler: ((stream: MediaStream, peerId: string) => void) | null = null;
  private remoteScreenStreamHandler: ((stream: MediaStream, peerId: string) => void) | null = null;
  private screenState = new Map<string, boolean>(); // peerId -> isScreenSharing
  
  // Actions
  private actions = new Map<string, TrysteroAction>();
  
  // File transfer
  private incomingFileHandlers = new Set<(offer: IncomingFileOffer) => void>();
  private fileProgressHandlers = new Set<(p: FileTransferProgress) => void>();
  private activeChunks = new Map<string, { buffer: ArrayBuffer; isLast: boolean }[]>();
  
  // AES-GCM anahtarı
  private roomKey: Uint8Array | null = null;

  constructor(roomId: string = '') {
    this.roomId = roomId;
  }

  /**
   * Odaya katıl (strateji zinciri ile)
   */
  async join(config: P2PTransportConfig): Promise<void> {
    // Room ID'yi güncelle (constructor'da verilen değer varsa onu kullan)
    if (config.roomId && this.roomId !== config.roomId) {
      this.roomId = config.roomId;
    }
    
    this._profile = config.profile;
    this._guild = config.guild;
    
    this.roomKey = config.roomSecret ? deriveKey(config.roomSecret) : null;
    
    // Stratejiyi seç ve dene
    const strategiesToTry = config.strategy 
      ? [config.strategy] 
      : STRATEGY_PRIORITY;
    
    const result = await this.tryStrategies(strategiesToTry, config);
    
    if (!result.success) {
      this.notifyConnectionChanged({
        status: 'error',
        peerCount: 0,
        roomId: this.roomId,
        error: result.error ?? 'Oda katılamadı',
        strategy: this.currentStrategy ?? 'nostr',
      });
      return;
    }
    
    // Event handler'ları kur
    this.setupRoomHandlers(config.profile);
    
    this.notifyConnectionChanged({
      status: 'connected',
      peerCount: this._peers.size,
      roomId: this.roomId,
      strategy: this.currentStrategy ?? 'nostr',
    });
  }

  /**
   * Strateji zincirini dener
   */
  private async tryStrategies(
    strategies: SignalingStrategy[], 
    config: P2PTransportConfig
  ): Promise<{ success: boolean; error?: string }> {
    for (const strategy of strategies) {
      const result = await this.tryStrategy(strategy, config);
      if (result.success) {
        this.currentStrategy = strategy;
        return result;
      }
    }
    return { success: false, error: 'Tüm stratejiler başarısız' };
  }

  /**
   * Tek bir stratejiyi dener
   */
  private async tryStrategy(
    strategy: SignalingStrategy,
    config: P2PTransportConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Stratejiye göre import yap
      switch (strategy) {
        case 'mqtt':
          await import('trystero/mqtt');
          break;
        case 'bittorrent':
          await import('trystero/torrent');
          break;
        case 'nostr':
        default:
          await import('trystero/nostr');
          break;
      }
      
      // Room'a katıl
      const trysteroConfig = {
        appId: config.appId ?? APP_ID,
        password: config.roomSecret,
        ...(config.relayUrls ? { relayConfig: { urls: config.relayUrls } } : {}),
      } as any;
      
      this.room = joinRoom(trysteroConfig, this.roomId);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error)?.message || 'Katılım hatası' };
    }
  }

  /**
   * Room event handler'larını kur
   */
  private setupRoomHandlers(profile: UserProfile): void {
    if (!this.room) return;
    
    const room = this.room;
    const self = this;
    
    // Presence zamanlayıcısı
    this.presenceIntervalId = window.setInterval(async () => {
      await self.broadcast('presence', {
        profile: self._profile ?? profile,
        voiceChannelId: self._guild?.id ?? null,
        muted: false,
        deafened: false,
        screensharing: self.isScreenSharing(self.selfPeerId),
      });
    }, PRESENCE_INTERVAL);
    
    // Peer katıldığında
    room.onPeerJoin = (peerId: string) => {
      self.updatePeerInfo(peerId);
    };
    
    // Peer ayrıldığında
    room.onPeerLeave = (peerId: string) => {
      (self as any).peers.delete(peerId);
      self.peersChangedHandlers.forEach(cb => cb(Array.from(self.peers.values())));
      self.peerLeftHandlers.forEach(cb => cb(peerId));
      // Timer temizle
      clearInterval(self.presenceTimers.get(peerId) as number);
      self.presenceTimers.delete(peerId);
      self.lastPresenceTime.delete(peerId);
      self.screenState.delete(peerId);
    };
    
    // Mesaj geldiğinde
    (room as any).onMessage = (data: unknown, context: { peerId: string }) => {
      self.handleIncomingMessage(data, context.peerId);
    };
    
    // Stream geldiğinde
    room.onPeerStream = (stream: MediaStream, peerId: string, metadata?: unknown) => {
      const isScreen = (metadata as Record<string, unknown>)?.kind === 'screen' || self.isScreenSharing(peerId);
      if (isScreen) {
        self.remoteScreenStreamHandler?.(stream, peerId);
      } else {
        self.remoteStreamHandler?.(stream, peerId);
      }
    };
  }

  /**
   * PeerInfo güncelle ve presence timeout kontrol et
   */
  private updatePeerInfo(_peerId?: string): void {
    // Bu metod hello/presence mesajlarından dışarıdan çağrılacak
  }

  /**
   * Ekran paylaşımı durumunu kontrol et
   */
  private isScreenSharing(peerId: string): boolean {
    return this.screenState.get(peerId) ?? false;
  }

  /**
   * Gelen mesajları işler
   */
  private handleIncomingMessage(data: unknown, peerId: string): void {
    // Presence timeout kontrolü
    const now = Date.now();
    const lastSeen = this.lastPresenceTime.get(peerId);
    
    // Eğer presence yoksa veya 35s'den eskiyse offline işaretle
    if (!lastSeen || now - lastSeen > PRESENCE_TIMEOUT) {
      const currentState = this._peers.get(peerId);
      if (currentState?.status !== 'offline') {
        // Offline yap ve callback tetikle
        if (currentState) {
          this._peers.set(peerId, { ...currentState, status: 'offline' });
        }
        this.peersChangedHandlers.forEach(cb => cb(Array.from(this.peers.values())));
      }
    }
    
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
      return;
    }
    
    const { type, payload } = envelope;
    
    // Mesaj türüne göre işle
    switch (type) {
      case 'hello':
        this.handleHello(peerId, payload as any);
        break;
      case 'presence':
        this.handlePresence(peerId, payload as PresencePayload);
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
    }
    
    // Diğer handler'lara ilet
    this.messageHandlers.forEach(cb => cb(envelope, peerId));
  }

  /**
   * Hello mesajını işler
   */
  private handleHello(peerId: string, _payload: HelloPayload): void {
    this.updatePeerInfo(peerId);
  }

  /**
   * Presence mesajını işler
   */
  private handlePresence(peerId: string, payload: PresencePayload): void {
    const now = Date.now();
    this.lastPresenceTime.set(peerId, now);
    
    // Timer zaten varsa temizle
    const existingTimer = this.presenceTimers.get(peerId);
    if (existingTimer) clearTimeout(existingTimer);
    
    // 35s sonrasında offline işaretle
    const timer = window.setTimeout(() => {
      const state = this._peers.get(peerId);
      if (state?.status !== 'offline') {
        const updatedState = { ...state, status: 'offline' as const };
        this._peers.set(peerId, updatedState);
        this.peersChangedHandlers.forEach(cb => cb(Array.from(this.peers.values())));
      }
      this.presenceTimers.delete(peerId);
    }, PRESENCE_TIMEOUT);
    
    this.presenceTimers.set(peerId, timer);
    
    // PeerInfo güncelle - PresencePayload sadece bazı alanları içerir
    const existing = this._peers.get(peerId);
    if (existing) {
      this._peers.set(peerId, {
        ...existing,
        name: payload.profile.name,
        avatarSeed: payload.profile.avatarSeed,
        accentHue: payload.profile.accentHue,
        customStatus: payload.profile.customStatus,
        roleIds: payload.profile.roleIds,
        voiceChannelId: payload.voiceChannelId,
        muted: payload.muted,
        deafened: payload.deafened,
        screensharing: payload.screensharing,
        status: 'online',
        lastSeen: now,
      });
    }
    
    this.peersChangedHandlers.forEach(cb => cb(Array.from(this.peers.values())));
  }

  /**
   * Screen state mesajını işler
   */
  private handleScreenState(peerId: string, payload: ScreenStatePayload): void {
    this.screenState.set(peerId, payload.isScreenSharing);
    // Stream handler'lar tetiklenir (onPeerStream'da kontrol edilir)
  }

  /**
   * Dosya teklifi geldiğinde
   */
  private handleFileOffer(_peerId: string, offer: IncomingFileOffer): void {
    this.incomingFileHandlers.forEach(cb => cb(offer));
  }

  /**
   * Dosya chunk'u geldiğinde
   */
  private handleFileChunk(peerId: string, payload: FileChunkPayload): void {
    const { transferId, chunk, isLast } = payload;
    
    // Chunk'leri biriktir
    if (!this.activeChunks.has(transferId)) {
      this.activeChunks.set(transferId, []);
    }
    
    const chunks = this.activeChunks.get(transferId)!;
    chunks.push({ buffer: chunk, isLast });
    
    // Progress bildir
    const totalSize = chunks.reduce((sum, c) => sum + c.buffer.byteLength, 0);
    const offer = this.getCurrentOffer(transferId);
    if (offer) {
      this.fileProgressHandlers.forEach(cb => cb({
        transferId,
        peerId,
        direction: 'receive',
        transferred: totalSize,
        total: offer.size,
        progress: totalSize / offer.size,
        bytesPerSecond: 0,
      }));
    }
    
    // Son chunk gelince complete et
    if (isLast) {
      this.handleFileComplete(peerId, { transferId });
    }
  }

  /**
   * Dosya tamamlandığında
   */
  private handleFileComplete(_peerId: string, payload: FileCompletePayload): void {
    const { transferId } = payload;
    const state = TransferModule.getTransferState(transferId);
    if (state) {
      const attachment = TransferModule.completeTransfer(transferId);
      if (attachment) {
        // TODO: Attachment'ı kullanıcıya ilet
      }
    }
    this.activeChunks.delete(transferId);
  }

  /**
   * Mevcut dosya teklifini al
   */
  private getCurrentOffer(_transferId: string): IncomingFileOffer | undefined {
    return undefined; // Gerçek implementasyonda saklanmalı
  }

  /**
   * Presence yayınla
   */
  async publishPresence(payload: PresencePayload): Promise<void> {
    await this.broadcast('presence', payload);
  }

  /**
   * Ekran state gönder
   */
  async sendScreenState(isScreenSharing: boolean): Promise<void> {
    await this.broadcast('screen-state', { isScreenSharing, peerId: this.selfPeerId });
  }

  /**
   * Tüm eşlere yayınla
   */
  async broadcast<T>(type: string, payload: T): Promise<void> {
    if (!this.room) return;
    
    const action = this.getAction(type);
    const envelope: WireEnvelope<T> = {
      v: 1,
      type,
      id: uid('msg'),
      ts: Date.now(),
      payload,
    };
    
    const sendPayload = this.roomKey ? encryptBytes(JSON.stringify(envelope), bytesToHex(this.roomKey)) : envelope;
    await action.send(sendPayload);
  }

  /**
   * Tek eşe gönder
   */
  async sendTo<T>(peerId: string, type: string, payload: T): Promise<void> {
    if (!this.room) return;
    
    const action = this.getAction(type);
    const envelope: WireEnvelope<T> = {
      v: 1,
      type,
      id: uid('msg'),
      ts: Date.now(),
      payload,
    };
    
    const sendPayload = this.roomKey ? encryptBytes(JSON.stringify(envelope), bytesToHex(this.roomKey)) : envelope;
    await action.send(sendPayload, { target: peerId });
  }

  /**
   * Bilinen tüm eşlere tek tek gönder
   */
  async broadcastExcept(exceptPeerId: string, type: string, payload: unknown): Promise<void> {
    const peers = Array.from(this._peers.keys()).filter(p => p !== exceptPeerId);
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
   * Mesaj sırasında "yazıyor" yayını
   */
  async publishTyping(payload: TypingPayload): Promise<void> {
    await this.broadcast('typing', payload);
  }

  /**
   * Yerel medya akışını ayarla
   */
  async setLocalStream(stream: MediaStream | null): Promise<void> {
    if (!this.room) return;
    
    if (stream && !this.localStream) {
      this.localStream = stream;
      this.room.addStream(stream);
      this.room.onPeerStream = (s, peerId, metadata) => {
        const isScreen = (metadata as Record<string, unknown>)?.kind === 'screen' || this.isScreenSharing(peerId);
        if (isScreen) {
          this.remoteScreenStreamHandler?.(s, peerId);
        } else {
          this.remoteStreamHandler?.(s, peerId);
        }
      };
    } else if (!stream && this.localStream) {
      this.room.removeStream(this.localStream);
      this.localStream = null;
      await this.sendScreenState(false);
    }
  }

  /**
   * Yerel ekran akışını ayarla
   */
  async setLocalScreenStream(stream: MediaStream | null): Promise<void> {
    if (!this.room) return;
    
    if (stream && !this.localScreenStream) {
      this.localScreenStream = stream;
      // Ekran paylaşımını bildir
      await this.sendScreenState(true);
      this.room.addStream(stream, { kind: 'screen' });
    } else if (!stream && this.localScreenStream) {
      this.room.removeStream(this.localScreenStream);
      this.localScreenStream = null;
      await this.sendScreenState(false);
    }
  }

  /**
   * Uzak stream'i dinle
   */
  onRemoteStream(handler: (peerId: string, stream: MediaStream) => void): () => void {
    this.remoteStreamHandler = (stream, peerId) => handler(peerId, stream);
    return () => { this.remoteStreamHandler = null; };
  }

  /**
   * Uzak ekran paylaşımını dinle
   */
  onRemoteScreenStream(handler: (peerId: string, stream: MediaStream) => void): () => void {
    this.remoteScreenStreamHandler = (stream, peerId) => handler(peerId, stream);
    return () => { this.remoteScreenStreamHandler = null; };
  }

  /**
   * Dosya gönderimi
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
    
    // Chunk gönderimi
    let offset = 0;
    const chunks: ArrayBuffer[] = [];
    let cancelled = false;
    
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
      
      TransferModule.emitFileProgress({
        transferId,
        peerId,
        direction: 'send',
        transferred: offset,
        total: file.size,
        progress: offset / file.size,
        bytesPerSecond: 0,
      });
      
      await new Promise(r => setTimeout(r, 0));
      if (!cancelled) sendNextChunk();
    };
    
    sendNextChunk().catch(() => {});
    
    return {
      id: transferId,
      promise: new Promise((resolve, reject) => {
        const timer = window.setInterval(() => {
          if (offset >= file.size && !cancelled) {
            clearInterval(timer);
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
        // İptal edilirse reject et
        if (cancelled) {
          clearInterval(timer);
          reject(new Error('Transfer cancelled'));
        }
      }),
      onProgress: (cb) => {
        this.fileProgressHandlers.add(cb);
        return () => this.fileProgressHandlers.delete(cb);
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
    // Chunk'lar toplandığında blob URL oluştur
    const state = TransferModule.getTransferState(transferId);
    if (state) {
      const attachment = TransferModule.completeTransfer(transferId);
      if (attachment) {
        // Tamamlandı mesajını gönder
        const action = this.getAction('file-complete');
        action.send({ transferId });
      }
    }
  }

  /**
   * Dosya gönderimini reddet
   */
  rejectFile(transferId: string): void {
    const chunks = this.activeChunks.get(transferId);
    if (chunks) {
      chunks.length = 0;
      this.activeChunks.delete(transferId);
    }
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
      return await (this.room as any).ping(peerId);
    } catch {
      const start = Date.now();
      try {
        const action = this.getAction('ping');
        await action.request({ ts: start }, { target: peerId, timeoutMs: 5000 });
        return Date.now() - start;
      } catch {
        return 0;
      }
    }
  }

  /**
   * Action al
   */
  private getAction(type: string): TrysteroAction {
    let action = this.actions.get(type);
    if (!action) {
      if (!this.room) throw new Error('Room açıklı değil');
      action = this.room.makeAction(type) as TrysteroAction;
      this.actions.set(type, action);
    }
    return action;
  }

  /**
   * Bağlantı durumunu bildir
   */
  private notifyConnectionChanged(info: ConnectionInfo): void {
    this.connectionChangedHandlers.forEach(cb => cb(info));
  }

  /**
   * Odanda çık
   */
  async leave(): Promise<void> {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    
    // Presence timer'ları temizle
    if (this.presenceIntervalId) {
      clearInterval(this.presenceIntervalId);
      this.presenceIntervalId = null;
    }
    this.presenceTimers.forEach(timer => clearTimeout(timer));
    this.presenceTimers.clear();
    this.lastPresenceTime.clear();
    this.screenState.clear();
    this.activeChunks.clear();
    
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
    this.actions.clear();
  }
}

// Payload tipleri
interface HelloPayload {
  profile: UserProfile;
  guildId: string;
  client: string;
}

interface ScreenStatePayload {
  isScreenSharing: boolean;
  peerId: string;
}

interface FileChunkPayload {
  transferId: string;
  chunk: ArrayBuffer;
  isLast: boolean;
}

interface FileCompletePayload {
  transferId: string;
}

/**
 * Room ID türet
 */
export function deriveRoomId(input: string): string {
  return input;
}

/**
 * Invite link parse et
 */
export function parseInvite(input: string): { roomId: string; secret?: string } | null {
  try {
    if (input.startsWith('peercord://')) {
      const url = new URL(input);
      const roomId = url.pathname.slice(1) || url.hostname || url.pathname;
      const secret = url.searchParams.get('secret') || undefined;
      return { roomId, secret };
    }
    
    if (input.includes('#')) {
      const [roomId, secret] = input.split('#');
      return { roomId, secret };
    }
    
    return { roomId: input };
  } catch {
    return null;
  }
}

/**
 * Invite link oluştur
 */
export function makeInviteLink(roomId: string, secret?: string): string {
  if (secret) {
    return `peercord://${roomId}?secret=${secret}`;
  }
  return `peercord://${roomId}`;
}
/**
 * PeerCord - P2P taşıma katmanı public API
 */
import type {
  SignalingStrategy,
} from '@/types';
import type { P2PTransport } from './contracts';

// Contract tiplerini re-export et
export type {
  WireEnvelope,
  HelloPayload,
  PresencePayload,
  TypingPayload,
  IncomingFileOffer,
  FileTransferProgress,
  FileTransferHandle,
  P2PTransportConfig,
  P2PTransport,
} from './contracts';

// Transport implementasyonu
export { P2PTransportImpl, deriveRoomId, parseInvite, makeInviteLink } from './transport';

// Identity yönetimi
export { 
  createIdentity, 
  loadIdentity, 
  saveIdentity, 
  updateIdentityName, 
  getUserId, 
  generateAccentHue,
  getSecretKey,
  getPublicKey,
} from './identity';

// Şifreleme
export { 
  deriveKey, 
  encryptBytes, 
  decryptBytes, 
  roomFingerprint,
  decryptPayload,
} from './crypto';

// Transport yardımcıları
export { 
  onIncomingFile, 
  getTransferCount,
  getTransferState,
  cancelTransfer,
  sendFile as sendFileTransfer,
} from './transfer';

// Import tipleri
import { P2PTransportImpl } from './transport';
import type { P2PTransportConfig } from './contracts';

/**
 * Transport factory - ESM uyumlu
 * 
 * @param roomId - Oda kimliği
 * @param config - Opsiyonel yapılandırma
 */
export function createTransport(roomId: string = '', config?: P2PTransportConfig): P2PTransport {
  const transport = new P2PTransportImpl(roomId);
  if (config) {
    // join() çağrısı yapılabilir
  }
  return transport;
}

/**
 * Strateji yöneticisi
 */
export function selectStrategy(config: { preferredStrategy?: SignalingStrategy }): SignalingStrategy {
  if (config.preferredStrategy) return config.preferredStrategy;
  return 'nostr'; // Öntanımlı strateji
}
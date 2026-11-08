/**
 * PeerCord - Trystero tipleri (tam tip tanımları eksikse)
 * @noble paketleriyle birlikte kullanılır
 */

// Room nesnesi tipi
export interface Room {
  selfId: string;
  leave(): void;
  addStream(stream: MediaStream, options?: { target?: string | string[]; metadata?: unknown }): void;
  removeStream(stream: MediaStream, options?: { target?: string | string[] }): void;
  onPeerJoin: ((peerId: string) => void) | null;
  onPeerLeave: ((peerId: string) => void) | null;
  onPeerStream: ((stream: MediaStream, peerId: string, metadata?: unknown) => void) | null;
  onMessage: ((data: unknown, context: { peerId: string }) => void) | null;
  makeAction(id: string, config?: ActionConfig): ActionInstance;
  ping?(peerId: string): Promise<number>;
  readonly roomId?: string;
}

// Action konfigürasyonu
export interface ActionConfig {
  kind?: 'request' | 'response';
  onRequest?: (data: unknown) => unknown | Promise<unknown>;
  onReceive?: (ctx: ActionContext) => boolean | Promise<boolean>;
  onReceiveProgress?: (percent: number, ctx: { peerId: string; metadata?: unknown }) => void;
}

// Action bağlamı
export interface ActionContext {
  byteLength: number;
  peerId: string;
  metadata?: unknown;
  kind?: string;
  signal: AbortSignal;
}

// Action örneği
export interface ActionInstance {
  send<T = unknown>(data: T | ArrayBuffer, options?: SendOptions): Promise<void>;
  request<T>(data: unknown, options: RequestOptions): Promise<T>;
  requestMany<T>(data: unknown, options: RequestManyOptions): Promise<Record<string, PromiseSettledResult<T>>>;
  onMessage: ((data: unknown, ctx: { peerId: string }) => void) | null;
  onReceive: ActionContext | ((ctx: ActionContext) => boolean | Promise<boolean>) | null;
  onReceiveProgress: ((percent: number, ctx: { peerId: string; metadata?: unknown }) => void) | null;
}

// Send seçenekleri
export interface SendOptions {
  target?: string | string[];
  metadata?: unknown;
  signal?: AbortSignal;
}

// Request seçenekleri
export interface RequestOptions {
  target: string;
  timeoutMs?: number;
  metadata?: unknown;
  signal?: AbortSignal;
  onProgress?: (percent: number, ctx: { peerId: string; metadata?: unknown }) => void;
}

// Request many seçenekleri
export interface RequestManyOptions {
  targets: string[];
  timeoutMs?: number;
  metadata?: unknown;
  signal?: AbortSignal;
  onResult?: (result: PromiseSettledResult<{ peerId: string; value: unknown }>) => void;
}

// Promise settles result
export interface PromiseSettledResult<T> {
  status: 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
}

// Self ID export (trystero'dan)
export { selfId } from 'trystero';

// Action tipi (trystero'dan)
export type Action = ActionInstance;
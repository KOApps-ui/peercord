/**
 * PeerCord - Trystero 0.26 tipleri
 * @trystero-p2p/core paketinden uyarlanmıştır
 */

// Temel tipler
export type JsonPrimitive = null | string | number | boolean;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type DataPayload = JsonValue | Blob | ArrayBuffer | ArrayBufferView;
export type PeerTarget = string | string[] | null;

// Action progress context
export interface ActionProgressContext {
  peerId: string;
  metadata?: JsonValue;
}
export type ActionProgressHandler = (progress: number, context: ActionProgressContext) => void;

// Message action context
export interface MessageContext {
  peerId: string;
  metadata?: JsonValue;
}

// Request action context
export interface RequestContext {
  peerId: string;
  metadata?: JsonValue;
  signal: AbortSignal;
}

// Action receive context
export interface ActionReceiveContext {
  peerId: string;
  byteLength: number;
  kind: 'message' | 'request' | 'response';
  signal: AbortSignal;
  metadata?: JsonValue;
}
export type ActionReceiveHandler = (context: ActionReceiveContext) => boolean | Promise<boolean>;

// MessageAction config
export interface MessageActionConfig<T extends DataPayload = DataPayload> {
  kind?: 'message';
  onMessage?: (data: T, context: MessageContext) => void | Promise<void>;
  onReceiveProgress?: ActionProgressHandler;
  onReceive?: ActionReceiveHandler;
}

// RequestAction config
export interface RequestActionConfig<T extends DataPayload = DataPayload, R extends DataPayload = DataPayload> {
  kind: 'request';
  onRequest?: (data: T, context: RequestContext) => R | Promise<R>;
  onReceiveProgress?: ActionProgressHandler;
  onReceive?: ActionReceiveHandler;
}

// Send options
export interface SendOptions {
  target?: PeerTarget;
  metadata?: JsonValue;
  onProgress?: ActionProgressHandler;
  signal?: AbortSignal;
}

// Request options
export interface RequestOptions {
  target: string;
  metadata?: JsonValue;
  timeoutMs?: number;
  onProgress?: ActionProgressHandler;
  signal?: AbortSignal;
}

// Request many options
export interface RequestManyOptions<R extends DataPayload = DataPayload> {
  targets: string[];
  metadata?: JsonValue;
  timeoutMs?: number;
  onProgress?: ActionProgressHandler;
  onResult?: (result: PeerResult<R>) => void;
  signal?: AbortSignal;
}

// Peer result
export type PeerResult<R extends DataPayload = DataPayload> =
  | { peerId: string; status: 'fulfilled'; value: R }
  | { peerId: string; status: 'timeout' }
  | { peerId: string; status: 'rejected'; error: Error }
  | { peerId: string; status: 'disconnected' };

// MessageAction arayüzü (trystero 0.26)
export interface MessageAction<T extends DataPayload = DataPayload> {
  send: (data: T, options?: SendOptions) => Promise<void>;
  onMessage: ((data: T, context: MessageContext) => void | Promise<void>) | null;
  onReceiveProgress: ActionProgressHandler | null;
  onReceive: ActionReceiveHandler | null;
}

// RequestAction arayüzü
export interface RequestAction<T extends DataPayload = DataPayload, R extends DataPayload = DataPayload> {
  request: (data: T, options: RequestOptions) => Promise<R>;
  requestMany: (data: T, options: RequestManyOptions<R>) => Promise<PeerResult<R>[]>;
  onRequest: ((data: T, context: RequestContext) => R | Promise<R>) | null;
  onReceiveProgress: ActionProgressHandler | null;
  onReceive: ActionReceiveHandler | null;
}

// Media options
export interface AddMediaOptions {
  target?: PeerTarget;
  metadata?: JsonValue;
}

export interface RemoveMediaOptions {
  target?: PeerTarget;
}

// Room arayüzü (trystero 0.26)
export interface Room {
  makeAction: {
    <T extends DataPayload = DataPayload>(namespace: string, config?: MessageActionConfig<T>): MessageAction<T>;
    <T extends DataPayload = DataPayload, R extends DataPayload = DataPayload>(
      namespace: string,
      config: RequestActionConfig<T, R>
    ): RequestAction<T, R>;
  };
  ping: (id: string) => Promise<number>;
  leave: () => Promise<void>;
  isPassive: () => boolean;
  getPeers: () => Record<string, RTCPeerConnection>;
  addStream: (stream: MediaStream, options?: AddMediaOptions) => Promise<void>[];
  removeStream: (stream: MediaStream, options?: RemoveMediaOptions) => void;
  addTrack: (track: MediaStreamTrack, stream: MediaStream, options?: AddMediaOptions) => Promise<void>[];
  removeTrack: (track: MediaStreamTrack, options?: RemoveMediaOptions) => void;
  replaceTrack: (oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, options?: AddMediaOptions) => Promise<void>[];
  onPeerJoin: ((peerId: string) => void) | null;
  onPeerLeave: ((peerId: string) => void) | null;
  onPeerStream: ((stream: MediaStream, peerId: string, metadata?: JsonValue) => void) | null;
  onPeerTrack: ((track: MediaStreamTrack, stream: MediaStream, peerId: string, metadata?: JsonValue) => void) | null;
}

// JoinRoom config
export interface BaseRoomConfig {
  appId: string;
  maxReceiveBytes?: number;
  password?: string;
  passive?: boolean;
  relayConfig?: {
    manualReconnection?: boolean;
    warnOnRelayFailure?: boolean;
    urls?: string[];
    redundancy?: number;
  };
  trickleIce?: boolean;
  rtcConfig?: RTCConfiguration;
  rtcPolyfill?: typeof RTCPeerConnection;
  turnConfig?: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
    credentialType?: string;
  }>;
}

// Self ID (trystero'dan export edilir)
export { selfId } from 'trystero/nostr';
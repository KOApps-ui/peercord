/**
 * PeerCord - Ed25519 kimlik yönetimi
 * localStorage'da peercord.identity.v1 saklanır
 */
import { ed25519 } from '@noble/curves/ed25519.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';
import type { UserProfile, ID } from '@/types';

const STORAGE_KEY = 'peercord.identity.v1';

// Ed25519 anahtar çifti arayüzü
export interface Identity {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  name: string;
}

//userId = açık anahtarın ilk 16 hex karakteri
export function getUserId(publicKey: Uint8Array): ID {
  return bytesToHex(publicKey).slice(0, 16);
}

// Avatar seed = userId, accentHue = deterministik
export function generateAccentHue(userId: ID): number {
  // Basit bir hash-to-hue dönüşümü
  let h = 0;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) - h + userId.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(h) % 360;
}

/**
 * Yeni kimlik oluşturur ve localStorage'a kaydeder
 */
export async function createIdentity(name: string = ''): Promise<{
  profile: UserProfile;
  identity: Identity;
}> {
  const secretKey = ed25519.utils.randomSecretKey();
  const publicKey = ed25519.getPublicKey(secretKey);
  const userId = getUserId(publicKey);
  const avatarSeed = userId;
  const accentHue = generateAccentHue(userId);
  
  const finalName = name.trim() || `Gezgin-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  const profile: UserProfile = {
    id: userId,
    name: finalName,
    avatarSeed,
    accentHue,
    status: 'online',
    roleIds: [],
    createdAt: Date.now(),
  };
  
  const identity: Identity = {
    secretKey,
    publicKey,
    name: finalName,
  };
  
  // Otomatik kaydet
  saveIdentity(profile, secretKey, publicKey);
  
  return { profile, identity };
}

/**
 * LocalStorage'dan kimlik yükler
 */
export function loadIdentity(): Identity | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data) as {
      secretKeyHex: string;
      publicKeyHex: string;
      name: string;
    };
    
    return {
      secretKey: hexToBytes(parsed.secretKeyHex),
      publicKey: hexToBytes(parsed.publicKeyHex),
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

/**
 * Kimliği localStorage'a kaydeder
 */
export function saveIdentity(profile: UserProfile, secretKey: Uint8Array, publicKey: Uint8Array): void {
  const data = {
    secretKeyHex: bytesToHex(secretKey),
    publicKeyHex: bytesToHex(publicKey),
    name: profile.name,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * İsim günceller ve localStorage'u günceller
 */
export function updateIdentityName(name: string, secretKey: Uint8Array, publicKey: Uint8Array): UserProfile {
  const userId = getUserId(publicKey);
  const avatarSeed = userId;
  const accentHue = generateAccentHue(userId);
  const profile: UserProfile = {
    id: userId,
    name,
    avatarSeed,
    accentHue,
    status: 'online',
    roleIds: [],
    createdAt: Date.now(),
  };
  saveIdentity(profile, secretKey, publicKey);
  return profile;
}

/**
 * Kimliği kilitle ( secretKey döndür, identity dışarıda sakla )
 */
export function getSecretKey(): Uint8Array | null {
  const identity = loadIdentity();
  return identity?.secretKey ?? null;
}

/**
 * Public key'i al
 */
export function getPublicKey(): Uint8Array | null {
  const identity = loadIdentity();
  return identity?.publicKey ?? null;
}
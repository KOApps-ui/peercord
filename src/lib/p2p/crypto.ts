/**
 * PeerCord - Oda sırrından AES-GCM anahtarı türetme ve şifreleme
 * @noble/ciphers ve @noble/hashes kullan.
 */
import { gcm } from '@noble/ciphers/aes.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { 
  utf8ToBytes, 
  bytesToUtf8, 
  randomBytes, 
  concatBytes, 
  bytesToHex 
} from '@noble/ciphers/utils.js';

// AES-GCM için 12 byte'lık nonce üretir
function generateNonce(): Uint8Array {
  return randomBytes(12);
}

/**
 * Oda sırrından AES-256 anahtarı türetir (sha256)
 * roomSecret → sha256 → 32 byte anahtar
 */
export function deriveKey(roomSecret: string): Uint8Array {
  return sha256(utf8ToBytes(roomSecret));
}

/**
 * AES-GCM ile şifreler
 * Çıktı: base64(nonce || ciphertext || tag)
 * 
 * @param plaintext - Şifrelenecek veri
 * @param roomSecret - Oda sırrı
 * @returns base64 encoded şifreli veri
 */
export function encryptBytes(plaintext: string | Uint8Array, roomSecret: string): string {
  const key = deriveKey(roomSecret);
  const nonce = generateNonce();
  const cipher = gcm(key, nonce);
  
  const pt = typeof plaintext === 'string' ? utf8ToBytes(plaintext) : plaintext;
  const ct = cipher.encrypt(pt);
  
  // nonce (12) + ciphertext + tag birleştir, base64'e dönüştür
  const combined = concatBytes(nonce, ct);
  return btoa(String.fromCharCode(...combined));
}

/**
 * AES-GCM ile çözer
 * 
 * @param encoded - base64 şifreli veri
 * @param roomSecret - Oda sırrı
 * @returns şifresi çözülmüş metin veya null (hata durumunda)
 */
export function decryptBytes(encoded: string, roomSecret: string): string | null {
  try {
    const key = deriveKey(roomSecret);
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    
    // İlk 12 byte nonce, kalan ciphertext+tag
    const nonce = combined.slice(0, 12);
    const ct = combined.slice(12);
    
    const cipher = gcm(key, nonce);
    const pt = cipher.decrypt(ct);
    
    return bytesToUtf8(pt);
  } catch {
    return null; // Şifre hatası - sessizce atla
  }
}

/**
 * Oda kimliği için kısa görsel kod üretir
 * 6 hex karakter (3 byte)
 * 
 * @param roomId - Oda ID'si
 * @returns 6 karakterlik görsel kod
 */
export function roomFingerprint(roomId: string): string {
  const hash = sha256(utf8ToBytes(roomId));
  // İlk 3 byte'ı hex olarak döndür (6 karakter)
  return bytesToHex(hash.slice(0, 3));
}

/**
 * Şifreli payload'ı çözer, JSON.parse sonucunu döndürür
 * 
 * @param encoded - Şifreli base64 veri
 * @param keyHex - AES anahtarı (hex string)
 * @returns çözülmüş obje veya null
 */
export function decryptPayload<T>(encoded: string, keyHex: string): T | null {
  const result = decryptBytes(encoded, keyHex);
  if (!result) return null;
  try {
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}
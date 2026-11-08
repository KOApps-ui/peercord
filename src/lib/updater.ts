/**
 * PeerCord — Güncelleyici (Updater)
 * GitHub Pages üzerinden statik sürüm kontrolü
 */

export interface RemoteVersion {
  version: string;
  buildTime: string;
  notes?: string;
  repoUrl?: string;
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  remoteVersion?: RemoteVersion;
  notes?: string;
}

// Build-defined sabitleri
declare const __COMMIT_SHA__: string;
declare const __BUILD_TIME__: string;

const CURRENT_VERSION = __COMMIT_SHA__ || 'dev';
const VERSION_URL = '/version.json';
const TIMEOUT_MS = 8000;

/**
 * Uzak version.json dosyasını çeker
 */
async function fetchRemoteVersion(): Promise<RemoteVersion | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(VERSION_URL + '?t=' + Date.now(), {
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as RemoteVersion;
    return data;
  } catch (error) {
    // Offline, timeout, 404 - sessiz geç
    console.debug('[PeerCord] Remote version alınamadı:', error);
    return null;
  }
}

/**
 * Güncellemeyi kontrol et
 */
export async function checkForUpdate(): Promise<UpdateInfo> {
  const remote = await fetchRemoteVersion();

  if (!remote) {
    return {
      available: false,
      currentVersion: CURRENT_VERSION,
    };
  }

  const available = remote.version !== CURRENT_VERSION;

  return {
    available,
    currentVersion: CURRENT_VERSION,
    remoteVersion: remote,
    notes: remote.notes,
  };
}

/**
 * Güncellemeyi uygula (service worker skipWaiting + yenile)
 */
export async function applyUpdate(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration) {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });

      // Yeni SW aktive olduğunda hedefe geç
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        location.reload();
      });

      // Zaman aşımı (10 saniye)
      setTimeout(() => {
        if (location.reload) location.reload();
      }, 10000);
    }
  } else {
    // SW yoksa direkt yenile
    location.reload();
  }
}

/**
 * Güncellemeyi poll et
 * @param intervalMs - kontrol aralığı (varsayılan 5 dakika)
 * @returns temizleme fonksiyonu
 */
export function startUpdatePolling(
  onUpdate: (info: UpdateInfo) => void,
  options: { intervalMs?: number; autoUpdate?: boolean } = {}
): () => void {
  const intervalMs = options.intervalMs ?? 5 * 60 * 1000;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function checkAndNotify(): Promise<void> {
    const info = await checkForUpdate();
    if (info.available) {
      onUpdate(info);
    }
  }

  // Sayfa görünür olduğunda kontrol et
  const handleVisibilityChange = (): void => {
    if (!document.hidden) {
      void checkAndNotify();
    }
  };

  // Kullanıcı etkileşimi durumunu izle (autoUpdate için)
  const handleInteraction = (): void => {
    // Etkileşim tespit edildi - timer sıfırlanır
  };

  // Periyodik kontrol
  intervalId = window.setInterval(checkAndNotify, intervalMs);

  // İlk kontrol
  void checkAndNotify();

  // Event listenerlar
  document.addEventListener('visibilitychange', handleVisibilityChange);
  document.addEventListener('click', handleInteraction, { passive: true });
  document.addEventListener('touchstart', handleInteraction, { passive: true });

  // Temizleme fonksiyonu
  return () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
  };
}
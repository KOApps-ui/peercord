/**
 * PeerCord — Updater Hook
 * Güncellemeyi yöneten React hook'u
 */

import { useEffect, useState, useCallback } from 'react';
import { checkForUpdate, applyUpdate, type UpdateInfo, startUpdatePolling } from '@/lib/updater';
import { useSettings } from '@/lib/store';
import { useActions } from '@/lib/store';

export function useUpdater() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const settings = useSettings();
  const pushToast = useActions().pushToast;

  // Auto-update ayarı (Settings'te varsayılan true)
  const autoUpdate: boolean = settings.autoUpdate ?? true;

  // Güncelleme kontrolü
  const handleUpdateAvailable = useCallback((info: UpdateInfo) => {
    setUpdateInfo(info);
    setShowBanner(true);

    // Otomatik güncelleme zamanlayıcısı (30 sn)
    if (autoUpdate) {
      // Bilgi mesajı gönder
      pushToast({
        title: 'Yeni sürüm hazır',
        description: info.remoteVersion?.notes || 'Güncelleme yapılabilir',
        kind: 'info',
      });
    }
  }, [autoUpdate, pushToast]);

  // Polling başlat
  useEffect(() => {
    const cleanup = startUpdatePolling(handleUpdateAvailable, {
      intervalMs: 5 * 60 * 1000, // 5 dakika
      autoUpdate,
    });

    return cleanup;
  }, [handleUpdateAvailable, autoUpdate]);

  // Banner kapatma
  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    setUpdateInfo(null);
  }, []);

  // Güncelleme uygula
  const handleUpdateNow = useCallback(async () => {
    try {
      pushToast({
        title: 'Güncelleniyor...',
        description: 'Uygulama yenileniyor',
        kind: 'info',
      });
      await applyUpdate();
    } catch (error) {
      console.error('[PeerCord] Güncelleme hatası:', error);
      pushToast({
        title: 'Güncelleme başarısız',
        description: 'Lütfen sayfayı yeniden yükleyin',
        kind: 'error',
      });
    }
  }, [pushToast]);

  return {
    updateInfo,
    showBanner,
    dismissBanner,
    checkForUpdate: () => checkForUpdate().then(setUpdateInfo),
    applyUpdate: handleUpdateNow,
  };
}
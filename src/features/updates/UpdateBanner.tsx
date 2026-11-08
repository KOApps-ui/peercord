/**
 * PeerCord — Güncelleme Bildirimi
 * Alt sağda cam efektli bildirim
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, RefreshCw } from 'lucide-react';
import { useUpdater } from './useUpdater';

export function UpdateBanner() {
  const { updateInfo, showBanner, dismissBanner, applyUpdate } = useUpdater();

  // Auto-update countdown
  useEffect(() => {
    if (!updateInfo?.available) return;

    const timer = window.setTimeout(() => {
      void applyUpdate();
    }, 30000);

    return () => clearTimeout(timer);
  }, [updateInfo?.available, applyUpdate]);

  if (!showBanner || !updateInfo?.available) {
    return null;
  }

  const currentVersion = updateInfo.currentVersion || 'local';
  const remoteVersion = updateInfo.remoteVersion?.version || 'yeni';
  const notes = updateInfo.notes || '';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="pc-panel backdrop-blur-sm bg-background/80 border border-accent/20 rounded-xl p-4 shadow-lg">
          {/* Başlık ve kapan butonu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Yeni sürüm hazır
              </h3>
            </div>
            <button
              onClick={dismissBanner}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Versiyon bilgisi */}
          <div className="text-sm text-muted-foreground mb-3">
            v{currentVersion} → v{remoteVersion}
          </div>

          {/* Release notları */}
          {notes && (
            <div className="text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded">
              {notes}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex items-center gap-2">
            <button
              onClick={applyUpdate}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Şimdi güncelle
            </button>
            <button
              onClick={dismissBanner}
              className="flex-1 px-3 py-1.5 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
            >
              Sonra
            </button>
          </div>

          {/* Auto-update sayacı */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Otomatik güncellenmesi 25 saniye kaldı
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
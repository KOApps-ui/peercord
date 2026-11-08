/* ------------------------------------------------------------------ *
 * PeerCord — Onboarding: WelcomeScreen
 * ------------------------------------------------------------------ */
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useActions } from '@/lib/store'
import { Button } from '@/ui/primitives'

export function WelcomeScreen() {
  const { openModal } = useActions()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-6">
      {/* Aurora gradyan arka plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[hsl(var(--pc-accent))] opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[hsl(var(--pc-violet))] opacity-12 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-[hsl(var(--pc-cyan))] opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Animasyonlu PeerCord logosu (SVG) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: mounted ? 1 : 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10"
      >
        <svg
          className="w-24 h-24 mx-auto fill-[hsl(var(--pc-accent))]"
          viewBox="0 0 24 24"
          aria-label="PeerCord logo"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Başlık */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight"
      >
        <span className="bg-gradient-to-r from-[hsl(var(--pc-accent))] to-[hsl(var(--pc-violet))] bg-[length:200%_200%] text-transparent bg-clip-text animate-gradient">
          Sohbet et. Sunucu yok. Kayıt yok.
        </span>
      </motion.h1>

      {/* Açıklama */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-[hsl(var(--pc-text-muted))] mb-10 max-w-md"
      >
        Uçtan uca şifreli mesajlaşma, sunucusuz P2P bağlantısı ve cihazınızdaki verileriniz. Hesap oluşturmanıza gerek yok.
      </motion.p>

      {/* Butonlar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => openModal('create-guild')}
        >
          Sunucu Oluştur
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => openModal('join-guild')}
        >
          Davetle Katıl
        </Button>
      </motion.div>

      {/* Özellik kartları */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-12"
      >
        {/* E2E Şifreli */}
        <div className="group pc-glass-strong rounded-2xl p-6 text-center border border-[hsl(var(--pc-border-soft))] hover:shadow-[0_8px_32px_hsl(var(--pc-accent)/0.15)] transition-all duration-300">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <svg className="w-10 h-10 mx-auto mb-4 text-[hsl(var(--pc-accent))]" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </motion.div>
          <h3 className="font-semibold text-[hsl(var(--pc-text))] mb-2">
            Uçtan uca şifreli
          </h3>
          <p className="text-sm text-[hsl(var(--pc-text-muted))]">
            Tüm mesajlar ve dosyalar şifrelenir, sadece katılımcılar erişebilir.
          </p>
        </div>

        {/* Sunorusuz P2P */}
        <div className="group pc-glass-strong rounded-2xl p-6 text-center border border-[hsl(var(--pc-border-soft))] hover:shadow-[0_8px_32px_hsl(var(--pc-accent)/0.15)] transition-all duration-300">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.65 }}
          >
            <svg className="w-10 h-10 mx-auto mb-4 text-[hsl(var(--pc-cyan))]" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <circle cx="5.5" cy="12" r="1.5" />
              <circle cx="18.5" cy="12" r="1.5" />
              <path d="M5.5 12v6a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <h3 className="font-semibold text-[hsl(var(--pc-text))] mb-2">
            Sunucusuz P2P
          </h3>
          <p className="text-sm text-[hsl(var(--pc-text-muted))]">
            Bağlantı doğrudan cihazlarınız arasında, hiçbir merkezi sunucu geçmez.
          </p>
        </div>

        {/* Cihazda Veri */}
        <div className="group pc-glass-strong rounded-2xl p-6 text-center border border-[hsl(var(--pc-border-soft))] hover:shadow-[0_8px_32px_hsl(var(--pc-accent)/0.15)] transition-all duration-300">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <svg className="w-10 h-10 mx-auto mb-4 text-[hsl(var(--pc-cyan))]" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M7 16v-8a5 5 0 0 1 10 0v8a5 5 0 0 1-10 0z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.div>
          <h3 className="font-semibold text-[hsl(var(--pc-text))] mb-2">
            Cihazda Veri
          </h3>
          <p className="text-sm text-[hsl(var(--pc-text-muted))]">
            Verileriniz asla bulutda depolanmaz, sadece cihazınızda şifreli saklanır.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
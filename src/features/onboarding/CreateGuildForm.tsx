/* ------------------------------------------------------------------ *
 * PeerCord — Onboarding: CreateGuildForm
 * ------------------------------------------------------------------ */
import { useState } from 'react'
import { motion } from 'motion/react'
import { useActions } from '@/lib/store'
import { Button, Input, Switch } from '@/ui/primitives'

export function CreateGuildForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [encrypted, setEncrypted] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { createGuild, pushToast, closeModal } = useActions()

  const handleCreate = async () => {
    // Doğrulama
    if (name.length < 2 || name.length > 32) {
      pushToast({
        kind: 'error',
        title: 'Geçersiz ad',
        description: 'Sunucu adı 2 ile 32 karakter arasında olmalıdır.',
        duration: 3000,
      })
      return
    }

    if (encrypted && password.length < 6) {
      pushToast({
        kind: 'error',
        title: 'Geçersiz şifre',
        description: 'Şifreli oda için parola en az 6 karakter olmalıdır.',
        duration: 3000,
      })
      return
    }

    try {
      await createGuild({
        name,
        encrypted,
        secret: encrypted ? password : undefined,
      })
      // Modal kapat ve URL güncelle (createGuild içinde yapılır)
      closeModal()
      pushToast({
        kind: 'success',
        title: 'Sunucu oluşturuldu',
        description: encrypted ? 'Şifreli oda oluşturuldu. Davet linkini paylaşın.' : 'Yeni sunucunuz hazır.',
        duration: 3000,
      })
    } catch (err) {
      pushToast({
        kind: 'error',
        title: 'Hata',
        description: err instanceof Error ? err.message : 'Sunucu oluşturulurken hata oluştu.',
        duration: 3000,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Sunucu adı */}
      <div>
        <Input
          label="Sunucu adı"
          placeholder="Örn: Arkadaşlarım"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
        />
      </div>

      {/* Açıklama */}
      <div>
        <Input
          label="Açıklama (opsiyonel)"
          placeholder="Sunucunuzu tanıtın..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Şifreli oda switch'i */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--pc-text))]">
              Uçtan uca şifreli oda
            </label>
            <p className="text-xs text-[hsl(var(--pc-text-muted))]">
              Sadece şifre bilenler katılabilir
            </p>
          </div>
          <Switch
            checked={encrypted}
            onCheckedChange={setEncrypted}
          />
        </div>

        {/* Parola girdisi - sadece şifreli oda aktifse */}
        {encrypted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Input
              label="Oda parolası"
              placeholder="En az 6 karakter"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-text))] transition-colors"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? '👁‍🗨' : '👁'}
                </button>
              }
            />
          </motion.div>
        )}
      </div>

      {/* Oluştur butonu */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleCreate}
        disabled={name.length < 2 || name.length > 32 || (encrypted && password.length < 6)}
      >
        {name.length >= 2 && name.length <= 32
          ? 'Sunucu Oluştur'
          : 'Geçersiz sunucu adı'}
      </Button>

      {/* Mini preview */}
      {name.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[hsl(var(--pc-surface-hover))] border border-[hsl(var(--pc-border-soft))] text-center"
        >
          <p className="text-xs text-[hsl(var(--pc-text-muted))] mb-1">Ön izleme</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--pc-accent))] flex items-center justify-center text-[hsl(var(--pc-accent-text))] font-bold">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-medium text-[hsl(var(--pc-text))]">{name}</p>
              {encrypted && (
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-[hsl(var(--pc-warning))]">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Şifreli
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
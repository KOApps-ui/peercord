/* ------------------------------------------------------------------ *
 * PeerCord — Onboarding: JoinGuildForm
 * ------------------------------------------------------------------ */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useActions } from '@/lib/store'
import { Button, Input } from '@/ui/primitives'

export function JoinGuildForm() {
  const [invite, setInvite] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { joinGuild, pushToast } = useActions()

  // Davet kodunu temizle ve parse et
  const normalizeInvite = (input: string): string => {
    // #/oda/kod formatından çıkar
    // https://peer.gg/oda/kod veya peer.gg/kod formatları
    const patterns = [
      /#/g,
      /peer\.gg\//g,
      /peer\.link\//g,
    ]
    let normalized = input
    for (const pattern of patterns) {
      normalized = normalized.replace(pattern, '')
    }
    return normalized.trim()
  }

  const handleInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInvite(value)
    setError(null)
  }

  const handleJoin = async () => {
    setError(null)
    const normalizedInvite = normalizeInvite(invite)

    // Doğrulama
    if (!/^[a-zA-Z0-9_-]{5,32}$/.test(normalizedInvite)) {
      setError('Geçersiz davet kodu. 5 ile 32 karakter arasında bir kod gerekir.')
      return
    }

    try {
      await joinGuild({
        invite: normalizedInvite,
        name: displayName || undefined,
        secret: password || undefined,
      })
      pushToast({
        kind: 'success',
        title: 'Odaya katıldınız',
        description: 'Sunucuya başarıyla katıldınız.',
        duration: 2000,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Odaya katılırken hata oluştu.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Davet kodu / linki */}
      <div>
        <Input
          label="Davet kodu veya link"
          placeholder="#/oda/kod veya peer.gg/kod"
          value={invite}
          onChange={handleInviteChange}
        />
        {!/^[a-zA-Z0-9_-]{5,32}$/.test(invite) && invite.length > 0 && (
          <p className="text-xs text-[hsl(var(--pc-text-muted))] mt-1">
            Geçerli bir davet kodu girin (örnek: abc123)
          </p>
        )}
      </div>

      {/* Görünen ad */}
      <div>
        <Input
          label="Görünen ad (isteğe bağlı)"
          placeholder="Gösterilecek adınız"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      {/* Parola (şifreli odada) */}
      <div>
        <Input
          label="Parola (şifreli oda için)"
          placeholder="Oda parolası"
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
      </div>

      {/* Katılma butonu */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleJoin}
        disabled={!/^[a-zA-Z0-9_-]{5,32}$/.test(normalizeInvite(invite))}
      >
        Odaya Katıl
      </Button>

      {/* Hata mesajı */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-[hsl(var(--pc-danger))/0.15] border border-[hsl(var(--pc-danger))/0.3] text-sm text-[hsl(var(--pc-danger))]"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
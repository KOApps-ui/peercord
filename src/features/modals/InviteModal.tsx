/* ------------------------------------------------------------------ *
 * PeerCord — Modals: InviteModal
 * ------------------------------------------------------------------ */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Modal } from '@/ui/primitives'
import { Button } from '@/ui/primitives/Button'
import { useActions, useAppStore } from '@/lib/store'
import { copyToClipboard } from '@/lib/utils'

export function InviteModal() {
  const { closeModal, inviteLink, pushToast } = useActions()
  const { guild } = useAppStore()
  const [copied, setCopied] = useState(false)

  const link = guild?.inviteSecret ? `#/oda/${guild.inviteSecret}` : inviteLink()

  const handleCopy = async () => {
    const success = await copyToClipboard(link)
    if (success) {
      setCopied(true)
      pushToast({
        kind: 'success',
        title: 'Kopyalandı',
        description: 'Davet linki panellene kopyalandı',
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Davet Linki"
      description="Sunucunuza davet etmek için bu linki paylaşın"
      size="sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4"
      >
        {/* Davet linki */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))]">
            Davet linki
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] text-ellipsis"
              aria-label="davet linki"
            />
            <Button
              size="sm"
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopy}
              fullWidth={false}
            >
              {copied ? 'Kopyalandı' : 'Kopyala'}
            </Button>
          </div>
        </div>

        {/* Şifreli uyarısı */}
        <AnimatePresence>
          {guild?.encrypted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-[hsl(var(--pc-warning))/0.15] border border-[hsl(var(--pc-warning))/0.3]"
            >
              <svg className="w-5 h-5 text-[hsl(var(--pc-warning))] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--pc-text))]">
                  Bu oda şifrelidir
                </p>
                <p className="text-xs text-[hsl(var(--pc-text-muted))] mt-0.5">
                  Katılmak için oda sırrını gerekli söz aktarmak zorundadır. Şifreli odalar her mesajı şifreler.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kapat butonu */}
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={() => closeModal()}
            fullWidth
          >
            Kapal
          </Button>
        </div>
      </motion.div>
    </Modal>
  )
}
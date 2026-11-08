/* ------------------------------------------------------------------ *
 * PeerCord — Modals: CreateGuildModal
 * ------------------------------------------------------------------ */
import { motion } from 'motion/react'
import { Modal } from '@/ui/primitives'
import { CreateGuildForm } from '@/features/onboarding'
import { useActions } from '@/lib/store'

export function CreateGuildModal() {
  const { closeModal } = useActions()

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Yeni Sunucu Oluştur"
      description="Yeni bir PeerCord odası oluşturun"
      size="md"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <CreateGuildForm />
      </motion.div>
    </Modal>
  )
}
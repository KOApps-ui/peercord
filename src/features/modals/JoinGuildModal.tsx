/* ------------------------------------------------------------------ *
 * PeerCord — Modals: JoinGuildModal
 * ------------------------------------------------------------------ */
import { motion } from 'motion/react'
import { Modal } from '@/ui/primitives'
import { JoinGuildForm } from '@/features/onboarding'
import { useActions } from '@/lib/store'

export function JoinGuildModal() {
  const { closeModal } = useActions()

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Oda'a Katıl"
      description="Davet kodu veya linki kullanarak odaya katılın"
      size="md"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <JoinGuildForm />
      </motion.div>
    </Modal>
  )
}
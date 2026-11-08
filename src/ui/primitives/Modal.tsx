import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  icon?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  children: ReactNode
}

function modalMaxWidth(size: ModalSize) {
  switch (size) {
    case 'sm':
      return 'max-w-sm'
    case 'lg':
      return 'max-w-lg'
    case 'xl':
      return 'max-w-xl'
    default:
      return 'max-w-md'
  }
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  footer,
  size = 'md',
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className={cn(
            'fixed inset-0 z-40 bg-[hsl(var(--pc-bg-deep))/0.6] backdrop-blur-sm',
            'pc-scroll-fade'
          )}
        />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            >
              <DialogContent
                className={cn(
                  'pc-panel rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border-soft))] shadow-float',
                  modalMaxWidth(size),
                  'flex flex-col'
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-lg)] pc-accent-gradient" />
                <div className="flex flex-col gap-1 p-6 pt-[calc(6px+1rem)]">
                  {icon && <div className="flex shrink-0 mb-1">{icon}</div>}
                  {title && <DialogTitle className="text-lg font-semibold text-[hsl(var(--pc-text))]">{title}</DialogTitle>}
                  {description && (
                    <DialogDescription className="text-sm text-[hsl(var(--pc-text-muted))] leading-relaxed">
                      {description}
                    </DialogDescription>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
                {footer && <div className="flex items-center gap-2 p-6 border-t border-[hsl(var(--pc-border-soft))]">{footer}</div>}
                <DialogClose
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))] transition-colors duration-150"
                  aria-label="Kapat"
                >
                  ✕
                </DialogClose>
              </DialogContent>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogPortal>
    </Dialog>
  )
}

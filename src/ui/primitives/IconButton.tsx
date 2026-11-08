import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonVariant = 'ghost' | 'accent' | 'danger'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  size?: IconButtonSize
  variant?: IconButtonVariant
  active?: boolean
  tooltip?: string
  children: ReactNode
}

function iconButtonSize(size: IconButtonSize) {
  switch (size) {
    case 'sm':
      return 'p-1'
    case 'lg':
      return 'p-3'
    default:
      return 'p-2'
  }
}

export function IconButton({
  className,
  'aria-label': ariaLabel,
  size = 'md',
  variant = 'ghost',
  active = false,
  tooltip,
  children,
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      aria-label={ariaLabel}
      title={tooltip}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] text-[hsl(var(--pc-text-muted))] transition-colors duration-150',
        variant === 'ghost' &&
          'hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))]',
        variant === 'accent' &&
          'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent))] hover:bg-[hsl(var(--pc-accent-soft))]/80',
        variant === 'danger' &&
          'text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger))/10]',
        active &&
          'bg-[hsl(var(--pc-accent-soft))] text-[hsl(var(--pc-accent))]',
        iconButtonSize(size),
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}

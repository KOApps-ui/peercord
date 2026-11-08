import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

function buttonVariant(variant: ButtonVariant) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors duration-150 border border-transparent disabled:opacity-60 disabled:pointer-events-none'

  switch (variant) {
    case 'primary':
      return `${base} pc-accent-gradient text-[hsl(var(--pc-accent-text))] hover:brightness-110 shadow-[0_0_20px_hsl(var(--pc-accent)/0.35)]`
    case 'secondary':
      return `${base} bg-[hsl(var(--pc-surface-raised))] text-[hsl(var(--pc-text))] border-[hsl(var(--pc-border-soft))] hover:bg-[hsl(var(--pc-surface-hover))]`
    case 'ghost':
      return `${base} bg-transparent text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))]`
    case 'danger':
      return `${base} bg-[hsl(var(--pc-danger))] text-white hover:bg-[hsl(358,82%,50%)]`
    case 'success':
      return `${base} bg-[hsl(var(--pc-success))] text-white hover:bg-[hsl(152,62%,40%)]`
    case 'link':
      return `${base} bg-transparent text-[hsl(var(--pc-accent))] underline-offset-4 hover:underline`
  }
}

function buttonSize(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return 'px-3 py-1.5 text-sm gap-1.5'
    case 'md':
      return 'px-4 py-2 text-sm'
    case 'lg':
      return 'px-6 py-3 text-base'
  }
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={loading ? undefined : { scale: 0.97 }}
      className={cn(buttonVariant(variant), buttonSize(size), fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-current border-r-transparent animate-spin" style={{ width: 16, height: 16 }} />
      ) : (
        <>
          {leftIcon && <span className="flex shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}

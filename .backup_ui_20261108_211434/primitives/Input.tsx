import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightSlot?: React.ReactNode
}

export function Input({
  className,
  label,
  hint,
  error,
  leftIcon,
  rightSlot,
  id,
  ...props
}: InputProps) {
  const inputId = id || React.useId()
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-[hsl(var(--pc-text-muted))] leading-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--pc-text-subtle))] pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'flex w-full items-center rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] transition-colors duration-150 placeholder-[hsl(var(--pc-text-subtle))]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9] focus-visible:border-transparent',
            leftIcon && 'pl-9',
            rightSlot && 'pr-9',
            error && 'border-[hsl(var(--pc-danger))] focus-visible:ring-[hsl(var(--pc-danger))/0.9]',
            className
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[hsl(var(--pc-text-subtle))]">
            {rightSlot}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-[hsl(var(--pc-danger))] leading-none">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--pc-text-subtle))] leading-none">{hint}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  autoGrow?: boolean
}

export function Textarea({
  className,
  label,
  hint,
  error,
  leftIcon,
  autoGrow = false,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || React.useId()
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-[hsl(var(--pc-text-muted))] leading-none"
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        {leftIcon && (
          <span className="absolute left-3 top-2 text-[hsl(var(--pc-text-subtle))] pointer-events-none">
            {leftIcon}
          </span>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'resizable-none rounded-[var(--radius-md)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-3 py-2.5 text-sm text-[hsl(var(--pc-text))] transition-colors duration-150 placeholder-[hsl(var(--pc-text-subtle))]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9] focus-visible:border-transparent',
            leftIcon && 'pl-9',
            autoGrow && 'min-h-[64px]',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-[hsl(var(--pc-danger))] leading-none">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--pc-text-subtle))] leading-none">{hint}</p>
      )}
    </div>
  )
}

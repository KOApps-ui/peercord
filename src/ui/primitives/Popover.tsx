import type { ReactNode, ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react'
import {
  Popover as RadixPopover,
  PopoverTrigger as RadixPopoverTrigger,
  PopoverContent as RadixPopoverContent,
} from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

export type { PopoverContentProps } from '@radix-ui/react-popover'

export interface PopoverProps {
  children: ReactNode
}

export function Popover({ children }: PopoverProps) {
  return <RadixPopover>{children}</RadixPopover>
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function PopoverTrigger({ children, ...props }: PopoverTriggerProps) {
  return (
    <RadixPopoverTrigger asChild>
      <button type="button" className="inline-flex items-center justify-center rounded-[var(--radius-md)] p-2 text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))] transition-colors duration-150" {...props}>
        {children}
      </button>
    </RadixPopoverTrigger>
  )
}

export function PopoverContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  ...props
}: ComponentPropsWithoutRef<typeof RadixPopoverContent> & { className?: string }) {
  return (
    <RadixPopoverContent
      side={side}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'pc-panel rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border-soft))] shadow-float p-2',
        'outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]',
        className
      )}
      {...props}
    />
  )
}

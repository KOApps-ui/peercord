import type { ButtonHTMLAttributes, ReactNode, PropsWithChildren, ComponentPropsWithoutRef } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { cn } from '@/lib/utils'

export interface MenuProps {
  children: ReactNode
}

export function Menu({ children }: MenuProps) {
  return <DropdownMenu>{children}</DropdownMenu>
}

export interface MenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  asChild?: boolean
}

export function MenuTrigger({ children, asChild = false, ...props }: MenuTriggerProps) {
  if (asChild) {
    return <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
  }
  return (
    <DropdownMenuTrigger asChild>
      <button type="button" className="inline-flex items-center justify-center rounded-[var(--radius-md)] p-2 text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))] transition-colors duration-150" {...props}>
        {children}
      </button>
    </DropdownMenuTrigger>
  )
}

export interface MenuItemProps {
  icon?: ReactNode
  danger?: boolean
  shortcut?: string
  children: ReactNode
  className?: string
  onSelect?: () => void
}

export function MenuItem({
  icon,
  danger = false,
  shortcut,
  children,
  className,
  onSelect,
  ...props
}: PropsWithChildren<MenuItemProps> & Omit<ComponentPropsWithoutRef<typeof DropdownMenuItem>, 'onSelect'>) {
  return (
    <DropdownMenuItem
      className={cn(
        'relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[hsl(var(--pc-text))] transition-colors duration-150',
        danger && 'text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger))/0.1]',
        !danger && 'text-[hsl(var(--pc-text-muted))] hover:bg-[hsl(var(--pc-surface-hover))] hover:text-[hsl(var(--pc-text))]',
        className
      )}
      onSelect={onSelect}
      {...props}
    >
      {icon && <span className="flex shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto flex items-center gap-1 px-1 py-0.5 rounded-[var(--radius-xs)] bg-[hsl(var(--pc-border))] text-[10px] font-medium text-[hsl(var(--pc-text-subtle))]">
          <Kbd>{shortcut}</Kbd>
        </span>
      )}
    </DropdownMenuItem>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-xs)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--pc-text-muted))]">
      {children}
    </span>
  )
}

export function MenuSeparator({ className }: { className?: string } = {}) {
  return (
    <DropdownMenuSeparator
      className={cn('border-[hsl(var(--pc-border))] my-2 h-[1px]', className)}
    />
  )
}

export function MenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DropdownMenuLabel
      className={cn('px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--pc-text-subtle))]', className)}
    >
      {children}
    </DropdownMenuLabel>
  )
}

export const MenuContent = DropdownMenuContent

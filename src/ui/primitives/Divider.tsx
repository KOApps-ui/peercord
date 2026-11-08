import { cn } from '@/lib/utils'

export interface DividerProps {
  label?: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Divider({
  label,
  className,
  orientation = 'horizontal',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('flex shrink-0', className)}>
        <div className="h-4 w-px border-[hsl(var(--pc-border))]" />
      </div>
    )
  }

  return (
    <div className={cn('relative flex w-full items-center gap-2', className)}>
      <div className="flex-1 border-[hsl(var(--pc-border))]" />
      {label && (
        <span className="px-2 text-xs whitespace-nowrap text-[hsl(var(--pc-text-subtle))]">
          {label}
        </span>
      )}
      <div className="flex-1 border-[hsl(var(--pc-border))]" />
    </div>
  )
}

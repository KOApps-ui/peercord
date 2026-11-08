import { cn } from '@/lib/utils'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const RADIUS: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-[var(--radius-xs)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  full: 'rounded-full',
}

export function Skeleton({
  className,
  width = '100%',
  height = '16px',
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden animate-pulse bg-[hsl(var(--pc-surface-hover))]',
        RADIUS[rounded],
        className
      )}
      style={{ width, height }}
    >
      <div
        className="absolute inset-0 h-full w-full bg-[linear-gradient(90deg,hsl(var(--pc-surface-hover))_25%,hsl(var(--pc-border))_50%,hsl(var(--pc-surface-hover))_75%)] bg-[length:200%_100%] animate-[pc-shimmer_2s_ease-in-out_infinite]"
      />
    </div>
  )
}

export interface SkeletonTextProps {
  className?: string
  lines?: number
  lineWidth?: string
  lineHeight?: string
}

export function SkeletonText({
  className,
  lines = 3,
  lineWidth = '100%',
  lineHeight = '1.25rem',
}: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : lineWidth}
          height={lineHeight}
          rounded="md"
        />
      ))}
    </div>
  )
}

export interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizes = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-8 w-8' }
  return (
    <div
      className={cn(
        'flex shrink-0 rounded-full border-[hsl(var(--pc-border))] border-t-[hsl(var(--pc-accent))] animate-[spin_1s_linear_infinite]',
        sizes[size],
        className
      )}
    />
  )
}

export interface TypingDotsProps {
  className?: string
}

export function TypingDots({ className }: TypingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex shrink-0 h-1.5 w-1.5 rounded-full bg-[hsl(var(--pc-text-muted))] animate-[pc-typing_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

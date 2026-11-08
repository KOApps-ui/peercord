import * as React from 'react'
import {
  ScrollArea as RadixScrollArea,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

type Orientation = 'vertical' | 'horizontal'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
  orientation?: Orientation
  hideScrollbar?: boolean
}

export function ScrollArea({
  children,
  className,
  orientation = 'vertical',
  hideScrollbar = false,
  ...props
}: ScrollAreaProps) {
  return (
    <RadixScrollArea.Root
      dir={orientation === 'horizontal' ? 'ltr' : undefined}
      className={cn(
        'relative rounded-[var(--radius-md)] overflow-hidden bg-[hsl(var(--pc-surface))]',
        hideScrollbar && 'pc-hide-scrollbar',
        className
      )}
      {...props}
    >
      <RadixScrollArea.Viewport
        className={cn(
          'pc-scroll-fade',
          orientation === 'horizontal' ? 'mask-none' : ''
        )}
      >
        {children}
      </RadixScrollArea.Viewport>
      {!hideScrollbar && (
        <RadixScrollArea.Scrollbar
          className={cn(
            'flex touch-none select-none transition-colors',
            orientation === 'vertical' ? 'h-full w-2' : 'w-full h-2'
          )}
          orientation={orientation}
        >
          <RadixScrollArea.Thumb
            className={cn(
              'rounded-full border border-transparent bg-[hsl(var(--pc-border))] hover:bg-[hsl(var(--pc-border-soft))]',
              orientation === 'vertical' ? 'w-full mx-0.5' : 'h-full my-0.5'
            )}
          />
        </RadixScrollArea.Scrollbar>
      )}
    </RadixScrollArea.Root>
  )
}

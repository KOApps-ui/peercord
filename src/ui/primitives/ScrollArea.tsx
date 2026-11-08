import type { ReactNode } from 'react'
import {
  ScrollArea as ScrollAreaRoot,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from '@radix-ui/react-scroll-area'
import { cn } from '@/lib/utils'

type Orientation = 'vertical' | 'horizontal'

export interface ScrollAreaProps {
  children: ReactNode
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
    <ScrollAreaRoot
      dir={orientation === 'horizontal' ? 'ltr' : undefined}
      className={cn(
        'relative rounded-[var(--radius-md)] overflow-hidden bg-[hsl(var(--pc-surface))]',
        hideScrollbar && 'pc-hide-scrollbar',
        className
      )}
      {...props}
    >
      <ScrollAreaContent
        className={cn(
          'pc-scroll-fade',
          orientation === 'horizontal' ? 'mask-none' : ''
        )}
      >
        {children}
      </ScrollAreaContent>
      {!hideScrollbar && (
        <ScrollAreaScrollbar
          className={cn(
            'flex touch-none select-none transition-colors',
            orientation === 'vertical' ? 'h-full w-2' : 'w-full h-2'
          )}
          orientation={orientation}
        >
          <ScrollAreaThumb
            className={cn(
              'rounded-full border border-transparent bg-[hsl(var(--pc-border))] hover:bg-[hsl(var(--pc-border-soft))]',
              orientation === 'vertical' ? 'w-full mx-0.5' : 'h-full my-0.5'
            )}
          />
        </ScrollAreaScrollbar>
      )}
    </ScrollAreaRoot>
  )
}

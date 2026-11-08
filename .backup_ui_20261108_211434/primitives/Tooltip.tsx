import * as React from 'react'
import {
  Tooltip as RadixTooltip,
  TooltipProvider as RadixTooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

interface TooltipProps {
  label: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  children: React.ReactNode
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltipProvider>{children}</RadixTooltipProvider>
}

export function Tooltip({
  label,
  side = 'top',
  delay,
  children,
}: TooltipProps) {
  return (
    <RadixTooltip.Root delay={delay}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className="pc-tooltip-content" forceMount={true}>
        <span className="text-xs text-[hsl(var(--pc-text-inverse))]">{label}</span>
      </TooltipContent>
    </RadixTooltip.Root>
  )
}

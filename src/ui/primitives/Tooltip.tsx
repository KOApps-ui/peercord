import type { ReactNode } from 'react'
import {
  Tooltip as RadixTooltipRoot,
  TooltipProvider as RadixTooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip'

export interface TooltipProps {
  label: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  children: ReactNode
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltipProvider>{children}</RadixTooltipProvider>
}

export function Tooltip({
  label,
  side = 'top',
  delay,
  children,
}: TooltipProps) {
  return (
    <RadixTooltipRoot {...(delay != null ? { delay } : {})}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="pc-tooltip-content">
        <span className="text-xs text-[hsl(var(--pc-text-inverse))]">{label}</span>
      </TooltipContent>
    </RadixTooltipRoot>
  )
}

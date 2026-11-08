import * as React from 'react'
import { Switch as RadixSwitch, SwitchThumb } from '@radix-ui/react-switch'
import { Slider as RadixSlider } from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
  className?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  className,
}: SwitchProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <RadixSwitch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] transition-colors duration-150',
          checked &&
            'border-[hsl(var(--pc-accent))] bg-[hsl(var(--pc-accent))]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]',
          'disabled:opacity-60 disabled:pointer-events-none'
        )}
      >
        <SwitchThumb
          className={cn(
            'block h-3 w-3 rounded-full bg-white shadow-[0_2px_2px_hsl(0,0,0,0.25)] transition-transform duration-150',
            checked && 'translate-x-4'
          )}
        />
      </RadixSwitch>
      {label && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-[hsl(var(--pc-text))]">{label}</span>
          {description && (
            <span className="text-xs text-[hsl(var(--pc-text-muted))]">{description}</span>
          )}
        </div>
      )}
    </div>
  )
}

interface SliderProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  formatValue?: (value: number) => string
  className?: string
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue,
  className,
}: SliderProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-[hsl(var(--pc-text-muted))]">{label}</span>
          <span className="text-xs text-[hsl(var(--pc-text-subtle))]">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      )}
      <RadixSlider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className={cn(
          'relative flex w-full touch-none select-none items-center rounded-full h-2 bg-[hsl(var(--pc-border))]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--pc-accent))/0.9]'
        )}
      >
        <RadixSlider.Track className="relative h-full w-full overflow-hidden rounded-full bg-[hsl(var(--pc-border))]">
          <RadixSlider.Range className="relative h-full bg-[hsl(var(--pc-accent))]" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--pc-accent))] ring-1 ring-white shadow-[0_1px_3px_hsl(0,0,0,0.3)] transition-transform duration-150" />
      </RadixSlider>
    </div>
  )
}

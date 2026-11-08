import { formatDayLabel } from '@/lib/utils'

export function DateDivider({ timestamp }: { timestamp: number }) {
  const day = formatDayLabel(timestamp)

  return (
    <div
      className="pc-scroll-fade pt-2 pb-1 text-sm text-muted-foreground border-t border-border-soft"
    >
      {day}
    </div>
  )
}
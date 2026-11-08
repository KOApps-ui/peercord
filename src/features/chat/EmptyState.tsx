export function EmptyState({
  title = 'Mesaj yok',
  description = 'Mesajlar burada görünecektir.',
  actionLabel,
  onAction,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <svg className="h-12 w-12 shrink-0 text-[hsl(var(--pc-text-subtle))] opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <h3 className="text-lg font-medium text-[hsl(var(--pc-text))]">{title}</h3>
      <p className="text-sm text-[hsl(var(--pc-text-muted))] text-center">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-sm font-medium text-[hsl(var(--pc-accent))] bg-[hsl(var(--pc-accent-soft))] hover:bg-[hsl(var(--pc-accent-soft))]/80 transition-colors duration-150"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

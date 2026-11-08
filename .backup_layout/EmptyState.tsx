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
      <svg className="h-12 w-12 text-muted-foreground opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="pc-focus-ring btn btn-ghost text-accent"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
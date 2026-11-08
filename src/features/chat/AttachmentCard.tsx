import { Button } from '@/ui/primitives'
import { formatBytes } from '@/lib/utils'
import type { Attachment } from '@/types'

export function AttachmentCard({
  attachment,
  canCancel,
}: {
  attachment: Attachment
  canCancel?: boolean
}) {
  const isImage = attachment.mime.startsWith('image/')
  const isVideo = attachment.mime.startsWith('video/')

  if (isImage || isVideo) {
    return ImageAttachmentCard({ attachment })
  }

  return FileAttachmentCard({ attachment, canCancel })
}

function ImageAttachmentCard({
  attachment,
}: {
  attachment: Attachment
}) {
  const url = attachment.url

  return (
    <div className="pc-scroll-fade rounded-md overflow-hidden group">
      {attachment.transfer && attachment.transfer.status === 'transferring'
        ? (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-xs text-foreground">
              {attachment.transfer.progress.toFixed(0)}%
            </div>
          )
          : null}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block w-full"
      >
        {attachment.width && attachment.height ? (
          <img
            src={url}
            alt={attachment.name}
            className="w-full h-[180px] object-cover transition-opacity duration-300 group-hover:opacity-90"
            style={{ width: attachment.width, height: attachment.height }}
          />
        ) : (
          <div
            className="w-full h-[180px] bg-surface/50 flex items-center justify-center text-muted-foreground"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="ml-1">Dosya</span>
          </div>
        )}
      </a>
    </div>
  )
}

function FileAttachmentCard({
  attachment,
  canCancel,
}: {
  attachment: Attachment
  canCancel?: boolean
}) {
  const sizeText = attachment.size
    ? formatBytes(attachment.size)
    : 'Bilginiz yok'

  return (
    <div className="pc-scroll-fade rounded-md border p-2 flex items-center gap-2">
      <div className="w-8 h-8 rounded-md bg-surface flex items-center justify-center flex-shrink-0">
        <svg
          className="h-4 w-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{attachment.name}</div>
        <div className="text-[var(--pc-text-muted)] text-xs">{sizeText}</div>
      </div>
      {canCancel && (
        <Button
          variant="ghost"
          size="sm"
          aria-label="İptal"
          className="pc-focus-rounded p-1"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      )}
    </div>
  )
}
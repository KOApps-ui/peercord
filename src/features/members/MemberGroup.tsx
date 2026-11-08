/* ------------------------------------------------------------------ *
 * PeerCord — Members: MemberGroup
 * Rol / presence durumuna göre grup başlığı ("Yönetici — 2",
 * "Çevrimiçi — 5", "Çevrimdışı — 3"). Katlanabilir, çocukları
 * kademeli (stagger) giriş animasyonuyla listeler.
 * ------------------------------------------------------------------ */
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MemberGroupProps {
  /** Grup etiketi — ör. "Yönetici", "Çevrimiçi", "Çevrimdışı" */
  label: string
  /** Gruptaki üye sayısı (başlıkta "— N" olarak görünür) */
  count: number
  /** Başlangıçta açık mı */
  defaultOpen?: boolean
  /** Katlanabilir olsun mu */
  collapsible?: boolean
  /** Etiket rengi (rol hue'u için) */
  labelColor?: string
  className?: string
  children: ReactNode
}

const EASE = [0.16, 1, 0.3, 1] as const

export function MemberGroup({
  label,
  count,
  defaultOpen = true,
  collapsible = true,
  labelColor,
  className,
  children,
}: MemberGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  const Chevron = open ? ChevronDown : ChevronRight

  const header = (
    <span className="flex min-w-0 flex-1 items-center gap-1.5">
      {collapsible && (
        <Chevron
          size={12}
          aria-hidden="true"
          className="shrink-0 text-[hsl(var(--pc-text-subtle))] transition-transform duration-150"
        />
      )}
      <span
        className="truncate text-[11px] font-semibold uppercase tracking-wider"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
      </span>
      <span className="shrink-0 text-[11px] font-medium tabular-nums text-[hsl(var(--pc-text-subtle))]">
        — {count}
      </span>
    </span>
  )

  return (
    <section className={cn('flex flex-col', className)} aria-label={`Üye grubu: ${label}`}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            'pc-focus-ring flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1.5 text-left',
            'transition-colors duration-150 hover:bg-[hsl(var(--pc-surface-hover))]'
          )}
        >
          {header}
        </button>
      ) : (
        <div className="flex items-center px-2 py-1.5">{header}</div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="members"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="m-0 flex list-none flex-col gap-0.5 overflow-hidden p-0 pl-1"
          >
            {Array.isArray(children)
              ? children.map((child, i) => (
                  <motion.li
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.16, ease: EASE, delay: Math.min(i * 0.025, 0.3) }}
                  >
                    {child}
                  </motion.li>
                ))
              : (
                  <motion.li
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.16, ease: EASE }}
                  >
                    {children}
                  </motion.li>
                )}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}

import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { useAppStore, useActions } from '@/lib/store'
import { ServerRail } from './ServerRail'
import { ChannelSidebar } from './ChannelSidebar'
import { ChannelHeader } from './ChannelHeader'
import { MemberSidebar } from './MemberSidebar'
import { UserPanel } from './UserPanel'

export interface AppShellProps {
  sidebar?: ReactNode
  header?: ReactNode
  children?: ReactNode
  members?: ReactNode
}

export function AppShell({
  sidebar,
  header,
  children,
  members,
}: AppShellProps): ReactNode {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const membersOpen = useAppStore((s) => s.membersOpen)
  const { toggleSidebar } = useActions()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="flex h-screen w-screen overflow-hidden bg-[hsl(var(--pc-bg))]"
    >
      <ServerRail />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-20 bg-[hsl(var(--pc-bg-deep))/0.6] backdrop-blur-sm lg:hidden"
            onClick={() => toggleSidebar(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'relative flex h-full w-full flex-col lg:flex-row',
          'transition-all duration-300 ease-in-out',
        )}
      >
        <aside
          className={cn(
            'flex h-full w-[var(--pc-sidebar-w)] shrink-0 transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0 lg:translate-x-0' : '-translate-x-full lg:translate-x-0',
            'z-30 lg:z-auto lg:static',
          )}
        >
          {sidebar ?? <ChannelSidebar />}
        </aside>

        <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[hsl(var(--pc-bg))]">
          {header ?? <ChannelHeader channel={null} />}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {children}
          </div>
        </main>

        <AnimatePresence>
          {membersOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'flex h-full w-[var(--pc-members-w)] shrink-0 z-20',
                'bg-[hsl(var(--pc-surface))] border-l border-[hsl(var(--pc-border-soft))] shadow-float',
                'lg:static lg:relative',
              )}
            >
              {members ?? <MemberSidebar />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => toggleSidebar(true)}
        aria-label="Sunucu listesini aç"
        className={cn(
          'absolute top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full',
          'bg-[hsl(var(--pc-surface-overlay))] border border-[hsl(var(--pc-border-soft))] text-[hsl(var(--pc-text))] shadow-panel',
          'lg:hidden',
          'transition-colors duration-150',
        )}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

export { ServerRail, ChannelSidebar, ChannelHeader, MemberSidebar, UserPanel }

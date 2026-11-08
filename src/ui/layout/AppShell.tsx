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

  // Referans genişlikler (index.css'teki CSS değişkenleri override edilir):
  // rail 72px, sidebar 248px, members 240px — hiçbir sütun dışına taşmaz.
  const rootStyle = {
    '--pc-rail-w': '72px',
    '--pc-members-w': '240px',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={rootStyle as unknown as React.CSSProperties}
      className="flex h-[100dvh] w-screen overflow-hidden bg-[hsl(var(--pc-bg))]"
    >
      {/* Sunucu rayı: masaüstünde her zaman görünür, mobilde gizlenir */}
      <ServerRail className="hidden lg:flex" />

      {/* Mobil sidebar arkaplanı */}
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
          'relative flex h-full w-full flex-col lg:flex-row min-w-0',
          'transition-all duration-300 ease-in-out',
        )}
      >
        {/* Kanal kenar çubuğu (masaüstü sabit, mobil drawer) */}
        <aside
          className={cn(
            'flex h-full w-[var(--pc-sidebar-w)] flex-col shrink-0 min-h-0 z-30',
            'bg-[hsl(var(--pc-surface))] border-r border-[hsl(var(--pc-border-soft))]',
            'fixed inset-y-0 left-0 lg:!static lg:relative lg:z-auto',
            'transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0 lg:translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          {sidebar ?? <ChannelSidebar />}
        </aside>

        {/* Ana içerik */}
        <main
          className={cn(
            'flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden',
            'bg-[hsl(var(--pc-bg))]',
            'lg:ml-0',
          )}
        >
          {header ?? <ChannelHeader channel={null} />}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            {children}
          </div>
        </main>

        {/* Üye paneli (varsayılan açık; masaüstü sabit, mobil drawer) */}
        <AnimatePresence>
          {membersOpen && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'flex h-full w-[var(--pc-members-w)] flex-col shrink-0 z-20',
                'bg-[hsl(var(--pc-surface))] border-l border-[hsl(var(--pc-border-soft))] shadow-panel',
                'fixed inset-y-0 right-0 lg:!static lg:relative lg:z-auto lg:transform-none',
                'transform transition-transform duration-300 ease-in-out',
                membersOpen ? 'translate-x-0 lg:translate-x-0' : 'translate-x-full',
              )}
              data-members
            >
              {members ?? <MemberSidebar />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobil: sunucu listesini aç/kapa düğmesi */}
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

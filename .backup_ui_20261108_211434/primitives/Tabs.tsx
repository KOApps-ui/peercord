import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Tabs as RadixTabs,
  TabsList,
  TabsTrigger as TabTrigger,
  TabsContent as TabPanelContent,
} from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
}

export function Tabs({ children, defaultValue }: TabsProps) {
  return <RadixTabs.Root defaultValue={defaultValue}>{children}</RadixTabs.Root>
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <TabsList
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-lg)] border border-[hsl(var(--pc-border))] bg-[hsl(var(--pc-surface-hover))] p-[2px]',
        className
      )}
    >
      {children}
    </TabsList>
  )
}

interface TabProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function Tab({ value, children, className, disabled }: TabProps) {
  return (
    <TabTrigger
      value={value}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition-colors duration-150 data-[state=active]:bg-[hsl(var(--pc-accent-soft))] data-[state=active]:text-[hsl(var(--pc-accent-text))]',
        'data-[state=inactive]:text-[hsl(var(--pc-text-muted))] hover:data-[state=inactive]:bg-[hsl(var(--pc-surface-hover))]',
        className
      )}
    >
      {children}
    </TabTrigger>
  )
}

interface TabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  return (
    <TabPanelContent
      value={value}
      className={cn('mt-6', className)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabPanelContent>
  )
}

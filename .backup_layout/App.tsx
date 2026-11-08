/* ------------------------------------------------------------------ *
 * PeerCord — Ana Uygulama Kabuğu
 * Tüm bileşenleri birleştirir, yaşam döngüsünü yönetir, kısayolları bağlar.
 * ------------------------------------------------------------------ */
import { useEffect, useRef, useState, type ReactNode, Component, type ErrorInfo } from 'react'
import { motion } from 'motion/react'
import { ThemeProvider } from '@/ui/theme'
import { TooltipProvider } from '@/ui/primitives'
import { AppShell, ChannelSidebar, ChannelHeader, MemberSidebar } from '@/ui/layout'
import { WelcomeScreen } from '@/features/onboarding'
import { ModalRouter } from '@/features/modals'
import { ToastViewport } from '@/features/notifications'
import { NotificationCenter } from '@/features/notifications'
import { SearchPanel } from '@/features/search'
import { CommandPalette } from '@/features/command'
import { VoiceStage } from '@/features/voice'
import { VoiceBar } from '@/features/voice'
import { VoiceControls } from '@/features/voice'
import { VoiceConnectionBanner } from '@/features/voice'
import { ScreenShareView } from '@/features/voice'
import { MessageList } from '@/features/chat'
import { MessageComposer } from '@/features/chat'
import { useActions, useAppStore, useActiveChannel, useActiveVoiceChannel, useRemoteScreenStreams, useLocalVoiceState } from '@/lib/store'

/* ------------------------------- BootSplash ------------------------------- */
function BootSplash(): ReactNode {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--pc-bg))]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full text-[hsl(var(--pc-accent))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <defs>
              <linearGradient id="peerCordGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--pc-accent))" />
                <stop offset="100%" stopColor="hsl(var(--pc-violet))" />
              </linearGradient>
            </defs>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="url(#peerCordGradient)" strokeWidth="2" />
            <circle cx="12" cy="12" r="1.5" fill="url(#peerCordGradient)" />
          </svg>
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'hsl(var(--pc-accent))' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-2 text-[hsl(var(--pc-text-muted))]">
          <div className="w-5 h-5 border-2 border-[hsl(var(--pc-accent))] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="text-sm font-medium">PeerCord başlatılıyor…</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- ErrorBoundary ------------------------------- */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[PeerCord] Uncaught error:', error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--pc-bg))] p-4">
          <div className="pc-panel rounded-2xl max-w-md w-full text-center p-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--pc-danger))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 className="text-xl font-semibold text-[hsl(var(--pc-text))] mb-2">Bir hata oluştu</h2>
            <p className="text-sm text-[hsl(var(--pc-text-muted))] mb-6">
              Uygulama beklenmedik bir hata ile karşılaştı. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-[hsl(var(--pc-accent))] text-[hsl(var(--pc-text-inverse))] font-medium hover:bg-[hsl(var(--pc-accent))/0.9] transition-colors"
            >
              Yeniden Yükle
            </button>
            {this.state.error && (
              <details className="mt-4 text-left text-xs text-[hsl(var(--pc-text-subtle))]">
                <summary className="cursor-pointer mb-1">Hata detayı</summary>
                <pre className="bg-[hsl(var(--pc-surface))] p-2 rounded overflow-auto max-h-40">{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/* ------------------------------- GuildView ------------------------------- */
function GuildView(): ReactNode {
  const activeChannel = useActiveChannel()
  const activeVoiceChannel = useActiveVoiceChannel()
  const remoteScreenStreams = useRemoteScreenStreams()
  const { screenSharing } = useLocalVoiceState()
  const { toggleMembers } = useActions()

  // Ekran paylaşımı için ilk remote stream'in peerId'sini al
  const firstRemoteScreenPeerId = Object.keys(remoteScreenStreams)[0]
  const firstRemoteScreenName = useAppStore((s) =>
    firstRemoteScreenPeerId ? s.members[firstRemoteScreenPeerId]?.name || 'Bilinmeyen' : '',
  )

  return (
    <AppShell
      sidebar={<ChannelSidebar />}
      header={<ChannelHeader channel={activeChannel} />}
      members={<MemberSidebar />}
    >
      {/* VoiceBar ve VoiceConnectionBanner - sesli kanalda iken üstte */}
      {activeVoiceChannel && (
        <>
          <VoiceBar channel={activeVoiceChannel} />
          <VoiceConnectionBanner />
        </>
      )}

      {/* Ana içerik alanı */}
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        {activeChannel?.type === 'voice' ? (
          <VoiceStage channel={activeChannel} onClose={toggleMembers} />
        ) : activeChannel?.type === 'text' ? (
          <>
            <MessageList channelId={activeChannel.id} />
            <MessageComposer channelId={activeChannel.id} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center pc-panel">
            <div className="text-center px-6">
              <p className="text-[hsl(var(--pc-text-muted))]">Kanal seçilmedi</p>
            </div>
          </div>
        )}

        {/* VoiceControls - sesli kanaldayken ve metin kanalındaysa composer'ın üstünde */}
        {activeVoiceChannel && activeChannel?.type === 'text' && (
          <VoiceControls />
        )}

        {/* ScreenShareView overlay */}
        {(Object.keys(remoteScreenStreams).length > 0 || screenSharing) && firstRemoteScreenPeerId && (
          <ScreenShareView
            peerId={firstRemoteScreenPeerId}
            name={firstRemoteScreenName}
            onClose={() => {}}
          />
        )}
      </div>
    </AppShell>
  )
}

/* ------------------------------- App ------------------------------- */
export default function App(): ReactNode {
  const ready = useAppStore((s) => s.ready)
  const guild = useAppStore((s) => s.guild)
  const error = useAppStore((s) => s.error)
  const settings = useAppStore((s) => s.settings)
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen)
  const { bootstrap, clearError, setCommandPaletteOpen } = useActions()

  const [searchOpen, setSearchOpen] = useState(false)
  const bootstrapGuard = useRef(false)

  // Bootstrap - tek sefer çalıştır
  useEffect(() => {
    if (!bootstrapGuard.current) {
      bootstrapGuard.current = true
      void bootstrap()
    }
  }, [bootstrap])

  // Global klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac')
      const modifier = isMac ? e.metaKey : e.ctrlKey

      if (modifier && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
        return
      }

      if (modifier && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
        return
      }

      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false)
        } else if (searchOpen) {
          setSearchOpen(false)
        } else {
          // Modal kapatma
          useAppStore.getState().actions.closeModal()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, searchOpen, setCommandPaletteOpen])

  // Hata bannerı
  const ErrorBanner = error ? (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down bg-[hsl(var(--pc-danger))/0.1] border-b border-[hsl(var(--pc-danger))/0.3] px-4 py-2">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[hsl(var(--pc-danger))]">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
        <button
          onClick={clearError}
          className="flex-shrink-0 px-2 py-1 rounded text-sm text-[hsl(var(--pc-danger))] hover:bg-[hsl(var(--pc-danger))/0.1] transition-colors"
          aria-label="Hata mesajını kapat"
        >
          Kapat
        </button>
      </div>
    </div>
  ) : null

  if (!ready) {
    return (
      <ErrorBoundary>
        <ThemeProvider theme={settings.theme} density={settings.density} reduceMotion={settings.reduceMotion}>
          <TooltipProvider>
            <BootSplash />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={settings.theme} density={settings.density} reduceMotion={settings.reduceMotion}>
        <TooltipProvider>
          <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
            {ErrorBanner}

            {!guild ? (
              <WelcomeScreen />
            ) : (
              <>
                <GuildView />
                <NotificationCenter />
              </>
            )}

            {/* Global bileşenler - guild var her zaman render edilir */}
            <ModalRouter />
            <ToastViewport />
            <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
            <CommandPalette />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
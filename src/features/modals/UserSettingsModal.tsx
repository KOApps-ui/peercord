/* ------------------------------------------------------------------ *
 * PeerCord — Modals: UserSettingsModal
 * ------------------------------------------------------------------ */
import { motion } from 'motion/react'
import { Modal } from '@/ui/primitives'
import { Tabs, TabsList, Tab, TabPanel } from '@/ui/primitives/Tabs'
import { Switch, Slider } from '@/ui/primitives/Switch'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { useActions, useAppStore } from '@/lib/store'
import { copyToClipboard } from '@/lib/utils'

export function UserSettingsModal() {
  const { closeModal, updateProfile, updateSettings, setTheme, setDensity, pushToast } = useActions()
  const { settings, me } = useAppStore()

  // Kimlik kopyala
  const handleCopyId = async () => {
    if (!me?.id) return
    await copyToClipboard(me.id)
    pushToast({
      kind: 'success',
      title: 'Kopyalandı',
      description: 'Kullanıcı kimliğiniz panellene kopyalandı',
      duration: 2000,
    })
  }

  // Ayarları kaydet
  const handleSaveSettings = () => {
    pushToast({
      kind: 'success',
      title: 'Ayarlar kaydedildi',
      description: 'Tüm ayarlarınız güncellendi.',
      duration: 2000,
    })
  }

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Kullanıcı Ayarları"
      description="Profil, görünüm ve sistem ayarlarını yönetin"
      size="lg"
    >
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <Tab value="profile">Profil</Tab>
          <Tab value="appearance">Görünüm</Tab>
          <Tab value="audio">Ses</Tab>
          <Tab value="network">Ağ</Tab>
          <Tab value="advanced">Gelişmiş</Tab>
        </TabsList>

        {/* Profil sekmesi */}
        <TabPanel value="profile" className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Kullanıcı adı"
              placeholder="Adınız"
              value={me?.name || ''}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />

            <Input
              label="Özel durum"
              placeholder="Boşta, Çalışıyor, vb."
              value={me?.customStatus || ''}
              onChange={(e) => updateProfile({ customStatus: e.target.value })}
            />

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-1">
                Hakkımda
              </label>
              <textarea
                rows={3}
                value={me?.bio || ''}
                onChange={(e) => updateProfile({ bio: e.target.value })}
                placeholder="Kendinizi tanıtın..."
                className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2.5 text-sm text-[hsl(var(--pc-text))] placeholder:[hsl(var(--pc-text-muted))] resize-none focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleCopyId}>
                Kimlik kopyala
              </Button>
            </div>
          </div>
        </TabPanel>

        {/* Görünüm sekmesi */}
        <TabPanel value="appearance" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Tema
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'amoled')}
                className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] cursor-pointer focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none"
              >
                <option value="dark">Karanlık</option>
                <option value="light">Açık</option>
                <option value="amoled">AMOLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Yoğunluk
              </label>
              <select
                value={settings.density}
                onChange={(e) => setDensity(e.target.value as 'cozy' | 'compact')}
                className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] cursor-pointer focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none"
              >
                <option value="cozy">Boş alan</option>
                <option value="compact">Sık</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))]">
                  Azaltılmış hareket
                </label>
                <p className="text-xs text-[hsl(var(--pc-text-muted))]/70 mt-0.5">
                  CSS hareketlerini sessize alır
                </p>
              </div>
              <Switch
                checked={settings.reduceMotion}
                onCheckedChange={(checked) => updateSettings({ reduceMotion: checked })}
              />
            </div>
          </div>
        </TabPanel>

        {/* Ses sekmesi */}
        <TabPanel value="audio" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Giriş sesi
              </label>
              <Slider
                value={settings.inputVolume}
                onValueChange={(value) => updateSettings({ inputVolume: value })}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Çıkış sesi
              </label>
              <Slider
                value={settings.outputVolume}
                onValueChange={(value) => updateSettings({ outputVolume: value })}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))]">
                  Ses bildirimleri
                </label>
              </div>
              <Switch
                checked={settings.soundsEnabled}
                onCheckedChange={(checked) => updateSettings({ soundsEnabled: checked })}
              />
            </div>
          </div>
        </TabPanel>

        {/* Ağ sekmesi */}
        <TabPanel value="network" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Tercih edilen strateji
              </label>
              <select
                value={settings.preferredStrategy}
                onChange={(e) => updateSettings({ preferredStrategy: e.target.value as any })}
                className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2 text-sm text-[hsl(var(--pc-text))] cursor-pointer focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none"
              >
                <option value="nostr">Nostr</option>
                <option value="mqtt">MQTT</option>
                <option value="bittorrent">BitTorrent</option>
                <option value="firebase">Firebase</option>
                <option value="ipfs">IPFS</option>
                <option value="supabase">Supabase</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Özel relay adresleri
              </label>
              <textarea
                value={settings.customRelays.join('\n')}
                onChange={(e) => updateSettings({ customRelays: e.target.value.split('\n').filter((r) => r.trim().length > 0) })}
                placeholder="her satırda bir relay URL"
                rows={2}
                className="w-full rounded-xl border border-[hsl(var(--pc-border-soft))] bg-[hsl(var(--pc-surface))] px-3 py-2.5 text-sm text-[hsl(var(--pc-text))] placeholder:text-[hsl(var(--pc-text-muted))] resize-none focus:ring-1 focus:ring-[hsl(var(--pc-accent))/0.9] focus:outline-none font-mono"
              />
            </div>
          </div>
        </TabPanel>

        {/* Gelişmiş sekmesi */}
        <TabPanel value="advanced" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
                Uygulama bilgileri
              </label>
              <div className="rounded-xl bg-[hsl(var(--pc-surface-hover))] p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--pc-text-muted))]">Versiyon</span>
                  <span className="text-[hsl(var(--pc-text))]">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--pc-text-muted))]">Kimlik</span>
                  <span className="font-mono text-xs text-[hsl(var(--pc-accent))]">{me?.id?.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Tüm yerel verilerinizi sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                  pushToast({
                    kind: 'info',
                    title: 'Sıfırla',
                    description: 'Bu özellik yakında kullanılabilir.',
                    duration: 2000,
                  })
                }
              }}
            >
              Yerel verileri sıfırla
            </Button>
          </div>
        </TabPanel>
      </Tabs>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 flex justify-end gap-2"
      >
        <Button variant="secondary" onClick={() => closeModal()}>
          Kapat
        </Button>
        <Button variant="primary" onClick={handleSaveSettings}>
          Kaydet
        </Button>
      </motion.div>
    </Modal>
  )
}
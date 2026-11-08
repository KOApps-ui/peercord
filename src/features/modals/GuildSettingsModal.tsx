/* ------------------------------------------------------------------ *
 * PeerCord — Modals: GuildSettingsModal
 * ------------------------------------------------------------------ */
import { useState } from 'react'
import { motion } from 'motion/react'
import { Modal } from '@/ui/primitives'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { useActions, useAppStore, useChannels, useCategories } from '@/lib/store'

export function GuildSettingsModal() {
  const { closeModal } = useActions()
  const guild = useAppStore((s) => s.guild)
  const { updateChannel, deleteChannel, createChannel, createCategory, pushToast } = useActions()
  const channels = useChannels()
  const categories = useCategories()
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null)
  const [editingChannelName, setEditingChannelName] = useState('')
  const [newChannelName, setNewChannelName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  if (!guild) return null

  // Sunucu adını güncelleme - uyarı göster
  const handleUpdateName = () => {
    pushToast({
      kind: 'info',
      title: 'Yakında',
      description: 'Sunucu adı güncellenmesi yakında eklenecek.',
      duration: 3000,
    })
  }

  // Kanal yeniden adlandır
  const handleRenameChannel = async (channelId: string, newName: string) => {
    if (newName.length === 0) {
      setEditingChannelId(null)
      setEditingChannelName('')
      return
    }
    await updateChannel(channelId, { name: newName })
    setEditingChannelId(null)
    setEditingChannelName('')
  }

  // Kanal sil
  const handleDeleteChannel = async (channelId: string) => {
    if (confirm('Bu kanalı silmek istediğinizden emin misiniz?')) {
      await deleteChannel(channelId)
    }
  }

  // Yeni kanal oluştur
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    await createChannel({ name: newChannelName, type: 'text', topic: '' })
    setNewChannelName('')
  }

  // Yeni kategori oluştur
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    await createCategory(newCategoryName)
    setNewCategoryName('')
  }

  // Kategorilere göre kanalları grupla
  const groupedChannels = (channels || []).reduce<Record<string, typeof channels>>((acc, channel) => {
    const catId = channel.categoryId || 'uncategorized'
    if (!acc[catId]) acc[catId] = []
    acc[catId].push(channel)
    return acc
  }, {} as Record<string, typeof channels>)

  const allCategories = (categories || []) as { id: string; name: string }[]
  const uncategorizedChannels = groupedChannels['uncategorized'] || []

  return (
    <Modal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Sunucu Ayarları"
      description={guild?.name || 'Sunucu'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Sunucu bilgileri */}
        <div className="space-y-3">
          <Input
            label="Sunucu adı"
            value={guild?.name || ''}
            onChange={() => handleUpdateName()}
          />

          <Input
            label="Sunucu açıklaması"
            value={guild?.description || ''}
            onChange={() => {}}
            placeholder="Sunucunuzu tanıtın..."
          />

          <div>
            <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
              İkon tohumu
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((seed) => {
                const isSelected = seed === Number(guild?.iconSeed)
                return (
                  <button
                    key={seed}
                    onClick={() => {}}
                    className={isSelected
                      ? 'w-8 h-8 rounded-full text-xs font-medium bg-[hsl(var(--pc-accent))] text-[hsl(var(--pc-accent-text))] ring-2 ring-[hsl(var(--pc-accent))/0.5]'
                      : 'w-8 h-8 rounded-full text-xs font-medium bg-[hsl(var(--pc-surface-hover))] text-[hsl(var(--pc-text-muted))] hover:ring-1 hover:ring-[hsl(var(--pc-border))]'
                    }
                  >
                    {seed}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Kanal yönetimi */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-[hsl(var(--pc-text-muted))]">Kanallar ({channels?.length || 0})</h3>

          {/* Kategorilere göre kanallar */}
          {allCategories.map((category) => {
            const catChannels = groupedChannels[category.id] || []
            if (catChannels.length === 0) return null
            return (
              <div key={category.id} className="space-y-1">
                <h4 className="text-xs font-medium text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">{category.name}</h4>
                {catChannels.map((channel) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--pc-surface-hover))] hover:bg-[hsl(var(--pc-surface))] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {channel.type === 'voice' ? (
                        <svg className="w-4 h-4 text-[hsl(var(--pc-cyan))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 2v10.5A2.5 2.5 0 0 1 9.5 15C7 15 5 12.5 5 10V2h2v8.5A1.5 1.5 0 0 0 8 12c1.1 0 2-.9 2-2V2h2v8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[hsl(var(--pc-accent))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 12l4-4 4 4 4-4 4 4 8-8" />
                        </svg>
                      )}
                      {editingChannelId === channel.id ? (
                        <Input
                          value={editingChannelName}
                          onChange={(e) => setEditingChannelName(e.target.value)}
                          onBlur={() => handleRenameChannel(channel.id, editingChannelName)}
                          autoFocus
                          className="h-6 text-sm p-1"
                        />
                      ) : (
                        <span className="text-sm text-[hsl(var(--pc-text))]">{channel.name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-danger))] transition-colors"
                      aria-label="Sil"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          })}

          {/* Kategorilendirilmemiş kanallar */}
          {uncategorizedChannels.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-[hsl(var(--pc-text-muted))] uppercase tracking-wider">Diğer</h4>
              {uncategorizedChannels.map((channel) => {
                const isEditing = editingChannelId === channel.id
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-[hsl(var(--pc-surface-hover))] hover:bg-[hsl(var(--pc-surface))] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[hsl(var(--pc-accent))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 12l4-4 4 4 4-4 4 4 8-8" />
                      </svg>
                      {isEditing ? (
                        <Input
                          value={editingChannelName}
                          onChange={(e) => setEditingChannelName(e.target.value)}
                          onBlur={() => handleRenameChannel(channel.id, editingChannelName)}
                          autoFocus
                          className="h-6 text-sm p-1"
                        />
                      ) : (
                        <span className="text-sm text-[hsl(var(--pc-text))]">{channel.name}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="text-[hsl(var(--pc-text-muted))] hover:text-[hsl(var(--pc-danger))] transition-colors"
                    >
                      Sil
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Kanal ekle mekanizması */}
          <div className="mt-3">
            <Input
              placeholder="Yeni kanal adı"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateChannel()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim()}
              className="mt-2"
            >
              Kanal ekle
            </Button>
          </div>
        </div>

        {/* Kategori yönetimi */}
        <div className="space-y-3 pt-2 border-t border-[hsl(var(--pc-border-soft))]">
          <h3 className="text-sm font-medium text-[hsl(var(--pc-text-muted))]">Kategoriler</h3>

          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <span
                key={category.id}
                className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--pc-surface-hover))] text-[hsl(var(--pc-text-muted))]"
              >
                {category.name}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Yeni kategori adı"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim()}
            >
              Kategori ekle
            </Button>
          </div>
        </div>

        {/* Davet linki */}
        <div>
          <label className="block text-xs font-medium text-[hsl(var(--pc-text-muted))] mb-2">
            Davet linki
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={guild?.inviteSecret ? `#/oda/${guild.inviteSecret}` : ''}
              readOnly
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(guild?.inviteSecret ? `#/oda/${guild.inviteSecret}` : '')
                pushToast({
                  kind: 'success',
                  title: 'Kopyalandı',
                  description: 'Davet linki kopyalandı',
                  duration: 2000,
                })
              }}
            >
              Kopyala
            </Button>
          </div>
        </div>

        {/* Roller bölümü */}
        <div className="pt-2 border-t border-[hsl(var(--pc-border-soft))]">
          <h3 className="text-sm font-medium text-[hsl(var(--pc-text-muted))] mb-2">Roller</h3>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              pushToast({
                kind: 'info',
                title: 'Yakında',
                description: 'Rol yönetimi yakında eklenecek.',
                duration: 3000,
              })
            }}
          >
            Rol yönet
          </Button>
        </div>
      </div>
    </Modal>
  )
}
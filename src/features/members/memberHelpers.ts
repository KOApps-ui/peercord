/* ------------------------------------------------------------------ *
 * PeerCord — Members: paylaşılan yardımcılar
 * Durum renkleri, rol çözümleme, gruplama, mention gönderimi ve
 * mesaja scroll + geçici vurgu işlemleri burada toplanır.
 * ------------------------------------------------------------------ */
import type { Channel, ID, PeerInfo, PresenceStatus, Role } from '@/types'
import type { AppStoreActions } from '@/lib/store'

/* ------------------------------ Durum ------------------------------ */

/** Presence durumuna karşılık gelen token rengi */
export function presenceColor(status: PresenceStatus): string {
  switch (status) {
    case 'online':
      return 'hsl(var(--pc-online))'
    case 'idle':
      return 'hsl(var(--pc-idle))'
    case 'dnd':
      return 'hsl(var(--pc-dnd))'
    case 'offline':
      return 'hsl(var(--pc-offline))'
  }
}

/** Durum etiketi (Türkçe) */
export function presenceLabel(status: PresenceStatus): string {
  switch (status) {
    case 'online':
      return 'Çevrimiçi'
    case 'idle':
      return 'Boşta'
    case 'dnd':
      return 'Rahatsız etmeyin'
    case 'offline':
      return 'Çevrimdışı'
  }
}

/* ------------------------------- Roller ----------------------------- */

/** Üyenin en yüksek (görünen) rolünü döndürür */
export function highestRole(roleIds: ID[], roles: Role[]): Role | null {
  let best: Role | null = null
  for (const role of roles) {
    if (!roleIds.includes(role.id)) continue
    if (best === null || role.position > best.position) best = role
  }
  return best
}

/** Üyenin rollerini pozisyona göre tersten sıralar */
export function memberRoles(roleIds: ID[], roles: Role[]): Role[] {
  return roles
    .filter((role) => roleIds.includes(role.id))
    .slice()
    .sort((a, b) => b.position - a.position)
}

/* ----------------------------- Gruplama ----------------------------- */

export interface MemberGroups {
  /** Yükseltilmiş (hoist) role sahip çevrimiçi üyeler */
  hoisted: PeerInfo[]
  /** Diğer çevrimiçi/boşta/rahatsız üyeler */
  online: PeerInfo[]
  offline: PeerInfo[]
}

/**
 * Üyeleri rol + presence durumuna göre gruplar.
 * Discord tarzı sıralama: yükseltilmiş roller, çevrimiçi, çevrimdışı.
 */
export function groupMembersByPresence(members: PeerInfo[], roles: Role[]): MemberGroups {
  const groups: MemberGroups = { hoisted: [], online: [], offline: [] }
  const hoistHues = new Set(roles.filter((r) => r.hoist).map((r) => r.id))

  for (const member of members) {
    if (member.status === 'offline') {
      groups.offline.push(member)
      continue
    }
    const hasHoist = member.roleIds.some((id) => hoistHues.has(id))
    if (hasHoist) groups.hoisted.push(member)
    else groups.online.push(member)
  }

  // Ada göre kararlı sıralama
  const byName = (a: PeerInfo, b: PeerInfo) => a.name.localeCompare(b.name, 'tr')
  groups.hoisted.sort(byName)
  groups.online.sort(byName)
  groups.offline.sort(byName)
  return groups
}

/* --------------------------- Mention gönderimi ---------------------- */

export interface MentionDeps {
  selectChannel: AppStoreActions['selectChannel']
  sendMessage: AppStoreActions['sendMessage']
  pushToast: AppStoreActions['pushToast']
}

/**
 * Üyeyi aktif (veya ilk) metin kanalına mention ile yönlendirir.
 * `true` dönerse kanal seçildi ve mesaj gönderildi.
 */
export async function mentionMember(
  member: PeerInfo,
  channels: Channel[],
  activeChannelId: ID | null,
  deps: MentionDeps
): Promise<boolean> {
  const active = activeChannelId
    ? channels.find((c) => c.id === activeChannelId && c.type === 'text')
    : undefined
  const channel = active ?? channels.find((c) => c.type === 'text')

  if (!channel) {
    deps.pushToast({
      kind: 'warning',
      title: 'Kanal bulunamadı',
      description: 'Mesaj göndermek için bir metin kanalı gerekiyor.',
      duration: 3500,
    })
    return false
  }

  deps.selectChannel(channel.id)
  await deps.sendMessage(channel.id, `<@${member.userId}>`, {
    mentions: [member.userId],
  })
  deps.pushToast({
    kind: 'success',
    title: 'Mesaj gönderildi',
    description: `#${channel.name} kanalına mention iletildi.`,
    duration: 2600,
  })
  return true
}

/* ------------------------ Mesaja scroll + vurgu --------------------- */

/**
 * Mesaj kartına yumuşak scroll ve 1.2 sn geçici vurgu uygular.
 * Mesaj DOM'da yoksa `false` döner.
 */
export function flashMessage(messageId: ID, ms = 1200): boolean {
  const el = document.getElementById(`msg-${messageId}`)
  if (!el) return false

  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el.classList.add('pc-search-hit')
  el.style.transition = 'box-shadow 160ms ease, background-color 160ms ease'
  el.style.boxShadow = '0 0 0 2px hsl(var(--pc-accent) / 0.9)'
  el.style.backgroundColor = 'hsl(var(--pc-accent) / 0.14)'

  window.setTimeout(() => {
    el.classList.remove('pc-search-hit')
    el.style.boxShadow = ''
    el.style.backgroundColor = ''
  }, ms)

  return true
}

/** Kanala git + mesajı vurgula için gereken eylemler */
export interface OpenMessageDeps {
  selectChannel: AppStoreActions['selectChannel']
  pushToast: AppStoreActions['pushToast']
}

/** Kanala git ve mesajı vurgula (arama sonucu / mention tıklaması) */
export function openMessage(messageId: ID, channelId: ID, deps: OpenMessageDeps): void {
  deps.selectChannel(channelId)
  requestAnimationFrame(() => {
    if (!flashMessage(messageId)) {
      deps.pushToast({
        kind: 'info',
        title: 'Mesaj bulunamadı',
        description: 'Mesaj bu kanalda görüntülenemiyor.',
        duration: 2600,
      })
    }
  })
}

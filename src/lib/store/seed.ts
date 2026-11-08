/**
 * PeerCord — Başlangıç verileri (seed)
 * Varsayılan roller, kategoriler ve kanal yapısı
 */
import type { Role, Category, Channel, ChannelType, Permission, ID, UnixMs, Guild } from '@/types'
import { uid } from '@/lib/utils'

/* ------------------------------ Roller ------------------------------- */

export const DEFAULT_ROLES: Role[] = [
  {
    id: uid('role'),
    name: '@everyone',
    hue: 210,
    hoist: false,
    mentionable: false,
    permissions: [
      'send_messages',
      'attach_files',
      'add_reactions',
      'connect_voice',
      'speak',
    ],
    position: 0,
  },
  {
    id: uid('role'),
    name: 'Yönetici',
    hue: 340,
    hoist: true,
    mentionable: true,
    permissions: [
      'manage_guild',
      'manage_channels',
      'manage_messages',
      'send_messages',
      'attach_files',
      'add_reactions',
      'connect_voice',
      'speak',
      'share_screen',
      'kick_members',
    ],
    position: 1,
  },
  {
    id: uid('role'),
    name: 'Moderatör',
    hue: 30,
    hoist: true,
    mentionable: true,
    permissions: [
      'manage_messages',
      'manage_channels',
      'send_messages',
      'attach_files',
      'add_reactions',
      'connect_voice',
      'speak',
      'kick_members',
    ],
    position: 2,
  },
]

const EVERYONE_ROLE_ID = DEFAULT_ROLES[0]!.id

/* ---------------------------- Kategoriler ---------------------------- */

export function createDefaultCategories(): Category[] {
  return [
    { id: uid('cat'), name: 'GENEL', position: 0 },
    { id: uid('cat'), name: 'SES', position: 1 },
  ]
}

/* ----------------------------- Kanallar ------------------------------ */

export function createDefaultChannels(categories: Category[]): Channel[] {
  const generalCat = categories.find(c => c.name === 'GENEL')!.id
  const voiceCat = categories.find(c => c.name === 'SES')!.id

  return [
    {
      id: uid('ch'),
      name: 'genel',
      type: 'text' as ChannelType,
      categoryId: generalCat,
      topic: 'Hoş geldiniz! Burası genel sohbet kanalı.',
      position: 0,
      slowmodeSec: 0,
      locked: false,
    },
    {
      id: uid('ch'),
      name: 'rastgele',
      type: 'text' as ChannelType,
      categoryId: generalCat,
      topic: 'Konu dışı sohbetler için.',
      position: 1,
      slowmodeSec: 0,
      locked: false,
    },
    {
      id: uid('ch'),
      name: 'Genel Ses',
      type: 'voice' as ChannelType,
      categoryId: voiceCat,
      position: 0,
      slowmodeSec: 0,
      locked: false,
    },
    {
      id: uid('ch'),
      name: 'Oyun Odası',
      type: 'voice' as ChannelType,
      categoryId: voiceCat,
      position: 1,
      slowmodeSec: 0,
      locked: false,
    },
  ]
}

/* ------------------------------ Yardımcı ----------------------------- */

export function createDefaultGuild(
  name: string,
  ownerId: ID,
  secret?: string,
  encrypted = false
): Guild {
  const now: UnixMs = Date.now()
  const categories = createDefaultCategories()
  const channels = createDefaultChannels(categories)

  return {
    id: uid('guild'),
    name,
    iconSeed: ownerId,
    description: '',
    ownerId,
    createdAt: now,
    encrypted,
    roles: DEFAULT_ROLES.map((r, i) => ({
      ...r,
      position: i,
    })),
    categories,
    channels,
    inviteSecret: secret,
  }
}

export function ensureEveryoneRole(guild: Guild): Guild {
  const hasEveryone = guild.roles.some(r => r.name === '@everyone')
  if (!hasEveryone) {
    return {
      ...guild,
      roles: [DEFAULT_ROLES[0]!, ...guild.roles],
    }
  }
  return guild
}

export function getDefaultPermissions(roleName: string): Permission[] {
  const role = DEFAULT_ROLES.find(r => r.name === roleName)
  return role?.permissions ?? []
}
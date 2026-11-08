/* ------------------------------------------------------------------ *
 * PeerCord — Members feature barrel
 * ------------------------------------------------------------------ */

export { MemberGroup } from './MemberGroup'
export type { MemberGroupProps } from './MemberGroup'

export { MemberListItem } from './MemberListItem'
export type { MemberListItemProps } from './MemberListItem'

export { MemberProfileCard } from './MemberProfileCard'
export type { MemberProfileCardProps } from './MemberProfileCard'

export { RoleBadge } from './RoleBadge'
export type { RoleBadgeProps, RoleBadgeSize, RoleBadgeTone } from './RoleBadge'

export {
  MemberContextMenu,
  MemberMenuDropdown,
  useMemberMenu,
} from './MemberContextMenu'
export type {
  MemberContextMenuProps,
  MemberMenuDropdownProps,
  MemberMenuEntry,
  MemberMenuRoleEntry,
} from './MemberContextMenu'

/* Paylaşılan yardımcılar */
export {
  groupMembersByPresence,
  highestRole,
  memberRoles,
  mentionMember,
  openMessage,
  flashMessage,
  presenceColor,
  presenceLabel,
} from './memberHelpers'
export type { MemberGroups, MentionDeps } from './memberHelpers'

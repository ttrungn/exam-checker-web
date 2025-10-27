export const Roles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MODERATOR: 'moderator',
  EXAMINER: 'examiner'
} as const

export type Role = (typeof Roles)[keyof typeof Roles]

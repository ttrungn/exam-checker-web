import { DashboardOutlined, FileTextOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'

import { type Role, Roles } from './auth'

type IconRef = React.ComponentType // reference, not JSX
export type NavItem = {
  key: string
  label: string
  icon: IconRef
  roles: Role[]
  [key: string]: any
}

export const SIDEBAR_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined, roles: [Roles.ADMIN] },
  { key: 'exams', label: 'Exams', icon: FileTextOutlined, roles: [Roles.ADMIN] },
  { key: 'settings', label: 'Settings', icon: SettingOutlined, roles: [Roles.ADMIN] }
]

export const USER_MENU_ITEMS: NavItem[] = [
  { key: 'profile', label: 'Profile', icon: UserOutlined, roles: [Roles.ADMIN] },
  { key: 'settings', label: 'Settings', icon: SettingOutlined, roles: [Roles.ADMIN] },
  { key: 'logout', label: 'Logout', icon: LogoutOutlined, danger: true, roles: [Roles.ADMIN] }
]

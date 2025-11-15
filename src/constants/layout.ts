import {
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
  FileSearchOutlined
} from '@ant-design/icons'

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
  { key: '', label: 'Bảng phân tích', icon: DashboardOutlined, roles: [Roles.ADMIN] },
  { key: 'manage-users', label: 'Quản lý người dùng', icon: UserOutlined, roles: [Roles.ADMIN] },
  { key: 'submissions', label: 'Quản lý bài nộp', icon: FileSearchOutlined, roles: [Roles.MANAGER] },
  { key: 'my-submissions', label: 'Bài cần chấm điểm', icon: FileTextOutlined, roles: [Roles.EXAMINER] },
  { key: 'exams', label: 'Quản lý bài thi', icon: FileTextOutlined, roles: [Roles.ADMIN] },
  { key: 'semesters', label: 'Quản lý học kỳ', icon: CalendarOutlined, roles: [Roles.ADMIN] },
  { key: 'settings', label: 'Cài đặt', icon: SettingOutlined, roles: [Roles.ADMIN] }
]

export const USER_MENU_ITEMS: NavItem[] = [
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: UserOutlined, roles: [Roles.ALL] },
  { key: 'settings', label: 'Cài đặt', icon: SettingOutlined, roles: [Roles.ALL] },
  { key: 'logout', label: 'Đăng xuất', icon: LogoutOutlined, danger: true, roles: [Roles.ALL] }
]

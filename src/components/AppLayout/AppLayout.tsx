import {
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'

import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import type { MenuProps } from 'antd'
import { Avatar, Button, Dropdown, Layout, Menu, Space, theme, Typography } from 'antd'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  // Get current route for active menu selection
  const getCurrentKey = () => {
    const path = location.pathname
    switch (path) {
      case '/':
      case '/dashboard':
        return ['1']
      case '/exams':
        return ['2']
      case '/settings':
        return ['3']
      default:
        return ['1']
    }
  }

  // Sidebar menu items
  const sidebarItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '2',
      icon: <FileTextOutlined />,
      label: 'Exams'
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'Settings'
    }
  ]

  // User dropdown menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true
    }
  ]

  const handleMenuClick = (e: { key: string }) => {
    switch (e.key) {
      case '1':
        navigate('/')
        break
      case '2':
        navigate('/exams')
        break
      case '3':
        navigate('/settings')
        break
      default:
        navigate('/')
    }
  }

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    console.log('User menu clicked:', e.key)
    // Handle user menu actions here
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: colorBgContainer
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >
          {collapsed ? 'EC' : 'Exam Checker'}
        </div>
        <Menu
          mode='inline'
          selectedKeys={getCurrentKey()}
          style={{
            background: 'transparent',
            border: 'none'
          }}
          items={sidebarItems}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <Button
            type='text'
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64
            }}
          />

          <Space>
            <Text>Welcome back!</Text>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement='bottomRight'
              arrow
            >
              <Avatar size='default' icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '16px',
            padding: '16px',
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout

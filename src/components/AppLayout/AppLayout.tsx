import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons'
import { useMsal } from '@azure/msal-react'

import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import type { MenuProps } from 'antd'
import { Avatar, Button, Dropdown, Layout, Menu, Space, theme, Typography } from 'antd'

import { type Role, Roles } from '../../constants/auth'
import { SIDEBAR_ITEMS, USER_MENU_ITEMS } from '../../constants/layout'
import { fetchUserProfile } from '../../features/user/userThunk'
import { useAppDispatch, useAppSelector } from '../../hooks/customReduxHooks'
import Loading from '../Loading/Loading'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const AppLayout: React.FC = () => {
  const { instance } = useMsal()
  const [collapsed, setCollapsed] = useState(false)
  const { profile, isLoading } = useAppSelector((state) => state.userProfile)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  useEffect(() => {
    if (!profile && !isLoading) {
      dispatch(fetchUserProfile())
    }
  }, [profile, dispatch, isLoading])

  const userRoleValues = useMemo(() => {
    const roles = (profile?.roles ?? []).map((r) => r.value).filter((v): v is Role => !!v)
    return roles
  }, [profile?.roles])

  const sidebarItems = useMemo<MenuProps['items']>(() => {
    return SIDEBAR_ITEMS.map((item) => {
      if (!item.roles.some((r) => r === Roles.ALL || userRoleValues.includes(r))) {
        return null
      }
      return {
        ...item,
        key: item.key,
        icon: React.createElement(item.icon),
        label: item.label
      }
    }).filter(Boolean)
  }, [userRoleValues])

  const userMenuItems = useMemo<MenuProps['items']>(() => {
    return USER_MENU_ITEMS.map((item) => {
      if (!item.roles.some((r) => r === Roles.ALL || userRoleValues.includes(r))) {
        return null
      }
      return {
        ...item,
        key: item.key,
        icon: React.createElement(item.icon),
        label: item.label
      }
    }).filter(Boolean)
  }, [userRoleValues])

  const handleLogoutRedirect = () => {
    instance.logoutRedirect().catch((error) => console.log(error))
  }

  const getCurrentKey = (): string[] => {
    const path = location.pathname
    return [path]
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key)
  }

  const handleUserMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') return handleLogoutRedirect()
    navigate(e.key)
  }

  if (isLoading) {
    return <Loading message='Loading...' />
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

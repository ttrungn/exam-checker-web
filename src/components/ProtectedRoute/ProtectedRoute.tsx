import { useMsal } from '@azure/msal-react'

import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { loginRequest } from '../../configs/maslConfig'
import Loading from '../Loading/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal()
  const location = useLocation()

  const isAuthenticated = accounts.length > 0

  useEffect(() => {
    if (!isAuthenticated && inProgress === 'none') {
      instance.loginRedirect(loginRequest).catch((error) => {
        console.error('MSAL redirect error:', error)
      })
    }
  }, [isAuthenticated, inProgress, instance, location])

  if (inProgress !== 'none' || !isAuthenticated) {
    return <Loading message='Redirecting...' />
  }

  return <>{children}</>
}

export default ProtectedRoute

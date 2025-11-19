import { useMsal } from '@azure/msal-react'
import * as signalR from '@microsoft/signalr'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { silentRequest } from '../configs/maslConfig'
import { fetchUserProfile } from '../features/user/userThunk'
import { useAppDispatch } from './customReduxHooks'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useAccountNotifications = () => {
  const { instance } = useMsal()
  const dispatch = useAppDispatch()
  const location = useLocation()

  useEffect(() => {
    const account = instance.getActiveAccount()
    if (!account) return

    const currentUserOid = account.idTokenClaims?.oid as string | undefined
    if (!currentUserOid) return

    let connection: signalR.HubConnection | null = null

    const connectSignalR = async () => {
      try {
        await instance.acquireTokenSilent({
          ...silentRequest,
          account
        })

        connection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/hubs/exam-checker-notifications`, {
            accessTokenFactory: async () => {
              const result = await instance.acquireTokenSilent({
                ...silentRequest,
                account
              })
              return result.accessToken
            },
            transport: signalR.HttpTransportType.WebSockets,
            logMessageContent: true,
            logger: signalR.LogLevel.Information
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: (retryContext) => {
              if (retryContext.previousRetryCount === 0) return 0
              if (retryContext.previousRetryCount === 1) return 2000
              if (retryContext.previousRetryCount === 2) return 10000
              return 30000
            }
          })
          .configureLogging(signalR.LogLevel.None)
          .build()

        connection.on('AccountUpdated', async (payload: { userId: string }) => {
          if (!payload?.userId) return

          if (payload.userId.toLowerCase() === currentUserOid.toLowerCase()) {
            await dispatch(fetchUserProfile())
            window.location.reload()
          }
        })

        connection.on('SubmissionUploaded', async (payload: { userId: string }) => {
          if (!payload?.userId) return

          // only when this user and currently on /my-submissions
          if (
            payload.userId.toLowerCase() === currentUserOid.toLowerCase() &&
            location.pathname === '/my-submissions'
          ) {
            console.log('SubmissionUploaded payload:', payload)
            window.location.reload()
          }
        })

        connection.onclose(() => {})
        connection.onreconnecting(() => {})
        connection.onreconnected(() => {})

        await connection.start()
      } catch {
        // Connection failed
      }
    }

    connectSignalR()

    return () => {
      if (connection) {
        connection.stop().catch(() => {})
      }
    }
  }, [instance, dispatch, location.pathname])
}

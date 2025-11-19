import { useMsal } from '@azure/msal-react'
import * as signalR from '@microsoft/signalr'

import { useEffect } from 'react'

import { silentRequest } from '../configs/maslConfig'
import { fetchUserProfile } from '../features/user/userThunk'
import { useAppDispatch } from './customReduxHooks'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useAccountNotifications = () => {
  const { instance } = useMsal()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const account = instance.getActiveAccount()
    if (!account) {
      return
    }

    const currentUserOid = account.idTokenClaims?.oid as string | undefined
    if (!currentUserOid) {
      return
    }

    let connection: signalR.HubConnection | null = null

    const connectSignalR = async () => {
      try {
        // Get token first to ensure we have valid authentication
        await instance.acquireTokenSilent({
          ...silentRequest,
          account
        })

        connection = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/hubs/account-notifications`, {
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
              // Exponential backoff: 0, 2, 10, 30 seconds then every 30 seconds
              if (retryContext.previousRetryCount === 0) {
                return 0
              } else if (retryContext.previousRetryCount === 1) {
                return 2000
              } else if (retryContext.previousRetryCount === 2) {
                return 10000
              } else {
                return 30000
              }
            }
          })
          .configureLogging(signalR.LogLevel.Information)
          .build()

        connection.on('AccountUpdated', async (payload: { userId: string }) => {
          if (!payload?.userId) {
            return
          }

          // Only reload if this event is about the currently logged-in user
          if (payload.userId.toLowerCase() === currentUserOid.toLowerCase()) {
            await dispatch(fetchUserProfile())
          }
        })

        connection.onclose(() => {
          // Connection closed
        })

        connection.onreconnecting(() => {
          // Connection reconnecting
        })

        connection.onreconnected(() => {
          // Connection reconnected
        })

        await connection.start()
      } catch {
        // Connection failed
      }
    }

    // Start connection
    connectSignalR()

    return () => {
      if (connection) {
        connection.stop().catch(() => {})
      }
    }
  }, [instance, dispatch])
}

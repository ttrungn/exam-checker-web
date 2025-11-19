import { type AccountInfo, PublicClientApplication } from '@azure/msal-browser'
import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { msalConfig } from '../configs/maslConfig'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    msalScopes?: string[]
    _msalTried?: boolean
  }
}

const msalInstance = new PublicClientApplication(msalConfig)
await msalInstance.initialize()

function getActiveAccount(): AccountInfo {
  const acc = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0]
  if (!acc) throw new Error('No active account')
  return acc
}

async function getAccessToken(scopes: string[]): Promise<string> {
  const account = getActiveAccount()
  try {
    const res = await msalInstance.acquireTokenSilent({ account, scopes })
    return res.accessToken
  } catch {
    await msalInstance.acquireTokenRedirect({ account, scopes })
    throw new Error('Redirecting for interactive login/consent')
  }
}

type ScopeRule = { test: (relativeUrl: string) => boolean; scopes: string[] }

const rules: ScopeRule[] = [{ test: (u) => u.startsWith('/'), scopes: [import.meta.env.VITE_API_DEFAULT_SCOPE] }]

function resolveScopes(relativeUrl: string, override?: string[]): string[] {
  if (override?.length) return override
  const rule = rules.find((r) => r.test(relativeUrl))
  if (!rule) throw new Error(`No scopes mapped for ${relativeUrl}`)
  return rule.scopes
}

const api: AxiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const relativeUrl = (config.url || '/').startsWith('http') ? new URL(config.url!).pathname : config.url || '/'
  const scopes = resolveScopes(relativeUrl, config.msalScopes)
  const token = await getAccessToken(scopes)
  const headers = AxiosHeaders.from(config.headers)
  headers.set('ngrok-skip-browser-warning', 'true')
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers

  return config
})

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const status = error.response?.status
  const original = error.config as InternalAxiosRequestConfig
  if (status === 401 && original && !original._msalTried) {
    original._msalTried = true
    const relativeUrl = (original.url || '/').startsWith('http') ? new URL(original.url!).pathname : original.url || '/'
    const scopes = resolveScopes(relativeUrl, original.msalScopes)
    await msalInstance.acquireTokenRedirect({ account: getActiveAccount(), scopes })
  }
  return Promise.reject(error)
})

export default api

// index.tsx (modified)
import { type AccountInfo, EventType, PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import { msalConfig } from './configs/maslConfig'
import { store } from './features/store'

import './index.css'

const msalInstance = new PublicClientApplication(msalConfig)

async function bootstrap() {
  await msalInstance.initialize()

  const result = await msalInstance.handleRedirectPromise().catch((err) => {
    console.error('MSAL handleRedirectPromise error:', err)
    return null
  })

  if (result?.account) {
    msalInstance.setActiveAccount(result.account)
  } else {
    const active = msalInstance.getActiveAccount()
    const all = msalInstance.getAllAccounts()
    if (!active && all.length > 0) {
      msalInstance.setActiveAccount(all[0])
    }
  }

  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const account = (event.payload as { account: AccountInfo }).account
      if (account) msalInstance.setActiveAccount(account)
    }
  })

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <Provider store={store}>
          <App />
        </Provider>
      </MsalProvider>
    </StrictMode>
  )
}

bootstrap().catch((e) => console.error('MSAL bootstrap error:', e))

import { LogLevel } from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: import.meta.env.VITE_MSAL_AUTHORITY,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_POST_LOGOUT_REDIRECT_URI,
    navigateToLoginRequestUrl: import.meta.env.VITE_MSAL_NAVIGATE_TO_LOGIN_REQUEST_URL === 'true'
  },
  cache: {
    cacheLocation: import.meta.env.VITE_MSAL_CACHE_LOCATION as 'localStorage' | 'sessionStorage',
    storeAuthStateInCookie: import.meta.env.VITE_MSAL_STORE_AUTH_STATE_IN_COOKIE === 'true'
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: any, containsPii: any) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            return
        }
      }
    }
  }
}

export const loginRequest = {
  scopes: []
}

export const silentRequest = {
  scopes: [import.meta.env.VITE_API_DEFAULT_SCOPE]
}

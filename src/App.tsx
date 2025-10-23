import React from 'react'

import { AppConfigProvider } from './components'
import AppRouter from './routes/AppRouter'

import './App.css'

const App: React.FC = () => {
  return (
    <AppConfigProvider>
      <AppRouter />
    </AppConfigProvider>
  )
}

export default App

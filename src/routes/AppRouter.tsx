import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components'
import { AnalyticsPage, ExamsPage, SettingsPage } from '../pages'
import { Login } from '../pages/Auth'

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='login' element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path='/' element={<AnalyticsPage />} />
          <Route path='/analytics' element={<AnalyticsPage />} />
          <Route path='/exams' element={<ExamsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout, ProtectedRoute } from '../components'
import MSALRedirect from '../components/Auth/MSALRedirect'
import { AnalyticsPage, ExamsPage, SemestersPage, SettingsPage } from '../pages'
import NotFound from '../pages/Errors/NotFound'

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/' element={<AnalyticsPage />} />
          <Route path='/analytics' element={<AnalyticsPage />} />
          <Route path='/exams' element={<ExamsPage />} />
          <Route path='/semesters' element={<SemestersPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
        <Route path='/login-redirect' element={<MSALRedirect />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

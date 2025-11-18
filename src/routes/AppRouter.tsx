import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout, ProtectedRoute } from '../components'
import MSALRedirect from '../components/Auth/MSALRedirect'
import {
  DashboardPage,
  ExamsPage,
  MySubmissionsPage,
  SemestersPage,
  SettingsPage,
  SubjectsPage,
  SubmissionsPage
} from '../pages'
import { GradingPage } from '../pages/Grading'
import NotFound from '../pages/Errors/NotFound'
import { ModeratorSubmissionsPage } from '../pages/Submissions'
import { UsersPage } from '../pages/Users'

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
          <Route path='/' element={<DashboardPage />} />
          <Route path='/manage-users' element={<UsersPage />} />
          <Route path='/submissions' element={<SubmissionsPage />} />
          <Route path='/moderator-submissions' element={<ModeratorSubmissionsPage />} />
          <Route path='/my-submissions' element={<MySubmissionsPage />} />
          <Route path='/grading/:assessmentId' element={<GradingPage />} />
          <Route path='/exams' element={<ExamsPage />} />
          <Route path='/semesters' element={<SemestersPage />} />
          <Route path='/subjects' element={<SubjectsPage />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Route>
        <Route path='/login-redirect' element={<MSALRedirect />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

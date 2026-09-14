import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import ShiningDots from './components/ShiningDots'
import NeoChat from './components/NeoChat'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

const TutorSession = lazy(() => import('./pages/TutorSession'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'))

function PageFallback() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      color: 'var(--text-secondary)',
      fontSize: '0.95rem'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(124, 93, 250, 0.2)',
        borderTopColor: 'var(--violet-light)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span>Loading practice session…</span>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ShiningDots />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/student-session"
                element={
                  <ProtectedRoute>
                    <TutorSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session"
                element={
                  <ProtectedRoute>
                    <TutorSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/:studentId"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
          <NeoChat />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

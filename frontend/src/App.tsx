import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import ShiningDots from './components/ShiningDots'
import './index.css'

const TutorSession = lazy(() => import('./pages/TutorSession'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

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
    <BrowserRouter>
      <ShiningDots />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/session" element={<TutorSession />} />
          <Route path="/dashboard/:studentId" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

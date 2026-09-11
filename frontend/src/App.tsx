import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import TutorSession from './pages/TutorSession'
import Dashboard from './pages/Dashboard'
import ShiningDots from './components/ShiningDots'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <ShiningDots />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/session" element={<TutorSession />} />
        <Route path="/dashboard/:studentId" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

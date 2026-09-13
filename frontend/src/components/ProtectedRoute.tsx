import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../lib/supabase'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

/**
 * Route guard component that:
 * 1. Waits for authentication hydration before determining route access.
 * 2. Redirects unauthenticated users to `/` (preserving intended destination in state).
 * 3. Restricts routes to specific roles (e.g. parent dashboard only for parents) if configured.
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/',
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(124, 93, 250, 0.2)',
            borderTopColor: 'var(--violet-light)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span>Verifying access…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const fallbackPath = role === 'parent' ? '/parent-dashboard' : '/student-session'
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}

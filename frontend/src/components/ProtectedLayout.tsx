import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

export default function ProtectedLayout() {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

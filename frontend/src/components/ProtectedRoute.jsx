import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  // 1. Check for the passport (token) and their job title (role)
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 2. Are they logged in at all?
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }

  // 3. Are they allowed in this specific room?
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If a Chef tries to get into the Admin Dashboard, kick them back to the kitchen.
    if (userRole === 'member') {
      return <Navigate to="/" replace />;
    }
    // Fallback for anyone else acting suspicious
    return <Navigate to="/login" replace />;
  }

  // 4. They have the passport and the right job title! Open the door.
  return <Outlet />;
}

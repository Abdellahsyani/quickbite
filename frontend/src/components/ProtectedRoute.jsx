import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // 1. Check if the user has a passport (token)
  const token = localStorage.getItem('token');

  // 2. If they don't have a token, instantly kick them to Login.
  // The "replace" keyword deletes the dashboard from their browser history
  // so they can't click the "Back" arrow to get back in.
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }

  // 3. If they do have a token, open the door and render the child routes (Outlet)
  return <Outlet />;
}

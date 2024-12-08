import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdmin(currentUser.email)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute; 
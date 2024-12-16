import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
  const { currentUser, isAdmin } = useAuth();

  // Only check auth if it's an admin route
  if (requiredRole === 'admin') {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
    
    if (!isAdmin) {
      return <Navigate to="/" />;
    }
  }

  return children;
}

export default ProtectedRoute; 
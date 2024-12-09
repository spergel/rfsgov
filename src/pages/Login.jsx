import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    // If we're authenticated, go to admin
    navigate('/admin');
  }, [isAuthenticated, navigate, loginWithRedirect]);

  return <div>Loading...</div>;
}

export default Login; 
import { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const {
    isAuthenticated,
    user,
    isLoading,
    loginWithRedirect,
    logout,
  } = useAuth0();

  const value = {
    currentUser: user,
    isAdmin: () => user?.email === 'jspergel@alumni.princeton.edu',
    isAuthenticated: () => isAuthenticated,
    login: loginWithRedirect,
    logout: () => logout({ returnTo: window.location.origin }),
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 
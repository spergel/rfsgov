import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// List of admin emails
const ADMIN_EMAILS = [
  'spergel.joshua@gmail.com',
  // Add other admin emails here
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAdmin = (email) => {
    return ADMIN_EMAILS.includes(email);
  };

  const signInWithEmail = async (email, password) => {
    if (!isAdmin(email)) {
      throw new Error('Unauthorized email address');
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const value = {
    currentUser,
    signInWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
    },
    signInWithEmail,
    signOut: () => firebaseSignOut(auth),
    isGovEmail: (email) => email?.endsWith('.gov'),
    isAdmin,
    isAuthenticated: () => currentUser !== null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
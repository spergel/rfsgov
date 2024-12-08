import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
  const { signInWithGoogle, signInWithEmail, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    
    try {
      if (isAdminLogin) {
        // Admin login doesn't require .gov email
        await signInWithEmail(email, password);
      } else {
        await signInWithGoogle();
      }
      
      const intendedPath = location.state?.from || '/';
      navigate(intendedPath, { replace: true });
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Failed to log in');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">
          {isAdminLogin ? 'Admin Login' : 'Login Required'}
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {isAdminLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-patriot-red text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Sign in as Admin
            </button>
          </form>
        ) : (
          <button
            onClick={() => handleLogin()}
            className="w-full bg-patriot-red text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sign in with Google
          </button>
        )}

        <button
          onClick={() => setIsAdminLogin(!isAdminLogin)}
          className="w-full mt-4 text-gray-600 hover:text-gray-800"
        >
          {isAdminLogin ? 'Switch to Google Sign In' : 'Switch to Admin Sign In'}
        </button>
      </div>
    </div>
  );
}

export default Login; 
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Submit from './pages/Submit.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import About from './pages/About';

export function App() {
  return (
    <Auth0Provider
      domain="dev-jmb3lq4tcsdn0tqb.us.auth0.com"
      clientId="zg9Q9KVv9uN9CVJ4k9nZe5sVZicOGmYO"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/login" element={<Login />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;

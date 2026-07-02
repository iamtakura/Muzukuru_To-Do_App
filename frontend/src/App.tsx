import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Protected from './pages/Protected';

// Route guard for authenticated pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        color: '#f4f4f5',
        background: 'radial-gradient(circle at 50% 50%, #0d0d11 0%, #050507 100%)',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        Initializing session...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route guard to prevent logged in users from visiting register/login
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        color: '#f4f4f5',
        background: 'radial-gradient(circle at 50% 50%, #0d0d11 0%, #050507 100%)',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif'
      }}>
        Initializing session...
      </div>
    );
  }

  if (token) {
    return <Navigate to="/protected" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />
      <Route
        path="/protected"
        element={
          <ProtectedRoute>
            <Protected />
          </ProtectedRoute>
        }
      />
      {/* Root/fallback redirects */}
      <Route path="/" element={<Navigate to="/protected" replace />} />
      <Route path="*" element={<Navigate to="/protected" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

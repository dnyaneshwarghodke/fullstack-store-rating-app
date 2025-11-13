// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PasswordPage from './pages/PasswordPage'; // <-- 1. IMPORT NEW PAGE

// Import Components
import ProtectedRoute from './components/ProtectedRoute';

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={ <PublicRoute> <LoginPage /> </PublicRoute> } 
          />
          <Route 
            path="/signup" 
            element={ <PublicRoute> <SignupPage /> </PublicRoute> } 
          />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute />}>
            {/* These are "child" routes. They will be rendered
              inside the <Outlet /> of ProtectedRoute.
            */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/change-password" element={<PasswordPage />} /> 
            {/* <-- 2. ADD THE NEW ROUTE */}
            
            {/* We can add more routes here later */}
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
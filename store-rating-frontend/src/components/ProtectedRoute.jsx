// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * This component acts as a "gate" for routes that
 * require a user to be logged in.
 *
 * We get the 'isLoggedIn' value from our AuthContext.
 */
const ProtectedRoute = () => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // If the user is not logged in, redirect them
    // to the /login page. 'replace' is a good practice.
    return <Navigate to="/login" replace />;
  }

  // If the user *is* logged in, we render the <Outlet />.
  // 'Outlet' is a placeholder for whatever child route
  // we are protecting. In our case, it will be the
  // <DashboardPage />.
  return <Outlet />;
};

export default ProtectedRoute;
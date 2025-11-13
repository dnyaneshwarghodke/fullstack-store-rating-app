// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // <-- 1. THE FIX: Changed import style

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // 3. Check for token in localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // <-- 2. THE FIX: Use 'jwtDecode' (camelCase)
        const decodedUser = jwtDecode(storedToken); 
        // Check if token is expired
        const isExpired = decodedUser.exp * 1000 < Date.now();
        if (!isExpired) {
          setToken(storedToken);
          setUser(decodedUser);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('token');
        }
      } catch (error) {
        // Token is invalid
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  // 4. Login Function
  const login = (newToken) => {
    try {
      // <-- 3. THE FIX: Use 'jwtDecode' (camelCase)
      const decodedUser = jwtDecode(newToken); 
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  // 5. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // 6. The "value" we provide to all children
  const value = {
    token,
    user,
    isLoggedIn: !!token,
    // We can also pass the role for convenience
    userRole: user ? user.role : null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7. Create a custom hook to use the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
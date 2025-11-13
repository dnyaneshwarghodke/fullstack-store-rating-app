// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- 1. IMPORT LINK

// Import Dashboard Components
import StoreList from '../components/StoreList'; 
import OwnerSummary from '../components/OwnerSummary';
import OwnerRatersList from '../components/OwnerRatersList';
import AdminDashboard from '../components/AdminDashboard'; 

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Store Rating App</h1>
        <div className="user-info">
          <span>Welcome, {user ? user.name : 'User'}!</span>
          {/* 2. ADD A LINK TO THE NEW PAGE */}
          <Link to="/change-password" className="header-link">Change Password</Link>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <main className="dashboard-main">
        {/* Role-based rendering */}
        
        {user && user.role === 'ADMIN' && (
          <AdminDashboard />
        )}
        
        {user && user.role === 'NORMAL' && (
          <StoreList />
        )}
        
        {user && user.role === 'OWNER' && (
          <>
            <OwnerSummary />
            <OwnerRatersList />
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
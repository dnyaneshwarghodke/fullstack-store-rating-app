// src/components/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement'; 
import StoreManagement from './StoreManagement'; // <-- 1. IMPORT THE NEW COMPONENT

const AdminDashboard = () => {
  // This state will track which tab is active
  const [activeTab, setActiveTab] = useState('stats');

  // This function renders the correct component
  // based on the activeTab state
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'stores':
        return <StoreManagement />; // <-- 2. RENDER THE NEW COMPONENT
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button
          // We set 'active' class if this tab is the active one
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Dashboard Stats
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Manage Stores
        </button>
      </div>
      
      <div className="admin-content">
        {/* Render the active component here */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
// src/components/AdminStats.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Note: We are re-using the .summary-box CSS class
// from the Owner's dashboard for consistent styling.

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // This API call is protected for 'ADMIN' only
        const response = await api.get('/dashboard/admin-stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard stats.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Runs once on component mount

  if (loading) {
    return <p>Loading stats...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!stats) {
    return <p>No stats available.</p>;
  }

  return (
    <div className="admin-stats-container">
      <div className="summary-boxes">
        <div className="summary-box">
          <strong>Total Users</strong>
          <span>{stats.total_users}</span>
        </div>
        <div className="summary-box">
          <strong>Total Stores</strong>
          <span>{stats.total_stores}</span>
        </div>
        <div className="summary-box">
          <strong>Total Ratings</strong>
          <span>{stats.total_ratings}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
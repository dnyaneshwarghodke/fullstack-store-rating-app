// src/components/OwnerSummary.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';


const OwnerSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        // This API call is protected for 'OWNER' only
        // and returns the summary for *their* linked store.
        const response = await api.get('/dashboard/my-store/summary');
        setSummary(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No store is linked to your owner account.');
        } else {
          setError('Failed to fetch store summary.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []); // Runs once on component mount

  if (loading) {
    return <p>Loading summary...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!summary) {
    return null; // Don't render anything if no summary
  }

  return (
    <div className="owner-summary-container">
      <h3>Your Store Summary</h3>
      <h4 className="store-name">{summary.name}</h4>
      <div className="summary-boxes">
        <div className="summary-box">
          <strong>Average Rating</strong>
          <span>{summary.average_rating ? `${summary.average_rating} ★` : 'N/A'}</span>
        </div>
        <div className="summary-box">
          <strong>Total Ratings</strong>
          <span>{summary.total_ratings}</span>
        </div>
      </div>
    </div>
  );
};

export default OwnerSummary;
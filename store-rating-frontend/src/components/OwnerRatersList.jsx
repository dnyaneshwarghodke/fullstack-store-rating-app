// src/components/OwnerRatersList.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
 

const OwnerRatersList = () => {
  const [raters, setRaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRaters = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/my-store/raters');
        setRaters(response.data);
      } catch (err) {
        setError('Failed to fetch list of raters.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRaters();
  }, []); // Runs once on component mount

  if (loading) {
    return <p>Loading ratings list...</p>;
  }
  
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="raters-list-container">
      <h3>Recent Ratings</h3>
      {raters.length === 0 ? (
        <p>Your store has not received any ratings yet.</p>
      ) : (
        <table className="raters-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Rating Given</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {raters.map((rater, index) => (
              <tr key={index}>
                <td>{rater.name}</td>
                <td>{rater.email}</td>
                <td className="rating-cell">{rater.rating_value} ★</td>
                <td>{new Date(rater.rated_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerRatersList;
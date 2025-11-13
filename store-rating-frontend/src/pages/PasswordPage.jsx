// src/pages/PasswordPage.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // We need the 'logout' function from our context
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Call the PUT /users/password route
      await api.put('/users/password', { newPassword });
      
      setSuccess('Password updated successfully! Please log in again with your new password.');
      
      // IMPORTANT: Changing a password should invalidate the
      // old token. The best practice is to force a re-login.
      // We will log the user out after a short delay.
      setTimeout(() => {
        logout();
      }, 3000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMsg = err.response.data.errors.map(er => er.msg).join(', ');
        setError(errorMsg);
      } else if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to update password.');
      } else {
        setError('Failed to update password. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return (
    // We can re-use the .auth-container and .auth-form styles
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Change Password</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        {/* If successful, we hide the form */}
        {!success && (
          <>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="8"
                maxLength="16"
              />
              <small>8-16 chars, 1 uppercase, 1 special character.</small>
            </div>
            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </>
        )}
        
        <p className="auth-link">
          <Link to="/">Back to Dashboard</Link>
        </p>
      </form>
    </div>
  );
};

export default PasswordPage;
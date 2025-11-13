// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Use our 'api' service to make the request
      await api.post('/auth/signup', {
        name,
        email,
        address,
        password,
      });

      setSuccess('Signup successful! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      // Handle validation errors from the backend
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMsg = err.response.data.errors.map(er => er.msg).join(', ');
        setError(errorMsg);
      } else if (err.response && err.response.data) {
        setError(err.response.data.message || 'Signup failed.');
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength="20"
            maxLength="60"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            maxLength="400"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
            maxLength="16"
          />
          <small>8-16 chars, 1 uppercase, 1 special character.</small>
        </div>
        <button type="submit" className="auth-button">Sign Up</button>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Use our 'api' service to make the request
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // The response.data will have our token
      const { token } = response.data;
      
      // Call the 'login' function from our AuthContext
      // This will save the token and update the user state
      login(token);

      // Redirect to the dashboard
      navigate('/');

    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
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
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Login</button>
        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
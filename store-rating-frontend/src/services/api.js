// src/services/api.js
import axios from 'axios';

// Create an "instance" of axios
const api = axios.create({
  // Set the base URL for all API requests
  // This is your backend server's address
  baseURL: 'http://localhost:3001', 
});

/**
 * This is a "request interceptor". It's a function that
 * will run BEFORE every single request that axios makes.
 *
 * Its job is to check if we have a token in localStorage,
 * and if we do, add it to the 'Authorization' header.
 *
 * This is how we will send our token on every protected request!
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // 'config' is the request object. We add the token to its headers.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // We must return the modified config
  },
  (error) => {
    // Handle any request errors
    return Promise.reject(error);
  }
);

export default api;
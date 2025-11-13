// src/services/api.js
import axios from 'axios';

// This is the "magic" line.
// It tells our app: "Try to find a special 'VITE_API_URL' variable
// (which Vercel will give us). If you can't find one (because
// we are on localhost), then use 'http://localhost:3001' as a fallback."
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
});

// This is our "interceptor" that automatically adds the
// Authorization token to every request. (This code is unchanged).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
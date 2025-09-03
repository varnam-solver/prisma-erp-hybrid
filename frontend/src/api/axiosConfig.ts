// src/api/axiosConfig.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// This is an "interceptor" - a piece of code that runs
// BEFORE each request is sent.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // <-- use "authToken"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
// src/api/axiosConfig.ts

import axios from 'axios';

// Create an instance of axios with the base URL of our backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // The address of your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
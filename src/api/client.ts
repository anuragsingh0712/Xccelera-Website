import axios from 'axios';
import toast from 'react-hot-toast';

// Single shared axios instance. baseURL is left relative until VITE_API_URL is set in .env.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token from localStorage to every real API call.
apiClient.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('auth_token');
    if (raw) {
      try {
        const token = JSON.parse(raw) as { userId: string };
        config.headers['Authorization'] = `Bearer ${token.userId}`;
      } catch {
        // Malformed token — ignore and proceed without auth header.
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — normalize errors and fire exactly one toast per failure.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';

    if (error.response) {
      const status = error.response.status as number;
      if (status === 401) {
        message = 'You are not authorized. Please log in again.';
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status >= 500) {
        message = 'A server error occurred. Please try again later.';
      } else if (error.response.data?.message) {
        message = error.response.data.message as string;
      }
    } else if (error.request) {
      message = 'Network error — could not reach the server.';
    }

    toast.error(message);
    return Promise.reject(error);
  },
);

export default apiClient;

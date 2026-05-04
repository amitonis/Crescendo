import axios, { AxiosError, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor for centralized error handling
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.debug(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error: unknown) => {
    const axiosError = error as AxiosError;

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        method: axiosError.config?.method?.toUpperCase(),
        url: axiosError.config?.url,
        status: axiosError.response?.status,
        message: axiosError.message,
        data: axiosError.response?.data,
      });
    }

    // Handle specific error cases
    if (axiosError.response?.status === 401) {
      // Unauthorized - might want to trigger logout here
      console.warn('[API] Unauthorized - user may need to re-authenticate');
    }

    if (axiosError.response?.status === 403) {
      // Forbidden
      console.warn('[API] Forbidden - user lacks permissions');
    }

    if (axiosError.response?.status === 429) {
      // Too many requests
      console.warn('[API] Rate limited - too many requests');
    }

    return Promise.reject(axiosError);
  }
);

export default api;


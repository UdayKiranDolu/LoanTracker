/**
 * API Service - Axios Configuration with Authentication
 */

import axios from 'axios';
import tokenService from './tokenService'; // FIXED: Use tokenService instead of authService

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies (refresh tokens)
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  (config) => {
    // FIXED: Get token from tokenService
    const token = tokenService.getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    // FIXED: Return full response object
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ============================================
    // Handle Token Refresh (401 errors)
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // FIXED: Get refresh token from tokenService
        const refreshToken = tokenService.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // FIXED: Use axios directly to avoid circular dependency
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { 
          refreshToken 
        }, {
          withCredentials: true
        });
        
        const { accessToken } = response.data.data;

        // FIXED: Update stored tokens using tokenService
        tokenService.setTokens(accessToken, refreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        console.error('🔄 Token refresh failed:', refreshError);
        tokenService.clearTokens();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // Handle Other Errors
    // ============================================
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      // Log errors in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error [${status}]:`, data);
      }

      // Handle specific status codes
      switch (status) {
        case 400:
          // Bad Request - Validation errors
          console.error('⚠️ Validation Error:', data.message || data.errors);
          
          if (data.errors && Array.isArray(data.errors)) {
            console.error('📋 Validation Details:');
            data.errors.forEach(err => {
              console.error(`   - ${err.field}: ${err.message}`);
            });
          }
          
          console.error('Full error object:', data);
          break;

        case 401:
          // Unauthorized - Already handled by token refresh above
          console.error('🔒 Unauthorized - Invalid or expired token');
          break;

        case 403:
          // Forbidden - Insufficient permissions
          console.error('🚫 Access Forbidden:', data.message);
          
          // Redirect to unauthorized page
          if (typeof window !== 'undefined' && !originalRequest._retry) {
            window.location.href = '/unauthorized';
          }
          break;

        case 404:
          // Not Found
          console.error('🔍 Resource Not Found:', data.message);
          break;

        case 429:
          // Too Many Requests - Rate limited
          console.error('⏱️ Rate Limit Exceeded:', data.message);
          break;

        case 500:
          // Server Error
          console.error('💥 Server Error:', data.message);
          break;

        case 503:
          // Service Unavailable
          console.error('🔧 Service Unavailable:', data.message);
          break;

        default:
          console.error(`❓ Unexpected Error [${status}]:`, data.message);
          break;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('🌐 Network Error - No response received:', error.request);
      
      // User-friendly network error message
      error.message = 'Network error. Please check your internet connection.';
    } else {
      // Error in request configuration
      console.error('⚙️ Request Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Helper function to check API health
// ============================================
export const checkAPIHealth = async () => {
  try {
    const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
    return response.data;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return null;
  }
};

// ============================================
// Helper function to handle file uploads
// ============================================
export const uploadFile = async (endpoint, file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = tokenService.getAccessToken(); // FIXED: Use tokenService

  return axios.post(`${API_URL}${endpoint}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
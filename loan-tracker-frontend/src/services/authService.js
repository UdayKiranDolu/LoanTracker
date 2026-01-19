/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from './api';
import tokenService from './tokenService';

const authService = {
  // ============================================
  // TOKEN MANAGEMENT (Re-export from tokenService)
  // ============================================
  
  setTokens: tokenService.setTokens,
  getAccessToken: tokenService.getAccessToken,
  getRefreshToken: tokenService.getRefreshToken,
  clearTokens: tokenService.clearTokens,
  
  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data; // FIXED: api now returns full response
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refreshToken: async () => {
    const refreshToken = tokenService.getRefreshToken();
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (updates) => {
    const response = await api.patch('/auth/update-profile', updates);
    return response.data;
  },
  
  updatePassword: async (passwordData) => {
    const response = await api.patch('/auth/update-password', passwordData);
    return response.data;
  },
  
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },
  
  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, passwordData) => {
    const response = await api.patch(`/auth/reset-password/${token}`, passwordData);
    return response.data;
  }
};

export default authService;
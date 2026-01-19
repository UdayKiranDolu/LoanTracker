import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = authService.getAccessToken();
    
    if (token) {
      try {
        const response = await authService.getMe();
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        authService.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    
    setLoading(false);
  };

// Register
const register = async (userData) => {
  try {
    const response = await authService.register(userData);
    const { user, accessToken, refreshToken } = response.data;
    
    authService.setTokens(accessToken, refreshToken);
    setUser(user);
    setIsAuthenticated(true);
    
    toast.success(response.message || 'Registration successful!');
    navigate('/dashboard');
    
    return response;
  } catch (error) {
    // NEW: Better error handling
    console.error('Registration error:', error);
    
    // Check if it's a validation error
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
    
    throw error;
  }
};

// Login
const login = async (credentials) => {
  try {
    const response = await authService.login(credentials);
    const { user, accessToken, refreshToken } = response.data;
    
    authService.setTokens(accessToken, refreshToken);
    setUser(user);
    setIsAuthenticated(true);
    
    toast.success('Login successful!');
    navigate('/dashboard');
    
    return response;
  } catch (error) {
    // NEW: Better error handling
    console.error('Login error:', error);
    
    // Check if it's a validation error
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    }
    
    throw error;
  }
};

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      // Still clear local state even if API call fails
      authService.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      const response = await authService.updateProfile(updates);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData);
      toast.success('Password updated successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    updatePassword,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    console.log('[AUTH CONTEXT] Initializing auth context');
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('[AUTH CONTEXT] User authenticated from storage');
      } else {
        console.log('[AUTH CONTEXT] No authentication found');
      }
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Check auth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AUTH CONTEXT] Login attempt');
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('[AUTH CONTEXT] Login successful');
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Login failed:', error);
      toast.error(error.message || 'Login failed');
      return { success: false, error };
    }
  };

  const signup = async (userData) => {
    try {
      console.log('[AUTH CONTEXT] Signup attempt');
      const response = await authService.signup(userData);
      
      if (response.success) {
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('[AUTH CONTEXT] Signup successful');
        toast.success('Account created successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Signup failed:', error);
      toast.error(error.message || 'Signup failed');
      return { success: false, error };
    }
  };

  const logout = () => {
    console.log('[AUTH CONTEXT] Logout');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const updateUser = async (profileData) => {
    try {
      console.log('[AUTH CONTEXT] Update user profile');
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data);
        console.log('[AUTH CONTEXT] Profile updated');
        toast.success('Profile updated successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[AUTH CONTEXT ERROR] Update profile failed:', error);
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
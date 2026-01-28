import api from './api';

export const authService = {
  signup: async (userData) => {
    try {
      console.log('[AUTH SERVICE] Signup request');
      const response = await api.post('/auth/signup', userData);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('[AUTH SERVICE ERROR] Signup failed:', error);
      throw error.response?.data || { message: 'Signup failed' };
    }
  },

  login: async (credentials) => {
    try {
      console.log('[AUTH SERVICE] Login request');
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('[AUTH SERVICE ERROR] Login failed:', error);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  logout: () => {
    console.log('[AUTH SERVICE] Logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    try {
      console.log('[AUTH SERVICE] Get current user');
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('[AUTH SERVICE ERROR] Get current user failed:', error);
      throw error.response?.data || { message: 'Failed to fetch user' };
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log('[AUTH SERVICE] Update profile');
      const response = await api.put('/users/profile', profileData);
      if (response.data.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        const updatedUser = { ...user, ...response.data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return response.data;
    } catch (error) {
      console.error('[AUTH SERVICE ERROR] Update profile failed:', error);
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },
};
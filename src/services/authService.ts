import api from './api';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  // Sign up a new user
  async signup(userData: SignupData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Log in a user
  async login(credentials: LoginData) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Store user data if needed
      if (response.data.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  },

  // Log out the current user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get the current authenticated user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Forgot password
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, password: string) {
    const response = await api.patch(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch('/auth/update-my-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default authService;

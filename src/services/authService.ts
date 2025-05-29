import api from './api';

// Interface for user data to be stored in session
interface StoredUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

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

// Helper function to set cookie
const setCookie = (name: string, value: string, days = 1) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
};

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const authService = {
  // Sign up a new user
  async signup(userData: SignupData) {
    const response = await api.post('/auth/signup', userData);
    // If signup was successful and includes user data, store it
    if (response.data.token) {
      setCookie('token', response.data.token);
      if (response.data.data?.user) {
        this.storeUserData(response.data.data.user);
      }
    }
    return response.data;
  },

  // Store user data in localStorage
  storeUserData(userData: any) {
    if (!userData) return;
    
    const userToStore: Partial<StoredUserData> = {
      id: userData._id || userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'user',
      isEmailVerified: userData.isEmailVerified || false
    };
    
    localStorage.setItem('user', JSON.stringify(userToStore));
  },

  // Log in a user
  async login(credentials: LoginData) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setCookie('token', response.data.token);
      // Store user data if available
      if (response.data.data?.user) {
        this.storeUserData(response.data.data.user);
      }
    }
    return response.data;
  },

  // Log out the current user
  logout() {
    deleteCookie('token');
    localStorage.removeItem('user');
  },

  // Get the current authenticated user
  getCurrentUser(): StoredUserData | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Get user's full name
  getUserFullName(): string {
    const user = this.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  },
  
  // Check if user has a specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  },

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!getCookie('token') || !!localStorage.getItem('token');
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

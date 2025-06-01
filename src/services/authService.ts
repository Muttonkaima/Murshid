import api from './api';

// Interface for user data to be stored in session
interface StoredUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  onboarded: boolean;
  authProvider?: 'local' | 'google';
  googleId?: string;
  createdAt?: string;
  passwordChangedAt?: string;
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
export const setCookie = (name: string, value: string, days = 1) => {
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
  // Clear cookie with all possible paths and domains
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  // Clear for subdomains as well
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  // Clear for current path
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${window.location.pathname};`;
};

// Google OAuth response type
export interface GoogleAuthResponse {
  status: string;
  token: string;
  data: {
    user: StoredUserData & {
      _id: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
      id: string;
    };
  };
}

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
  storeUserData(userData: any): void {
    if (typeof window === 'undefined' || !userData) return;
    
    try {
      const userToStore: Partial<StoredUserData> = {
        id: userData._id || userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        isEmailVerified: userData.isEmailVerified || false,
        onboarded: userData.onboarded || false,
        authProvider: userData.authProvider || 'local',
        googleId: userData.googleId || null,
        createdAt: userData.createdAt || null,
        passwordChangedAt: userData.passwordChangedAt || null,
      };
      
      localStorage.setItem('user', JSON.stringify(userToStore));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Log in a user
  async login(credentials: LoginData) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setCookie('token', response.data.token);
      localStorage.setItem('token', response.data.token);
      // Store user data if available
      if (response.data.data?.user) {
        this.storeUserData(response.data.data.user);
      }
    }
    return response.data;
  },

  // Log out the current user
  logout() {
    // Clear all auth related cookies
    deleteCookie('token');
    deleteCookie('connect.sid'); // Clear any session cookies
    
    // Clear all auth related local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear any session storage
    sessionStorage.clear();
    
    // Clear axios default headers
    if (api.defaults.headers.common['Authorization']) {
      delete api.defaults.headers.common['Authorization'];
    }
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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

  // Check if user has completed onboarding
  isOnboarded(): boolean {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).onboarded === true : false;
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

  // Update password for logged-in user
  async updatePassword(currentPassword: string, newPassword: string) {
    console.log('Sending password update request...');
    try {
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'Token exists' : 'No token found');
      
      const response = await api.patch('/auth/update-my-password', { 
        currentPassword, 
        newPassword 
      });
      
      console.log('Password update response:', response);
      return response;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  },
  
  // Google OAuth login
  loginWithGoogle(action: 'login' | 'signup' = 'login'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Store the action in localStorage to handle the response
        localStorage.setItem('oauthAction', action);
        
        // Get the current URL to redirect back after authentication
        const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const redirectUri = `${frontendUrl}/auth/callback`;
        
        // Get the backend URL
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Construct the OAuth URL
        const authUrl = new URL(`${backendUrl}/api/auth/google`);
        authUrl.searchParams.set('action', action);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        
        // Store the current path to redirect back after authentication
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/signup') {
            localStorage.setItem('redirectAfterAuth', currentPath);
          }
        }
        
        // Redirect to the OAuth URL
        window.location.href = authUrl.toString();
        
        // The promise will never resolve if the redirect is successful
        // This is just to satisfy TypeScript
        return new Promise(() => {});
        
      } catch (error) {
        console.error('Google OAuth error:', error);
        reject(error instanceof Error ? error : new Error('Failed to initiate Google authentication'));
        return Promise.reject(error);
      }
    });
  },
  
  // Handle successful authentication
  handleAuthentication(token: string, userData: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Store the token in cookies
      const cookieOptions = {
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      };
      
      document.cookie = `token=${token}; ${Object.entries(cookieOptions)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')}`;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Store user data in localStorage
      this.storeUserData(userData);
      
      // Get the redirect URL from localStorage or default to '/dashboard'
      const redirectPath = localStorage.getItem('redirectAfterAuth') || '/dashboard';
      localStorage.removeItem('redirectAfterAuth');
      
      // Redirect to the desired page
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Error handling authentication:', error);
      throw new Error('Failed to complete authentication');
    }
  },
  

};

export default authService;

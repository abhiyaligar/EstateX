import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and listen to Supabase auth changes
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check for existing Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const accessToken = session.access_token;
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', session.refresh_token);
        
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    // 2. Listen for auth state changes (OAuth login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const accessToken = session.access_token;
        setToken(accessToken);
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', session.refresh_token);
        
        // Fetch user profile
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
        }
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      // Fetch user profile after login
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = userResponse.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || "Login failed. Please try again." 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || "Registration failed." 
      };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const sendAuthOtp = async (email) => {
    try {
      const response = await api.post('/auth/login/otp/send', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to send login code."
      };
    }
  };

  const verifyAuthOtp = async (email, otpCode) => {
    try {
      const response = await api.post('/auth/login/otp/verify', { 
        email, 
        otp_code: otpCode,
        otp_type: "magiclink" // kept for schema compatibility
      });
      const { access_token, refresh_token } = response.data;
      
      // Fetch user profile
      const userResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const userData = userResponse.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid or expired login code."
      };
    }
  };

  const verifyRegistrationOtp = async (email, otpCode) => {
    try {
      const response = await api.post('/auth/register/verify-otp', { 
        email, 
        otp_code: otpCode,
        otp_type: "signup" 
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Verification failed."
      };
    }
  };

  const resendOtp = async (email, purpose) => {
    try {
      const response = await api.post('/auth/otp/resend', { email, purpose });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to resend OTP."
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    sendAuthOtp,
    verifyAuthOtp,
    verifyRegistrationOtp,
    resendOtp,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

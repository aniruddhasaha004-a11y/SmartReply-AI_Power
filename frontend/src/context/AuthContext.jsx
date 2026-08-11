import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Synchronous recovery from localStorage
    const cachedUser = authService.getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
      // Fetch latest profile asynchronously to update preferences/details
      userService.getProfile()
        .then(profile => {
          setUser(prev => ({ ...prev, ...profile }));
        })
        .catch(() => {
          // If profile fetch fails (e.g. token expired), log out
          logout();
        });
    }
    setLoading(false);

    // Listen to token expiration globally
    const handleAuthExpired = () => {
      setUser(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updatePreferredToneState = (tone) => {
    setUser(prev => prev ? { ...prev, preferredTone: tone } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferredToneState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

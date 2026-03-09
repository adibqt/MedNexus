/**
 * AdminAuthContext - Admin authentication state management
 * Handles admin login and session state
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext(null);

/**
 * useAdminAuth - Hook to access admin authentication context
 * Must be used within an AdminAuthProvider
 */
export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};

/**
 * AdminAuthProvider - Context provider for admin authentication
 * Manages admin session and login state
 */
export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Check for stored admin authentication on mount
   */
  useEffect(() => {
    const stored = localStorage.getItem('admin_authenticated');
    setIsAdminAuthenticated(stored === 'true');
    setLoading(false);
  }, []);

  /**
   * Admin login - validates credentials and sets authentication state
   */
  const login = ({ email, password }) => {
    // Simple credential check as requested
    if (email === 'admin@mednexus.com' && password === 'admin123') {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAdminAuthenticated(true);
      navigate('/admin', { replace: true });
      return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
  };

  /**
   * Admin logout - clears session and redirects to home
   */
  const logout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminAuthenticated(false);
    navigate('/', { replace: true });
  };

  const value = {
    isAdminAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;



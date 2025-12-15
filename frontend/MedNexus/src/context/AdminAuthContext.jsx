import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('admin_authenticated');
    setIsAdminAuthenticated(stored === 'true');
    setLoading(false);
  }, []);

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



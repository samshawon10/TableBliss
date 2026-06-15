import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';
import { signInWithGoogle } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const initialLoadDone = useRef(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      initialLoadDone.current = true;
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      const userData = data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(storedToken);
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
      initialLoadDone.current = true;
    }
  }, [clearAuth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password, role = 'customer') => {
    const { data } = await authAPI.register({ name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async () => {
    const firebaseUser = await signInWithGoogle();
    const { data } = await authAPI.googleLogin({
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      firebaseUid: firebaseUser.uid,
      avatar: firebaseUser.photoURL,
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const getDashboardUrl = useCallback(() => {
    if (!user) return '/auth/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'restaurant_owner') return '/owner/dashboard';
    return '/dashboard';
  }, [user]);

  const value = {
    user,
    loading,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    loadUser,
    clearAuth,
    getDashboardUrl,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isRestaurantOwner: user?.role === 'restaurant_owner',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
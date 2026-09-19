import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as loginService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vc_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getMe()
        .then(data => setUser(data))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('vc_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (data) => {
    const res = await loginService(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('vc_token', res.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vc_token');
  };

  const updateUser = (data) => {
    setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

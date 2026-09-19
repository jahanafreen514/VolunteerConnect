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
        .then(res => {
          const userData = res?.data !== undefined ? res.data : res;
          setUser(userData);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('vc_token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (emailOrData, password) => {
    const payload = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, password };
    const res = await loginService(payload);
    const authData = res?.data !== undefined ? res.data : res;
    const newToken = authData?.token;
    const newUser = authData?.user;

    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('vc_token', newToken);
    }
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vc_token');
  };

  const updateUser = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

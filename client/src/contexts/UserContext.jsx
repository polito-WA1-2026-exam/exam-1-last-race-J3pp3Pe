import React, { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth.js';
import { User } from '../models/GameModels.js';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await authApi.getAuthStatus();
      if (status.authenticated && status.user) {
        setUser(new User(status.user.id, status.user.username));
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const data = await authApi.login(username, password);

      setUser(new User(data.user.id, data.user.username));
      return true;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, logout, checkAuthStatus }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

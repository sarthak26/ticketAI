import { useEffect, useState } from 'react';

const TOKEN_STORAGE_KEY = 'ticketai_token';

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY));

  useEffect(() => {
    const onStorage = () => {
      setToken(localStorage.getItem(TOKEN_STORAGE_KEY));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    isAuthenticated: Boolean(token),
    token,
    clearAuth: () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
    },
  };
};

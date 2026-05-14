import { createContext, useContext } from 'react';
import type { IAuthContext } from '../../interfaces/auth';

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

import { useEffect, useState, type ReactNode } from 'react';
import type { IAuthUser, LoginData } from '../../interfaces/auth';
import { AuthContext } from './AuthContext';
import { loginUser, getUser, logoutUser } from '../../services/authService';
import { useQueryClient } from '@tanstack/react-query';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  async function login(loginData: LoginData) {
    await loginUser(loginData);
    queryClient.clear();
    const user = await getUser();
    user.id = user.pk;
    setAuthUser(user);
  }

  async function logout() {
    await logoutUser();
    queryClient.clear();
    setAuthUser(null);
  }

  useEffect(() => {
    getUser()
      .then((user) => {
        user.id = user.pk;
        setAuthUser(user);
      })
      .catch(() => setAuthUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { useAuthStore } from '../store/useAuthStore';

export function useAuth() {
  const { user, isAuthenticated, isLoading, login, register, logout, checkAuth } = useAuthStore();

  const isArtist = user?.role === 'artist';
  const isFan = user?.role === 'fan';
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isLoading,
    isArtist,
    isFan,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };
}

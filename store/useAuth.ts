import { useAppStore } from "./AppStore";

export const useAuth = () => {
  const { user, login, logout, signup } = useAppStore();

  return {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    signup
  };
};

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getStoredToken, setStoredToken, type AuthUser, type RegisterResponse } from "./api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<RegisterResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => setStoredToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const { token, user: loggedInUser } = await api.login(email, password);
    setStoredToken(token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(email: string, password: string): Promise<RegisterResponse> {
    // Registration no longer logs the user in -- they must verify their email first.
    return api.register(email, password);
  }

  function logout(): void {
    setStoredToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

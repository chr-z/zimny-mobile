import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type AuthUser = {
  email: string;
  name: string;
  avatarUrl: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Autenticação base (mock). Substituir por sessão WordPress/JWT quando disponível.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, _password: string) => {
    const trimmed = email.trim();
    const local = trimmed.split("@")[0] ?? "Leitor";
    setUser({
      email: trimmed,
      name: local.charAt(0).toUpperCase() + local.slice(1),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmed)}&background=000000&color=FFFFFF&size=256&bold=true`,
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  identifier: string;
  department?: string;
  backgroundColor?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pagini care nu necesită autentificare
const publicPages = ["/login", "/register", "/forgot-password", "/"];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Redirect logic după verificarea auth
    if (!isLoading) {
      const isPublicPage = publicPages.includes(pathname);

      if (!user && !isPublicPage) {
        // Nu e logat și încearcă să acceseze o pagină protejată
        router.push("/login");
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        // E logat și încearcă să acceseze login/register
        router.push("/dashboard");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, pathname]);

  const checkAuthStatus = async () => {
    try {
      // Verifică localStorage pentru utilizatorul logat
      const cachedUser = localStorage.getItem("user");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Eroare la verificarea autentificării:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // Redirect către dashboard după login reușit
    if (pathname === "/login" || pathname === "/register") {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
      // Apelează API-ul de logout
      await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Eroare la logout:", error);
    } finally {
      // Curăță state-ul local indiferent de rezultat
      setUser(null);
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizat pentru folosirea context-ului
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook pentru verificarea rolurilor
export function useRole() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role?.toUpperCase() === "ADMIN",
    isManager:
      user?.role?.toUpperCase() === "MANAGER" ||
      user?.role?.toUpperCase() === "ADMIN",
    isUser: !!user,
    role: user?.role || null,
    hasSubordinates:
      user?.role?.toUpperCase() === "MANAGER" ||
      user?.role?.toUpperCase() === "ADMIN",
  };
}

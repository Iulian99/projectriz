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
// creare container global
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pagini care nu necesită autentificare
const publicPages = [
  "/login",
  "/register",
  "/forgot-password",
  "/",
  "/add-user",
];

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
        // Nu e logat + accesare pagina protejata
        router.push("/login");
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        // dupa login
        router.push("/dashboard");
      }
    }
    // verificare variabile in useEffect sa fie în dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, pathname]);

  const checkAuthStatus = async () => {
    try {
      // verificare localStorage pentru utilizator
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

    // redirectionare catre dashboard dupa login utilizator
    if (pathname === "/login" || pathname === "/register") {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    try {
      // API de logout
      await fetch("/api/user-management/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Eroare la logout:", error);
    } finally {
      // Curatare state-ul local - localStorage
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

// Hook pentru context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook verificare roluri
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

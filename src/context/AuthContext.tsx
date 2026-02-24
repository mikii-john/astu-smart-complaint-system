import React, { createContext, useContext, useState, useEffect } from "react";

export type Role = "student" | "staff" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("astu_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (role: Role) => {
    let mockUser: User;
    
    switch (role) {
      case "student":
        mockUser = { id: "s1", name: "Alex Student", email: "alex@astu.edu", role: "student" };
        break;
      case "staff":
        mockUser = { id: "st1", name: "Sarah Staff", email: "sarah@astu.edu", role: "staff", department: "IT Support" };
        break;
      case "admin":
        mockUser = { id: "a1", name: "Admin User", email: "admin@astu.edu", role: "admin" };
        break;
    }
    
    setUser(mockUser);
    localStorage.setItem("astu_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("astu_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

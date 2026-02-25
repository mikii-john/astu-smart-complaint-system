import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

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
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rely solely on onAuthStateChange for initial session and updates
    // This avoids Navigator LockManager contention between getSession and listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Handle the case where the profile doesn't exist yet (e.g. trigger delay or failure)
        if (error.code === "PGRST116") {
          console.warn("Profile not found for user ID:", userId);
          setUser(null);
          return;
        }
        throw error;
      }
      
      if (data) {
        setUser({
          id: data.id,
          name: data.full_name,
          email: data.email,
          role: data.role as Role,
          department: data.department,
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile detail:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAuthenticated: !!user }}>
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

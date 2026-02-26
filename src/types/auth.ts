import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from "@supabase/supabase-js";

export type Role = "student" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<AuthResponse>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<AuthResponse>;
  isAuthenticated: boolean;
}

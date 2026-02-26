import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "@/hooks/useAuth";
import type { User, Role } from "@/types/auth";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from "@supabase/supabase-js";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchProfile = async (userId: string, metadata?: any) => {
    try {
      console.log(`[Auth] Fetching profile for ${userId}...`);
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.warn("[Auth] Profile not found. Attempting fallback creation...");
          
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const userMetadata = metadata || authUser?.user_metadata;
          
          if (authUser && userMetadata) {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                full_name: userMetadata.full_name || "New User",
                email: authUser.email,
                role: userMetadata.role || "student"
              })
              .select()
              .single();
            
            if (createError) throw createError;
            data = newProfile;
          } else {
            console.error("[Auth] No metadata available for fallback profile creation.");
            setUser(null);
            return;
          }
        } else {
          throw error;
        }
      }
      
      if (data && isMounted.current) {
        console.log("[Auth] Profile found:", data.role);
        setUser({
          id: data.id,
          name: data.full_name,
          email: data.email,
          role: data.role as Role,
          department: data.department,
        });
      }
    } catch (error: any) {
      console.error("[Auth] Profile fetch error:", error.message);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    const initializeAuth = async () => {
      try {
        console.log("[Auth] Initializing session check...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (isMounted.current) {
          if (session) {
            console.log("[Auth] Initial session found");
            await fetchProfile(session.user.id);
          } else {
            console.log("[Auth] No initial session");
            setUser(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("[Auth] Initialization error:", err);
        if (isMounted.current) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;
      console.log("[Auth] State change event:", event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || (event === 'INITIAL_SESSION' && session)) {
        if (session) await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    const timeout = setTimeout(() => {
      if (isMounted.current && loading) {
        console.warn("[Auth] Initialization safety timeout reached");
        setLoading(false);
      }
    }, 15000);

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await supabase.auth.signInWithPassword(credentials);
      if (response.error) throw response.error;
      
      if (response.data.user) {
        await fetchProfile(response.data.user.id, response.data.user.user_metadata);
      }
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await supabase.auth.signUp(credentials);
      if (response.error) throw response.error;
      
      // For sign-up, we set loading false so UI can show message.
      // fetchProfile will be triggered by onAuthStateChange if automatically confirmed.
      setLoading(false);
      return response;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log("[Auth] Logging out...");
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signIn, signUp, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

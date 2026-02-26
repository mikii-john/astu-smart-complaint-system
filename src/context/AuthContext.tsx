import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "@/hooks/useAuth";
import type { User, Role } from "@/types/auth";
import { SignInWithPasswordCredentials, SignUpWithPasswordCredentials, AuthResponse } from "@supabase/supabase-js";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const fetchPromise = useRef<Promise<void> | null>(null);

  const fetchProfile = async (userId: string, metadata?: any, emailAddr?: string) => {
    // If a fetch is already in progress, wait for it instead of starting a new one
    if (fetchPromise.current) {
      console.log(`[Auth] Fetch already in progress for ${userId}, waiting...`);
      return fetchPromise.current;
    }
    
    fetchPromise.current = (async () => {
      try {
        console.log(`[Auth] Fetching profile for ${userId}...`);
        
        // Add a local timeout for the fetch itself
        const fetchTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Profile fetch timeout")), 10000)
        );

        const fetchCall = supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        const { data, error } = await Promise.race([fetchCall, fetchTimeout]) as any;

        if (error) {
          if (error.code === "PGRST116") {
            console.warn("[Auth] Profile not found. Attempting fallback creation...");
            
            let userMetadata = metadata;
            let email = emailAddr || metadata?.email;

            if (!userMetadata || !email) {
              const { data: { session } } = await supabase.auth.getSession();
              userMetadata = userMetadata || session?.user?.user_metadata;
              email = email || session?.user?.email;
            }
            
            if (email && userMetadata) {
              console.log("[Auth] Creating profile with metadata:", userMetadata.role);
              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  full_name: userMetadata.full_name || "New User",
                  email: email,
                  role: userMetadata.role || "student"
                })
                .select()
                .single();
              
              if (createError) throw createError;
              
              if (newProfile && isMounted.current) {
                updateUserState(newProfile);
              }
            } else {
              console.error("[Auth] No metadata available for fallback profile creation.");
              if (isMounted.current) setUser(null);
            }
          } else {
            throw error;
          }
        } else if (data && isMounted.current) {
          updateUserState(data);
        }
      } catch (error: any) {
        console.error("[Auth] Profile fetch error:", error.message);
        if (isMounted.current && !user) {
          // If we failed to get a profile and don't have one, we should probably stop loading
          setLoading(false);
        }
      } finally {
        fetchPromise.current = null;
        if (isMounted.current) {
          setLoading(false);
        }
      }
    })();

    return fetchPromise.current;
  };

  const updateUserState = (data: any) => {
    console.log("[Auth] Updating user state:", data.role);
    setUser({
      id: data.id,
      name: data.full_name,
      email: data.email,
      role: data.role as Role,
      department: data.department,
    });
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
            await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
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
        if (session) await fetchProfile(session.user.id, session.user.user_metadata, session.user.email);
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
        await fetchProfile(response.data.user.id, response.data.user.user_metadata, response.data.user.email);
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

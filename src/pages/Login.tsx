import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Loader2 } from "lucide-react";

const Login: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "staff" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      console.log(`[Login] User found (${user.role}), navigating...`);
      if (user.role === "student") navigate("/student");
      else if (user.role === "staff") navigate("/staff");
      else if (user.role === "admin") navigate("/admin");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 15s timeout to prevent infinite loading
    const loginTimeout = setTimeout(() => {
      setLoading(false);
      setError("Sign-in process is taking longer than expected. Please check your internet or try again.");
      console.warn("[Auth] Sign-in safety timeout reached in Login.tsx");
    }, 15000);

    try {
      console.log(`[Auth] Attempting ${isLogin ? 'Sign-in' : 'Sign-up'} for ${email}...`);
      if (isLogin) {
        await signIn({ email, password });
        console.log("[Auth] Sign-in context method completed");
      } else {
        await signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        console.log("[Auth] Sign-up context method completed");
        setError("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      console.error("[Auth] Error:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      clearTimeout(loginTimeout);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
              AS
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">ASTU Smart Complaint</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Role</label>
                      <select 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input 
                  type="email" 
                  required 
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input 
                  type="password" 
                  required 
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${error.includes('Check') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 transition-colors" 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4 flex justify-center text-sm">
            <button 
              className="text-blue-600 hover:underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </CardFooter>
        </Card>
        <div className="text-center text-xs text-slate-400 mt-6 uppercase tracking-widest font-medium">
          ASTU IT Department • Secured by Supabase
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

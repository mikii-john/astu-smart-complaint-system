import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === "student") navigate("/student");
      else if (user.role === "staff") navigate("/staff");
      else if (user.role === "admin") navigate("/admin");
    }
  }, [user, navigate]);

  const handleLogin = (role: "student" | "staff" | "admin") => {
    login(role);
    // Navigation happens in useEffect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-2">
              AS
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">ASTU Smart Complaint</CardTitle>
            <CardDescription>
              Select your role to sign in to the portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleLogin("student")}
            >
              Student Login
            </Button>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-12 border-slate-200 hover:bg-slate-50"
                onClick={() => handleLogin("staff")}
              >
                Staff Access
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-slate-200 hover:bg-slate-50"
                onClick={() => handleLogin("admin")}
              >
                Admin Portal
              </Button>
            </div>
            <div className="text-center text-xs text-slate-400 mt-4">
              Secure System • ASTU IT Department
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;

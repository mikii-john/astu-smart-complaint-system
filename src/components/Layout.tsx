import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User, 
  Settings, 
  FileText,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import Chatbot from "./Chatbot";
import ThemeToggle from "./ThemeToggle";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100">{children}</div>;
  }

  const studentLinks = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/new", label: "New Complaint", icon: PlusCircle },
    { href: "/student/history", label: "History", icon: FileText },
  ];

  const staffLinks = [
    { href: "/staff", label: "Assigned Tickets", icon: LayoutDashboard },
    { href: "/staff/reports", label: "Reports", icon: FileText },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/staff", label: "Assigned Tickets", icon: LayoutDashboard },
    { href: "/staff/reports", label: "Reports", icon: FileText },
    { href: "/admin/users", label: "Users", icon: User },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  let links = studentLinks;
  if (user.role === "staff") links = staffLinks;
  if (user.role === "admin") links = adminLinks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-10">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
              AS
            </div>
            ASTU Smart
          </h1>
          <ThemeToggle />
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-slate-400")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/30" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 flex items-center justify-between px-4">
        <h1 className="text-lg font-bold text-blue-600">ASTU Smart</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-slate-900 z-10 pt-20 px-4">
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
              >
                <link.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                {link.label}
              </Link>
            ))}
            <Button variant="destructive" className="w-full mt-8" onClick={handleLogout}>
              Sign Out
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className={cn("flex-1 p-4 md:p-8 pt-20 md:pt-8 md:ml-64 transition-all duration-200 ease-in-out")}>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Chatbot - Only for students */}
      {user.role === "student" && <Chatbot />}
    </div>
  );
};

export default Layout;

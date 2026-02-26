import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/Button";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};

export default ThemeToggle;

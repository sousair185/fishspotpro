
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="app-button h-10 w-10 rounded-full bg-card border border-border/50 shadow-soft hover:bg-accent/10"
      aria-label="Toggle theme"
    >
      {theme === "light" ? 
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary transition-all duration-300" /> : 
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400 transition-all duration-300" />
      }
    </Button>
  );
}

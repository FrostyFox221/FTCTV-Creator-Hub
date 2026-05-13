import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("ftctv_theme") as Theme) || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const checkNightTime = () => {
        const hours = new Date().getHours();
        return hours >= 22 || hours < 6;
      };
      
      const isDark = checkNightTime();
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("ftctv_theme", next);
      return next;
    });
  };

  return { theme, toggleTheme };
}

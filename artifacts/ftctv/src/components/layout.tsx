import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, MonitorPlay, Radio } from "lucide-react";
import logoPath from "/logo.png";
import { useGetMaintenanceStatus } from "@workspace/api-client-react";
import Maintenance from "./maintenance";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  
  const { data: maintenance } = useGetMaintenanceStatus({ query: { queryKey: ["maintenance"] } });

  if (maintenance?.isActive) {
    return <Maintenance endsAt={maintenance.endsAt} message={maintenance.message} />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background text-foreground transition-colors duration-800">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src={logoPath} 
              alt="FTCTV" 
              className="h-10 dark:brightness-200 dark:contrast-200 transition-all" 
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-foreground/80'}`}
            >
              Главная
            </Link>
            <Link 
              href="/live" 
              className={`flex items-center gap-2 text-sm font-semibold tracking-wide uppercase transition-colors hover:text-primary ${location === '/live' ? 'text-primary' : 'text-foreground/80'}`}
            >
              <Radio className="w-4 h-4" />
              Прямой эфир
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link 
              href="/live" 
              className="md:hidden flex items-center justify-center p-2 rounded-full bg-primary text-primary-foreground"
            >
              <Radio className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <footer className="w-full bg-zinc-950 text-zinc-400 py-12 border-t-4 border-primary mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src={logoPath} alt="FTCTV" className="h-8 brightness-200 contrast-200 grayscale" />
            <p className="text-xs uppercase tracking-wider mt-2">FTC CREATE PRODUCTION 2026. Все права защищены.</p>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>По вопросам рекламы и сотрудничества:</p>
            <a href="mailto:ftcmedia@mail.com" className="text-primary-foreground font-semibold hover:text-primary transition-colors">ftcmedia@mail.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

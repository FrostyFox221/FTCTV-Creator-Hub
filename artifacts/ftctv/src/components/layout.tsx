import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Radio, Lock } from "lucide-react";
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
              className="h-8 w-auto invert dark:invert-0 dark:brightness-150 transition-all"
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

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide border transition-colors ${location === '/admin' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
              data-testid="link-admin"
              title="Панель администратора"
            >
              <Lock className="w-3 h-3" />
              Админ
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

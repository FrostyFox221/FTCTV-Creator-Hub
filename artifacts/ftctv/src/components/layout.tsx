import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Lock, Menu, X, PlayCircle } from "lucide-react";
import logoPath from "/logo.png";
import { useGetMaintenanceStatus, useGetLivestream } from "@workspace/api-client-react";
import Maintenance from "./maintenance";
import { useState, useEffect } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: maintenance } = useGetMaintenanceStatus({ query: { queryKey: ["maintenance"] } });
  const { data: livestream } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (maintenance?.isActive) {
    return <Maintenance endsAt={maintenance.endsAt} message={maintenance.message} />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground font-sans transition-colors duration-300">
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-background/95 backdrop-blur-md border-b shadow-sm" 
            : "bg-background border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <img
              src={logoPath}
              alt="FTCTV"
              className="h-8 w-auto invert dark:invert-0 dark:brightness-150 transition-all"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                location === '/' ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              Главная
            </Link>
            <Link
              href="/live"
              className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                location === '/live' ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              <div className="relative flex h-2 w-2">
                {livestream?.isLive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30"></span>
                )}
              </div>
              Прямой эфир
            </Link>
            <Link
              href="/media"
              className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                location.startsWith('/media') ? 'text-primary' : 'text-foreground/70'
              }`}
            >
              FTC Media
            </Link>
          </nav>

          <div className="flex items-center gap-2 z-50">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle theme"
              data-testid="button-toggle-theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border text-foreground/70 hover:border-primary hover:text-primary transition-colors"
              data-testid="link-admin"
              title="Панель администратора"
            >
              <Lock className="w-3 h-3" />
              Админ
            </Link>
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden p-2.5 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b shadow-lg py-4 px-4 flex flex-col gap-4 z-40">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold uppercase tracking-wider p-3 rounded-lg ${
                location === '/' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              Главная
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between text-base font-semibold uppercase tracking-wider p-3 rounded-lg ${
                location === '/live' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-2">
                Прямой эфир
              </div>
              {livestream?.isLive ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  В ЭФИРЕ
                </span>
              ) : (
                <PlayCircle className="w-4 h-4 text-muted-foreground" />
              )}
            </Link>
            <Link
              href="/media"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base font-semibold uppercase tracking-wider p-3 rounded-lg ${
                location.startsWith('/media') ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'
              }`}
            >
              FTC Media
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 mt-2 border-t text-muted-foreground hover:text-foreground"
            >
              <Lock className="w-4 h-4" />
              Панель администратора
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative pb-12">
        {children}
      </main>

      <footer className="w-full bg-[#1a1a2e] text-zinc-400 py-16 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoPath} alt="FTCTV" className="h-10 brightness-200 contrast-200 grayscale" />
            <p className="text-sm font-medium tracking-wide text-zinc-300">Смотреть. Знать. Быть в курсе.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white uppercase font-bold tracking-wider mb-2 text-sm">Навигация</h4>
            <Link href="/" className="hover:text-white transition-colors text-sm">Главная</Link>
            <Link href="/live" className="hover:text-white transition-colors text-sm">Прямой эфир</Link>
            <Link href="/media" className="hover:text-white transition-colors text-sm">FTC Media</Link>
            <Link href="/media/schedule" className="hover:text-white transition-colors text-sm">Сетка вещания</Link>
            <Link href="/media/forum" className="hover:text-white transition-colors text-sm">Форум</Link>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white uppercase font-bold tracking-wider mb-2 text-sm">Контакты</h4>
            <p className="text-sm">По вопросам рекламы и сотрудничества:</p>
            <a href="mailto:ftcmedia@mail.com" className="text-white font-semibold hover:text-primary transition-colors">ftcmedia@mail.com</a>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-zinc-800 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500">FTC CREATE PRODUCTION 2026. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Lock, Menu, X, PlayCircle, User, LogOut, Calendar } from "lucide-react";
import logoPath from "/logo.png";
import { useGetMaintenanceStatus, useGetLivestream } from "@workspace/api-client-react";
import Maintenance from "./maintenance";
import ComingSoon, { shouldShowComingSoon } from "./coming-soon";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, logout } = useUserAuth();

  const { data: maintenance } = useGetMaintenanceStatus({ query: { queryKey: ["maintenance"] } });
  const { data: livestream } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdminLoggedIn = !!localStorage.getItem("ftctv_admin_token");
  const isAdminPage = location === "/admin" || location.startsWith("/admin");

  // Show maintenance page if active (admin can bypass)
  if (maintenance?.isActive && !isAdminLoggedIn && !isAdminPage) {
    return <Maintenance endsAt={maintenance.endsAt} message={maintenance.message} />;
  }

  // Show "coming soon" page Aug 18–Sep 1 2026 (admin can bypass)
  if (shouldShowComingSoon() && !isAdminLoggedIn && !isAdminPage) {
    return <ComingSoon />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col w-full bg-background text-foreground font-sans transition-colors duration-300">
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"} border-b`}>
        {/* Main header row */}
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={logoPath} alt="FTCTV" className="h-7 w-auto invert dark:invert-0 dark:brightness-150 transition-all" />
          </Link>

          {/* Desktop nav: Live + Schedule pills */}
          <nav className="hidden md:flex items-center gap-2 mx-auto">
            <Link
              href="/live"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors
                ${location === '/live'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-foreground/70 hover:border-primary hover:text-primary'
                }`}
            >
              <div className="relative flex h-2 w-2 shrink-0">
                {livestream?.isLive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30"></span>
                )}
              </div>
              Прямой эфир
            </Link>

            <Link
              href="/media/schedule"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors
                ${location === '/media/schedule'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-foreground/70 hover:border-primary hover:text-primary'
                }`}
            >
              <Calendar className="w-3 h-3 shrink-0" />
              Программа передач
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={toggleTheme} className="p-2 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session ? (
              <div className="hidden md:flex items-center gap-1">
                <span className="text-xs font-semibold text-foreground/70 px-1.5 max-w-[90px] truncate">{session.displayName}</span>
                <button onClick={logout} className="p-2 rounded-full text-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors" title="Выйти">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border text-foreground/70 hover:border-primary hover:text-primary transition-colors">
                <User className="w-3 h-3" /> Войти
              </Link>
            )}

            <Link href="/admin" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-border text-foreground/70 hover:border-primary hover:text-primary transition-colors">
              <Lock className="w-3 h-3" /> Админ
            </Link>

            <button className="md:hidden p-2.5 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full bg-background border-b shadow-lg py-4 px-4 flex flex-col gap-3 z-40">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>Главная</Link>
            <Link href="/live" onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/live' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>
              <span className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                  {livestream?.isLive ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </>
                  ) : <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground/30"></span>}
                </div>
                Прямой эфир
              </span>
              {livestream?.isLive && (
                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">В ЭФИРЕ</span>
              )}
            </Link>
            <Link href="/media/schedule" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/media/schedule' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>
              <Calendar className="w-4 h-4" /> Программа передач
            </Link>
            <div className="border-t pt-3 flex flex-col gap-2">
              {session ? (
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-semibold">{session.displayName}</span>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xs text-destructive font-bold uppercase tracking-wider">Выйти</button>
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-foreground/80 hover:text-foreground"><User className="w-4 h-4" /> Войти</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-foreground/80 hover:text-foreground">Регистрация</Link>
                </>
              )}
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-muted-foreground hover:text-foreground"><Lock className="w-4 h-4" /> Панель администратора</Link>
            </div>
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
            <Link href="/media/schedule" className="hover:text-white transition-colors text-sm">Программа передач</Link>
            <Link href="/login" className="hover:text-white transition-colors text-sm">Войти / Регистрация</Link>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white uppercase font-bold tracking-wider mb-2 text-sm">Контакты</h4>
            <p className="text-sm">По вопросам рекламы и сотрудничества:</p>
            <a href="mailto:ftcmedia@mail.com" className="text-white font-semibold hover:text-primary transition-colors">ftcmedia@mail.com</a>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-10 pt-8 border-t border-zinc-800">
          <div className="bg-zinc-900/60 rounded-xl p-5 mb-8 text-xs text-zinc-500 leading-relaxed max-w-3xl mx-auto text-center">
            <p className="font-bold uppercase tracking-wider text-zinc-400 mb-2">Политика конфиденциальности аккаунтов</p>
            <p>
              Регистрируясь на FTCTV, вы создаёте личный аккаунт. Ваши данные (логин, имя, пароль) хранятся в защищённом виде и не передаются третьим лицам.
              Пароль хранится в зашифрованном виде — сотрудники редакции не имеют доступа к вашему паролю.
              Вы несёте ответственность за сохранность своих учётных данных и обязуетесь не передавать их третьим лицам.
              Аккаунт предназначен исключительно для личного использования.
            </p>
          </div>
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 text-center">FTC CREATE PRODUCTION 2026. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

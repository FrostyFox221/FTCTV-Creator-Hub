import { Link, useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, Lock, Menu, X, PlayCircle, User, LogOut, Calendar, Image, Video, FileText } from "lucide-react";
import logoPath from "/logo.png";
import { useGetMaintenanceStatus, useGetLivestream } from "@workspace/api-client-react";
import Maintenance from "./maintenance";
import ComingSoon, { shouldShowComingSoon } from "./coming-soon";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { session, logout } = useUserAuth();
  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem("ftctv_cookie_consent") === "accepted");
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const [showBirthdayText, setShowBirthdayText] = useState(false);
  const getBirthdayYears = useCallback(() => {
    const y = new Date().getFullYear() - 2025;
    const mod10 = y % 10; const mod100 = y % 100;
    const word = (mod100 >= 11 && mod100 <= 14) ? "ЛЕТ" : mod10 === 1 ? "ГОД" : (mod10 >= 2 && mod10 <= 4) ? "ГОДА" : "ЛЕТ";
    return `${y} ${word}`;
  }, []);

  const { data: maintenance } = useGetMaintenanceStatus({ query: { queryKey: ["maintenance"] } });
  const { data: livestream } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // March 19 confetti on header logo — birthday celebration
  const launchConfetti = useCallback(() => {
    const wrapper = logoWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = "0";
    canvas.style.top = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const colors = ["#ff0", "#f0f", "#0ff", "#f00", "#0f0", "#00f", "#ff6600", "#ff69b4", "#7b68ee"];
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    interface Particle { x: number; y: number; vx: number; vy: number; color: string; size: number; life: number; rotation: number; rotSpeed: number; shape: number; }
    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        life: 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: Math.floor(Math.random() * 3),
      });
    }
    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.life -= 0.012;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) { frame = requestAnimationFrame(animate); }
      else { canvas.remove(); }
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); canvas.remove(); };
  }, []);

  useEffect(() => {
    const now = new Date();
    if (now.getMonth() !== 2 || now.getDate() !== 19) return;
    const fire = () => {
      launchConfetti();
      setShowBirthdayText(true);
      setTimeout(() => setShowBirthdayText(false), 4000);
    };
    fire();
    const interval = setInterval(fire, 30000);
    return () => { clearInterval(interval); };
  }, [launchConfetti]);


  const isAdminLoggedIn = !!localStorage.getItem("ftctv_admin_token");
  const isAdminPage = location === "/admin" || location.startsWith("/admin");

  // Show maintenance page if active (admin can bypass)
  if (maintenance?.isActive && !isAdminLoggedIn && !isAdminPage) {
    return (
      <>
        <Maintenance endsAt={maintenance.endsAt} message={maintenance.message} />
        {!cookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-2xl">
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-2xl shrink-0">🍪</div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold">Редакторы очень любят печеньки. Разрешите нам, пожалуйста.</p>
                  <p className="text-xs text-muted-foreground mt-1">Мы используем куки для улучшения работы сайта и вашего опыта.</p>
                </div>
                <button
                  onClick={() => { localStorage.setItem("ftctv_cookie_consent", "accepted"); setCookieConsent(true); }}
                  className="shrink-0 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Разрешить 🍪
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show "coming soon" page Aug 18–Sep 1 2026 (admin can bypass)
  if (shouldShowComingSoon() && !isAdminLoggedIn && !isAdminPage) {
    return (
      <>
        <ComingSoon />
        {!cookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-2xl">
              <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-2xl shrink-0">🍪</div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-semibold">Редакторы очень любят печеньки. Разрешите нам, пожалуйста.</p>
                  <p className="text-xs text-muted-foreground mt-1">Мы используем куки для улучшения работы сайта и вашего опыта.</p>
                </div>
                <button
                  onClick={() => { localStorage.setItem("ftctv_cookie_consent", "accepted"); setCookieConsent(true); }}
                  className="shrink-0 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Разрешить 🍪
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col w-full overflow-x-hidden bg-background text-foreground font-sans transition-colors duration-300">
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background"} border-b`}>
        {/* Main header row */}
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div ref={logoWrapperRef} className="relative overflow-hidden">
              <img src={logoPath} alt="FTCTV" className={`h-7 w-auto invert dark:invert-0 dark:brightness-150 transition-opacity duration-700 ${showBirthdayText ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute inset-0 flex items-center whitespace-nowrap font-black text-sm md:text-base tracking-tight bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent transition-opacity duration-700 ${showBirthdayText ? "opacity-100" : "opacity-0"}`}>
                <span className="md:hidden">{getBirthdayYears()} ВМЕСТЕ</span>
                <span className="hidden md:inline">{getBirthdayYears()} ВМЕСТЕ С ТОБОЙ</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav: Live + Schedule pills */}
          {/* Live indicator - always visible */}
          {livestream?.isLive && (
            <Link href="/live" className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors ml-auto">
              <div className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </div>
              В эфире
            </Link>
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={toggleTheme} className="p-2 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors" aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="p-2.5 rounded-full text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 w-full bg-background border-b shadow-lg py-4 px-4 flex flex-col gap-3 z-40">
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
            <Link href="/media/articles" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/media/articles' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>
              <FileText className="w-4 h-4" /> Статьи
            </Link>
            <Link href="/gallery" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/gallery' || location.startsWith('/gallery/') ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>
              <Image className="w-4 h-4" /> Галерея
            </Link>
            <Link href="/videos" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/videos' || location.startsWith('/videos/') ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>
              <Video className="w-4 h-4" /> Видео
            </Link>
            <div className="border-t pt-3 flex flex-col gap-2">
              {session ? (
                <>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-foreground/80 hover:text-foreground"><User className="w-4 h-4" /> {session.displayName}</Link>
                  <div className="flex items-center justify-between p-3">
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xs text-destructive font-bold uppercase tracking-wider">Выйти</button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-foreground/80 hover:text-foreground"><User className="w-4 h-4" /> Войти</Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-foreground/80 hover:text-foreground">Регистрация</Link>
                </>
              )}
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider p-3 text-muted-foreground hover:text-foreground"><Lock className="w-4 h-4" /> Панель администратора</Link>
              <div className="border-t pt-3 mt-1 flex flex-col gap-2">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={`text-sm font-semibold uppercase tracking-wider p-3 rounded-lg ${location === '/about' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-secondary'}`}>О нас</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full relative pb-12">
        {children}
      </main>

      <footer className="w-full bg-[#1a1a2e] text-zinc-400 pt-16 pb-[max(4rem,env(safe-area-inset-bottom,4rem))] mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoPath} alt="FTCTV" className="h-10 brightness-200 contrast-200 grayscale" />
            <p className="text-sm font-medium tracking-wide text-zinc-300">Смотри Своё</p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white uppercase font-bold tracking-wider mb-2 text-sm">Навигация</h4>
            <Link href="/" className="hover:text-white transition-colors text-sm">Главная</Link>
            <Link href="/live" className="hover:text-white transition-colors text-sm">Прямой эфир</Link>
            <Link href="/media/schedule" className="hover:text-white transition-colors text-sm">Программа передач</Link>
            <Link href="/media/articles" className="hover:text-white transition-colors text-sm">Статьи</Link>
            <Link href="/gallery" className="hover:text-white transition-colors text-sm">Галерея</Link>
            <Link href="/videos" className="hover:text-white transition-colors text-sm">Видео</Link>
            <Link href="/about" className="hover:text-white transition-colors text-sm">О нас</Link>
            <Link href="/privacy" className="hover:text-white transition-colors text-sm">Политика конфиденциальности</Link>
            <Link href="/login" className="hover:text-white transition-colors text-sm">Войти / Регистрация</Link>
          </div>

          <div className="flex flex-col items-center md:items-start gap-3">
            <h4 className="text-white uppercase font-bold tracking-wider mb-2 text-sm">Контакты</h4>
            <p className="text-sm">По вопросам рекламы и сотрудничества:</p>
            <a href="mailto:ftcmedia@mail.com" className="text-white font-semibold hover:text-primary transition-colors">ftcmedia@mail.com</a>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-10 pt-8 border-t border-zinc-800">
          <p className="text-xs uppercase tracking-widest font-semibold text-zinc-500 text-center">© FTC MEDIA 2025–{new Date().getFullYear()}. Все права защищены.</p>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="text-2xl shrink-0">🍪</div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-semibold">Редакторы очень любят печеньки. Разрешите нам, пожалуйста.</p>
                <p className="text-xs text-muted-foreground mt-1">Мы используем куки для улучшения работы сайта и вашего опыта.</p>
              </div>
              <button
                onClick={() => { localStorage.setItem("ftctv_cookie_consent", "accepted"); setCookieConsent(true); }}
                className="shrink-0 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Разрешить 🍪
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

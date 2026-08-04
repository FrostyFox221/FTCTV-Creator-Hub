import { useEffect, useState } from "react";
import logoPath from "/logo.png";
import { Link } from "wouter";
import { Lock } from "lucide-react";

// Maintenance Aug 18 06:00 UTC+10 → Sep 1 00:00 UTC+10
const SHOW_FROM = new Date("2026-08-18T06:00:00+10:00");
const SHOW_UNTIL = new Date("2026-09-01T00:00:00+10:00");
const RETURN_DATE = new Date("2026-09-01T00:00:00+10:00");

export function shouldShowComingSoon(): boolean {
  const now = new Date();
  return now >= SHOW_FROM && now < SHOW_UNTIL;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getCountdown() {
  const now = new Date().getTime();
  const end = RETURN_DATE.getTime();
  const diff = Math.max(0, end - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
}

export default function ComingSoon() {
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-pink-500/5 blur-[100px]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full animate-in fade-in zoom-in duration-700">
        <img src={logoPath} alt="FTCTV" className="h-12 mx-auto mb-10 brightness-200 contrast-200 grayscale" />

        {/* Pulse dot */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Обновление</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4">
          Становимся
          <br />
          <span className="bg-gradient-to-r from-primary via-pink-400 to-amber-400 bg-clip-text text-transparent">
            лучше
          </span>
          <br />
          ради вас
        </h1>

        <p className="text-zinc-400 text-base md:text-lg mt-6 mb-12 leading-relaxed font-light">
          Мы обновляем платформу, чтобы предложить вам&nbsp;
          <span className="text-white font-medium">лучший опыт просмотра</span>.
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-12">
          {[
            { value: countdown.days, label: "Дней" },
            { value: countdown.hours, label: "Часов" },
            { value: countdown.minutes, label: "Минут" },
            { value: countdown.seconds, label: "Секунд" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 backdrop-blur-sm flex flex-col items-center gap-1">
              <span className="text-3xl md:text-5xl font-black text-white font-mono tabular-nums">
                {pad(value)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Return date badge */}
        <div className="inline-flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 rounded-full px-6 py-3 mb-10">
          <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Возвращаемся</span>
          <span className="text-white font-black text-sm tracking-wide">1 Сентября 2026</span>
        </div>

        {/* Admin link */}
        <div className="mt-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-zinc-700 hover:text-zinc-400 transition-colors">
            <Lock className="w-3 h-3" />
            Панель администратора
          </Link>
        </div>
      </div>
    </div>
  );
}

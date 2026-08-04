import logoPath from "/logo.png";
import { Clock, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Maintenance({ endsAt, message }: { endsAt?: string | null, message?: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endsAt) return;
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;
      if (distance < 0) { setTimeLeft("Скоро завершится"); return; }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <img src={logoPath} alt="FTCTV" className="h-16 mb-8 brightness-200 contrast-200 grayscale" />

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl backdrop-blur-sm w-full">
          <Clock className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
            {message || "Ведутся плановые технические работы"}
          </h1>
          <p className="text-zinc-400 mb-6 text-sm">
            Мы обновляем платформу, чтобы сделать её лучше. Скоро мы вернемся.
          </p>

          {endsAt && (
            <div className="bg-zinc-950 rounded-lg p-4 inline-flex items-center justify-center gap-3 border border-zinc-800 mb-6">
              <span className="text-xs text-zinc-500 uppercase font-semibold">Осталось:</span>
              <span className="text-xl font-bold text-primary font-mono">{timeLeft}</span>
            </div>
          )}

          {/* Admin bypass link */}
          <div className="border-t border-zinc-800 pt-5 mt-2">
            <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors">
              <Lock className="w-3 h-3" />
              Панель администратора
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

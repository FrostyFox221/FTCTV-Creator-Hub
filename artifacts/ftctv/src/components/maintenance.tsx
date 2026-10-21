import logoPath from "/logo.png";
import { useEffect, useRef, useState } from "react";

export default function Maintenance({ endsAt, message }: { endsAt?: string | null, message?: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [localEndTime, setLocalEndTime] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Format end time in user's local timezone
  useEffect(() => {
    if (!endsAt) return;
    try {
      const date = new Date(endsAt);
      setLocalEndTime(
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    } catch {
      setLocalEndTime("");
    }
  }, [endsAt]);

  // Countdown timer
  useEffect(() => {
    if (!endsAt) return;

    const update = () => {
      const now = Date.now();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setExpired(false);
      setTimeLeft({
        hours: Math.floor(distance / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  // Autoplay music — safe handling of browser restrictions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;
    audio.loop = true;

    const tryPlay = () => {
      audio.play().catch(() => {
        // Browser blocked autoplay — silently ignore
      });
    };

    tryPlay();

    // Also try on first user interaction if autoplay was blocked
    const handleInteraction = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  // Auto-reload when maintenance ends
  useEffect(() => {
    if (!expired) return;
    const timeout = setTimeout(() => {
      window.location.reload();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [expired]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Logo */}
        <img
          src={logoPath}
          alt="FTCTV"
          className="h-14 mb-10 brightness-200 contrast-200 grayscale opacity-80"
        />

        {/* Main card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md w-full shadow-2xl shadow-black/30">
          {/* Animated gear icon */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary animate-[spin_4s_linear_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-tight">
            Профилактические работы
          </h1>

          <p className="text-zinc-300 mb-2 text-sm leading-relaxed">
            {message || "На сайте проводятся плановые профилактические работы."}
          </p>

          {endsAt && localEndTime && (
            <p className="text-zinc-400 mb-8 text-sm">
              Сайт возобновит работу в{" "}
              <span className="text-white font-semibold">{localEndTime}</span>
            </p>
          )}

          {!endsAt && (
            <p className="text-zinc-500 mb-8 text-xs">
              Время завершения будет объявлено дополнительно.
            </p>
          )}

          {/* Styled countdown timer */}
          {endsAt && !expired && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                    {pad(timeLeft.hours)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 mt-2 uppercase tracking-widest">Час</span>
              </div>

              <span className="text-2xl sm:text-3xl font-bold text-primary/60 -mt-5 animate-pulse">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                    {pad(timeLeft.minutes)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 mt-2 uppercase tracking-widest">Мин</span>
              </div>

              <span className="text-2xl sm:text-3xl font-bold text-primary/60 -mt-5 animate-pulse">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center shadow-lg">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums">
                    {pad(timeLeft.seconds)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-zinc-500 mt-2 uppercase tracking-widest">Сек</span>
              </div>
            </div>
          )}

          {/* Expired state */}
          {expired && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 text-sm font-medium">
                Работы завершены! Страница обновится автоматически...
              </p>
            </div>
          )}

          {/* Subtle animated line */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Footer text */}
        <p className="text-zinc-600 text-xs mt-6">
          Благодарим за терпение и понимание
        </p>
      </div>

      {/* Hidden audio — autoplay, no controls */}
      <audio ref={audioRef} src="/maintenance-music.mp3" preload="auto" />
    </div>
  );
}

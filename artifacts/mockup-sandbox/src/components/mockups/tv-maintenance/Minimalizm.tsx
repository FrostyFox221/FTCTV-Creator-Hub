import { useEffect, useState } from "react";

export function Minimalizm() {
  const [angle, setAngle] = useState(0);
  const [pulse, setPulse] = useState(1);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 8000;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) % duration;
      const progress = elapsed / duration;
      setAngle(progress * 360);
      setPulse(0.85 + 0.15 * Math.sin(progress * Math.PI * 2));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{ fontFamily: "'Unbounded', sans-serif" }}
      className="w-full aspect-video relative overflow-hidden flex items-center justify-center"
    >
      <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Animated purple gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, #7c3aed 0%, #4c1d95 40%, #1e0a3c 100%)`,
          transform: `scale(${pulse})`,
          transition: "transform 0.05s linear",
        }}
      />

      {/* Rotating secondary glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0%, rgba(167,139,250,0.18) 20%, transparent 40%, rgba(124,58,237,0.25) 60%, transparent 80%)`,
        }}
      />

      {/* Dark vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 40%, rgba(10,0,30,0.7) 100%)",
        }}
      />

      {/* Center glassmorphism card */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-16 py-10 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 8px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
          minWidth: "60%",
        }}
      >
        {/* Logo */}
        <div
          className="text-white font-black tracking-widest mb-6"
          style={{ fontSize: "clamp(2rem, 8vw, 5rem)" }}
        >
          FTCTV
        </div>

        {/* Divider */}
        <div
          className="mb-6 rounded-full"
          style={{
            width: "4rem",
            height: "2px",
            background: "rgba(255,255,255,0.35)",
          }}
        />

        {/* Main text */}
        <p
          className="text-white/80 font-normal uppercase leading-relaxed mb-2"
          style={{ fontSize: "clamp(0.55rem, 1.4vw, 0.95rem)", letterSpacing: "0.12em" }}
        >
          На телеканале ведутся плановые профилактические работы
        </p>
        <p
          className="text-white font-bold uppercase"
          style={{ fontSize: "clamp(0.7rem, 1.8vw, 1.2rem)", letterSpacing: "0.1em" }}
        >
          Вещание возобновится в 15:00
        </p>
      </div>
    </div>
  );
}

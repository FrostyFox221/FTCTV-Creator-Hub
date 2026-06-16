import { useEffect, useRef } from "react";

export function Efir() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let frame: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192,162,255,${p.opacity})`;
        ctx.fill();
      }
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

      {/* Background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #2e1065 0%, #4c1d95 35%, #1e0a3c 70%, #0d0020 100%)"
      }} />

      {/* Soft center glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 60% at 50% 45%, rgba(139,92,246,0.3) 0%, transparent 70%)"
      }} />

      {/* Floating particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(5,0,20,0.65) 100%)"
      }} />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center text-center px-20 py-10 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
          minWidth: "58%",
        }}
      >
        <div className="text-white font-black tracking-widest mb-5" style={{ fontSize: "clamp(2.5rem, 9vw, 5.5rem)" }}>
          FTCTV
        </div>

        <div className="mb-5 rounded-full" style={{ width: "5rem", height: "2px", background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)" }} />

        <p className="text-white/65 uppercase leading-relaxed mb-2"
          style={{ fontSize: "clamp(0.5rem, 1.3vw, 0.9rem)", letterSpacing: "0.14em" }}>
          На телеканале ведутся плановые профилактические работы
        </p>
        <p className="text-white font-bold uppercase"
          style={{ fontSize: "clamp(0.7rem, 1.9vw, 1.25rem)", letterSpacing: "0.1em" }}>
          Вещание возобновится в 15:00
        </p>
      </div>
    </div>
  );
}

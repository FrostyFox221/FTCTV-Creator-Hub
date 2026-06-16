import { useEffect, useState } from "react";

export function Signal() {
  const [scale, setScale] = useState([1, 0.5, 0]);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 3000;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = ((ts - start) % duration) / duration;
      setScale([
        0.4 + 0.6 * t,
        0.4 + 0.6 * ((t + 0.33) % 1),
        0.4 + 0.6 * ((t + 0.66) % 1),
      ]);
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
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, #5b21b6 0%, #3b0764 50%, #0d0020 100%)"
      }} />

      {/* Ripple rings */}
      {scale.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-purple-400"
          style={{
            width: "80%",
            paddingBottom: "80%",
            transform: `translate(-50%, -50%) scale(${s})`,
            left: "50%",
            top: "50%",
            opacity: 1 - s * 0.9,
            transition: "none",
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(5,0,20,0.75) 100%)"
      }} />

      {/* Content — horizontal split */}
      <div
        className="relative z-10 flex flex-row items-center gap-10 px-16 py-10 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
          minWidth: "65%",
        }}
      >
        {/* Left: logo */}
        <div className="flex flex-col items-center shrink-0">
          <div className="text-white font-black tracking-widest" style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}>
            FTCTV
          </div>
          <div className="mt-2 rounded-full" style={{ width: "3rem", height: "2px", background: "rgba(167,139,250,0.6)" }} />
        </div>

        {/* Vertical divider */}
        <div className="self-stretch rounded-full shrink-0" style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />

        {/* Right: text */}
        <div className="flex flex-col gap-2 text-left">
          <p className="text-white/70 font-normal uppercase leading-relaxed"
            style={{ fontSize: "clamp(0.5rem, 1.2vw, 0.85rem)", letterSpacing: "0.1em" }}>
            На телеканале ведутся<br />плановые профилактические работы
          </p>
          <p className="text-white font-bold uppercase"
            style={{ fontSize: "clamp(0.65rem, 1.6vw, 1.1rem)", letterSpacing: "0.08em" }}>
            Вещание возобновится в 15:00
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export function Minimalizm() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      setAngle(((ts - start) / 8000) * 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="w-full aspect-video relative overflow-hidden flex items-center justify-center">
      {/* Rotating radial gradient */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, #7c3aed 0%, #4c1d95 45%, #1e0a3c 100%)",
      }} />
      <div className="absolute inset-0" style={{
        background: `conic-gradient(from ${angle}deg at 50% 50%, transparent 0%, rgba(167,139,250,0.2) 20%, transparent 40%, rgba(124,58,237,0.28) 60%, transparent 80%)`,
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 40%, rgba(10,0,30,0.7) 100%)",
      }} />

      {/* Glass panel */}
      <div className="relative z-10 rounded-2xl" style={{
        width: "60%",
        height: "55%",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.13)",
        boxShadow: "0 8px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
      }} />
    </div>
  );
}

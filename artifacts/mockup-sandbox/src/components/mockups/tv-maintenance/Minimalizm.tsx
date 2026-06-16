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

    </div>
  );
}

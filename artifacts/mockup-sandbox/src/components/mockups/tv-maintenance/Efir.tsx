export function Efir() {
  return (
    <div className="w-full aspect-video relative overflow-hidden flex items-center justify-center">
      {/* Flat dark violet background */}
      <div className="absolute inset-0" style={{
        background: "#160a2e",
      }} />
      {/* Center spotlight */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 75% 65% at 50% 48%, rgba(109,40,217,0.45) 0%, rgba(76,29,149,0.2) 50%, transparent 80%)",
      }} />
      {/* Subtle horizontal light streak */}
      <div className="absolute" style={{
        top: "50%",
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.25), transparent)",
        transform: "translateY(-50%)",
      }} />

    </div>
  );
}

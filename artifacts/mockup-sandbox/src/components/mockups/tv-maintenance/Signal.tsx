export function Signal() {
  return (
    <div className="w-full aspect-video relative overflow-hidden flex items-center justify-center">
      {/* Deep purple linear gradient */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #1e0a3c 0%, #4c1d95 40%, #2e1065 70%, #0d0020 100%)",
      }} />
      {/* Soft top-left glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(139,92,246,0.35) 0%, transparent 70%)",
      }} />
      {/* Soft bottom-right glow */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 50% 50% at 80% 80%, rgba(109,40,217,0.3) 0%, transparent 70%)",
      }} />

      {/* Glass panel — wide horizontal */}
      <div className="relative z-10 rounded-2xl" style={{
        width: "70%",
        height: "45%",
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.11)",
        boxShadow: "0 8px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
      }} />
    </div>
  );
}

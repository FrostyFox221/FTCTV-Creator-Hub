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

    </div>
  );
}

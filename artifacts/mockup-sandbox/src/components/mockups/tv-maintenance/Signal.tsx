export function Signal() {
  return (
    <div
      style={{ fontFamily: "'Unbounded', sans-serif" }}
      className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden"
    >
      <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet" />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-80" />

      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-8 px-16 w-full max-w-4xl">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#7c3aed] animate-pulse" />
          <span style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-[#7c3aed] text-sm font-bold tracking-[0.3em] uppercase">Технический перерыв</span>
          <div className="w-3 h-3 rounded-full bg-[#7c3aed] animate-pulse" />
        </div>

        <div className="text-white font-black text-8xl tracking-widest">FTCTV</div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="flex flex-col gap-3">
          <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/70 text-base font-normal tracking-wide uppercase">
            На телеканале ведутся плановые профилактические работы
          </p>
          <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white text-4xl font-black tracking-widest">
            Вещание возобновится в&nbsp;15:00
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/25 text-xs tracking-[0.4em] uppercase">
          FTC Create Production · ftcmedia@mail.com
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent opacity-80" />
    </div>
  );
}

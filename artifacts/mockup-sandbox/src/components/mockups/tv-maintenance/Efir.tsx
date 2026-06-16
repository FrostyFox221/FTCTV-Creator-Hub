export function Efir() {
  return (
    <div
      style={{ fontFamily: "'Unbounded', sans-serif" }}
      className="w-full aspect-video bg-[#111118] flex flex-col relative overflow-hidden"
    >
      <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet" />

      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between px-12 py-8 border-b border-white/10">
          <span style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white font-black text-3xl tracking-widest">FTCTV</span>
          <span style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/30 text-xs tracking-widest uppercase">FTC Create Production</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center gap-10 px-16 max-w-3xl">
            <div className="w-20 h-20 rounded-full border-2 border-[#7c3aed]/50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-[#7c3aed] flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#7c3aed]" />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/60 text-lg font-normal leading-relaxed tracking-wide uppercase">
                На телеканале ведутся<br />плановые профилактические работы
              </p>
              <div className="flex items-center justify-center gap-6">
                <div className="h-px w-16 bg-[#7c3aed]/50" />
                <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white text-5xl font-black tracking-wider">
                  15:00
                </p>
                <div className="h-px w-16 bg-[#7c3aed]/50" />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/50 text-base tracking-widest uppercase">
                Вещание возобновится
              </p>
            </div>
          </div>
        </div>

        <div className="px-12 py-6 border-t border-white/10 flex items-center justify-center">
          <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white/20 text-xs tracking-[0.4em] uppercase">ftcmedia@mail.com</p>
        </div>
      </div>
    </div>
  );
}

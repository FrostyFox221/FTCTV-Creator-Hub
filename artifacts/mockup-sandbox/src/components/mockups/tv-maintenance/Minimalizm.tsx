export function Minimalizm() {
  return (
    <div
      style={{ fontFamily: "'Unbounded', sans-serif" }}
      className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden"
    >
      <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet" />

      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="w-[900px] h-[900px] rounded-full border border-white" />
        <div className="absolute w-[600px] h-[600px] rounded-full border border-white" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-white" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-10 px-16">
        <div className="text-white font-black text-7xl tracking-widest">FTCTV</div>

        <div className="w-24 h-px bg-white opacity-30" />

        <div className="flex flex-col gap-4">
          <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white text-xl font-bold leading-snug tracking-wide uppercase">
            На телеканале ведутся<br />плановые профилактические работы
          </p>
          <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white text-3xl font-black tracking-widest">
            Вещание возобновится в 15:00
          </p>
        </div>

        <div className="w-24 h-px bg-white opacity-30" />

        <p style={{ fontFamily: "'Unbounded', sans-serif" }} className="text-white opacity-40 text-xs tracking-widest uppercase">
          FTC Create Production
        </p>
      </div>
    </div>
  );
}

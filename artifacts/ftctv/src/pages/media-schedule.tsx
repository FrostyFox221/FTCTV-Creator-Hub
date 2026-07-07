import { useGetSchedule } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft, Star, Radio } from "lucide-react";

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export default function MediaSchedule() {
  const { data: items, isLoading } = useGetSchedule({ query: { queryKey: ["schedule"] } });

  const byDay = DAYS.map((name, idx) => ({
    name,
    items: (items ?? []).filter((i) => i.dayOfWeek === idx).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
  }));

  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/media" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">FTC Media</p>
          <h1 className="text-3xl font-black uppercase tracking-wide">Программа передач</h1>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500" /> Премьера</span>
        <span className="flex items-center gap-1.5 text-red-500"><Radio className="w-3.5 h-3.5" /> Прямой эфир</span>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {byDay.map(({ name, items }, idx) => (
            <div
              key={name}
              className={`rounded-xl border p-5 ${idx === todayIdx ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-black uppercase tracking-wide text-sm">{name}</h2>
                {idx === todayIdx && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                    Сегодня
                  </span>
                )}
                {items.some(i => i.date) && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {items.find(i => i.date)?.date}
                  </span>
                )}
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет программ</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 items-start p-2.5 rounded-lg -mx-2.5 ${
                        item.isPremiere ? "bg-amber-500/10" : item.isLiveShow ? "bg-red-500/10" : ""
                      }`}
                    >
                      <span className="text-xs font-bold text-primary min-w-[40px] mt-0.5">{item.timeSlot}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-semibold leading-tight">{item.title}</p>
                          {item.isPremiere && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                          {item.isLiveShow && <Radio className="w-3 h-3 text-red-500 shrink-0" />}
                        </div>
                        {item.genre && <p className="text-xs text-muted-foreground mt-0.5">{item.genre}</p>}
                        {item.date && <p className="text-[10px] text-muted-foreground mt-0.5">{item.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

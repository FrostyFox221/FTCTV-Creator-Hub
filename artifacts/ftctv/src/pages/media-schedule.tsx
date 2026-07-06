import { useGetSchedule } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

export default function MediaSchedule() {
  const { data: items, isLoading } = useGetSchedule({ query: { queryKey: ["schedule"] } });

  const byDay = DAYS.map((name, idx) => ({
    name,
    items: (items ?? []).filter((i) => i.dayOfWeek === idx),
  }));

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/media" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">FTC Media</p>
          <h1 className="text-3xl font-black uppercase tracking-wide">Сетка вещания</h1>
        </div>
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
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">Нет программ</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-primary min-w-[40px]">{item.timeSlot}</span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{item.title}</p>
                        {item.genre && <p className="text-xs text-muted-foreground">{item.genre}</p>}
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

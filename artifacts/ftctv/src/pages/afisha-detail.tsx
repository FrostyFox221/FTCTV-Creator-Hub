import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Calendar, MapPin, Ticket, Clock, ExternalLink, AlertCircle } from "lucide-react";

interface AfishaEventDetail {
  id: number;
  title: string;
  description: string;
  body_text: string;
  images: { image: string }[];
  dates: { start: number; end: number }[];
  place: { id: number; title: string; address: string } | null;
  price: string;
  categories: string[];
  site_url: string;
  age_restriction: string | null;
  is_free: boolean;
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours(), m = d.getMinutes();
  if (h === 0 && m === 0) return "";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

async function fetchEvent(id: string): Promise<AfishaEventDetail> {
  const res = await fetch(`/api/afisha/events/${id}`);
  if (!res.ok) throw new Error("Не удалось загрузить событие");
  return res.json();
}

export default function AfishaDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading, error } = useQuery<AfishaEventDetail>({
    queryKey: ["afisha-event", id],
    queryFn: () => fetchEvent(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="aspect-[16/9] bg-muted rounded-2xl" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Событие не найдено</p>
        <Link href="/afisha" className="text-primary hover:underline text-sm">
          ← Вернуться к афише
        </Link>
      </div>
    );
  }

  const img = event.images?.[0]?.image;
  const startTs = event.dates?.[0]?.start;
  const endTs = event.dates?.[0]?.end;
  const dateStr = startTs ? formatDate(startTs) : "";
  const endDateStr = endTs && endTs !== startTs ? formatDate(endTs) : "";
  const time = startTs ? formatTime(startTs) : "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Навигация */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/afisha" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Афиша</p>
      </div>

      {/* Заголовок */}
      <h1 className="text-3xl font-black leading-tight mb-6">{event.title}</h1>

      {/* Мета-информация */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
        {dateStr && (
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary/70" />
            {dateStr}{endDateStr ? ` — ${endDateStr}` : ""}
          </span>
        )}
        {time && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            {time}
          </span>
        )}
        {event.place && (
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary/70" />
            {event.place.title}{event.place.address ? `, ${event.place.address}` : ""}
          </span>
        )}
        {event.price && (
          <span className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-primary/70" />
            {event.price}
          </span>
        )}
      </div>

      {/* Бейджи */}
      <div className="flex flex-wrap gap-2 mb-6">
        {event.is_free && (
          <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold">
            Бесплатно
          </span>
        )}
        {event.age_restriction && (
          <span className="px-3 py-1 rounded-lg bg-secondary text-foreground/70 text-xs font-bold">
            {event.age_restriction}
          </span>
        )}
        {event.categories.map(cat => (
          <span key={cat} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
            {cat}
          </span>
        ))}
      </div>

      {/* Изображение */}
      {img && (
        <div className="rounded-2xl overflow-hidden mb-8 border border-border">
          <img
            src={img}
            alt={event.title}
            className="w-full object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Описание */}
      {event.description && (
        <div className="text-base text-foreground/90 leading-relaxed whitespace-pre-line mb-6">
          {event.description}
        </div>
      )}

      {/* Полный текст */}
      {event.body_text && event.body_text !== event.description && (
        <div
          className="prose prose-sm dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: event.body_text }}
        />
      )}

      {/* Ссылка на источник */}
      {event.site_url && (
        <div className="mt-8 pt-6 border-t border-border">
          <a
            href={event.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Открыть оригинальный пост
          </a>
        </div>
      )}
    </div>
  );
}

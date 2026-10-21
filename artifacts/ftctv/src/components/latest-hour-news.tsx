import { useState, useEffect } from "react";
import { Clock, ExternalLink, Tag } from "lucide-react";

interface HourlyNewsItem {
  id: number;
  title: string;
  summary: string | null;
  sourceUrl: string;
  sourceName: string;
  topic: string | null;
  publishedAt: string;
  hidden: boolean;
}

const TOPIC_COLORS: Record<string, string> = {
  "Политика": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Экономика": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Общество": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Мир": "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  "Спорт": "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Технологии": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  "Культура": "bg-pink-500/15 text-pink-400 border-pink-500/30",
  "Происшествия": "bg-red-500/15 text-red-400 border-red-500/30",
  "Разное": "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} ч назад`;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function LatestHourNews() {
  const [news, setNews] = useState<HourlyNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/hourly-news?limit=50`);
        if (!res.ok) throw new Error("fetch failed");
        const data: HourlyNewsItem[] = await res.json();
        if (mounted) setNews(data.filter(n => !n.hidden));
      } catch {
        if (mounted) setNews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 3 * 60 * 1000); // refresh every 3 min
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <section className="w-full border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-muted h-6 w-56 rounded animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="bg-muted h-4 w-16 rounded" />
                <div className="bg-muted h-4 flex-1 rounded" />
                <div className="bg-muted h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  const topics = Array.from(new Set(news.map(n => n.topic || "Разное")));
  const filtered = selectedTopic ? news.filter(n => (n.topic || "Разное") === selectedTopic) : news;

  return (
    <section className="w-full border-b border-border bg-card/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              Последний час
            </div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Новости</h2>
            <span className="text-xs text-muted-foreground font-semibold">({filtered.length})</span>
          </div>
        </div>

        {topics.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                !selectedTopic ? "bg-primary text-white border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Все
            </button>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t === selectedTopic ? null : t)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  t === selectedTopic ? "bg-primary text-white border-primary" : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="divide-y divide-border/50">
          {filtered.slice(0, 20).map(item => (
            <a
              key={item.id}
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start sm:items-center gap-3 py-2.5 group hover:bg-secondary/30 -mx-2 px-2 rounded transition-colors"
            >
              <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap pt-0.5 sm:pt-0">
                {timeAgo(item.publishedAt)}
              </span>
              <span className="flex-1 text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </span>
              <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${TOPIC_COLORS[item.topic || "Разное"] || TOPIC_COLORS["Разное"]}`}>
                <Tag className="w-2.5 h-2.5" />
                {item.topic || "Разное"}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap shrink-0 hidden md:flex items-center gap-1">
                {item.sourceName} <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Send, ChevronRight, MonitorPlay } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";

interface TelegramPost {
  id: number;
  title: string;
  content: string;
  images: string[];
  videoUrl: string | null;
  createdAt: string;
  source: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function TelegramNewsFeed() {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/posts?source=telegram&limit=10&page=1`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (mounted) setPosts(data.posts || []);
      } catch {
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <section className="w-full border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-muted h-6 w-48 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col gap-2 p-4 rounded-xl bg-muted/30">
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-full rounded" />
                <div className="bg-muted h-3 w-2/3 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section className="w-full border-b border-border bg-card/30">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-black uppercase tracking-tight">
            <Send className="w-5 h-5 text-[#0088cc]" />
            Telegram-новости
          </h2>
          <Link href="/news" className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
            Все <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {posts.slice(0, 8).map(post => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group flex flex-col bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {post.images?.[0] ? (
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  <img
                    src={getImageUrl(post.images[0])}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {post.videoUrl && (
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-white text-[9px] font-bold uppercase flex items-center gap-1">
                      <MonitorPlay className="w-2.5 h-2.5" /> Видео
                    </div>
                  )}
                </div>
              ) : null}
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#0088cc] bg-[#0088cc]/10 px-1.5 py-0.5 rounded">
                    Telegram
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 font-light">
                  {post.content.substring(0, 80)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

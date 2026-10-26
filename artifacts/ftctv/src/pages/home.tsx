import { useGetPosts, useGetBanners, useGetArticles } from "@workspace/api-client-react";
import StoriesReel from "@/components/stories-reel";
import InfoTicker from "@/components/info-ticker";
import { Link } from "wouter";
import { MonitorPlay, ChevronRight, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import LatestHourNews from "@/components/latest-hour-news";
import TelegramNewsFeed from "@/components/telegram-news-feed";

function BannerCarousel() {
  const { data: allBanners } = useGetBanners({ query: { queryKey: ["banners"] } });
  const banners = (allBanners ?? []).filter(b => b.isEnabled);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 10000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  const b = banners[idx];

  return (
    <section className="w-full border-b border-border">
      <div className="relative w-full aspect-[21/9] max-h-[280px] overflow-hidden bg-zinc-900">
        {b.imageUrl ? (
          <img
            src={getImageUrl(b.imageUrl)}
            alt={b.title}
            className="w-full h-full object-cover transition-opacity duration-700"
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-zinc-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-1">Реклама</p>
          {b.link ? (
            <a href={b.link} target="_blank" rel="noopener noreferrer" className="group">
              <h3 className="text-white font-black text-base md:text-xl uppercase tracking-tight leading-tight mb-0.5 group-hover:text-primary transition-colors">
                {b.title}
              </h3>
            </a>
          ) : (
            <h3 className="text-white font-black text-base md:text-xl uppercase tracking-tight leading-tight mb-0.5">{b.title}</h3>
          )}
          {b.text && <p className="text-zinc-300 text-xs md:text-sm font-light line-clamp-1">{b.text}</p>}
          {b.link && (
            <a href={b.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary uppercase tracking-wider hover:underline">
              Подробнее <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: postsData, isLoading } = useGetPosts(
    { page: 1, limit: 1, source: 'admin' },
    { query: { queryKey: ["posts", 1, "", "admin"] } }
  );

  const featuredPost = postsData?.posts?.[0];

  // Editorial articles
  const { data: articlesData, isLoading: articlesLoading } = useGetArticles({ query: { queryKey: ["home_articles"] } });
  const latestArticles = (articlesData?.articles ?? []).slice(0, 3);

  return (
    <div className="w-full">
      <InfoTicker />
      <BannerCarousel />
      <div className="md:hidden"><StoriesReel /></div>


      {/* Новости за последний час — после рекламы */}
      <LatestHourNews />
      <div className="container mx-auto px-4"><div className="border-t-2 border-[#8953F2]/30 my-1"></div></div>
      {/* Telegram-новости */}
      <TelegramNewsFeed />
      <div className="container mx-auto px-4"><div className="border-t-2 border-[#8953F2]/30 my-1"></div></div>

      <div className="container mx-auto px-4 py-5 md:py-8 flex flex-col gap-8">
        {!isLoading && featuredPost && (
          <section>
            <Link href={`/post/${featuredPost.id}`} className="group block relative rounded-xl overflow-hidden shadow-md border border-border bg-card transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-3/5 lg:w-2/3 aspect-[2/1] md:aspect-auto md:max-h-[260px] relative bg-muted flex-shrink-0">
                  {featuredPost.images?.[0] ? (
                    <img src={getImageUrl(featuredPost.images[0])} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <img src="/logo.png" alt="FTCTV" className="h-12 opacity-10 grayscale" />
                    </div>
                  )}
                  {featuredPost.videoUrl && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <MonitorPlay className="w-3 h-3" /> Видео
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/5 lg:w-1/3 p-4 md:p-5 lg:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {featuredPost.source === 'telegram' ? 'Telegram' : 'Редакция'}
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {formatDate(featuredPost.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-3">
                    {featuredPost.title}
                  </h3>
                  <p className="text-muted-foreground font-light text-sm line-clamp-2 mb-3">
                    {featuredPost.content.substring(0, 120)}...
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mt-auto">
                    Читать далее <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}


        {/* Статьи редакции — 3 latest editorial articles */}
        <section>
          <div className="flex items-center justify-between mb-5 border-b pb-3">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Статьи редакции</h2>
            <Link href="/media/articles" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
              Все статьи <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {articlesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="bg-muted h-6 w-3/4 rounded" />
                  <div className="bg-muted h-4 w-full rounded" />
                  <div className="bg-muted h-4 w-2/3 rounded" />
                </div>
              ))}
            </div>
          ) : latestArticles.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl bg-card border-dashed">
              <p className="text-muted-foreground text-sm">Статей пока нет</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {latestArticles.map((article) => (
                <Link key={article.id} href={`/media/articles/${article.id}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col flex-grow p-4 md:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">Редакция</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{formatDate(article.createdAt)}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-muted-foreground text-sm font-light line-clamp-3 mb-4 mt-auto">
                      {article.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                      Читать <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

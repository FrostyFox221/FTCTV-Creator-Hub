import { useGetPosts, useGetLivestream, useGetBanners } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Search, Radio, MonitorPlay, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="relative w-full aspect-[16/9] max-h-[480px] overflow-hidden bg-zinc-900">
        {b.imageUrl ? (
          <img
            src={b.imageUrl}
            alt={b.title}
            className="w-full h-full object-cover transition-opacity duration-700"
            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-zinc-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-1.5">Реклама</p>
          {b.link ? (
            <a href={b.link} target="_blank" rel="noopener noreferrer" className="group">
              <h3 className="text-white font-black text-xl md:text-3xl uppercase tracking-tight leading-tight mb-1 group-hover:text-primary transition-colors">
                {b.title}
              </h3>
            </a>
          ) : (
            <h3 className="text-white font-black text-xl md:text-3xl uppercase tracking-tight leading-tight mb-1">{b.title}</h3>
          )}
          {b.text && <p className="text-zinc-300 text-sm md:text-base font-light line-clamp-2">{b.text}</p>}
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: postsData, isLoading } = useGetPosts(
    { page, limit: 12, ...(search ? { search } : {}) },
    { query: { queryKey: ["posts", page, search] } }
  );
  const { data: livestream } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const featuredPost = postsData?.posts?.[0];
  const gridPosts = featuredPost && page === 1 ? postsData.posts.slice(1) : postsData?.posts || [];

  return (
    <div className="w-full">
      <BannerCarousel />

      {livestream?.isLive && (
        <section className="w-full bg-[#110e1b] border-b border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col gap-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider w-max shadow-lg shadow-red-600/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  В ЭФИРЕ
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                  {livestream.title || "Прямой эфир FTCTV"}
                </h2>
                {livestream.description && (
                  <p className="text-zinc-300 text-lg line-clamp-2 font-light">{livestream.description}</p>
                )}
              </div>
              <Link href="/live">
                <Button size="lg" className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6 h-auto font-bold uppercase tracking-widest shadow-xl shadow-primary/30 transition-transform hover:scale-105">
                  Смотреть сейчас
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col gap-16">
        {!isLoading && featuredPost && !search && page === 1 && (
          <section>
            <Link href={`/post/${featuredPost.id}`} className="group block relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-3/5 lg:w-2/3 aspect-[16/9] md:aspect-auto relative bg-muted flex-shrink-0">
                  {featuredPost.images?.[0] ? (
                    <img src={featuredPost.images[0]} alt={featuredPost.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <img src="/logo.png" alt="FTCTV" className="h-16 opacity-10 grayscale" />
                    </div>
                  )}
                  {featuredPost.videoUrl && (
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <MonitorPlay className="w-3.5 h-3.5" /> Видео
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/5 lg:w-1/3 p-6 md:p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                      {featuredPost.source === 'telegram' ? 'Telegram' : 'Редакция'}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {formatDate(featuredPost.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-3">
                    {featuredPost.title}
                  </h3>
                  <p className="text-muted-foreground font-light text-base md:text-lg line-clamp-3 mb-6">
                    {featuredPost.content.substring(0, 150)}...
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary mt-auto">
                    Читать далее <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4 border-b pb-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Последние новости</h2>
            <form onSubmit={handleSearch} className="flex items-center w-full md:w-auto relative">
              <Search className="w-4 h-4 absolute left-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Искать новости..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-11 pr-4 py-5 w-full md:w-72 rounded-full bg-secondary/50 border-transparent focus:bg-background focus:border-primary shadow-sm"
              />
            </form>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-4">
                  <div className="bg-muted aspect-[4/3] rounded-2xl w-full" />
                  <div className="flex gap-2"><div className="bg-muted h-5 w-20 rounded" /><div className="bg-muted h-5 w-24 rounded" /></div>
                  <div className="bg-muted h-6 w-full rounded" />
                </div>
              ))}
            </div>
          ) : gridPosts.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center border rounded-3xl bg-card border-dashed">
              <img src="/logo.png" alt="FTCTV" className="h-16 opacity-20 grayscale mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-wide mb-2 text-foreground/80">Пока новостей нет</h3>
              <p className="text-muted-foreground max-w-sm">Скоро здесь появятся свежие материалы. Заходите немного позже.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {gridPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="relative overflow-hidden aspect-[4/3] bg-muted w-full shrink-0">
                    {post.images?.[0] ? (
                      <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/30 relative">
                        <img src="/logo.png" alt="FTCTV" className="h-12 opacity-10 grayscale absolute" />
                      </div>
                    )}
                    {post.videoUrl && (
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <MonitorPlay className="w-3 h-3" /> Видео
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow p-5 md:p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {post.source === 'telegram' ? 'Telegram' : 'Редакция'}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-light line-clamp-2 mb-4 mt-auto">
                      {post.content.substring(0, 100)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {postsData && postsData.total > postsData.limit && (
            <div className="flex items-center justify-center mt-12 gap-4">
              <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full w-10 h-10">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-bold uppercase tracking-wider px-2">
                Страница {page} из {Math.ceil(postsData.total / postsData.limit)}
              </span>
              <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(postsData.total / postsData.limit)} className="rounded-full w-10 h-10">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

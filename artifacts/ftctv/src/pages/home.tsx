import { useGetPosts, useGetLivestream } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Search, Radio } from "lucide-react";
import { useState } from "react";
import { formatDate, removeEmojis } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: postsData, isLoading } = useGetPosts({ page, limit: 20, search: search || null }, { query: { queryKey: ["posts", page, search] } });
  const { data: livestream } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {livestream?.isLive && (
        <div className="mb-10 w-full">
          <Link href="/live" className="block relative overflow-hidden rounded-2xl group border-2 border-primary/50 hover:border-primary transition-colors">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-900/80 z-10" />
            <div className="relative z-20 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-max animate-pulse">
                  <Radio className="w-4 h-4" /> В ЭФИРЕ
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
                  {livestream.title || "Прямой эфир FTCTV"}
                </h2>
                <p className="text-zinc-300 max-w-2xl line-clamp-2">
                  {livestream.description}
                </p>
              </div>
              <Button size="lg" className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                Смотреть
              </Button>
            </div>
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Новости</h1>
        <form onSubmit={handleSearch} className="flex items-center w-full md:w-auto relative">
          <Search className="w-5 h-5 absolute left-3 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Поиск..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 w-full md:w-64 rounded-full bg-secondary border-transparent focus:bg-background focus:border-primary"
          />
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-4">
              <div className="bg-muted aspect-video rounded-xl" />
              <div className="bg-muted h-6 w-3/4 rounded" />
              <div className="bg-muted h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : postsData?.posts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Новостей не найдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {postsData?.posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="group flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-muted">
                {post.images?.[0] ? (
                  <img 
                    src={post.images[0]} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground/30">
                    <img src="/logo.png" alt="FTCTV" className="h-12 opacity-20 grayscale" />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <MonitorPlay className="w-3 h-3" /> Видео
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {postsData && postsData.total > postsData.limit && (
        <div className="flex justify-center mt-12 gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-full uppercase tracking-wider text-xs font-bold"
          >
            Назад
          </Button>
          <span className="flex items-center px-4 font-mono font-bold text-sm bg-secondary rounded-full">
            {page} / {Math.ceil(postsData.total / postsData.limit)}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(postsData.total / postsData.limit)}
            className="rounded-full uppercase tracking-wider text-xs font-bold"
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
}

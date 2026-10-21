import { useState } from "react";
import { useGetPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Send, MonitorPlay, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function News() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: postsData, isLoading } = useGetPosts(
    { page, limit: 12, source: "telegram", ...(search ? { search } : {}) },
    { query: { queryKey: ["posts", page, search, "telegram"] } }
  );

  const posts = postsData?.posts ?? [];
  const total = postsData?.total ?? 0;
  const limit = postsData?.limit ?? 12;
  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
          <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-black uppercase tracking-tight">
            <Send className="w-6 h-6 text-[#0088cc]" />
            Telegram-новости
          </h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-muted aspect-[4/3] rounded-xl w-full" />
                <div className="bg-muted h-4 w-3/4 rounded" />
                <div className="bg-muted h-3 w-full rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border rounded-2xl bg-card border-dashed">
            <Send className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">Новостей не найдено</h3>
            <p className="text-muted-foreground text-sm">Попробуйте другой поисковый запрос</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative overflow-hidden aspect-[4/3] bg-muted w-full shrink-0">
                  {post.images?.[0] ? (
                    <img
                      src={getImageUrl(post.images[0])}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                      <Send className="w-8 h-8 text-[#0088cc]/20" />
                    </div>
                  )}
                  {post.videoUrl && (
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <MonitorPlay className="w-3 h-3" /> Видео
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow p-3.5 md:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#0088cc] bg-[#0088cc]/10 px-1.5 py-0.5 rounded">
                      Telegram
                    </span>
                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm font-light line-clamp-2 mt-auto">
                    {post.content.substring(0, 100)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {total > limit && (
          <div className="flex items-center justify-center mt-8 gap-3">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-full w-10 h-10">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-bold uppercase tracking-wider px-2">
              {page} из {totalPages}
            </span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded-full w-10 h-10">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

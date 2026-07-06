import { useGetArticles } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function MediaArticles() {
  const { data, isLoading } = useGetArticles({ query: { queryKey: ["articles"] } });
  const articles = data?.articles ?? [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/media" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">FTC Media</p>
          <h1 className="text-3xl font-black uppercase tracking-wide">Статьи</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">—</p>
          <p className="font-semibold">Статей пока нет</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/media/articles/${article.id}`}>
              <div className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer">
                <h2 className="font-black text-lg uppercase tracking-wide leading-tight mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {article.content.replace(/<[^>]+>/g, "").slice(0, 180)}...
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {article.authorName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

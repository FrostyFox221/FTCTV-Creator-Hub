import { useGetArticle } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { ChevronLeft, User, Calendar } from "lucide-react";
import { formatDate } from "@/lib/format";
import DOMPurify from "dompurify";

export default function MediaArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useGetArticle(Number(id), {
    query: { queryKey: ["article", id] },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-64 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Статья не найдена</p>
        <Link href="/media/articles" className="text-primary hover:underline text-sm mt-4 block">
          Вернуться к статьям
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/media/articles" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Статьи</p>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-wide leading-tight mb-4">{article.title}</h1>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 pb-6 border-b border-border">
        <span className="flex items-center gap-1.5">
          <User className="w-3 h-3" />
          {article.authorName}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          {formatDate(article.createdAt)}
        </span>
      </div>

      {article.mediaUrl && (
        (/\.(mp4|webm)/i.test(article.mediaUrl) || /type=video/i.test(article.mediaUrl)) ? (
          <video
            src={article.mediaUrl}
            controls
            className="w-full rounded-lg mb-8 bg-black"
          />
        ) : (
          <img
            src={article.mediaUrl}
            alt={article.title}
            className="w-full rounded-lg mb-8 object-cover"
          />
        )
      )}

      <div
        className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground/90 [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-semibold [&_table]:my-4"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(article.content, {
            ALLOWED_TAGS: [
              "p", "br", "strong", "b", "em", "i", "u",
              "h2", "h3", "ul", "ol", "li", "hr",
              "table", "thead", "tbody", "tr", "th", "td",
              "blockquote", "pre", "code",
            ],
            ALLOWED_ATTR: ["colspan", "rowspan"],
          }),
        }}
      />
    </div>
  );
}

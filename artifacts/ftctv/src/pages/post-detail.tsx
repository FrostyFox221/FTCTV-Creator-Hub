import { useGetPost } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, MonitorPlay } from "lucide-react";
import { formatDate, renderMarkdownBold } from "@/lib/format";

export default function PostDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: post, isLoading, error } = useGetPost(id, { query: { enabled: !!id, queryKey: ["post", id] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4 mb-6" />
        <div className="h-96 bg-muted rounded-xl mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Новость не найдена</h2>
        <Link href="/" className="text-primary hover:underline">Вернуться на главную</Link>
      </div>
    );
  }

  const paragraphs = post.content.split('\n\n').filter(p => p.trim());

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-4 text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-4">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDate(post.createdAt)}</span>
          {post.source && (
            <span className="bg-secondary px-2 py-0.5 rounded text-xs">
              {post.source === 'telegram' ? 'Telegram' : 'Редакция'}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-black leading-tight uppercase tracking-tighter">
          {post.title}
        </h1>
      </div>

      {post.videoUrl && (
        <div className="mb-10 w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl relative">
          {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
            <iframe 
              src={`https://www.youtube.com/embed/${post.videoUrl.split(/v=|youtu\.be\//)[1]?.split('&')[0]}`}
              className="w-full h-full absolute inset-0"
              allowFullScreen
            />
          ) : (
            <video src={post.videoUrl} controls className="w-full h-full object-contain" />
          )}
        </div>
      )}

      {post.images?.[0] && !post.videoUrl && (
        <div className="mb-10 w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-xl">
          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none prose-p:font-medium prose-p:leading-relaxed prose-strong:font-black prose-strong:text-foreground">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={renderMarkdownBold(p)} />
        ))}
      </div>

      {post.images && post.images.length > 1 && (
        <div className="mt-16 border-t pt-10">
          <h3 className="text-xl font-black uppercase tracking-tight mb-6">Галерея</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {post.images.slice(1).map((img, i) => (
              <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 transition-opacity">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

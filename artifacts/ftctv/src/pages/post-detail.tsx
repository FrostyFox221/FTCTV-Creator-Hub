import { useGetPost } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, MonitorPlay, Share2 } from "lucide-react";
import { formatDate, renderMarkdownBold } from "@/lib/format";

export default function PostDetail() {
  const params = useParams();
  const id = Number(params.id);

  const { data: post, isLoading, error } = useGetPost(id, { query: { enabled: !!id, queryKey: ["post", id] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-8" />
        <div className="h-10 bg-muted rounded w-full mb-4" />
        <div className="h-10 bg-muted rounded w-3/4 mb-6" />
        <div className="h-6 bg-muted rounded w-48 mb-8" />
        <div className="aspect-video bg-muted rounded-2xl mb-10 w-full" />
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-full mt-4" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <img src="/logo.png" className="w-8 opacity-20 grayscale" alt="" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Новость не найдена</h2>
        <p className="text-muted-foreground mb-8">Возможно, материал был удален или ссылка недействительна.</p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  const paragraphs = post.content.split('\n\n').filter(p => p.trim());

  return (
    <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-8 md:mb-10 transition-colors group">
        <div className="p-2 rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Все новости
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] tracking-tight mb-6 text-foreground">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" /> {formatDate(post.createdAt)}
            </span>
            {post.source && (
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded">
                {post.source === 'telegram' ? 'Источник: Telegram' : 'Редакция FTCTV'}
              </span>
            )}
          </div>
          <button 
            className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.href });
              }
            }}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Поделиться</span>
          </button>
        </div>
      </header>

      {post.videoUrl && (
        <div className="mb-12 w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl relative border border-border/20">
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
        <div className="mb-12 w-full max-h-[600px] rounded-2xl overflow-hidden bg-muted shadow-lg border border-border/50 flex justify-center">
          <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none prose-p:font-light prose-p:text-lg prose-p:leading-relaxed prose-strong:font-bold prose-strong:text-foreground text-foreground/90 space-y-6">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={renderMarkdownBold(p)} className="break-words" />
        ))}
      </div>

      {post.images && post.images.length > 1 && (
        <div className="mt-16 pt-10 border-t border-border">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-8">Фотогалерея</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {post.images.slice(1).map((img, i) => (
              <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 hover:shadow-md transition-all border border-border/50">
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

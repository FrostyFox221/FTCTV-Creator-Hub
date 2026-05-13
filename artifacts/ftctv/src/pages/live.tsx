import { useGetLivestream, useGetPosts } from "@workspace/api-client-react";
import { Radio, Calendar, MessageCircle, ChevronRight, Play } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export default function Live() {
  const { data: livestream, isLoading } = useGetLivestream({ query: { queryKey: ["livestream"] } });
  const { data: postsData } = useGetPosts({ limit: 3 }, { query: { queryKey: ["posts", 1, null] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl animate-pulse">
        <div className="h-10 bg-muted rounded w-1/3 mb-8" />
        <div className="aspect-video bg-muted rounded-2xl w-full mb-8" />
        <div className="h-8 bg-muted rounded w-2/3 mb-4" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
    );
  }

  const renderPlayer = () => {
    if (!livestream?.streamUrl) return null;

    if (livestream.streamType === 'youtube') {
      let videoId = '';
      const match = livestream.streamUrl.match(/[?&]v=([^&]+)/) || livestream.streamUrl.match(/youtu\.be\/([^?]+)/);
      if (match) videoId = match[1];

      return (
        <iframe 
          className="w-full h-full absolute inset-0"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }
    
    if (livestream.streamType === 'vk') {
      return (
        <iframe 
          className="w-full h-full absolute inset-0"
          src={livestream.streamUrl} 
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" 
        />
      );
    }

    if (livestream.streamType === 'telegram') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#0088cc]/10" />
          <Radio className="w-16 h-16 text-[#0088cc] mb-6 animate-pulse relative z-10" />
          <h3 className="text-2xl font-bold mb-6 relative z-10">Трансляция в Telegram</h3>
          <a 
            href={livestream.streamUrl} 
            target="_blank" 
            rel="noreferrer"
            className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-colors shadow-lg shadow-[#0088cc]/20 relative z-10"
          >
            Перейти в канал
          </a>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
        <p className="text-muted-foreground uppercase font-bold tracking-wider">Неподдерживаемый формат трансляции</p>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-16rem)]">
      {/* Header Area */}
      <div className="container mx-auto px-4 pt-10 pb-6 max-w-5xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Прямой эфир FTCTV</h1>
          <p className="text-muted-foreground text-lg font-light">Главные события региона в реальном времени</p>
        </div>
      </div>

      {livestream?.isLive ? (
        <div className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm shadow-red-600/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              В ЭФИРЕ
            </div>
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">FTCTV.Online</span>
          </div>

          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-border/20 mb-8 ring-1 ring-white/10">
            {renderPlayer()}
          </div>

          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black leading-tight mb-4 text-foreground">
              {livestream.title}
            </h2>
            {livestream.description && (
              <p className="text-base md:text-lg text-muted-foreground whitespace-pre-wrap font-light">
                {livestream.description}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="w-full aspect-[21/9] md:aspect-video bg-card border rounded-3xl overflow-hidden shadow-sm relative flex flex-col items-center justify-center p-6 text-center mb-16">
            <div className="absolute inset-0 bg-secondary/30" />
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-md relative z-10">
              <Play className="w-8 h-8 text-muted-foreground ml-1" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4 relative z-10 text-foreground/90">
              Эфир не ведется
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto relative z-10 mb-8">
              Когда начнется следующая трансляция, плеер появится на этой странице автоматически.
            </p>
            
            <div className="bg-background border rounded-2xl p-6 max-w-md w-full relative z-10 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-center gap-3 text-primary mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider">Анонсы трансляций</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Следите за расписанием и анонсами в нашем Telegram-канале, чтобы ничего не пропустить.
              </p>
              <a 
                href="https://t.me/ftctv_itv" 
                target="_blank" 
                rel="noreferrer"
                className="mt-2 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                @ftctv.itv
              </a>
            </div>
          </div>

          {postsData?.posts && postsData.posts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Пока нет эфира — читайте новости</h3>
                <Link href="/" className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1 hover:underline">
                  Все новости <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {postsData.posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative">
                      {post.images?.[0] ? (
                        <img src={post.images[0]} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img src="/logo.png" alt="" className="h-8 opacity-20 grayscale" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {formatDate(post.createdAt)}
                      </span>
                      <h4 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

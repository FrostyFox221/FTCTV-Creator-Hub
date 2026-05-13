import { useGetLivestream } from "@workspace/api-client-react";
import { Radio } from "lucide-react";

export default function Live() {
  const { data: livestream, isLoading } = useGetLivestream({ query: { queryKey: ["livestream"] } });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl animate-pulse">
        <div className="aspect-video bg-muted rounded-2xl w-full mb-8" />
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!livestream?.isLive) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-4xl text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8">
          <Radio className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Прямой эфир временно недоступен</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Трансляция в данный момент не ведется. Следите за анонсами в наших социальных сетях и возвращайтесь позже.
        </p>
      </div>
    );
  }

  const renderPlayer = () => {
    if (!livestream.streamUrl) return null;

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
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-8">
          <Radio className="w-16 h-16 text-[#0088cc] mb-6 animate-pulse" />
          <h3 className="text-2xl font-bold mb-4">Трансляция в Telegram</h3>
          <a 
            href={livestream.streamUrl} 
            target="_blank" 
            rel="noreferrer"
            className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-colors"
          >
            Перейти в канал
          </a>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">
        <p>Неподдерживаемый формат трансляции</p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 animate-pulse w-max">
          <div className="w-2 h-2 bg-white rounded-full" /> В эфире
        </div>
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">FTCTV.Online</span>
      </div>

      <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-border/50 mb-8">
        {renderPlayer()}
      </div>

      <div className="max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4">
          {livestream.title}
        </h1>
        {livestream.description && (
          <p className="text-lg text-muted-foreground whitespace-pre-wrap">
            {livestream.description}
          </p>
        )}
      </div>
    </div>
  );
}

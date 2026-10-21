import { Link } from "wouter";
import { Play, ListVideo, Film } from "lucide-react";
import { useGetVideos, useGetVideoPlaylists } from "@workspace/api-client-react";

export default function Videos() {
  const { data: videos, isLoading: loadingV } = useGetVideos();
  const { data: playlists, isLoading: loadingP } = useGetVideoPlaylists();
  const isLoading = loadingV || loadingP;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Медиа</p>
        <h1 className="text-4xl font-black uppercase tracking-wide mb-3">Видео</h1>
        <p className="text-muted-foreground text-base">Видеоматериалы и плейлисты</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Playlists */}
      {playlists && playlists.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-primary" /> Плейлисты
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((pl) => (
              <Link key={pl.id} href={`/videos/playlist/${pl.id}`}>
                <div className="group rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200">
                  {pl.coverUrl ? (
                    <div className="aspect-video overflow-hidden">
                      <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-indigo-900/20">
                      <ListVideo className="w-12 h-12 text-indigo-400/40" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-black uppercase tracking-wide text-sm mb-1">{pl.name}</h3>
                    {pl.description && <p className="text-xs text-muted-foreground line-clamp-2">{pl.description}</p>}
                    {pl.itemCount !== undefined && <p className="text-xs text-muted-foreground mt-1">{pl.itemCount} видео</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All videos */}
      {videos && videos.length > 0 && (
        <div>
          <h2 className="text-lg font-black uppercase tracking-wide mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" /> Все видео
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <Link key={v.id} href={`/videos/${v.id}`}>
                <div className="group rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-purple-900/10 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200">
                  {v.thumbnailUrl ? (
                    <div className="aspect-video overflow-hidden relative">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <Play className="w-10 h-10 text-white/80" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-purple-900/20">
                      <Play className="w-12 h-12 text-purple-400/40" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-black uppercase tracking-wide text-sm mb-1">{v.title}</h3>
                    {v.duration && <p className="text-xs text-muted-foreground">{v.duration}</p>}
                    {v.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && (!videos || videos.length === 0) && (!playlists || playlists.length === 0) && (
        <div className="text-center py-20">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Видео пока нет</p>
        </div>
      )}
    </div>
  );
}

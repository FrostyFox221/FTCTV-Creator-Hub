import { useParams, Link } from "wouter";
import { ArrowLeft, Play, ListVideo } from "lucide-react";
import { useGetVideoPlaylist } from "@workspace/api-client-react";
import { useState } from "react";

export default function VideoPlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const { data: playlist, isLoading, error } = useGetVideoPlaylist(playlistId);
  const [activeIdx, setActiveIdx] = useState(0);

  const activeVideo = playlist?.videos?.[activeIdx];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/videos">
        <span className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Назад к видео
        </span>
      </Link>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">Не удалось загрузить плейлист</div>
      )}

      {playlist && (
        <>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Плейлист</p>
            <h1 className="text-3xl font-black uppercase tracking-wide mb-2">{playlist.name}</h1>
            {playlist.description && <p className="text-muted-foreground text-sm">{playlist.description}</p>}
          </div>

          {(playlist.videos?.length ?? 0) === 0 ? (
            <div className="text-center py-20">
              <ListVideo className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Плейлист пуст</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Player */}
              <div>
                {activeVideo && (
                  <div className="rounded-2xl overflow-hidden border border-indigo-500/30 bg-black mb-3">
                    <video
                      key={activeVideo.id}
                      src={activeVideo.videoUrl}
                      poster={activeVideo.thumbnailUrl || undefined}
                      controls
                      autoPlay
                      preload="metadata"
                      className="w-full aspect-video"
                    />
                  </div>
                )}
                {activeVideo && (
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-wide">{activeVideo.title}</h2>
                    {activeVideo.duration && <p className="text-xs text-muted-foreground mt-1">{activeVideo.duration}</p>}
                    {activeVideo.description && <p className="text-sm text-muted-foreground mt-2">{activeVideo.description}</p>}
                  </div>
                )}
              </div>

              {/* Playlist sidebar */}
              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-indigo-900/5 overflow-hidden">
                <div className="p-3 border-b border-indigo-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {playlist.videos?.length ?? 0} видео
                  </p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {playlist.videos?.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        idx === activeIdx
                          ? "bg-primary/15"
                          : "hover:bg-white/5"
                      }`}
                      onClick={() => setActiveIdx(idx)}
                    >
                      <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{idx + 1}</span>
                      <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-black/30">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-white/30" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{item.title}</p>
                        {item.duration && <p className="text-[10px] text-muted-foreground">{item.duration}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useGetVideo } from "@workspace/api-client-react";

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const videoId = Number(id);
  const { data: video, isLoading, error } = useGetVideo(videoId);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
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
        <div className="text-center py-20 text-red-400">Не удалось загрузить видео</div>
      )}

      {video && (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-black uppercase tracking-wide mb-2">{video.title}</h1>
            {video.duration && <p className="text-sm text-muted-foreground">Длительность: {video.duration}</p>}
          </div>

          <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-black mb-6">
            <video
              src={video.videoUrl}
              poster={video.thumbnailUrl || undefined}
              controls
              preload="metadata"
              className="w-full aspect-video"
            />
          </div>

          {video.description && (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/10 to-purple-900/5 p-6">
              <h2 className="text-sm font-black uppercase tracking-wide mb-2">Описание</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

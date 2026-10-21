import { useParams, Link } from "wouter";
import { ArrowLeft, ImageIcon, X } from "lucide-react";
import { useGetGalleryFolder } from "@workspace/api-client-react";
import { useState } from "react";

export default function GalleryFolder() {
  const { id } = useParams<{ id: string }>();
  const folderId = Number(id);
  const { data: folder, isLoading, error } = useGetGalleryFolder(folderId);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href="/gallery">
        <span className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Назад к галерее
        </span>
      </Link>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">Не удалось загрузить альбом</div>
      )}

      {folder && (
        <>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Альбом</p>
            <h1 className="text-3xl font-black uppercase tracking-wide mb-2">{folder.name}</h1>
            <p className="text-muted-foreground text-sm">{folder.photos.length} фото</p>
          </div>

          {folder.photos.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Фотографий пока нет</p>
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {folder.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-primary/50 transition-colors"
                  onClick={() => setLightboxIdx(idx)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-[11px] text-white/90 leading-tight truncate">{photo.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && folder && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-50"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Prev */}
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl font-light z-50"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}
            >
              ‹
            </button>
          )}

          {/* Next */}
          {lightboxIdx < folder.photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl font-light z-50"
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}
            >
              ›
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={folder.photos[lightboxIdx].imageUrl}
              alt={folder.photos[lightboxIdx].caption || ""}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {folder.photos[lightboxIdx].caption && (
              <p className="mt-3 text-sm text-white/80 text-center">{folder.photos[lightboxIdx].caption}</p>
            )}
            <p className="mt-1 text-xs text-white/40">{lightboxIdx + 1} / {folder.photos.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}

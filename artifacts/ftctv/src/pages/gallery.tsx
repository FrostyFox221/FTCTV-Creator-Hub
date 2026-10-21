import { Link } from "wouter";
import { FolderOpen, ImageIcon } from "lucide-react";
import { useGetGalleryFolders } from "@workspace/api-client-react";

export default function Gallery() {
  const { data: folders, isLoading, error } = useGetGalleryFolders();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Медиа</p>
        <h1 className="text-4xl font-black uppercase tracking-wide mb-3">Галерея</h1>
        <p className="text-muted-foreground text-base">Фотоальбомы и репортажи</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-400">Не удалось загрузить галерею</div>
      )}

      {folders && folders.length === 0 && (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Альбомов пока нет</p>
        </div>
      )}

      {folders && folders.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Link key={folder.id} href={`/gallery/${folder.id}`}>
              <div className="group rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-violet-900/10 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200">
                {folder.coverUrl ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={folder.coverUrl}
                      alt={folder.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] flex items-center justify-center bg-violet-900/20">
                    <ImageIcon className="w-12 h-12 text-violet-400/40" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-black uppercase tracking-wide text-sm mb-1">{folder.name}</h2>
                  {folder.photoCount !== undefined && (
                    <p className="text-xs text-muted-foreground">{folder.photoCount} фото</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

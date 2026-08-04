import { useGetStories } from "@workspace/api-client-react";
import { useRef, useState } from "react";

function StoryViewer({ stories, startIdx, onClose }: {
  stories: { id: number; imageUrl: string; title?: string | null; link?: string | null }[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const story = stories[idx];

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm h-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30">
              <div className={`h-full rounded-full bg-white transition-all ${i < idx ? "w-full" : i === idx ? "w-full" : "w-0"}`} />
            </div>
          ))}
        </div>

        {/* Close */}
        <button onClick={onClose} className="absolute top-7 right-4 z-10 text-white/80 hover:text-white text-2xl font-light leading-none">✕</button>

        {/* Image */}
        <img src={story.imageUrl} alt={story.title ?? ""} className="w-full h-full object-cover rounded-2xl" />

        {/* Title */}
        {story.title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
            <p className="text-white font-bold text-lg">{story.title}</p>
            {story.link && (
              <a href={story.link} target="_blank" rel="noopener noreferrer" className="text-primary text-xs font-bold uppercase tracking-wider mt-1 inline-block">
                Подробнее →
              </a>
            )}
          </div>
        )}

        {/* Nav areas */}
        {idx > 0 && (
          <button className="absolute left-0 inset-y-0 w-1/3" onClick={() => setIdx(i => i - 1)} />
        )}
        {idx < stories.length - 1 && (
          <button className="absolute right-0 inset-y-0 w-1/3" onClick={() => setIdx(i => i + 1)} />
        )}
      </div>
    </div>
  );
}

export default function StoriesReel() {
  const { data: stories } = useGetStories({ query: { queryKey: ["stories"] } });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  if (!stories || stories.length === 0) return null;

  return (
    <>
      <section className="w-full border-b border-border bg-background">
        <div
          ref={scrollRef}
          className="flex gap-4 px-4 py-4 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {stories.map((story, i) => (
            <button
              key={story.id}
              onClick={() => setViewerIdx(i)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              {/* Ring */}
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-amber-400 shadow-md group-hover:scale-105 transition-transform">
                <div className="p-[2px] rounded-full bg-background">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden">
                    <img
                      src={story.imageUrl}
                      alt={story.title ?? ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              {/* Label */}
              <span className="text-[10px] font-medium text-muted-foreground max-w-[64px] truncate text-center">
                {story.title ?? "История"}
              </span>
            </button>
          ))}
        </div>
      </section>

      {viewerIdx !== null && (
        <StoryViewer
          stories={stories}
          startIdx={viewerIdx}
          onClose={() => setViewerIdx(null)}
        />
      )}
    </>
  );
}

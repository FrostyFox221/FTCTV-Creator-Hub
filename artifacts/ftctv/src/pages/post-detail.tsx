import { useGetPost } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Clock, MonitorPlay, Share2, Heart, Send, Trash2, User } from "lucide-react";
import { formatDate, renderMarkdownBold } from "@/lib/format";
import { getImageUrl } from "@/lib/image-url";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
          <img src={getImageUrl(post.images[0])} alt={post.title} className="w-full h-full object-cover" />
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
              <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 hover:shadow-md transition-all border border-border/50">
                <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}
      {/* Reactions & Comments Section */}
      <ReactionsAndComments postId={id} />
    </article>
  );
}

interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

function ReactionsAndComments({ postId }: { postId: number }) {
  const { session, isLoggedIn } = useUserAuth();
  const [reactionCount, setReactionCount] = useState(0);
  const [userReacted, setUserReacted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const headers: Record<string, string> = {};
  if (session) headers["Authorization"] = `Bearer ${session.token}`;

  // Load reactions
  useEffect(() => {
    fetch(`/api/posts/${postId}/reactions`, { headers })
      .then(r => r.json())
      .then(data => {
        setReactionCount(data.count ?? 0);
        setUserReacted(data.userReacted ?? false);
      })
      .catch(() => {});
  }, [postId]);

  // Load comments
  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setComments(data); })
      .catch(() => {});
  }, [postId]);

  const toggleReaction = async () => {
    if (!isLoggedIn) return;
    const res = await fetch(`/api/posts/${postId}/reactions`, { method: "POST", headers });
    const data = await res.json();
    if (data.reacted) {
      setUserReacted(true);
      setReactionCount(c => c + 1);
    } else {
      setUserReacted(false);
      setReactionCount(c => Math.max(0, c - 1));
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments(prev => [{ ...data, avatarUrl: session?.avatarUrl || null }, ...prev]);
        setCommentText("");
      }
    } catch {}
    setSubmitting(false);
  };

  const deleteComment = async (id: number) => {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE", headers });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="mt-16 pt-10 border-t border-border">
      {/* Reaction button */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={toggleReaction}
          disabled={!isLoggedIn}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm transition-all ${
            userReacted
              ? "bg-red-500/10 border-red-500/30 text-red-500"
              : "border-border text-muted-foreground hover:border-red-500/30 hover:text-red-500"
          } ${!isLoggedIn ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          title={isLoggedIn ? "Нравится" : "Войдите, чтобы поставить реакцию"}
        >
          <Heart className={`w-4 h-4 ${userReacted ? "fill-current" : ""}`} />
          {reactionCount > 0 && <span>{reactionCount}</span>}
        </button>
        {!isLoggedIn && <span className="text-xs text-muted-foreground">Войдите, чтобы оставить реакцию</span>}
      </div>

      {/* Comments */}
      <h3 className="text-xl font-black uppercase tracking-tight mb-6">
        Комментарии {comments.length > 0 && `(${comments.length})`}
      </h3>

      {isLoggedIn && (
        <form onSubmit={submitComment} className="flex gap-3 mb-8">
          <div className="w-9 h-9 rounded-full bg-muted border flex-shrink-0 flex items-center justify-center overflow-hidden">
            {session?.avatarUrl ? (
              <img src={session.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Напишите комментарий..."
              maxLength={1000}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={submitting || !commentText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground mb-8">
          <Link href="/login" className="text-primary font-semibold hover:underline">Войдите</Link>, чтобы оставить комментарий.
        </p>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground">Пока нет комментариев. Будьте первым!</p>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
            <div className="w-8 h-8 rounded-full bg-muted border flex-shrink-0 flex items-center justify-center overflow-hidden">
              {comment.avatarUrl ? (
                <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold truncate">{comment.displayName || comment.username}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(comment.createdAt).toLocaleDateString("ru-RU")}</span>
                  {session?.username === comment.username && (
                    <button onClick={() => deleteComment(comment.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Удалить">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/80 break-words">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

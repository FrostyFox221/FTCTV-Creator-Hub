import { useState } from "react";
import { useGetForumTopic, useCreateForumReply } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { ChevronLeft, Send } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MediaForumTopic() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch } = useGetForumTopic(Number(id), {
    query: { queryKey: ["forum-topic", id] },
  });
  const { mutateAsync: createReply } = useCreateForumReply();

  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;
    setSubmitting(true);
    try {
      await createReply({
        id: Number(id),
        data: { authorName: authorName.trim(), content: content.trim() },
      });
      setContent("");
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 w-full bg-muted rounded" />
          <div className="h-20 w-full bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Тема не найдена</p>
        <Link href="/media/forum" className="text-primary text-sm mt-4 block">Вернуться к форуму</Link>
      </div>
    );
  }

  const { topic, replies } = data;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/media/forum" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {topic.category}
        </span>
      </div>

      <h1 className="text-2xl font-black uppercase tracking-wide leading-tight mb-2">{topic.title}</h1>
      <p className="text-xs text-muted-foreground mb-8">{topic.authorName} · {formatDate(topic.createdAt)}</p>

      {replies.length > 0 && (
        <div className="flex flex-col gap-4 mb-8">
          {replies.map((reply, idx) => (
            <div key={reply.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-black text-primary">
                  {reply.authorName[0]?.toUpperCase()}
                </div>
                <span className="font-bold text-sm">{reply.authorName}</span>
                <span className="text-xs text-muted-foreground ml-auto">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {replies.length === 0 && (
        <div className="text-center py-10 text-muted-foreground mb-8">
          <p className="text-sm">Ответов пока нет. Будьте первым!</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-black text-sm uppercase tracking-wide mb-4">Ответить</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Ваше имя"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Ваш ответ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
          <Button type="submit" disabled={submitting} className="self-end gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Отправка..." : "Отправить"}
          </Button>
        </form>
      </div>
    </div>
  );
}

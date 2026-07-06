import { useState } from "react";
import { useGetForumTopics, useCreateForumTopic } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft, MessageSquare, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["Общее", "Новости", "Техника", "Обратная связь", "Идеи"];

export default function MediaForum() {
  const { data, isLoading, refetch } = useGetForumTopics({ query: { queryKey: ["forum-topics"] } });
  const { mutateAsync: createTopic } = useCreateForumTopic();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Общее");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const topics = data?.topics ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    setSubmitting(true);
    try {
      await createTopic({ data: { title: title.trim(), category, authorName: authorName.trim() } });
      setTitle("");
      setAuthorName("");
      setShowForm(false);
      refetch();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/media" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">FTC Media</p>
            <h1 className="text-3xl font-black uppercase tracking-wide">Форум</h1>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Отмена" : "Новая тема"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <h3 className="font-black text-sm uppercase tracking-wide">Создать тему</h3>
          <Input placeholder="Заголовок темы" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Ваше имя" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Отправка..." : "Создать"}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">—</p>
          <p className="font-semibold">Тем пока нет. Создайте первую!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/media/forum/${topic.id}`}>
              <div className="group rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {topic.category}
                    </span>
                  </div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors truncate">{topic.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{topic.authorName} · {formatDate(topic.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground ml-4 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-semibold">{topic.replyCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

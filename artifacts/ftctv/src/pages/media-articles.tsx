import { useState } from "react";
import { useGetArticles, useCreateArticle } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ChevronLeft, User, Calendar, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function MediaArticles() {
  const { data, isLoading } = useGetArticles({ query: { queryKey: ["articles"] } });
  const { mutateAsync: createArticle } = useCreateArticle();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", authorName: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const articles = data?.articles ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.authorName.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await createArticle({
        data: { title: form.title.trim(), authorName: form.authorName.trim(), content: form.content.trim() },
      });
      toast({ title: "Статья отправлена на модерацию" });
      setForm({ title: "", authorName: "", content: "" });
      setShowForm(false);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отправить статью", variant: "destructive" });
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
            <h1 className="text-3xl font-black uppercase tracking-wide">Статьи</h1>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Отмена" : "Написать статью"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <h3 className="font-black text-sm uppercase tracking-wide">Новая статья</h3>
          <p className="text-xs text-muted-foreground -mt-2">После отправки статья будет опубликована после проверки редакцией</p>
          <Input
            placeholder="Заголовок"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            placeholder="Ваше имя / псевдоним"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            required
          />
          <Textarea
            placeholder="Текст статьи..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={8}
            required
          />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Отправка..." : "Отправить на модерацию"}
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">—</p>
          <p className="font-semibold">Статей пока нет. Станьте первым автором!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/media/articles/${article.id}`}>
              <div className="group rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer">
                <h2 className="font-black text-lg uppercase tracking-wide leading-tight mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {article.content.replace(/<[^>]+>/g, "").slice(0, 180)}...
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {article.authorName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

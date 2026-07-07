import { useState, useEffect, useRef } from "react";
import { useAdminLogin, useGetPosts, useGetLivestream, useGetSettings, useGetTelegramStatus, useGetSchedule, useGetBanners } from "@workspace/api-client-react";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings, Radio, MessageCircle, FileText, Lock, Calendar, Upload, Edit2, Star, Image } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import logoPath from "/logo.png";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("ftctv_admin_token") || "");
  const [password, setPassword] = useState("");
  
  const loginMutation = useAdminLogin();
  const { toast } = useToast();
  
  // Dashboard stats queries
  const { data: postsData } = useGetPosts({ page: 1, limit: 1 }, { query: { enabled: !!token } });
  const { data: liveData } = useGetLivestream({ query: { enabled: !!token } });
  const { data: tgStatus } = useGetTelegramStatus({ query: { enabled: !!token } });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (res) => {
        if (res.success) {
          setToken(res.token);
          localStorage.setItem("ftctv_admin_token", res.token);
          toast({ title: "Успешный вход", variant: "default" });
        } else {
          toast({ title: "Ошибка входа", description: "Неверный пароль", variant: "destructive" });
        }
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Сбой сервера", variant: "destructive" });
      }
    });
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("ftctv_admin_token");
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 relative overflow-hidden bg-background">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <form onSubmit={handleLogin} className="w-full max-w-md bg-card p-10 rounded-3xl border border-border shadow-2xl flex flex-col gap-8 relative z-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2 border border-border/50">
              <Lock className="w-6 h-6 text-foreground/70" />
            </div>
            <img src={logoPath} alt="FTCTV" className="h-6 invert dark:invert-0 dark:brightness-150 mb-2 opacity-50" />
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Вход в систему</h1>
            <p className="text-sm text-muted-foreground font-light">Доступ только для редакции FTCTV</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Input 
              type="password" 
              placeholder="Пароль администратора" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="text-center text-lg font-mono py-6 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-primary"
              required
            />
            <Button type="submit" size="lg" className="w-full uppercase font-bold tracking-wider rounded-xl shadow-lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Проверка..." : "Войти"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Панель управления</h1>
          <p className="text-muted-foreground font-light text-sm mt-1">Редактирование новостей и настроек сайта</p>
        </div>
        <Button variant="outline" onClick={logout} className="text-xs uppercase font-bold tracking-wider rounded-full">
          Выход
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Всего новостей</p>
            <p className="text-2xl font-black">{postsData?.total || 0}</p>
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full ${liveData?.isLive ? 'bg-red-500/10' : 'bg-secondary'} flex items-center justify-center shrink-0`}>
            <Radio className={`w-5 h-5 ${liveData?.isLive ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Статус эфира</p>
            <p className="text-lg font-black">{liveData?.isLive ? 'В ЭФИРЕ' : 'Офлайн'}</p>
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-[#0088cc]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Синхронизация TG</p>
            <p className="text-sm font-semibold mt-1 truncate">{tgStatus?.lastSync ? formatDate(tgStatus.lastSync) : 'Нет данных'}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-8 w-full justify-start overflow-x-auto bg-transparent h-auto p-0 gap-2 border-b rounded-none pb-px no-scrollbar">
          {[
            { id: "posts", label: "Новости", icon: FileText },
            { id: "banners", label: "Реклама", icon: Image },
            { id: "schedule", label: "Программа передач", icon: Calendar },
            { id: "live", label: "Прямой эфир", icon: Radio },
            { id: "telegram", label: "Telegram", icon: MessageCircle },
            { id: "settings", label: "Настройки", icon: Settings }
          ].map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-t-xl rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-card px-6 py-3.5 uppercase tracking-wider text-xs font-bold flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground transition-colors"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="bg-card border rounded-b-2xl rounded-tr-2xl shadow-sm min-h-[400px]">
          <TabsContent value="posts" className="m-0 p-0"><PostsTab /></TabsContent>
          <TabsContent value="banners" className="m-0 p-0"><BannersTab /></TabsContent>
          <TabsContent value="schedule" className="m-0 p-0"><ScheduleTab /></TabsContent>
          <TabsContent value="live" className="m-0 p-0"><LiveTab /></TabsContent>
          <TabsContent value="telegram" className="m-0 p-0"><TelegramTab /></TabsContent>
          <TabsContent value="settings" className="m-0 p-0"><SettingsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ImageUrlsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useUpload({
    onError: (e) => toast({ title: "Ошибка загрузки", description: e.message, variant: "destructive" }),
  });

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const res = await uploadFile(file);
      if (res) {
        const serveUrl = `/api/storage${res.objectPath}`;
        onChange([...value, serveUrl]);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={isUploading}
          className="gap-2 text-xs uppercase font-bold tracking-wider"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? `Загрузка ${progress}%` : "Загрузить фото"}
        </Button>
        {isUploading && (
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt=""
                className="h-16 w-24 object-cover rounded-lg border border-border"
                onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsTab() {
  const { data: posts, refetch } = useGetPosts({ page: 1, limit: 50 }, { query: { queryKey: ["admin_posts"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", images: [] as string[] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; content: string; images: string[] } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить новость? Действие необратимо.")) return;
    try {
      await fetchWithToken(`/api/posts/${id}`, { method: "DELETE" });
      toast({ title: "Новость удалена" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setIsSubmitting(true);
    try {
      await fetchWithToken('/api/posts', {
        method: "POST",
        body: JSON.stringify({ title: newPost.title, content: newPost.content, images: newPost.images, published: true })
      });
      toast({ title: "Новость опубликована" });
      setNewPost({ title: "", content: "", images: [] });
      setShowNewForm(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      await fetchWithToken(`/api/posts/${editingPost.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editingPost.title, content: editingPost.content, images: editingPost.images })
      });
      toast({ title: "Новость обновлена" });
      setEditingPost(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b flex justify-between items-center bg-secondary/30">
        <h2 className="text-xl font-bold uppercase tracking-tight">Список новостей</h2>
        <Button onClick={() => setShowNewForm(!showNewForm)} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
          {showNewForm ? "Отмена" : <><Plus className="w-4 h-4" /> Добавить новость</>}
        </Button>
      </div>

      {showNewForm && (
        <form onSubmit={handleCreatePost} className="p-6 border-b bg-card flex flex-col gap-4 animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок</label>
            <Input
              value={newPost.title}
              onChange={e => setNewPost({...newPost, title: e.target.value})}
              placeholder="Введите заголовок"
              className="text-lg font-medium"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Текст новости</label>
            <Textarea
              value={newPost.content}
              onChange={e => setNewPost({...newPost, content: e.target.value})}
              placeholder="Содержание новости"
              rows={6}
              required
              className="resize-y"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Фотографии (URL, Enter или +)</label>
            <ImageUrlsInput value={newPost.images} onChange={imgs => setNewPost({...newPost, images: imgs})} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="uppercase font-bold tracking-wider">
              {isSubmitting ? "Публикация..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      )}

      {editingPost && (
        <form onSubmit={handleSaveEdit} className="p-6 border-b bg-primary/5 border-primary/20 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <label className="font-bold uppercase text-xs text-primary tracking-wider">Редактирование поста #{editingPost.id}</label>
            <button type="button" onClick={() => setEditingPost(null)} className="text-muted-foreground hover:text-foreground text-sm">Закрыть</button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок</label>
            <Input value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Текст</label>
            <Textarea value={editingPost.content} onChange={e => setEditingPost({ ...editingPost, content: e.target.value })} rows={8} className="resize-y font-mono text-sm" required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Фотографии</label>
            <ImageUrlsInput value={editingPost.images} onChange={imgs => setEditingPost({ ...editingPost, images: imgs })} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={savingEdit} className="uppercase font-bold tracking-wider">
              {savingEdit ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b">
            <tr>
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4 w-16">Фото</th>
              <th className="p-4">Заголовок</th>
              <th className="p-4 w-28">Источник</th>
              <th className="p-4 w-36">Дата</th>
              <th className="p-4 pr-6 w-28 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts?.posts.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                <td className="p-4 pl-6 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="p-4">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt="" className="h-9 w-14 object-cover rounded border border-border" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                  ) : (
                    <div className="h-9 w-14 rounded border border-dashed border-border flex items-center justify-center">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wide">нет</span>
                    </div>
                  )}
                </td>
                <td className="p-4 font-semibold max-w-xs truncate pr-4">{p.title}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.source === 'telegram' ? 'bg-[#0088cc]/10 text-[#0088cc]' : 'bg-primary/10 text-primary'}`}>
                    {p.source}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                <td className="p-4 pr-6 text-right flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingPost(editingPost?.id === p.id ? null : { id: p.id, title: p.title, content: p.content, images: p.images ?? [] })}
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
                    title="Редактировать"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {posts?.posts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-muted-foreground">Нет постов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BannersTab() {
  const { data: banners, refetch } = useGetBanners({ query: { queryKey: ["admin_banners"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();

  const emptyForm = { title: "", text: "", imageUrl: "", link: "", isEnabled: true, sortOrder: 0 };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<null | { id: number } & typeof emptyForm>(null);
  const [saving, setSaving] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useUpload({
    onError: (e) => toast({ title: "Ошибка загрузки", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (files: FileList | null, onDone: (url: string) => void) => {
    if (!files || !files[0]) return;
    const res = await uploadFile(files[0]);
    if (res) onDone(`/api/storage${res.objectPath}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSubmitting(true);
    try {
      await fetchWithToken("/api/banners", { method: "POST", body: JSON.stringify({ ...form, text: form.text || undefined, imageUrl: form.imageUrl || undefined, link: form.link || undefined }) });
      toast({ title: "Баннер добавлен" });
      setForm(emptyForm);
      setShowForm(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setSaving(true);
    try {
      await fetchWithToken(`/api/banners/${editingBanner.id}`, { method: "PUT", body: JSON.stringify({ title: editingBanner.title, text: editingBanner.text || undefined, imageUrl: editingBanner.imageUrl || undefined, link: editingBanner.link || undefined, isEnabled: editingBanner.isEnabled, sortOrder: editingBanner.sortOrder }) });
      toast({ title: "Баннер обновлён" });
      setEditingBanner(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить баннер?")) return;
    try {
      await fetchWithToken(`/api/banners/${id}`, { method: "DELETE" });
      toast({ title: "Баннер удалён" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const toggleEnabled = async (id: number, isEnabled: boolean) => {
    try {
      await fetchWithToken(`/api/banners/${id}`, { method: "PUT", body: JSON.stringify({ isEnabled }) });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b flex justify-between items-center bg-secondary/30">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Рекламные баннеры</h2>
          <p className="text-xs text-muted-foreground mt-1">Баннеры отображаются на главной странице и ротируются каждые 10 секунд</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingBanner(null); }} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
          {showForm ? "Отмена" : <><Plus className="w-4 h-4" /> Добавить баннер</>}
        </Button>
      </div>

      {showForm && (
        <div className="p-6 border-b bg-card animate-in slide-in-from-top-4">
          <h3 className="font-bold uppercase text-xs text-primary tracking-wider mb-4">Новый баннер</h3>
          <BannerForm f={form} set={setForm} onSubmit={handleCreate} loading={submitting} btnLabel="Добавить" />
        </div>
      )}

      {editingBanner && (
        <div className="p-6 border-b bg-primary/5 border-primary/20 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <label className="font-bold uppercase text-xs text-primary tracking-wider">Редактирование баннера #{editingBanner.id}</label>
            <button type="button" onClick={() => setEditingBanner(null)} className="text-muted-foreground hover:text-foreground text-sm">Закрыть</button>
          </div>
          <BannerForm
            f={{ title: editingBanner.title, text: editingBanner.text, imageUrl: editingBanner.imageUrl, link: editingBanner.link, isEnabled: editingBanner.isEnabled, sortOrder: editingBanner.sortOrder }}
            set={(v) => setEditingBanner({ ...editingBanner, ...v })}
            onSubmit={handleSaveEdit}
            loading={saving}
            btnLabel="Сохранить"
          />
        </div>
      )}

      <div className="p-6">
        {!banners || banners.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl text-muted-foreground">
            <Image className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold uppercase tracking-wider">Нет баннеров</p>
            <p className="text-xs mt-1">Добавьте первый рекламный баннер</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {banners.map(b => (
              <div key={b.id} className={`flex gap-4 items-center rounded-xl border p-4 transition-all ${b.isEnabled ? 'bg-card' : 'bg-muted/30 opacity-60'}`}>
                <div className="w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center border">
                  {b.imageUrl ? <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} /> : <Image className="w-5 h-5 text-muted-foreground/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{b.title}</p>
                  {b.text && <p className="text-xs text-muted-foreground truncate">{b.text}</p>}
                  {b.link && <p className="text-xs text-primary truncate">{b.link}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${b.isEnabled ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>{b.isEnabled ? 'Активен' : 'Отключён'}</span>
                    <span className="text-[10px] text-muted-foreground">Порядок: {b.sortOrder}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => toggleEnabled(b.id, !b.isEnabled)} className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full" title={b.isEnabled ? "Отключить" : "Включить"}>
                    <span className="text-base">{b.isEnabled ? "⏸" : "▶"}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingBanner({ id: b.id, title: b.title, text: b.text ?? "", imageUrl: b.imageUrl ?? "", link: b.link ?? "", isEnabled: b.isEnabled ?? true, sortOrder: b.sortOrder ?? 0 })} className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

function ScheduleTab() {
  const { data: items, refetch } = useGetSchedule({ query: { queryKey: ["admin_schedule"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();

  const emptyForm = { dayOfWeek: 0, timeSlot: "", title: "", genre: "", date: "", isPremiere: false, isLiveShow: false };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<null | { id: number } & typeof emptyForm>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.timeSlot || !form.title) return;
    setSubmitting(true);
    try {
      await fetchWithToken("/api/schedule", {
        method: "POST",
        body: JSON.stringify({ ...form, genre: form.genre || undefined, date: form.date || undefined }),
      });
      toast({ title: "Программа добавлена" });
      setForm(emptyForm);
      setShowForm(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      await fetchWithToken(`/api/schedule/${editingItem.id}`, {
        method: "PUT",
        body: JSON.stringify({ dayOfWeek: editingItem.dayOfWeek, timeSlot: editingItem.timeSlot, title: editingItem.title, genre: editingItem.genre || undefined, date: editingItem.date || undefined, isPremiere: editingItem.isPremiere, isLiveShow: editingItem.isLiveShow }),
      });
      toast({ title: "Программа обновлена" });
      setEditingItem(null);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить программу?")) return;
    try {
      await fetchWithToken(`/api/schedule/${id}`, { method: "DELETE" });
      toast({ title: "Программа удалена" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const byDay = DAYS.map((name, idx) => ({
    name,
    items: (items ?? []).filter((i) => i.dayOfWeek === idx).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
  }));

  const ScheduleFormFields = ({ f, set }: { f: typeof emptyForm; set: (v: typeof emptyForm) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">День недели</label>
        <select value={f.dayOfWeek} onChange={(e) => set({ ...f, dayOfWeek: Number(e.target.value) })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Время начала</label>
        <Input type="time" value={f.timeSlot} onChange={(e) => set({ ...f, timeSlot: e.target.value })} required />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Название программы</label>
        <Input placeholder="Например: Утренние новости" value={f.title} onChange={(e) => set({ ...f, title: e.target.value })} required />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Жанр (необязательно)</label>
        <Input placeholder="Например: Информационная" value={f.genre} onChange={(e) => set({ ...f, genre: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Дата выхода (необязательно)</label>
        <Input placeholder="Например: 12 июля 2026" value={f.date} onChange={(e) => set({ ...f, date: e.target.value })} />
      </div>
      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={f.isPremiere} onChange={e => set({ ...f, isPremiere: e.target.checked })} className="w-4 h-4 accent-amber-500" />
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Премьера</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={f.isLiveShow} onChange={e => set({ ...f, isLiveShow: e.target.checked })} className="w-4 h-4 accent-red-500" />
          <Radio className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Прямой эфир</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b flex justify-between items-center bg-secondary/30">
        <h2 className="text-xl font-bold uppercase tracking-tight">Программа передач</h2>
        <Button onClick={() => { setShowForm(!showForm); setEditingItem(null); }} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
          {showForm ? "Отмена" : <><Plus className="w-4 h-4" /> Добавить программу</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 border-b bg-card flex flex-col gap-4 animate-in slide-in-from-top-4">
          <ScheduleFormFields f={form} set={setForm} />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting} className="uppercase font-bold tracking-wider">
              {submitting ? "Сохранение..." : "Добавить"}
            </Button>
          </div>
        </form>
      )}

      {editingItem && (
        <form onSubmit={handleSaveEdit} className="p-6 border-b bg-primary/5 border-primary/20 flex flex-col gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold uppercase text-xs text-primary tracking-wider">Редактирование программы #{editingItem.id}</label>
            <button type="button" onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground text-sm">Закрыть</button>
          </div>
          <ScheduleFormFields
            f={{ dayOfWeek: editingItem.dayOfWeek, timeSlot: editingItem.timeSlot, title: editingItem.title, genre: editingItem.genre, date: editingItem.date, isPremiere: editingItem.isPremiere, isLiveShow: editingItem.isLiveShow }}
            set={(v) => setEditingItem({ ...editingItem, ...v })}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="uppercase font-bold tracking-wider">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      )}

      <div className="p-6 grid gap-4 md:grid-cols-2">
        {byDay.map(({ name, items }) => (
          <div key={name} className="rounded-xl border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 bg-secondary/40 border-b">
              <h3 className="font-black text-xs uppercase tracking-widest">{name}</h3>
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4">Нет программ</p>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between px-4 py-3 group hover:bg-muted/30 transition-colors ${item.isPremiere ? 'bg-amber-50 dark:bg-amber-500/5' : item.isLiveShow ? 'bg-red-50 dark:bg-red-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary min-w-[40px]">{item.timeSlot}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold leading-tight">{item.title}</p>
                          {item.isPremiere && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          {item.isLiveShow && <Radio className="w-3 h-3 text-red-500" />}
                        </div>
                        {item.genre && <p className="text-xs text-muted-foreground">{item.genre}</p>}
                        {item.date && <p className="text-[10px] text-muted-foreground/70">{item.date}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem({ id: item.id, dayOfWeek: item.dayOfWeek, timeSlot: item.timeSlot, title: item.title, genre: item.genre ?? "", date: (item as any).date ?? "", isPremiere: item.isPremiere ?? false, isLiveShow: item.isLiveShow ?? false })} className="h-7 w-7 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-7 w-7 text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-full">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveTab() {
  const { data: live, refetch } = useGetLivestream({ query: { queryKey: ["livestream"] } });
  const { fetchWithToken, isLoading } = useAdminFetch();
  const { toast } = useToast();

  const [form, setForm] = useState({
    isLive: false,
    title: "",
    description: "",
    streamUrl: "",
    streamType: "youtube"
  });

  useEffect(() => {
    if (live) {
      setForm({
        isLive: live.isLive,
        title: live.title || "",
        description: live.description || "",
        streamUrl: live.streamUrl || "",
        streamType: live.streamType || "youtube"
      });
    }
  }, [live]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithToken('/api/livestream', {
        method: "PUT",
        body: JSON.stringify(form)
      });
      toast({ title: "Настройки эфира сохранены" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSave} className="p-6 md:p-8 flex flex-col gap-6 max-w-3xl">
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border ${form.isLive ? 'bg-red-500/5 border-red-500/20' : 'bg-secondary/50 border-border'}`}>
        <div>
          <h3 className="font-bold uppercase tracking-tight text-lg flex items-center gap-2">
            {form.isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            Статус трансляции
          </h3>
          <p className="text-sm text-muted-foreground font-light mt-1">Включение этого тумблера покажет плеер на сайте</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={form.isLive}
            onChange={e => setForm({...form, isLive: e.target.checked})}
          />
          <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
          <span className="ml-3 text-sm font-bold uppercase tracking-wider">{form.isLive ? 'Включен' : 'Выключен'}</span>
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок эфира</label>
          <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Например: Прямая линия с губернатором" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Платформа</label>
          <select 
            value={form.streamType} 
            onChange={e => setForm({...form, streamType: e.target.value})}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="youtube">YouTube</option>
            <option value="vk">ВКонтакте</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка или ID видео</label>
          <Input value={form.streamUrl} onChange={e => setForm({...form, streamUrl: e.target.value})} placeholder="https://..." />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Описание (под плеером)</label>
          <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} placeholder="Краткое описание того, что происходит в эфире" />
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end">
        <Button type="submit" disabled={isLoading} className="uppercase font-bold tracking-wider rounded-full px-8">
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

function TelegramTab() {
  const { data: status, refetch } = useGetTelegramStatus({ query: { queryKey: ["telegram_status"] } });
  const { fetchWithToken, isLoading } = useAdminFetch();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const res = await fetchWithToken<{synced: number, errors: number}>('/api/telegram/sync', {
        method: "POST",
        body: JSON.stringify({ adminToken: localStorage.getItem("ftctv_admin_token"), limit: 10 })
      });
      toast({ title: "Синхронизация завершена", description: `Загружено постов: ${res.synced}` });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8 max-w-2xl">
      <div className="bg-[#0088cc]/5 border border-[#0088cc]/20 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4 text-[#0088cc]">
          <MessageCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold uppercase tracking-tight">Интеграция с Telegram</h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-light">
          Система автоматически проверяет канал и загружает новые посты каждые 5 минут. 
          Вы также можете запустить синхронизацию вручную, если новость нужна на сайте прямо сейчас.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-background border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Загружено постов</p>
            <p className="text-3xl font-black text-foreground">{status?.totalPosts || 0}</p>
          </div>
          <div className="bg-background border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Последняя проверка</p>
            <p className="text-sm font-semibold mt-2 text-foreground">{status?.lastSync ? formatDate(status.lastSync) : 'Нет данных'}</p>
          </div>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={isLoading} 
          className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white uppercase font-bold tracking-wider py-6 rounded-xl shadow-md"
        >
          {isLoading ? "Загрузка..." : "Синхронизировать сейчас"}
        </Button>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: settings, refetch } = useGetSettings({ query: { queryKey: ["settings"] } });
  const { fetchWithToken, isLoading } = useAdminFetch();
  const { toast } = useToast();

  const [form, setForm] = useState({
    siteName: "",
    contactEmail: "",
    telegramChannel: "",
  });

  const [banner, setBanner] = useState({
    bannerEnabled: false,
    bannerTitle: "",
    bannerText: "",
    bannerImageUrl: "",
    bannerLink: "",
  });

  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || "",
        contactEmail: settings.contactEmail || "",
        telegramChannel: settings.telegramChannel || "",
      });
      setBanner({
        bannerEnabled: settings.bannerEnabled ?? false,
        bannerTitle: settings.bannerTitle || "",
        bannerText: settings.bannerText || "",
        bannerImageUrl: settings.bannerImageUrl || "",
        bannerLink: settings.bannerLink || "",
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithToken('/api/settings', {
        method: "PUT",
        body: JSON.stringify(form)
      });
      toast({ title: "Настройки сохранены" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      await fetchWithToken('/api/settings', {
        method: "PUT",
        body: JSON.stringify({
          ...banner,
          bannerTitle: banner.bannerTitle || null,
          bannerText: banner.bannerText || null,
          bannerImageUrl: banner.bannerImageUrl || null,
          bannerLink: banner.bannerLink || null,
        })
      });
      toast({ title: "Баннер сохранён" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className="flex flex-col divide-y">
      {/* Banner section */}
      <form onSubmit={handleSaveBanner} className="p-6 md:p-8 flex flex-col gap-6 max-w-2xl">
        <div>
          <h3 className="font-black text-base uppercase tracking-tight mb-1">Рекламный баннер</h3>
          <p className="text-xs text-muted-foreground">Показывается в самом верху главной страницы</p>
        </div>

        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border ${banner.bannerEnabled ? 'bg-primary/5 border-primary/20' : 'bg-secondary/50 border-border'}`}>
          <div>
            <p className="font-bold uppercase tracking-tight text-sm">Показать баннер</p>
            <p className="text-xs text-muted-foreground font-light mt-0.5">Включить отображение баннера на сайте</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={banner.bannerEnabled}
              onChange={e => setBanner({ ...banner, bannerEnabled: e.target.checked })}
            />
            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-bold uppercase tracking-wider">{banner.bannerEnabled ? 'Включен' : 'Выключен'}</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок баннера</label>
          <Input placeholder="Например: Реклама" value={banner.bannerTitle} onChange={e => setBanner({ ...banner, bannerTitle: e.target.value })} className="max-w-md" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Текст баннера</label>
          <Textarea placeholder="Описание рекламного предложения" rows={3} value={banner.bannerText} onChange={e => setBanner({ ...banner, bannerText: e.target.value })} className="max-w-md resize-none" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">URL картинки</label>
          <Input placeholder="https://..." value={banner.bannerImageUrl} onChange={e => setBanner({ ...banner, bannerImageUrl: e.target.value })} className="max-w-md" />
          {banner.bannerImageUrl && (
            <img src={banner.bannerImageUrl} alt="preview" className="mt-2 h-24 w-auto rounded-lg object-cover border border-border max-w-xs" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка при клике (необязательно)</label>
          <Input placeholder="https://..." value={banner.bannerLink} onChange={e => setBanner({ ...banner, bannerLink: e.target.value })} className="max-w-md" />
        </div>
        <div className="pt-2 flex justify-start">
          <Button type="submit" disabled={savingBanner} className="uppercase font-bold tracking-wider rounded-full px-8">
            {savingBanner ? "Сохранение..." : "Сохранить баннер"}
          </Button>
        </div>
      </form>

      {/* Site settings section */}
      <form onSubmit={handleSave} className="p-6 md:p-8 flex flex-col gap-6 max-w-2xl">
        <h3 className="font-black text-base uppercase tracking-tight">Настройки сайта</h3>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Название сайта</label>
          <Input value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="max-w-md" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Email редакции (для футера)</label>
          <Input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="max-w-md" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Telegram Канал (ID или ссылка)</label>
          <Input value={form.telegramChannel} onChange={e => setForm({...form, telegramChannel: e.target.value})} className="max-w-md" />
        </div>
        <div className="pt-4 border-t flex justify-start">
          <Button type="submit" disabled={isLoading} className="uppercase font-bold tracking-wider rounded-full px-8">
            {isLoading ? "Сохранение..." : "Сохранить настройки"}
          </Button>
        </div>
      </form>
    </div>
  );
}

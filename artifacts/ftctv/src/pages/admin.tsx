import { useState, useEffect, useRef, useCallback } from "react";
import { useAdminLogin, useGetPosts, useGetLivestream, useGetSettings, useGetTelegramStatus, useGetSchedule, useGetBanners, useGetMaintenanceStatus, useStartMaintenance, useStopMaintenance, useGetStories } from "@workspace/api-client-react";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings, Radio, MessageCircle, FileText, Lock, Calendar, Upload, Edit2, Star, Image, WrenchIcon, CircleDot, FolderOpen, Users, Film, ListVideo, ChevronUp, ChevronDown, X } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web/use-upload";
import logoPath from "/logo.png";
import RichTextEditor from "@/components/rich-text-editor";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("ftctv_admin_token") || "");
  const [password, setPassword] = useState("");
  
  const loginMutation = useAdminLogin();
  const { toast } = useToast();
  
  // Dashboard stats queries
  const { data: postsData } = useGetPosts({ page: 1, limit: 1 }, { query: { queryKey: ["admin_dashboard_posts"], enabled: !!token } });
  const { data: liveData } = useGetLivestream({ query: { queryKey: ["admin_dashboard_live"], enabled: !!token } });
  const { data: tgStatus } = useGetTelegramStatus({ query: { queryKey: ["admin_dashboard_tg"], enabled: !!token } });

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
            { id: "stories", label: "Истории", icon: CircleDot },
            { id: "schedule", label: "Программа передач", icon: Calendar },
            { id: "live", label: "Прямой эфир", icon: Radio },
            { id: "telegram", label: "Telegram", icon: MessageCircle },
            { id: "maintenance", label: "Профилактика", icon: WrenchIcon },
            { id: "settings", label: "Настройки", icon: Settings },
            { id: "gallery", label: "Галерея", icon: FolderOpen },
            { id: "articles", label: "Статьи", icon: FileText },
            { id: "users", label: "Пользователи", icon: Users },
            { id: "videos", label: "Видео", icon: Film }
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
          <TabsContent value="stories" className="m-0 p-0"><StoriesTab /></TabsContent>
          <TabsContent value="schedule" className="m-0 p-0"><ScheduleTab /></TabsContent>
          <TabsContent value="live" className="m-0 p-0"><LiveTab /></TabsContent>
          <TabsContent value="telegram" className="m-0 p-0"><TelegramTab /></TabsContent>
          <TabsContent value="maintenance" className="m-0 p-0"><MaintenanceTab /></TabsContent>
          <TabsContent value="settings" className="m-0 p-0"><SettingsTab /></TabsContent>
          <TabsContent value="gallery" className="m-0 p-0"><GalleryTab /></TabsContent>
          <TabsContent value="articles" className="m-0 p-0"><ArticlesTab /></TabsContent>
          <TabsContent value="users" className="m-0 p-0"><UsersTab /></TabsContent>
          <TabsContent value="videos" className="m-0 p-0"><VideosTab /></TabsContent>
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

  const { uploadFile, isUploading, progress } = useUpload({
    onError: (e) => toast({ title: "Ошибка загрузки", description: e.message, variant: "destructive" }),
  });

  const handleUploadCreate = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const res = await uploadFile(files[0]);
    if (res) setForm(prev => ({ ...prev, imageUrl: `/api/storage${res.objectPath}` }));
  };

  const handleUploadEdit = async (files: FileList | null) => {
    if (!files || !files[0]) return;
    const res = await uploadFile(files[0]);
    if (res) setEditingBanner(prev => prev ? { ...prev, imageUrl: `/api/storage${res.objectPath}` } : prev);
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
          <BannerForm f={form} set={setForm} onSubmit={handleCreate} loading={submitting} btnLabel="Добавить" onUpload={handleUploadCreate} isUploading={isUploading} progress={progress} />
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
            onUpload={handleUploadEdit}
            isUploading={isUploading}
            progress={progress}
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

// BannerForm — must be defined OUTSIDE BannersTab to avoid remount on every keystroke
type BannerFormData = { title: string; text: string; imageUrl: string; link: string; isEnabled: boolean; sortOrder: number };
function BannerForm({ f, set, onSubmit, loading, btnLabel, onUpload, isUploading, progress }: {
  f: BannerFormData;
  set: (v: BannerFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  btnLabel: string;
  onUpload: (files: FileList | null) => void;
  isUploading: boolean;
  progress: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок *</label>
          <Input placeholder="Заголовок баннера" value={f.title} onChange={e => set({ ...f, title: e.target.value })} required />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка (необязательно)</label>
          <Input placeholder="https://..." value={f.link} onChange={e => set({ ...f, link: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Текст (необязательно)</label>
          <Input placeholder="Краткое описание" value={f.text} onChange={e => set({ ...f, text: e.target.value })} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Фоновое изображение</label>
          {f.imageUrl ? (
            <div className="flex items-start gap-3">
              <img src={f.imageUrl} alt="preview" className="h-24 w-auto rounded-lg object-cover border border-border max-w-xs" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="flex flex-col gap-1.5">
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={isUploading} className="text-xs uppercase tracking-wider font-bold gap-1">
                  <Upload className="w-3.5 h-3.5" /> {isUploading ? `${progress}%` : "Заменить"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ ...f, imageUrl: "" })} className="text-xs uppercase tracking-wider font-bold gap-1 text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" /> Удалить
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={isUploading} className="w-fit text-xs uppercase tracking-wider font-bold gap-1">
              <Upload className="w-3.5 h-3.5" /> {isUploading ? `${progress}%` : "Загрузить изображение"}
            </Button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => onUpload(e.target.files)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Порядок сортировки</label>
          <Input type="number" value={f.sortOrder} onChange={e => set({ ...f, sortOrder: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-3 pt-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={f.isEnabled} onChange={e => set({ ...f, isEnabled: e.target.checked })} className="w-4 h-4 accent-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">Активен</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading || isUploading} className="uppercase font-bold tracking-wider text-xs rounded-full">
          {loading ? "Сохранение..." : btnLabel}
        </Button>
      </div>
    </form>
  );
}

const DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

interface ScheduleFormData {
  dayOfWeek: number; timeSlot: string; title: string; genre: string;
  date: string; imageUrl: string; isPremiere: boolean; isLiveShow: boolean;
}

function ScheduleFormFields({ f, set, fileRef, isUploading, progress, onUpload }: {
  f: ScheduleFormData; set: (v: ScheduleFormData) => void;
  fileRef: React.RefObject<HTMLInputElement | null>; isUploading: boolean; progress: number;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
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
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Картинка программы (необязательно)</label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        {f.imageUrl ? (
          <div className="flex items-center gap-3">
            <img src={f.imageUrl} alt="" className="w-20 h-14 object-cover rounded border" />
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>Заменить</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { set({ ...f, imageUrl: "" }); if (fileRef.current) fileRef.current.value = ""; }}>Удалить</Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="self-start gap-1">
            <Upload className="w-4 h-4" /> Загрузить изображение
          </Button>
        )}
        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
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
}

function ScheduleTab() {
  const { data: items, refetch } = useGetSchedule({ query: { queryKey: ["admin_schedule"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();

  const emptyForm: ScheduleFormData = { dayOfWeek: 0, timeSlot: "", title: "", genre: "", date: "", imageUrl: "", isPremiere: false, isLiveShow: false };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ScheduleFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<null | { id: number } & ScheduleFormData>(null);
  const [saving, setSaving] = useState(false);

  const createFileRef = useRef<HTMLInputElement>(null);
  const { uploadFile: createUpload, isUploading: createUploading, progress: createProgress } = useUpload();
  const handleCreateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await createUpload(file);
      if (!res) throw new Error("Загрузка не удалась");
      setForm(prev => ({ ...prev, imageUrl: `/api/storage${res.objectPath}` }));
      toast({ title: "Изображение загружено" });
    } catch (err: any) { toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" }); }
  };

  const editFileRef = useRef<HTMLInputElement>(null);
  const { uploadFile: editUpload, isUploading: editUploading, progress: editProgress } = useUpload();
  const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await editUpload(file);
      if (!res) throw new Error("Загрузка не удалась");
      setEditingItem(prev => prev ? { ...prev, imageUrl: `/api/storage${res.objectPath}` } : prev);
      toast({ title: "Изображение загружено" });
    } catch (err: any) { toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" }); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.timeSlot || !form.title) return;
    setSubmitting(true);
    try {
      await fetchWithToken("/api/schedule", {
        method: "POST",
        body: JSON.stringify({ ...form, genre: form.genre || undefined, date: form.date || undefined, imageUrl: form.imageUrl || undefined }),
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
        body: JSON.stringify({ dayOfWeek: editingItem.dayOfWeek, timeSlot: editingItem.timeSlot, title: editingItem.title, genre: editingItem.genre || undefined, date: editingItem.date || undefined, isPremiere: editingItem.isPremiere, isLiveShow: editingItem.isLiveShow, imageUrl: editingItem.imageUrl || undefined }),
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

  // Вычисляем дату каждого дня текущей недели (Пн–Вс)
  const weekDates = (() => {
    const today = new Date();
    const jsDay = today.getDay(); // 0=Вс, 1=Пн...
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return DAYS.map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
    });
  })();

  const byDay = DAYS.map((name, idx) => ({
    name,
    date: weekDates[idx],
    items: (items ?? []).filter((i) => i.dayOfWeek === idx).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)),
  }));

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
          <ScheduleFormFields f={form} set={setForm} fileRef={createFileRef} isUploading={createUploading} progress={createProgress} onUpload={handleCreateUpload} />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting || createUploading} className="uppercase font-bold tracking-wider">
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
            f={{ dayOfWeek: editingItem.dayOfWeek, timeSlot: editingItem.timeSlot, title: editingItem.title, genre: editingItem.genre, date: editingItem.date, imageUrl: editingItem.imageUrl, isPremiere: editingItem.isPremiere, isLiveShow: editingItem.isLiveShow }}
            set={(v) => setEditingItem({ ...editingItem, ...v })}
            fileRef={editFileRef} isUploading={editUploading} progress={editProgress} onUpload={handleEditUpload}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving || editUploading} className="uppercase font-bold tracking-wider">
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      )}

      <div className="p-6 grid gap-4 md:grid-cols-2">
        {byDay.map(({ name, date: dayDate, items }) => (
          <div key={name} className="rounded-xl border border-border bg-background overflow-hidden">
            <div className="px-4 py-3 bg-secondary/40 border-b flex items-baseline gap-2">
              <h3 className="font-black text-xs uppercase tracking-widest">{name}</h3>
              <span className="text-[10px] text-muted-foreground font-medium">— {dayDate}</span>
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
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem({ id: item.id, dayOfWeek: item.dayOfWeek, timeSlot: item.timeSlot, title: item.title, genre: item.genre ?? "", date: (item as any).date ?? "", imageUrl: (item as any).imageUrl ?? "", isPremiere: item.isPremiere ?? false, isLiveShow: item.isLiveShow ?? false })} className="h-7 w-7 text-primary/60 hover:text-primary hover:bg-primary/10 rounded-full">
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

  const settingsBannerFileRef = useRef<HTMLInputElement>(null);
  const { uploadFile: settingsBannerUpload, isUploading: settingsBannerUploading, progress: settingsBannerProgress } = useUpload();
  const handleSettingsBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await settingsBannerUpload(file);
      if (!res) throw new Error("Загрузка не удалась");
      setBanner(prev => ({ ...prev, bannerImageUrl: `/api/storage${res.objectPath}` }));
      toast({ title: "Изображение баннера загружено" });
    } catch (err: any) { toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" }); }
  };

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
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Картинка баннера</label>
          <input ref={settingsBannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleSettingsBannerUpload} />
          {banner.bannerImageUrl ? (
            <div className="flex items-center gap-3">
              <img src={banner.bannerImageUrl} alt="preview" className="h-24 w-auto rounded-lg object-cover border border-border max-w-xs" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="flex flex-col gap-1">
                <Button type="button" size="sm" variant="outline" onClick={() => settingsBannerFileRef.current?.click()}>Заменить</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setBanner({ ...banner, bannerImageUrl: "" }); if (settingsBannerFileRef.current) settingsBannerFileRef.current.value = ""; }}>Удалить</Button>
              </div>
            </div>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={() => settingsBannerFileRef.current?.click()} className="self-start gap-1 max-w-md">
              <Upload className="w-4 h-4" /> Загрузить изображение
            </Button>
          )}
          {settingsBannerUploading && (
            <div className="w-full max-w-md bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 transition-all" style={{ width: `${settingsBannerProgress}%` }} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка при клике (необязательно)</label>
          <Input placeholder="https://..." value={banner.bannerLink} onChange={e => setBanner({ ...banner, bannerLink: e.target.value })} className="max-w-md" />
        </div>
        <div className="pt-2 flex justify-start">
          <Button type="submit" disabled={savingBanner || settingsBannerUploading} className="uppercase font-bold tracking-wider rounded-full px-8">
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

function MaintenanceTab() {
  const { data: status, refetch } = useGetMaintenanceStatus({ query: { queryKey: ["maintenance_admin"] } });
  const startMutation = useStartMaintenance();
  const stopMutation = useStopMaintenance();
  const { toast } = useToast();

  const [endsAtDate, setEndsAtDate] = useState("");
  const [endsAtTime, setEndsAtTime] = useState("");
  const [message, setMessage] = useState("");

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endsAtDate || !endsAtTime) {
      toast({ title: "Укажите дату и время окончания", variant: "destructive" });
      return;
    }
    const endsAt = new Date(`${endsAtDate}T${endsAtTime}:00`).toISOString();
    try {
      await startMutation.mutateAsync({ data: { endsAt, message: message || null } });
      toast({ title: "Профилактика запущена" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const handleStop = async () => {
    if (!confirm("Завершить профилактику досрочно?")) return;
    try {
      await stopMutation.mutateAsync();
      toast({ title: "Профилактика завершена" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  const isActive = status?.isActive;

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b bg-secondary/30 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Режим профилактики</h2>
          <p className="text-xs text-muted-foreground mt-1">Ручное управление режимом технических работ. Плановое расписание: каждое 18-е число 00:00–06:00 UTC+10.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${isActive ? 'border-red-500/40 text-red-500 bg-red-500/10' : 'border-green-500/40 text-green-600 bg-green-500/10'}`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
          {isActive ? 'Активна' : 'Сайт работает'}
        </div>
      </div>

      {isActive && (
        <div className="p-6 border-b bg-red-500/5 border-red-500/20 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm text-red-600">Профилактика активна</p>
            {status?.endsAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Завершится: {new Date(status.endsAt).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
            {status?.message && <p className="text-xs text-muted-foreground mt-1 italic">"{status.message}"</p>}
          </div>
          <Button variant="outline" onClick={handleStop} disabled={stopMutation.isPending} className="border-red-500/40 text-red-600 hover:bg-red-500/10 uppercase font-bold text-xs tracking-wider rounded-full shrink-0">
            {stopMutation.isPending ? "..." : "Завершить сейчас"}
          </Button>
        </div>
      )}

      <form onSubmit={handleStart} className="p-6 md:p-8 flex flex-col gap-5 max-w-lg">
        <h3 className="font-black text-sm uppercase tracking-tight">Запустить профилактику вручную</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Дата окончания</label>
            <Input type="date" value={endsAtDate} onChange={e => setEndsAtDate(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Время окончания</label>
            <Input type="time" value={endsAtTime} onChange={e => setEndsAtTime(e.target.value)} required />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Сообщение (необязательно)</label>
          <Input
            placeholder="Например: Плановое обновление системы"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={startMutation.isPending || isActive} className="uppercase font-bold tracking-wider rounded-full px-8 bg-amber-500 hover:bg-amber-600 text-white border-none">
            {startMutation.isPending ? "Запуск..." : isActive ? "Уже активна" : "Запустить профилактику"}
          </Button>
          {isActive && <p className="text-xs text-muted-foreground mt-2">Сначала завершите текущую профилактику</p>}
        </div>
      </form>
    </div>
  );
}

function StoriesTab() {
  const { data: stories, refetch, isLoading, isError, error } = useGetStories({ query: { queryKey: ["admin_stories"], retry: false } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useUpload({
    onError: (e) => toast({ title: "Ошибка загрузки", description: e.message, variant: "destructive" }),
  });

  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await uploadFile(file);
    if (res) {
      setImageUrl(`/api/storage${res.objectPath}`);
      toast({ title: "Изображение загружено" });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { toast({ title: "Добавьте изображение", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await fetchWithToken("/api/stories", { method: "POST", body: JSON.stringify({ imageUrl, title: title || null, link: link || null }) });
      toast({ title: "История добавлена" });
      setImageUrl(""); setTitle(""); setLink(""); setShowForm(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить историю?")) return;
    try {
      await fetchWithToken(`/api/stories/${id}`, { method: "DELETE" });
      toast({ title: "История удалена" });
      refetch();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Загрузка историй...</div>;
  if (isError) return <div className="p-8 text-center text-destructive">Ошибка загрузки историй: {error?.message ?? "Неизвестная ошибка"}</div>;

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b bg-secondary/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Истории</h2>
          <p className="text-xs text-muted-foreground mt-1">Круглые истории над лентой новостей (как в VK / Instagram)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
          {showForm ? "Отмена" : <><Plus className="w-4 h-4" /> Добавить историю</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 border-b bg-card flex flex-col gap-4 max-w-md animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Изображение *</label>
            {imageUrl ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/40">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white text-xs">✕</button>
              </div>
            ) : (
              <label className="flex items-center gap-3 cursor-pointer bg-muted/50 hover:bg-muted border border-dashed border-border rounded-xl px-4 py-3 w-fit transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{isUploading ? "Загрузка..." : "Загрузить фото"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
              </label>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок (необязательно)</label>
            <Input placeholder="Например: Новости" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка (необязательно)</label>
            <Input placeholder="https://..." value={link} onChange={e => setLink(e.target.value)} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={submitting || isUploading} className="uppercase font-bold tracking-wider">
              {submitting ? "Сохранение..." : "Добавить"}
            </Button>
          </div>
        </form>
      )}

      <div className="p-6">
        {!stories || stories.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">Нет историй. Добавьте первую!</p>
        ) : (
          <div className="flex flex-wrap gap-5">
            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center gap-2 group relative">
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary via-pink-500 to-amber-400">
                  <div className="p-[2px] rounded-full bg-card">
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img src={story.imageUrl} alt={story.title ?? ""} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground max-w-[64px] truncate text-center">{story.title ?? "История"}</span>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity shadow-md"
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryTab() {
  const { fetchWithToken, isLoading: fetchLoading } = useAdminFetch();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [folderPhotos, setFolderPhotos] = useState<any[]>([]);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [folderForm, setFolderForm] = useState({ name: "", coverUrl: "" });
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [photoForm, setPhotoForm] = useState({ imageUrl: "", caption: "", sortOrder: 0 });
  const [editingPhoto, setEditingPhoto] = useState<any>(null);

  const { toast } = useToast();

  // Folder cover upload
  const folderCoverRef = useRef<HTMLInputElement>(null);
  const { uploadFile: folderCoverUpload, isUploading: folderCoverUploading, progress: folderCoverProgress } = useUpload();
  const handleFolderCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await folderCoverUpload(file);
      if (!res) throw new Error("Не удалось загрузить файл");
      setFolderForm(prev => ({ ...prev, coverUrl: `/api/storage${res.objectPath}` }));
      toast({ title: "Обложка загружена" });
    } catch (err: any) { toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" }); }
  };

  // Photo upload
  const photoFileRef = useRef<HTMLInputElement>(null);
  const { uploadFile: photoUpload, isUploading: photoUploading, progress: photoProgress } = useUpload();
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const res = await photoUpload(file);
      if (!res) throw new Error("Не удалось загрузить файл");
      setPhotoForm(prev => ({ ...prev, imageUrl: `/api/storage${res.objectPath}` }));
      toast({ title: "Фото загружено" });
    } catch (err: any) { toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" }); }
  };

  const loadFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery/folders");
      const data = await res.json();
      setFolders(data);
    } catch {} finally { setLoading(false); }
  }, []);

  const loadFolder = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/gallery/folders/${id}`);
      const data = await res.json();
      setSelectedFolder(data);
      setFolderPhotos(data.photos || []);
    } catch {}
  }, []);

  useEffect(() => { loadFolders(); }, [loadFolders]);

  const saveFolder = async () => {
    try {
      if (editingFolder) {
        await fetchWithToken(`/api/gallery/folders/${editingFolder.id}`, { method: "PUT", body: JSON.stringify({ name: folderForm.name, coverUrl: folderForm.coverUrl || null }) });
      } else {
        await fetchWithToken("/api/gallery/folders", { method: "POST", body: JSON.stringify({ name: folderForm.name, coverUrl: folderForm.coverUrl || null }) });
      }
      setShowFolderForm(false); setEditingFolder(null); setFolderForm({ name: "", coverUrl: "" }); if (folderCoverRef.current) folderCoverRef.current.value = "";
      loadFolders();
      if (selectedFolder) loadFolder(selectedFolder.id);
    } catch {}
  };

  const deleteFolder = async (id: number) => {
    if (!confirm("Удалить папку и все её фото?")) return;
    try {
      await fetchWithToken(`/api/gallery/folders/${id}`, { method: "DELETE" });
      if (selectedFolder?.id === id) { setSelectedFolder(null); setFolderPhotos([]); }
      loadFolders();
    } catch {}
  };

  const savePhoto = async () => {
    if (!selectedFolder) return;
    try {
      if (editingPhoto) {
        await fetchWithToken(`/api/gallery/photos/${editingPhoto.id}`, { method: "PUT", body: JSON.stringify({ imageUrl: photoForm.imageUrl, caption: photoForm.caption || null, sortOrder: photoForm.sortOrder }) });
      } else {
        await fetchWithToken("/api/gallery/photos", { method: "POST", body: JSON.stringify({ folderId: selectedFolder.id, imageUrl: photoForm.imageUrl, caption: photoForm.caption || null, sortOrder: photoForm.sortOrder }) });
      }
      setShowPhotoForm(false); setEditingPhoto(null); setPhotoForm({ imageUrl: "", caption: "", sortOrder: 0 }); if (photoFileRef.current) photoFileRef.current.value = "";
      loadFolder(selectedFolder.id);
    } catch {}
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Удалить фото?")) return;
    try {
      // Check if deleting the cover photo
      const photo = folderPhotos.find((p: any) => p.id === id);
      await fetchWithToken(`/api/gallery/photos/${id}`, { method: "DELETE" });
      // If deleted photo was the folder cover, clear coverUrl
      if (selectedFolder && photo && selectedFolder.coverUrl === photo.imageUrl) {
        await fetchWithToken(`/api/gallery/folders/${selectedFolder.id}`, { method: "PUT", body: JSON.stringify({ name: selectedFolder.name, coverUrl: null }) });
        loadFolders();
      }
      if (selectedFolder) loadFolder(selectedFolder.id);
    } catch {}
  };

  const setCoverPhoto = async (photo: any) => {
    if (!selectedFolder) return;
    try {
      await fetchWithToken(`/api/gallery/folders/${selectedFolder.id}`, { method: "PUT", body: JSON.stringify({ name: selectedFolder.name, coverUrl: photo.imageUrl }) });
      toast({ title: "Обложка обновлена" });
      loadFolders();
      loadFolder(selectedFolder.id);
    } catch { toast({ title: "Ошибка", variant: "destructive" }); }
  };

  if (loading) return <div className="p-6 text-center text-gray-400">Загрузка…</div>;

  // Folder detail view
  if (selectedFolder) return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { setSelectedFolder(null); setFolderPhotos([]); }} className="text-sm px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white">← Назад</button>
        <h3 className="text-lg font-bold text-white flex-1">{selectedFolder.name}</h3>
        <button onClick={() => { setPhotoForm({ imageUrl: "", caption: "", sortOrder: folderPhotos.length }); setEditingPhoto(null); setShowPhotoForm(true); if (photoFileRef.current) photoFileRef.current.value = ""; }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-[#8953F2] hover:bg-[#7a45e0] text-white"><Plus className="w-4 h-4" /> Добавить фото</button>
      </div>

      {showPhotoForm && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-700">
          <h4 className="font-semibold text-white text-sm">{editingPhoto ? "Редактировать" : "Новое фото"}</h4>
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Изображение *</label>
            <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            {photoForm.imageUrl ? (
              <div className="flex items-center gap-3">
                <img src={photoForm.imageUrl} alt="" className="w-20 h-20 object-cover rounded border" />
                <Button type="button" size="sm" variant="outline" onClick={() => photoFileRef.current?.click()}>Заменить</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setPhotoForm({...photoForm, imageUrl: ""}); if (photoFileRef.current) photoFileRef.current.value = ""; }}>Удалить</Button>
              </div>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => photoFileRef.current?.click()} className="self-start gap-1">
                <Upload className="w-4 h-4" /> Загрузить изображение
              </Button>
            )}
            {photoUploading && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 transition-all" style={{ width: `${photoProgress}%` }} />
              </div>
            )}
          </div>
          <Input placeholder="Подпись (необязательно)" value={photoForm.caption} onChange={e => setPhotoForm({...photoForm, caption: e.target.value})} />
          <Input type="number" placeholder="Порядок" value={photoForm.sortOrder} onChange={e => setPhotoForm({...photoForm, sortOrder: Number(e.target.value)})} />
          <div className="flex gap-2">
            <button onClick={savePhoto} disabled={!photoForm.imageUrl || fetchLoading || photoUploading} className="px-4 py-2 rounded bg-[#98FF98] text-[#282524] text-sm font-semibold hover:bg-[#7de67d] disabled:opacity-50">{editingPhoto ? "Сохранить" : "Добавить"}</button>
            <button onClick={() => { setShowPhotoForm(false); setEditingPhoto(null); }} className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-600">Отмена</button>
          </div>
        </div>
      )}

      {folderPhotos.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Нет фото в этой папке</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {folderPhotos.map((p: any) => (
            <div key={p.id} className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <img src={p.imageUrl} alt={p.caption || ""} className="w-full aspect-square object-cover" onError={(e: any) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-size='14'%3EОшибка%3C/text%3E%3C/svg%3E"; }} />
              {p.caption && <p className="text-xs text-gray-300 px-2 py-1 truncate">{p.caption}</p>}
              {selectedFolder.coverUrl === p.imageUrl && <div className="absolute top-1 left-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">Обложка</div>}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setCoverPhoto(p)} className={`p-1 rounded text-white ${selectedFolder.coverUrl === p.imageUrl ? "bg-yellow-500/80 hover:bg-yellow-500" : "bg-black/60 hover:bg-black/80"}`} title="Сделать обложкой"><Star className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setPhotoForm({ imageUrl: p.imageUrl, caption: p.caption || "", sortOrder: p.sortOrder || 0 }); setEditingPhoto(p); setShowPhotoForm(true); if (photoFileRef.current) photoFileRef.current.value = ""; }} className="p-1 rounded bg-black/60 text-white hover:bg-black/80"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => deletePhoto(p.id)} className="p-1 rounded bg-red-600/80 text-white hover:bg-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Folders list view
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Папки галереи</h3>
        <button onClick={() => { setFolderForm({ name: "", coverUrl: "" }); setEditingFolder(null); setShowFolderForm(true); if (folderCoverRef.current) folderCoverRef.current.value = ""; }} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded bg-[#8953F2] hover:bg-[#7a45e0] text-white"><Plus className="w-4 h-4" /> Новая папка</button>
      </div>

      {showFolderForm && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-700">
          <h4 className="font-semibold text-white text-sm">{editingFolder ? "Редактировать папку" : "Новая папка"}</h4>
          <Input placeholder="Название папки *" value={folderForm.name} onChange={e => setFolderForm({...folderForm, name: e.target.value})} required />
          <div className="flex flex-col gap-2">
            <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Обложка (необязательно)</label>
            <input ref={folderCoverRef} type="file" accept="image/*" className="hidden" onChange={handleFolderCoverUpload} />
            {folderForm.coverUrl ? (
              <div className="flex items-center gap-3">
                <img src={folderForm.coverUrl} alt="" className="w-20 h-14 object-cover rounded border" />
                <Button type="button" size="sm" variant="outline" onClick={() => folderCoverRef.current?.click()}>Заменить</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => { setFolderForm({...folderForm, coverUrl: ""}); if (folderCoverRef.current) folderCoverRef.current.value = ""; }}>Удалить</Button>
              </div>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => folderCoverRef.current?.click()} className="self-start gap-1">
                <Upload className="w-4 h-4" /> Загрузить обложку
              </Button>
            )}
            {folderCoverUploading && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 transition-all" style={{ width: `${folderCoverProgress}%` }} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={saveFolder} disabled={!folderForm.name || fetchLoading || folderCoverUploading} className="px-4 py-2 rounded bg-[#98FF98] text-[#282524] text-sm font-semibold hover:bg-[#7de67d] disabled:opacity-50">{editingFolder ? "Сохранить" : "Создать"}</button>
            <button onClick={() => { setShowFolderForm(false); setEditingFolder(null); }} className="px-4 py-2 rounded bg-gray-700 text-white text-sm hover:bg-gray-600">Отмена</button>
          </div>
        </div>
      )}

      {folders.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Нет папок. Создайте первую!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {folders.map((f: any) => (
            <div key={f.id} className="group bg-gray-800 rounded-lg overflow-hidden border border-gray-700 cursor-pointer hover:border-[#8953F2] transition-colors" onClick={() => loadFolder(f.id)}>
              <div className="aspect-video bg-gray-900 relative">
                {f.coverUrl ? (
                  <img src={f.coverUrl} alt={f.name} className="w-full h-full object-cover" onError={(e: any) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FolderOpen className="w-10 h-10 text-gray-600" /></div>
                )}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setFolderForm({ name: f.name, coverUrl: f.coverUrl || "" }); setEditingFolder(f); setShowFolderForm(true); if (folderCoverRef.current) folderCoverRef.current.value = ""; }} className="p-1 rounded bg-black/60 text-white hover:bg-black/80"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteFolder(f.id)} className="p-1 rounded bg-red-600/80 text-white hover:bg-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-2"><p className="text-sm font-medium text-white truncate">{f.name}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticlesTab() {
  const { fetchWithToken, isLoading: fetchLoading } = useAdminFetch();
  const { toast } = useToast();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: "", authorName: "", content: "", published: true, mediaUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const { uploadFile: articleUpload, isUploading: articleUploading, progress: articleProgress } = useUpload();
  const handleArticleUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    const res = await articleUpload(file);
    if (res) {
      const isVideo = file.type.startsWith("video/");
      const url = `/api/storage${res.objectPath}${isVideo ? "?type=video" : ""}`;
      setForm(prev => ({ ...prev, mediaUrl: url }));
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await fetchWithToken<{ articles: any[] }>("/api/articles");
      setArticles(data.articles || []);
    } catch {
      toast({ title: "Ошибка загрузки статей", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (article: any) => {
    setEditing(article);
    setForm({
      title: article.title || "",
      authorName: article.authorName || "",
      content: article.content || "",
      published: article.published ?? true,
      mediaUrl: article.mediaUrl || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Заполните заголовок и содержание", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fetchWithToken(`/api/articles/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast({ title: "Статья обновлена" });
      } else {
        await fetchWithToken("/api/articles", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast({ title: "Статья опубликована" });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await loadArticles();
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить статью? Это действие необратимо.")) return;
    try {
      await fetchWithToken(`/api/articles/${id}`, { method: "DELETE" });
      toast({ title: "Статья удалена" });
      await loadArticles();
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  if (showForm) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {editing ? "Редактировать статью" : "Новая статья"}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditing(null); }}>
            Отмена
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Заголовок</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Заголовок статьи"
              className="text-lg font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Автор</label>
            <Input
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              placeholder="Имя автора"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Обложка / Медиа</label>
            {form.mediaUrl ? (
              <div className="flex items-center gap-3">
                {(/\.(mp4|webm)/i.test(form.mediaUrl) || /type=video/i.test(form.mediaUrl)) ? (
                  <video src={form.mediaUrl} className="h-24 w-auto rounded-lg border border-border max-w-xs" muted controls />
                ) : (
                  <img src={form.mediaUrl} alt="preview" className="h-24 w-auto rounded-lg object-cover border border-border max-w-xs" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div className="flex flex-col gap-1">
                  <label className="cursor-pointer">
                    <span className="text-xs text-primary hover:underline font-semibold">Заменить</span>
                    <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleArticleUpload(e.target.files)} disabled={articleUploading} />
                  </label>
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, mediaUrl: "" }))} className="text-xs text-destructive hover:underline font-semibold text-left">Удалить</button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-3 cursor-pointer border border-dashed border-border rounded-lg p-4 hover:bg-accent/30 transition-colors">
                <Image className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{articleUploading ? `Загрузка... ${articleProgress}%` : "Нажмите, чтобы загрузить изображение или видео"}</span>
                <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={e => handleArticleUpload(e.target.files)} disabled={articleUploading} />
              </label>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Содержание</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Напишите статью..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="px-8">
            {saving ? "Сохранение..." : editing ? "Сохранить изменения" : "Опубликовать статью"}
          </Button>
          <p className="text-xs text-muted-foreground">Статья будет опубликована сразу после сохранения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tight">Статьи</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Новая статья
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Статей пока нет</p>
          <p className="text-sm mt-1">Создайте первую статью</p>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-accent/30 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-bold text-sm truncate">{article.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{article.authorName}</span>
                  <span>{formatDate(article.createdAt)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${article.published ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                    {article.published ? "Опубликовано" : "Черновик"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(article)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { toast } = useToast();
  const token = localStorage.getItem("ftctv_admin_token") || "";

  const ROLES = [
    { value: "user", label: "Пользователь" },
    { value: "moderator", label: "Модератор" },
    { value: "editor", label: "Редактор" },
    { value: "administrator", label: "Администратор" },
    { value: "owner", label: "Владелец" },
  ];

  const ROLE_COLORS: Record<string, string> = {
    user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    moderator: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    editor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    administrator: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    owner: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить пользователей", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Ошибка обновления");
      toast({ title: "Роль обновлена", description: `Роль пользователя успешно изменена на "${ROLES.find(r => r.value === newRole)?.label}"` });
      fetchUsers();
    } catch {
      toast({ title: "Ошибка", description: "Не удалось обновить роль", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatUserDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black tracking-tight">Пользователи</h2>
          <p className="text-sm text-muted-foreground mt-1">Зарегистрированных: {users.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">ID</th>
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">Пользователь</th>
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">Email</th>
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">Роль</th>
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">Дата регистрации</th>
              <th className="text-left p-3 font-bold uppercase text-xs tracking-wider text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-mono text-xs text-muted-foreground">{user.id}</td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(user.displayName || user.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{user.email || "—"}</td>
                <td className="p-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[user.role || "user"] || ROLE_COLORS.user}`}>
                    {ROLES.find(r => r.value === (user.role || "user"))?.label || user.role}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">{user.createdAt ? formatUserDate(user.createdAt) : "—"}</td>
                <td className="p-3">
                  <select
                    value={user.role || "user"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                    className="text-xs border rounded-lg px-2 py-1.5 bg-background cursor-pointer focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===================== VIDEOS TAB =====================
function VideosTab() {
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "", thumbnailUrl: "", duration: "" });
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  // Playlist state
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
  const [playlistForm, setPlaylistForm] = useState({ name: "", description: "" });
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      if (res.ok) setVideos(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchVideos(); }, []);
  // === Playlist Functions ===
  const fetchPlaylists = async () => {
    try {
      const res = await fetch("/api/video-playlists");
      if (res.ok) setPlaylists(await res.json());
    } catch {}
  };

  const fetchPlaylistDetails = async (id: number) => {
    try {
      const res = await fetch(`/api/video-playlists/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPlaylist(data);
      }
    } catch (err: any) {
      toast({ title: "Ошибка загрузки плейлиста", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistForm.name.trim()) { toast({ title: "Введите название плейлиста", variant: "destructive" }); return; }
    try {
      await fetchWithToken("/api/video-playlists", { method: "POST", body: JSON.stringify(playlistForm) });
      toast({ title: "Плейлист создан" });
      setPlaylistForm({ name: "", description: "" });
      setShowPlaylistForm(false);
      fetchPlaylists();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist) return;
    try {
      await fetchWithToken(`/api/video-playlists/${editingPlaylist.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editingPlaylist.name, description: editingPlaylist.description })
      });
      toast({ title: "Плейлист обновлён" });
      setEditingPlaylist(null);
      fetchPlaylists();
      if (selectedPlaylist?.id === editingPlaylist.id) fetchPlaylistDetails(editingPlaylist.id);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (!confirm("Удалить плейлист? Видео из него не будут удалены.")) return;
    try {
      await fetchWithToken(`/api/video-playlists/${id}`, { method: "DELETE" });
      toast({ title: "Плейлист удалён" });
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
      fetchPlaylists();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleAddVideoToPlaylist = async (videoId: number) => {
    if (!selectedPlaylist) return;
    const maxSort = selectedPlaylist.videos?.length ? Math.max(...selectedPlaylist.videos.map((v: any) => v.sortOrder ?? 0)) + 1 : 0;
    try {
      await fetchWithToken("/api/video-playlist-items", {
        method: "POST",
        body: JSON.stringify({ playlistId: selectedPlaylist.id, videoId, sortOrder: maxSort })
      });
      toast({ title: "Видео добавлено в плейлист" });
      setShowAddVideo(false);
      fetchPlaylistDetails(selectedPlaylist.id);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!selectedPlaylist) return;
    try {
      await fetchWithToken(`/api/video-playlist-items/${itemId}`, { method: "DELETE" });
      toast({ title: "Видео удалено из плейлиста" });
      fetchPlaylistDetails(selectedPlaylist.id);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const handleMoveItem = async (index: number, direction: "up" | "down") => {
    if (!selectedPlaylist?.videos) return;
    const items = [...selectedPlaylist.videos];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    const newItemIds = items.map((it: any) => it.id);
    // Optimistic UI update
    setSelectedPlaylist({ ...selectedPlaylist, videos: items });
    try {
      await fetchWithToken(`/api/video-playlists/${selectedPlaylist.id}/reorder`, {
        method: "PUT",
        body: JSON.stringify({ itemIds: newItemIds })
      });
    } catch (err: any) {
      toast({ title: "Ошибка сортировки", description: err.message, variant: "destructive" });
      fetchPlaylistDetails(selectedPlaylist.id);
    }
  };


  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "create" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["video/mp4", "video/webm"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Ошибка", description: "Поддерживаются только MP4 и WebM", variant: "destructive" });
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      toast({ title: "Ошибка", description: "Максимальный размер — 500 МБ", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const xhr = new XMLHttpRequest();
      const url = await new Promise<string>((resolve, reject) => {
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 90) + 5); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.url);
          } else { reject(new Error("Ошибка загрузки")); }
        };
        xhr.onerror = () => reject(new Error("Сетевая ошибка"));
        xhr.open("POST", "/api/upload");
        xhr.send(fd);
      });
      setUploadProgress(100);
      if (target === "create") setForm(f => ({ ...f, videoUrl: url }));
      else if (editingVideo) setEditingVideo((v: any) => ({ ...v, videoUrl: url }));
      toast({ title: "Видео загружено" });
    } catch (err: any) {
      toast({ title: "Ошибка загрузки", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "create" | "edit") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Ошибка загрузки обложки");
      const data = await res.json();
      if (target === "create") setForm(f => ({ ...f, thumbnailUrl: data.url }));
      else if (editingVideo) setEditingVideo((v: any) => ({ ...v, thumbnailUrl: data.url }));
      toast({ title: "Обложка загружена" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) { toast({ title: "Заполните название и загрузите видео", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await fetchWithToken("/api/videos", { method: "POST", body: JSON.stringify(form) });
      toast({ title: "Видео опубликовано" });
      setForm({ title: "", description: "", videoUrl: "", thumbnailUrl: "", duration: "" });
      setShowForm(false);
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setSubmitting(true);
    try {
      await fetchWithToken(`/api/videos/${editingVideo.id}`, {
        method: "PUT",
        body: JSON.stringify({ title: editingVideo.title, description: editingVideo.description, videoUrl: editingVideo.videoUrl, thumbnailUrl: editingVideo.thumbnailUrl, duration: editingVideo.duration })
      });
      toast({ title: "Видео обновлено" });
      setEditingVideo(null);
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить видео? Это действие необратимо.")) return;
    try {
      await fetchWithToken(`/api/videos/${id}`, { method: "DELETE" });
      toast({ title: "Видео удалено" });
      fetchVideos();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " КБ";
    return (bytes / 1024 / 1024).toFixed(1) + " МБ";
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Загрузка видео...</div>;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-secondary/30 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight">Видео</h2>
          <p className="text-xs text-muted-foreground mt-1">Загрузка и управление видеоматериалами</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingVideo(null); }} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
          <Plus className="w-3.5 h-3.5" /> Добавить видео
        </Button>
      </div>

      {/* Upload instructions */}
      <div className="mx-6 mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-muted-foreground space-y-1">
        <p className="font-bold text-foreground text-sm mb-1">📹 Порядок загрузки видео:</p>
        <p>1. Нажмите «Добавить видео» → откроется форма создания.</p>
        <p>2. Введите название, описание и длительность видео.</p>
        <p>3. Нажмите «Выбрать видеофайл» и выберите MP4 или WebM (до 500 МБ).</p>
        <p>4. Дождитесь завершения загрузки — индикатор покажет прогресс.</p>
        <p>5. (Опционально) Загрузите обложку — изображение для превью.</p>
        <p>6. Нажмите «Опубликовать» — видео появится на публичной странице /videos.</p>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-6 border-b space-y-4 bg-card">
          <h3 className="text-sm font-bold uppercase tracking-wider">Новое видео</h3>
          <Input placeholder="Название видео *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <Textarea placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="resize-y text-sm" />
          <Input placeholder="Длительность (напр. 12:34)" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />

          {/* Video file upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Видеофайл (MP4/WebM, до 500 МБ) *</label>
            <input type="file" accept="video/mp4,video/webm" onChange={e => handleVideoUpload(e, "create")} disabled={isUploading} className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:uppercase file:tracking-wider" />
            {isUploading && uploadProgress > 0 && (
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {form.videoUrl && <p className="text-xs text-green-500 font-semibold">✓ Видео загружено: {form.videoUrl}</p>}
          </div>

          {/* Thumbnail upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Обложка (необязательно)</label>
            <input type="file" accept="image/*" onChange={e => handleThumbnailUpload(e, "create")} disabled={isUploading} className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 file:cursor-pointer file:uppercase file:tracking-wider" />
            {form.thumbnailUrl && (
              <div className="flex items-center gap-2">
                <img src={form.thumbnailUrl} alt="Превью" className="w-20 h-14 rounded object-cover border" />
                <p className="text-xs text-green-500 font-semibold">✓ Обложка загружена</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting || isUploading || !form.videoUrl} className="uppercase font-bold tracking-wider text-xs rounded-full">
              {submitting ? "Публикация..." : "Опубликовать"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setForm({ title: "", description: "", videoUrl: "", thumbnailUrl: "", duration: "" }); }} className="text-xs">
              Отмена
            </Button>
          </div>
        </form>
      )}

      {/* Edit form */}
      {editingVideo && (
        <form onSubmit={handleUpdate} className="p-6 border-b space-y-4 bg-amber-500/5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">Редактирование видео #{editingVideo.id}</h3>
          <Input placeholder="Название *" value={editingVideo.title} onChange={e => setEditingVideo({...editingVideo, title: e.target.value})} required />
          <Textarea placeholder="Описание" value={editingVideo.description || ""} onChange={e => setEditingVideo({...editingVideo, description: e.target.value})} rows={3} className="resize-y text-sm" />
          <Input placeholder="Длительность" value={editingVideo.duration || ""} onChange={e => setEditingVideo({...editingVideo, duration: e.target.value})} />

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Заменить видеофайл</label>
            <input type="file" accept="video/mp4,video/webm" onChange={e => handleVideoUpload(e, "edit")} disabled={isUploading} className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:uppercase file:tracking-wider" />
            {isUploading && uploadProgress > 0 && (
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {editingVideo.videoUrl && <p className="text-xs text-green-500 font-semibold">✓ {editingVideo.videoUrl}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Заменить обложку</label>
            <input type="file" accept="image/*" onChange={e => handleThumbnailUpload(e, "edit")} disabled={isUploading} className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 file:cursor-pointer file:uppercase file:tracking-wider" />
            {editingVideo.thumbnailUrl && (
              <div className="flex items-center gap-2">
                <img src={editingVideo.thumbnailUrl} alt="Превью" className="w-20 h-14 rounded object-cover border" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting || isUploading} className="uppercase font-bold tracking-wider text-xs rounded-full bg-amber-500 hover:bg-amber-600">
              {submitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditingVideo(null)} className="text-xs">Отмена</Button>
          </div>
        </form>
      )}

      {/* Videos list */}
      {videos.length === 0 ? (
        <div className="p-12 text-center">
          <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Видео пока нет. Нажмите «Добавить видео» для загрузки.</p>
        </div>
      ) : (
        <div className="divide-y">
          {videos.map(v => (
            <div key={v.id} className="p-4 flex gap-4 items-start hover:bg-secondary/20 transition-colors">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title} className="w-28 h-20 rounded-lg object-cover border shrink-0" />
              ) : (
                <div className="w-28 h-20 rounded-lg bg-secondary/50 border flex items-center justify-center shrink-0">
                  <Film className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{v.title}</h3>
                {v.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{v.description}</p>}
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  {v.duration && <span>⏱ {v.duration}</span>}
                  {v.createdAt && <span>{new Date(v.createdAt).toLocaleDateString("ru-RU")}</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => { setEditingVideo(v); setShowForm(false); }} className="h-8 w-8 p-0">
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======== PLAYLISTS SECTION ======== */}
      <div className="border-t mt-2">
        <div className="p-6 border-b bg-secondary/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ListVideo className="w-5 h-5" /> Плейлисты
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Группировка и порядок воспроизведения видео</p>
          </div>
          <Button onClick={() => { setShowPlaylistForm(!showPlaylistForm); setEditingPlaylist(null); }} className="uppercase font-bold tracking-wider text-xs rounded-full gap-1">
            <Plus className="w-3.5 h-3.5" /> Новый плейлист
          </Button>
        </div>

        {/* Create playlist form */}
        {showPlaylistForm && (
          <form onSubmit={handleCreatePlaylist} className="p-6 border-b space-y-4 bg-card">
            <h3 className="text-sm font-bold uppercase tracking-wider">Новый плейлист</h3>
            <Input placeholder="Название плейлиста *" value={playlistForm.name} onChange={e => setPlaylistForm({...playlistForm, name: e.target.value})} required />
            <Textarea placeholder="Описание (необязательно)" value={playlistForm.description} onChange={e => setPlaylistForm({...playlistForm, description: e.target.value})} rows={2} className="resize-y text-sm" />
            <div className="flex gap-3">
              <Button type="submit" className="uppercase font-bold tracking-wider text-xs rounded-full">Создать</Button>
              <Button type="button" variant="ghost" onClick={() => setShowPlaylistForm(false)} className="text-xs">Отмена</Button>
            </div>
          </form>
        )}

        {/* Edit playlist form */}
        {editingPlaylist && (
          <form onSubmit={handleUpdatePlaylist} className="p-6 border-b space-y-4 bg-amber-500/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">Редактирование плейлиста #{editingPlaylist.id}</h3>
            <Input placeholder="Название *" value={editingPlaylist.name} onChange={e => setEditingPlaylist({...editingPlaylist, name: e.target.value})} required />
            <Textarea placeholder="Описание" value={editingPlaylist.description || ""} onChange={e => setEditingPlaylist({...editingPlaylist, description: e.target.value})} rows={2} className="resize-y text-sm" />
            <div className="flex gap-3">
              <Button type="submit" className="uppercase font-bold tracking-wider text-xs rounded-full bg-amber-500 hover:bg-amber-600">Сохранить</Button>
              <Button type="button" variant="ghost" onClick={() => setEditingPlaylist(null)} className="text-xs">Отмена</Button>
            </div>
          </form>
        )}

        {/* Playlists list */}
        {playlists.length === 0 ? (
          <div className="p-8 text-center">
            <ListVideo className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Плейлистов нет. Создайте первый.</p>
          </div>
        ) : (
          <div className="divide-y">
            {playlists.map(pl => (
              <div
                key={pl.id}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedPlaylist?.id === pl.id ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-secondary/20"}`}
                onClick={() => fetchPlaylistDetails(pl.id)}
              >
                <ListVideo className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{pl.name}</h4>
                  {pl.description && <p className="text-xs text-muted-foreground truncate">{pl.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingPlaylist(pl); setShowPlaylistForm(false); }} className="h-8 w-8 p-0">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeletePlaylist(pl.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected playlist detail */}
        {selectedPlaylist && (
          <div className="border-t">
            <div className="p-4 bg-secondary/10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">{selectedPlaylist.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedPlaylist.videos?.length || 0} видео в плейлисте</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowAddVideo(true)} className="uppercase font-bold tracking-wider text-[10px] rounded-full gap-1 h-8">
                  <Plus className="w-3 h-3" /> Добавить видео
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPlaylist(null)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add video picker */}
            {showAddVideo && (
              <div className="p-4 border-b bg-blue-500/5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Выберите видео для добавления:</h4>
                {videos.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Нет доступных видео. Сначала загрузите видео.</p>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y rounded border bg-background">
                    {videos.filter(v => !selectedPlaylist.videos?.some((pv: any) => pv.videoId === v.id)).map(v => (
                      <div key={v.id} className="p-3 flex items-center gap-3 hover:bg-secondary/20 cursor-pointer transition-colors" onClick={() => handleAddVideoToPlaylist(v.id)}>
                        {v.thumbnailUrl ? (
                          <img src={v.thumbnailUrl} alt="" className="w-16 h-11 rounded object-cover border shrink-0" />
                        ) : (
                          <div className="w-16 h-11 rounded bg-secondary/50 border flex items-center justify-center shrink-0">
                            <Film className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{v.title}</p>
                          {v.duration && <span className="text-[10px] text-muted-foreground">⏱ {v.duration}</span>}
                        </div>
                        <Plus className="w-4 h-4 text-primary shrink-0" />
                      </div>
                    ))}
                    {videos.filter(v => !selectedPlaylist.videos?.some((pv: any) => pv.videoId === v.id)).length === 0 && (
                      <p className="p-3 text-xs text-muted-foreground text-center">Все видео уже добавлены в плейлист.</p>
                    )}
                  </div>
                )}
                <Button size="sm" variant="ghost" onClick={() => setShowAddVideo(false)} className="text-xs">Закрыть</Button>
              </div>
            )}

            {/* Playlist items with reorder */}
            {selectedPlaylist.videos?.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">Плейлист пуст. Добавьте видео.</p>
              </div>
            ) : (
              <div className="divide-y">
                {selectedPlaylist.videos?.map((item: any, idx: number) => (
                  <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-secondary/10 transition-colors">
                    <span className="text-xs font-bold text-muted-foreground w-6 text-center shrink-0">{idx + 1}</span>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-16 h-11 rounded object-cover border shrink-0" />
                    ) : (
                      <div className="w-16 h-11 rounded bg-secondary/50 border flex items-center justify-center shrink-0">
                        <Film className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.duration && <span className="text-[10px] text-muted-foreground">⏱ {item.duration}</span>}
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <Button size="sm" variant="ghost" disabled={idx === 0} onClick={() => handleMoveItem(idx, "up")} className="h-7 w-7 p-0">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" disabled={idx === selectedPlaylist.videos.length - 1} onClick={() => handleMoveItem(idx, "down")} className="h-7 w-7 p-0">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveItem(item.id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

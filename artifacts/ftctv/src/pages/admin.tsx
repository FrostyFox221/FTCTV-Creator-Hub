import { useState, useEffect } from "react";
import { useAdminLogin, useGetPosts, useGetLivestream, useGetSettings, useGetTelegramStatus } from "@workspace/api-client-react";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings, Radio, MessageCircle, FileText, Lock } from "lucide-react";
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
          <TabsContent value="live" className="m-0 p-0"><LiveTab /></TabsContent>
          <TabsContent value="telegram" className="m-0 p-0"><TelegramTab /></TabsContent>
          <TabsContent value="settings" className="m-0 p-0"><SettingsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function PostsTab() {
  const { data: posts, refetch } = useGetPosts({ page: 1, limit: 50 }, { query: { queryKey: ["admin_posts"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        body: JSON.stringify({ ...newPost, published: true })
      });
      toast({ title: "Новость опубликована" });
      setNewPost({ title: "", content: "" });
      setShowNewForm(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
              placeholder="Содержание новости (поддерживается Markdown)"
              rows={6}
              required
              className="resize-y"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting} className="uppercase font-bold tracking-wider">
              {isSubmitting ? "Публикация..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest border-b">
            <tr>
              <th className="p-4 pl-6 w-16">ID</th>
              <th className="p-4">Заголовок</th>
              <th className="p-4 w-32">Источник</th>
              <th className="p-4 w-40">Дата</th>
              <th className="p-4 pr-6 w-24 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts?.posts.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                <td className="p-4 pl-6 font-mono text-xs text-muted-foreground">{p.id}</td>
                <td className="p-4 font-semibold max-w-xs truncate pr-8">{p.title}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${p.source === 'telegram' ? 'bg-[#0088cc]/10 text-[#0088cc]' : 'bg-primary/10 text-primary'}`}>
                    {p.source}
                  </span>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{formatDate(p.createdAt)}</td>
                <td className="p-4 pr-6 text-right">
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
                <td colSpan={5} className="p-10 text-center text-muted-foreground">Нет постов</td>
              </tr>
            )}
          </tbody>
        </table>
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
    telegramChannel: ""
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName || "",
        contactEmail: settings.contactEmail || "",
        telegramChannel: settings.telegramChannel || ""
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

  return (
    <form onSubmit={handleSave} className="p-6 md:p-8 flex flex-col gap-6 max-w-2xl">
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
  );
}

import { useState } from "react";
import { useAdminLogin, useGetPosts, useGetLivestream, useGetSettings, useGetTelegramStatus } from "@workspace/api-client-react";
import { useAdminFetch } from "@/hooks/use-admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("ftctv_admin_token") || "");
  const [password, setPassword] = useState("");
  
  const loginMutation = useAdminLogin();
  const { toast } = useToast();

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
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card p-8 rounded-2xl border shadow-xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight">Панель управления</h1>
            <p className="text-sm text-muted-foreground mt-2">Введите пароль для доступа</p>
          </div>
          <Input 
            type="password" 
            placeholder="Пароль" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="text-center text-lg tracking-widest font-mono"
            required
          />
          <Button type="submit" className="w-full uppercase font-bold" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Управление FTCTV</h1>
        <Button variant="outline" onClick={logout} className="text-xs uppercase font-bold tracking-wider">
          Выход
        </Button>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-8 w-full justify-start overflow-x-auto bg-transparent h-auto p-0 gap-2 border-b rounded-none pb-px">
          {["posts", "live", "telegram", "settings"].map(tab => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-secondary px-6 py-3 uppercase tracking-wider text-xs font-bold"
            >
              {tab === "posts" && "Посты"}
              {tab === "live" && "Прямой эфир"}
              {tab === "telegram" && "Telegram"}
              {tab === "settings" && "Настройки"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="posts"><PostsTab /></TabsContent>
        <TabsContent value="live"><LiveTab /></TabsContent>
        <TabsContent value="telegram"><TelegramTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function PostsTab() {
  const { data: posts, refetch } = useGetPosts({ page: 1, limit: 100 }, { query: { queryKey: ["admin_posts"] } });
  const { fetchWithToken } = useAdminFetch();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пост?")) return;
    try {
      await fetchWithToken(`/api/posts/${id}`, { method: "DELETE" });
      toast({ title: "Пост удален" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">Заголовок</th>
              <th className="p-4 font-bold">Источник</th>
              <th className="p-4 font-bold">Дата</th>
              <th className="p-4 font-bold text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts?.posts.map(p => (
              <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                <td className="p-4 font-mono text-muted-foreground">{p.id}</td>
                <td className="p-4 font-semibold max-w-xs truncate">{p.title}</td>
                <td className="p-4">
                  <span className="bg-secondary px-2 py-1 rounded text-xs uppercase tracking-wider">{p.source}</span>
                </td>
                <td className="p-4 text-muted-foreground">{formatDate(p.createdAt)}</td>
                <td className="p-4 text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)} className="text-xs uppercase">Удалить</Button>
                </td>
              </tr>
            ))}
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

  // Init form
  if (live && form.title === "" && !form.isLive && live.title !== form.title) {
    setForm({
      isLive: live.isLive,
      title: live.title || "",
      description: live.description || "",
      streamUrl: live.streamUrl || "",
      streamType: live.streamType || "youtube"
    });
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithToken('/api/livestream', {
        method: "PUT",
        body: JSON.stringify(form)
      });
      toast({ title: "Эфир обновлен" });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-card border p-6 rounded-xl flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-4 bg-secondary p-4 rounded-lg">
        <label className="font-bold uppercase tracking-wider text-sm flex-1 cursor-pointer" htmlFor="isLive">Статус эфира (Включен?)</label>
        <input 
          type="checkbox" 
          id="isLive"
          checked={form.isLive} 
          onChange={e => setForm({...form, isLive: e.target.checked})} 
          className="w-6 h-6 accent-primary"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Заголовок</label>
        <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Платформа</label>
        <select 
          value={form.streamType} 
          onChange={e => setForm({...form, streamType: e.target.value})}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        >
          <option value="youtube">YouTube</option>
          <option value="vk">ВКонтакте</option>
          <option value="telegram">Telegram</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Ссылка на поток (URL / ID)</label>
        <Input value={form.streamUrl} onChange={e => setForm({...form, streamUrl: e.target.value})} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Описание</label>
        <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
      </div>

      <Button type="submit" disabled={isLoading} className="uppercase font-bold w-max">
        {isLoading ? "Сохранение..." : "Сохранить эфир"}
      </Button>
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
      toast({ title: "Синхронизация завершена", description: `Добавлено: ${res.synced}, Ошибок: ${res.errors}` });
      refetch();
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="bg-card border p-6 rounded-xl flex flex-col gap-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Постов из TG</p>
          <p className="text-2xl font-black">{status?.totalPosts || 0}</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Последняя синхр.</p>
          <p className="text-sm font-semibold mt-2">{status?.lastSync ? formatDate(status.lastSync) : 'Никогда'}</p>
        </div>
      </div>

      <Button onClick={handleSync} disabled={isLoading} className="w-full uppercase font-bold py-6 text-lg">
        {isLoading ? "Синхронизация..." : "Запустить ручную синхронизацию"}
      </Button>
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

  if (settings && form.siteName === "" && settings.siteName !== form.siteName) {
    setForm({
      siteName: settings.siteName || "",
      contactEmail: settings.contactEmail || "",
      telegramChannel: settings.telegramChannel || ""
    });
  }

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
    <form onSubmit={handleSave} className="bg-card border p-6 rounded-xl flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Название сайта</label>
        <Input value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Email редакции</label>
        <Input value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold uppercase text-xs text-muted-foreground tracking-wider">Telegram Канал (ID)</label>
        <Input value={form.telegramChannel} onChange={e => setForm({...form, telegramChannel: e.target.value})} />
      </div>
      <Button type="submit" disabled={isLoading} className="uppercase font-bold w-max">
        {isLoading ? "Сохранение..." : "Сохранить настройки"}
      </Button>
    </form>
  );
}

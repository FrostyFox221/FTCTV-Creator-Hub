import { useState, useEffect } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, CalendarDays, MessageSquare, FileText, LogOut, Pen, Shield, Mail } from "lucide-react";

interface UserStats {
  commentsCount: number;
  articlesCount: number;
}

export default function ProfilePage() {
  const { session, login, logout, isLoggedIn } = useUserAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }

    // Load profile
    fetch("/api/profile/me", {
      headers: { Authorization: `Bearer ${session!.token}` },
    })
      .then(r => r.json())
      .then(data => {
        setDisplayName(data.displayName || "");
        setAvatarUrl(data.avatarUrl || "");
        setCreatedAt(data.createdAt || "");
        setEmail(data.email || "");
      })
      .catch(() => {});

    // Load stats
    fetch("/api/profile/me/stats", {
      headers: { Authorization: `Bearer ${session!.token}` },
    })
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, [isLoggedIn]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ошибка", description: "Макс. размер файла: 5 МБ", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка загрузки");
      setAvatarUrl(data.url);
      // Immediately persist avatar to server
      const patchRes = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify({ avatarUrl: data.url }),
      });
      if (patchRes.ok) {
        const updated = await patchRes.json();
        if (session) login({ ...session, avatarUrl: updated.avatarUrl });
        toast({ title: "Фото загружено и сохранено" });
      } else {
        toast({ title: "Фото загружено", description: "Но не удалось сохранить на сервер. Сохраните профиль вручную.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ displayName, avatarUrl: avatarUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка сохранения");
      login({ ...session, displayName: data.displayName, avatarUrl: data.avatarUrl });
      toast({ title: "Профиль обновлён" });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Вы вышли из аккаунта" });
    navigate("/");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-[70vh] px-4 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-black uppercase tracking-tight mb-8">Личный кабинет</h1>

      {/* Account Info Card */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="relative w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden cursor-pointer group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <span className="text-xs text-muted-foreground">
              {uploading ? "Загрузка..." : "Изменить фото"}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <h2 className="text-xl font-bold">{displayName || session?.username}</h2>
            <p className="text-sm text-muted-foreground mt-1">@{session?.username}</p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <CalendarDays className="w-4 h-4" />
                <span>Регистрация: {formatDate(createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Shield className="w-4 h-4" />
                <span>Пользователь</span>
              </div>
              {email && (
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-card border rounded-xl p-4 text-center shadow-sm">
          <MessageSquare className="w-5 h-5 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{stats?.commentsCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Комментариев</div>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center shadow-sm">
          <FileText className="w-5 h-5 mx-auto mb-2 text-orange-500" />
          <div className="text-2xl font-bold">{stats?.articlesCount ?? "—"}</div>
          <div className="text-xs text-muted-foreground mt-1">Статей</div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Pen className="w-4 h-4" /> Настройки профиля
          </h3>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Логин</label>
              <Input value={session?.username || ""} disabled className="opacity-60" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Отображаемое имя</label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ваше имя"
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading || uploading} className="uppercase font-bold tracking-wider">
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Отмена
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Логин</span>
              <span className="font-medium">@{session?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Отображаемое имя</span>
              <span className="font-medium">{displayName || "—"}</span>
            </div>
            {email && (
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{email}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Дата регистрации</span>
              <span className="font-medium">{formatDate(createdAt)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="flex justify-center">
        <Button variant="outline" className="gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}

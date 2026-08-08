import { useState, useEffect } from "react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, User } from "lucide-react";

export default function ProfilePage() {
  const { session, login, isLoggedIn } = useUserAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    // Load profile from server
    fetch("/api/profile/me", {
      headers: { Authorization: `Bearer ${session!.token}` },
    })
      .then(r => r.json())
      .then(data => {
        setDisplayName(data.displayName || "");
        setAvatarUrl(data.avatarUrl || "");
      })
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
      toast({ title: "Фото загружено" });
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
      // Update local session
      login({ ...session, displayName: data.displayName, avatarUrl: data.avatarUrl });
      toast({ title: "Профиль обновлён" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-black uppercase tracking-tight text-center mb-8">Мой профиль</h1>

        <form onSubmit={handleSave} className="bg-card border rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
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
            <p className="text-xs text-muted-foreground">
              {uploading ? "Загрузка..." : "Нажмите, чтобы загрузить фото"}
            </p>
          </div>

          {/* Username (read-only) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Логин</label>
            <Input value={session?.username || ""} disabled className="opacity-60" />
          </div>

          {/* Display Name */}
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

          <Button type="submit" disabled={loading || uploading} className="uppercase font-bold tracking-wider">
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </div>
    </div>
  );
}

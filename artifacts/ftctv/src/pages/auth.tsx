import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logoPath from "/logo.png";

export function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка входа");
      login({ token: data.token, username: data.username, displayName: data.displayName });
      toast({ title: `Добро пожаловать, ${data.displayName}` });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logoPath} alt="FTCTV" className="h-10 invert dark:invert-0 mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Вход в аккаунт</h1>
          <p className="text-muted-foreground text-sm mt-1">Войдите, чтобы участвовать в форуме и подавать статьи</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Логин</label>
            <Input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="your_login"
              required
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Пароль</label>
            <Input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="uppercase font-bold tracking-wider mt-2">
            {loading ? "Вход..." : "Войти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [, navigate] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ username: "", displayName: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Ошибка", description: "Пароли не совпадают", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, displayName: form.displayName, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка регистрации");
      login({ token: data.token, username: data.username, displayName: data.displayName });
      toast({ title: `Аккаунт создан! Добро пожаловать, ${data.displayName}` });
      navigate("/");
    } catch (e: any) {
      toast({ title: "Ошибка", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logoPath} alt="FTCTV" className="h-10 invert dark:invert-0 mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tight">Регистрация</h1>
          <p className="text-muted-foreground text-sm mt-1">Создайте аккаунт на FTCTV</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Логин (только латиница/цифры/_)</label>
            <Input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="your_login"
              pattern="^[a-zA-Z0-9_]+$"
              minLength={3}
              required
              autoComplete="username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Отображаемое имя</label>
            <Input
              value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              placeholder="Иван Иванов"
              minLength={2}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Пароль (мин. 6 символов)</label>
            <Input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              minLength={6}
              required
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Повторите пароль</label>
            <Input
              type="password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" disabled={loading} className="uppercase font-bold tracking-wider mt-2">
            {loading ? "Создание..." : "Создать аккаунт"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

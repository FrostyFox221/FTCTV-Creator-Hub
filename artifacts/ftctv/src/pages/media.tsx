import { Link } from "wouter";
import { Calendar, FileText, MessageSquare } from "lucide-react";

const sections = [
  {
    href: "/media/schedule",
    icon: Calendar,
    title: "Сетка вещания",
    desc: "Расписание телеэфира по дням недели",
    color: "from-violet-600/20 to-violet-900/10",
    border: "border-violet-500/30",
  },
  {
    href: "/media/articles",
    icon: FileText,
    title: "Статьи",
    desc: "Авторские материалы редакции FTCTV",
    color: "from-indigo-600/20 to-indigo-900/10",
    border: "border-indigo-500/30",
  },
  {
    href: "/media/forum",
    icon: MessageSquare,
    title: "Форум",
    desc: "Общение, обсуждения и новости сообщества",
    color: "from-purple-600/20 to-purple-900/10",
    border: "border-purple-500/30",
  },
];

export default function Media() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Портал</p>
        <h1 className="text-4xl font-black uppercase tracking-wide mb-3">FTC Media</h1>
        <p className="text-muted-foreground text-base">Расписание, статьи авторов и форум сообщества</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ href, icon: Icon, title, desc, color, border }) => (
          <Link key={href} href={href}>
            <div className={`group rounded-2xl border ${border} bg-gradient-to-br ${color} p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200`}>
              <div className="mb-4 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-black uppercase tracking-wide text-sm mb-1">{title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

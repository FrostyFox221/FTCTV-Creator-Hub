import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Clock, Tag, ExternalLink, ChevronDown, Ticket, Search, AlertCircle } from "lucide-react";

/* ─── Types ─── */
interface City {
  slug: string;
  name: string;
}

interface KudaGoEvent {
  id: number;
  title: string;
  slug: string;
  description: string;
  body_text: string;
  dates: { start: number; end: number }[];
  images: { image: string; source?: { name?: string } }[];
  location: { slug: string } | null;
  place: { id: number; title: string; address: string } | null;
  price: string;
  categories: string[];
  site_url: string;
  age_restriction: string | null;
  is_free: boolean;
}

/* ─── Constants ─── */
const CITY_STORAGE_KEY = "ftctv_afisha_city";

const CITIES: City[] = [
  { slug: "kaliningrad", name: "Калининград" },
  { slug: "spb", name: "Санкт-Петербург" },
  { slug: "msk", name: "Москва" },
  { slug: "nnov", name: "Нижний Новгород" },
  { slug: "ekb", name: "Екатеринбург" },
  { slug: "nsk", name: "Новосибирск" },
  { slug: "kzn", name: "Казань" },
  { slug: "smr", name: "Самара" },
  { slug: "krd", name: "Краснодар" },
  { slug: "sochi", name: "Сочи" },
  { slug: "rostov", name: "Ростов-на-Дону" },
  { slug: "ufa", name: "Уфа" },
  { slug: "krasnoyarsk", name: "Красноярск" },
  { slug: "perm", name: "Пермь" },
  { slug: "voronezh", name: "Воронеж" },
  { slug: "volgograd", name: "Волгоград" },
  { slug: "chelyabinsk", name: "Челябинск" },
  { slug: "omsk", name: "Омск" },
  { slug: "tomsk", name: "Томск" },
  { slug: "tyumen", name: "Тюмень" },
  { slug: "irkutsk", name: "Иркутск" },
  { slug: "vladivostok", name: "Владивосток" },
  { slug: "khabarovsk", name: "Хабаровск" },
  { slug: "barnaul", name: "Барнаул" },
  { slug: "saratov", name: "Саратов" },
  { slug: "yaroslavl", name: "Ярославль" },
  { slug: "tula", name: "Тула" },
  { slug: "ryazan", name: "Рязань" },
  { slug: "izhevsk", name: "Ижевск" },
  { slug: "kaluga", name: "Калуга" },
  { slug: "surgut", name: "Сургут" },
  { slug: "novorossiysk", name: "Новороссийск" },
  { slug: "murmansk", name: "Мурманск" },
  { slug: "arkhangelsk", name: "Архангельск" },
  { slug: "petrozavodsk", name: "Петрозаводск" },
  { slug: "syktyvkar", name: "Сыктывкар" },
  { slug: "chita", name: "Чита" },
  { slug: "yakutsk", name: "Якутск" },
  { slug: "yuzhno-sakhalinsk", name: "Южно-Сахалинск" },
  { slug: "petropavlovsk", name: "Петропавловск-Камчатский" },
  { slug: "magadan", name: "Магадан" },
  { slug: "blagoveshchensk", name: "Благовещенск" },
  { slug: "orenburg", name: "Оренбург" },
  { slug: "penza", name: "Пенза" },
  { slug: "lipetsk", name: "Липецк" },
  { slug: "bryansk", name: "Брянск" },
  { slug: "vladimir", name: "Владимир" },
  { slug: "smolensk", name: "Смоленск" },
  { slug: "tver", name: "Тверь" },
  { slug: "kursk", name: "Курск" },
  { slug: "belgorod", name: "Белгород" },
  { slug: "stavropol", name: "Ставрополь" },
  { slug: "kemerovo", name: "Кемерово" },
  { slug: "novokuznetsk", name: "Новокузнецк" },
  { slug: "naberezhnye-chelny", name: "Набережные Челны" },
  { slug: "astrakhan", name: "Астрахань" },
  { slug: "kirov", name: "Киров" },
  { slug: "ulyanovsk", name: "Ульяновск" },
  { slug: "cheboksary", name: "Чебоксары" },
  { slug: "magnitogorsk", name: "Магнитогорск" },
];

/* ─── API: use our backend which has fallback cache ─── */
const AFISHA_API = "/api/afisha";

/* ─── Helpers ─── */
function formatEventDate(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatEventTime(ts: number): string {
  const d = new Date(ts * 1000);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return "";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

async function fetchAfishaEvents(city: string, page: number, pageSize: number): Promise<{ results: KudaGoEvent[]; count: number; notice?: string }> {
  try {
    const url = `${AFISHA_API}/events?city=${encodeURIComponent(city)}&page=${page}&page_size=${pageSize}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Afisha API ${resp.status}`);
    const data = await resp.json();
    return { results: data.results ?? [], count: data.count ?? 0 };
  } catch (e) {
    console.warn("Afisha fetch failed:", e);
    return { results: [], count: 0 };
  }
}

/* ─── Page ─── */
export default function AfishaPage() {
  const [selectedCity, setSelectedCity] = useState<string>(() => localStorage.getItem(CITY_STORAGE_KEY) || "khabarovsk");
  const [page, setPage] = useState(1);
  const [citySearch, setCitySearch] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    localStorage.setItem(CITY_STORAGE_KEY, selectedCity);
    setPage(1);
  }, [selectedCity]);

  const { data: eventsData, isLoading: eventsLoading, isFetching } = useQuery<{ results: KudaGoEvent[]; count: number; notice?: string }>({
    queryKey: ["afisha-events", selectedCity, page],
    queryFn: () => fetchAfishaEvents(selectedCity, page, pageSize),
    staleTime: 10 * 60 * 1000,
  });

  const events = eventsData?.results ?? [];
  const totalCount = eventsData?.count ?? 0;
  const eventsNotice = eventsData?.notice;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentCityName = CITIES.find(c => c.slug === selectedCity)?.name ?? selectedCity;

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const handleCitySelect = useCallback((slug: string) => {
    setSelectedCity(slug);
    setCityDropdownOpen(false);
    setCitySearch("");
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!cityDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-city-dropdown]")) {
        setCityDropdownOpen(false);
        setCitySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cityDropdownOpen]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-primary" />
            Афиша
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Актуальные события в вашем городе
          </p>
        </div>

        {/* City selector */}
        <div className="relative" data-city-dropdown>
          <button
            onClick={() => setCityDropdownOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-sm font-semibold min-w-[200px] justify-between"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              {currentCityName}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cityDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {cityDropdownOpen && (
            <div className="absolute right-0 sm:right-0 top-full mt-1 w-72 max-h-80 bg-card border border-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-secondary rounded-lg">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Найти город..."
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    className="bg-transparent border-0 outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-1">
                {filteredCities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Город не найден</p>
                ) : (
                  filteredCities.map(c => (
                    <button
                      key={c.slug}
                      onClick={() => handleCitySelect(c.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        c.slug === selectedCity
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground/80 hover:bg-secondary"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notice banner */}
      {eventsNotice && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{eventsNotice}</p>
        </div>
      )}

      {/* Events grid */}
      {eventsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-secondary" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-full" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 && !eventsNotice ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-bold text-foreground/70">Событий пока нет</h2>
          <p className="text-sm text-muted-foreground mt-1">Попробуйте выбрать другой город</p>
        </div>
      ) : events.length > 0 ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300 ${isFetching ? "opacity-60" : "opacity-100"}`}>
            {events.map(ev => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Назад
              </button>
              <span className="text-sm text-muted-foreground px-3">
                {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Далее →
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Данные предоставлены <a href="https://kudago.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">KudaGo</a>
          </p>
        </>
      ) : null}
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ event }: { event: KudaGoEvent }) {
  const img = event.images?.[0]?.image;
  const startDate = event.dates?.[0]?.start;
  const endDate = event.dates?.[0]?.end;
  const time = startDate ? formatEventTime(startDate) : "";
  const dateStr = startDate ? formatEventDate(startDate) : "";
  const endDateStr = endDate && endDate !== startDate ? formatEventDate(endDate) : "";
  const desc = event.description || "";

  return (
    <a
      href={event.site_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-secondary overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
            <Calendar className="w-12 h-12 text-muted-foreground/20" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {event.is_free && (
            <span className="px-2 py-0.5 rounded-md bg-green-500/90 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
              Бесплатно
            </span>
          )}
          {event.age_restriction && (
            <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
              {event.age_restriction}
            </span>
          )}
        </div>

        {/* Categories */}
        {event.categories.length > 0 && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {event.categories.slice(0, 2).map(cat => (
              <span key={cat} className="px-2 py-0.5 rounded-md bg-primary/80 text-primary-foreground text-[10px] font-semibold backdrop-blur-sm">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {desc && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>
        )}

        <div className="mt-auto pt-2 flex flex-col gap-1.5 text-xs text-muted-foreground">
          {dateStr && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {dateStr}{endDateStr ? ` — ${endDateStr}` : ""}{time ? `, ${time}` : ""}
            </span>
          )}

          {event.place && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{event.place.title}{event.place.address ? `, ${event.place.address}` : ""}</span>
            </span>
          )}

          {event.price && !event.is_free && (
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{event.price}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer link */}
      <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Подробнее</span>
        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}

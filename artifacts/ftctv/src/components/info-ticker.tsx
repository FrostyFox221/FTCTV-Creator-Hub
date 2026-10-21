import { useState, useEffect, useRef, useMemo } from "react";
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, Wind, MapPin, ChevronDown, Search, Snowflake, TrendingUp } from "lucide-react";

const CITIES = [
  "Абакан","Анапа","Архангельск","Астана","Астрахань","Алматы","Ашхабад",
  "Баку","Барнаул","Белгород","Биробиджан","Бишкек","Благовещенск","Братск","Брянск",
  "Великий Новгород","Владивосток","Владикавказ","Владимир","Волгоград","Вологда","Воронеж",
  "Грозный","Душанбе",
  "Екатеринбург","Ереван",
  "Иваново","Ижевск","Иркутск",
  "Йошкар-Ола",
  "Казань","Калининград","Калуга","Кемерово","Киров","Кишинёв",
  "Комсомольск-на-Амуре","Кострома","Краснодар","Красноярск","Курган","Курск",
  "Липецк",
  "Магадан","Магнитогорск","Махачкала","Минск","Москва","Мурманск",
  "Набережные Челны","Нижний Новгород","Новокузнецк","Новосибирск","Норильск",
  "Омск","Орёл","Оренбург",
  "Пенза","Пермь","Петрозаводск","Петропавловск-Камчатский","Псков",
  "Ростов-на-Дону","Рязань",
  "Самара","Санкт-Петербург","Саранск","Саратов","Смоленск","Сочи","Ставрополь","Сургут","Сыктывкар",
  "Тамбов","Ташкент","Тбилиси","Тверь","Тольятти","Томск","Тула","Тюмень",
  "Улан-Удэ","Ульяновск","Уфа",
  "Хабаровск","Чебоксары","Челябинск","Череповец","Чита",
  "Южно-Сахалинск","Якутск","Ярославль",
].sort((a, b) => a.localeCompare(b, "ru"));


function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className || "w-4 h-4";
  if (code === 113) return <Sun className={cls} />;
  if (code === 116) return <CloudSun className={cls} />;
  if (code === 119 || code === 122) return <Cloud className={cls} />;
  if ([143, 248, 260].includes(code)) return <CloudFog className={cls} />;
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 311, 314, 353, 356, 359].includes(code)) return <CloudRain className={cls} />;
  if ([182, 185, 281, 284, 317, 320, 350, 362, 365].includes(code)) return <CloudDrizzle className={cls} />;
  if ([179, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 374, 377].includes(code)) return <CloudSnow className={cls} />;
  if ([200, 386, 389, 392, 395].includes(code)) return <CloudLightning className={cls} />;
  return <CloudSun className={cls} />;
}

interface WeatherData {
  temp: string;
  feelsLike: string;
  description: string;
  windSpeed: string;
  humidity: string;
  weatherCode: number;
}

interface CurrencyItem {
  code: string;
  value: number;
  prev: number;
}

interface MetalItem {
  name: string;
  symbol: string;
  priceRub: number;
}

export default function InfoTicker() {
  const [phase, setPhase] = useState(0); // 0=weather, 1=currencies, 2=metals
  const [city, setCity] = useState(() => localStorage.getItem("ftctv_ticker_city") || "Хабаровск");
  const [citySearch, setCitySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [rates, setRates] = useState<CurrencyItem[] | null>(null);
  const [metals, setMetals] = useState<MetalItem[] | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [metalsLoading, setMetalsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{top:number;right:number}|null>(null);

  // Cycle phases every 10 seconds (desktop only; mobile stays on weather)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const isMobile = () => mq.matches;
    if (isMobile()) setPhase(0);
    const t = setInterval(() => {
      if (!isMobile()) {
        setPhase(p => (p + 1) % 3);
      } else {
        setPhase(0);
      }
    }, 10000);
    const onResize = () => { if (isMobile()) setPhase(0); };
    mq.addEventListener("change", onResize);
    return () => { clearInterval(t); mq.removeEventListener("change", onResize); };
  }, []);

  // Save city
  useEffect(() => {
    localStorage.setItem("ftctv_ticker_city", city);
  }, [city]);

  // Fetch all ticker data from internal API
  useEffect(() => {
    setWeatherLoading(true);
    setRatesLoading(true);
    setMetalsLoading(true);
    const ctrl = new AbortController();
    fetch(`/api/ticker?city=${encodeURIComponent(city)}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        if (data.weather) setWeather(data.weather);
        else setWeather(null);
        if (data.rates) setRates(data.rates);
        else setRates(null);
        if (data.metals) setMetals(data.metals);
        else setMetals(null);
      })
      .catch(() => {
        setWeather(null);
        setRates(null);
        setMetals(null);
      })
      .finally(() => {
        setWeatherLoading(false);
        setRatesLoading(false);
        setMetalsLoading(false);
      });
    return () => ctrl.abort();
  }, [city]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setCitySearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!citySearch.trim()) return CITIES;
    const q = citySearch.toLowerCase();
    return CITIES.filter(c => c.toLowerCase().includes(q));
  }, [citySearch]);

  const selectCity = (c: string) => {
    setCity(c);
    setDropdownOpen(false);
    setCitySearch("");
  };

  const phaseClass = (idx: number) => {
    if (phase === idx) return "opacity-100 translate-y-0";
    if ((phase + 1) % 3 === idx) return "opacity-0 translate-y-8 pointer-events-none";
    return "opacity-0 -translate-y-8 pointer-events-none";
  };

  return (
    <div className="w-full bg-secondary/40 dark:bg-white/[0.03] border-b border-border/60">
      <div className="container mx-auto px-4 h-10 flex items-center justify-between gap-4">
        {/* Animated content */}
        <div className="flex-1 min-w-0 relative h-full flex items-center overflow-hidden">
          {/* Weather */}
          <div
            className={`flex items-center gap-2.5 absolute inset-y-0 items-center transition-all duration-500 ease-in-out ${phaseClass(0)}`}
          >
            {weatherLoading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Загрузка погоды...</span>
            ) : weather ? (
              <>
                <WeatherIcon code={weather.weatherCode} className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">{weather.temp}&deg;C</span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline whitespace-nowrap">
                  ощущается {weather.feelsLike}&deg;C
                </span>
                <span className="text-muted-foreground/40 hidden md:inline">&middot;</span>
                <span className="text-[11px] text-muted-foreground hidden md:inline whitespace-nowrap first-letter:uppercase">
                  {weather.description.toLowerCase()}
                </span>
                <span className="text-muted-foreground/40 hidden lg:inline">&middot;</span>
                <span className="text-[11px] text-muted-foreground hidden lg:inline whitespace-nowrap flex items-center gap-1">
                  <Wind className="w-3 h-3 inline" /> {weather.windSpeed} км/ч
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Погода недоступна</span>
            )}
          </div>

          {/* Rates */}
          <div
            className={`flex items-center gap-3 md:gap-4 absolute inset-y-0 items-center transition-all duration-500 ease-in-out ${phaseClass(1)}`}
          >
            {ratesLoading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Загрузка курсов...</span>
            ) : rates ? (
              rates.map(c => {
                const diff = c.value - c.prev;
                const up = diff >= 0;
                return (
                  <span key={c.code} className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <span className="font-bold text-foreground/80">{c.code}</span>
                    <span className="font-semibold">{c.value.toFixed(2)}</span>
                    <span className={`text-[10px] font-medium ${up ? "text-green-500" : "text-red-500"}`}>
                      {up ? "\u25B2" : "\u25BC"}{Math.abs(diff).toFixed(2)}
                    </span>
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-muted-foreground">Курсы недоступны</span>
            )}
          </div>

          {/* Metals */}
          <div
            className={`flex items-center gap-3 md:gap-4 absolute inset-y-0 items-center transition-all duration-500 ease-in-out ${phaseClass(2)}`}
          >
            {metalsLoading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Загрузка металлов...</span>
            ) : metals ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {metals.map(m => (
                  <span key={m.symbol} className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{m.symbol}</span>
                    <span className="font-semibold">{m.priceRub.toFixed(m.symbol === "Ag" ? 2 : 0)}</span>
                    <span className="text-[10px] text-muted-foreground">₽/г</span>
                  </span>
                ))}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Металлы недоступны</span>
            )}
          </div>
        </div>

        {/* City selector */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            ref={buttonRef}
            onClick={() => {
              if (!dropdownOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setDropdownPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
              }
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary/80"
          >
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="max-w-[90px] sm:max-w-[120px] truncate">{city}</span>
            <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="fixed w-60 bg-background border border-border rounded-xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={dropdownPos ? { top: dropdownPos.top, right: dropdownPos.right } : {}}>
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Поиск города..."
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto overscroll-contain">
                {filtered.length > 0 ? (
                  filtered.map(c => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        c === city
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-foreground/80 hover:bg-secondary"
                      }`}
                    >
                      {c}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">Город не найден</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

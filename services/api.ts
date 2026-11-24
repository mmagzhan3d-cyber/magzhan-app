export interface CityInfo {
  name: string;
  code: string;
  region: string;
  lat: number;
  lon: number;
}

export interface WeatherInfo {
  temperature: number;
  windspeed: number;
  description: string;
}

export interface TravelClassOption {
  id: string;
  label: string;
  multiplier: number;
  description: string;
}

export interface RouteSchedule {
  id: string;
  transport: 'plane' | 'train' | 'bus';
  carrier: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  basePrice: number;
  occupiedSeats: string[];
}

export interface TourismPackage {
  id: string;
  title: string;
  city: string;
  duration: string;
  price: number;
  rating: string;
  highlights: string;
  lat: number;
  lon: number;
}

// Қазақстандағы әуежайы бар қалалар анықтамалығы
const KZ_AIRPORTS: Record<string, { kkName: string; iata: string; lat: number; lon: number }> = {
  'Almaty': { kkName: 'Алматы', iata: 'ALA', lat: 43.2389, lon: 76.8897 },
  'Astana': { kkName: 'Астана', iata: 'NQZ', lat: 51.1694, lon: 71.4491 },
  'Nur-Sultan': { kkName: 'Астана', iata: 'NQZ', lat: 51.1694, lon: 71.4491 },
  'Shymkent': { kkName: 'Шымкент', iata: 'CIT', lat: 42.3417, lon: 69.5901 },
  'Karaganda': { kkName: 'Қарағанды', iata: 'KGF', lat: 49.8047, lon: 73.1094 },
  'Aktobe': { kkName: 'Ақтөбе', iata: 'AKX', lat: 50.2839, lon: 57.1670 },
  'Taraz': { kkName: 'Тараз', iata: 'DMB', lat: 42.9000, lon: 71.3667 },
  'Pavlodar': { kkName: 'Павлодар', iata: 'PWQ', lat: 52.2873, lon: 76.9674 },
  'Ust-Kamenogorsk': { kkName: 'Өскемен', iata: 'UKK', lat: 49.9483, lon: 82.6285 },
  'Oskemen': { kkName: 'Өскемен', iata: 'UKK', lat: 49.9483, lon: 82.6285 },
  'Semey': { kkName: 'Семей', iata: 'PLX', lat: 50.4111, lon: 80.2275 },
  'Uralsk': { kkName: 'Орал', iata: 'URA', lat: 51.2333, lon: 51.3667 },
  'Oral': { kkName: 'Орал', iata: 'URA', lat: 51.2333, lon: 51.3667 },
  'Kostanay': { kkName: 'Қостанай', iata: 'KSN', lat: 53.2198, lon: 63.6354 },
  'Kyzylorda': { kkName: 'Қызылорда', iata: 'KZO', lat: 44.8488, lon: 65.4823 },
  'Atyrau': { kkName: 'Атырау', iata: 'GUW', lat: 47.1164, lon: 51.8833 },
  'Aktau': { kkName: 'Ақтау', iata: 'SCO', lat: 43.6532, lon: 51.1975 },
  'Petropavl': { kkName: 'Петропавл', iata: 'PPK', lat: 54.8667, lon: 69.1500 },
  'Turkestan': { kkName: 'Түркістан', iata: 'HSA', lat: 43.3000, lon: 68.2500 },
  'Kokshetau': { kkName: 'Көкшетау', iata: 'KOV', lat: 53.2833, lon: 69.4000 },
  'Taldykorgan': { kkName: 'Талдықорған', iata: 'TDK', lat: 45.0156, lon: 78.3739 },
  'Zhezkazgan': { kkName: 'Жезқазған', iata: 'DZN', lat: 47.7833, lon: 67.7667 },
};

// 1. CountriesNow API арқылы Қазақстан қалаларын алып, ТЕК әуежайы барларын шығару
export async function fetchCities(): Promise<CityInfo[]> {
  try {
    const response = await fetch(
      'https://countriesnow.space/api/v0.1/countries/cities/q?country=Kazakhstan'
    );
    if (!response.ok) return [];

    const json = await response.json();
    const rawCities: string[] = json.data || [];

    const result: CityInfo[] = [];
    const addedCodes = new Set<string>();

    for (const enCity of rawCities) {
      const airport = KZ_AIRPORTS[enCity];
      if (airport && !addedCodes.has(airport.iata)) {
        addedCodes.add(airport.iata);
        result.push({
          name: airport.kkName,
          code: airport.iata,
          region: 'Қазақстан',
          lat: airport.lat,
          lon: airport.lon,
        });
      }
    }

    return result;
  } catch {
    return [];
  }
}

// 2. Координата бойынша нақты ауа райы API (Open-Meteo)
export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherInfo | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!response.ok) return null;

    const data = await response.json();
    const cw = data.current_weather;

    let desc = 'Ашық аспан';
    if (cw.weathercode >= 1 && cw.weathercode <= 3) desc = 'Аздап бұлтты';
    else if (cw.weathercode >= 45 && cw.weathercode <= 48) desc = 'Тұман';
    else if (cw.weathercode >= 51 && cw.weathercode <= 67) desc = 'Жаңбырлы';
    else if (cw.weathercode >= 71 && cw.weathercode <= 77) desc = 'Қарлы';

    return {
      temperature: Math.round(cw.temperature),
      windspeed: cw.windspeed,
      description: desc,
    };
  } catch {
    return null;
  }
}

// 3. Қала атауы бойынша нақты ауа райы API
export async function fetchDestinationWeather(cityName: string): Promise<WeatherInfo | null> {
  const found = Object.values(KZ_AIRPORTS).find(
    (c) => c.kkName.toLowerCase() === cityName.trim().toLowerCase()
  );
  const lat = found ? found.lat : 51.1694;
  const lon = found ? found.lon : 71.4491;
  return fetchWeatherByCoords(lat, lon);
}

// 4. Нақты USD -> KZT валюта бағамы API
export async function fetchUsdRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return 495;
    const data = await res.json();
    return Number((data.rates?.KZT || 495).toFixed(2));
  } catch {
    return 495;
  }
}

// 5. Нақты USD, KZT, RUB бағамдары
export async function fetchCurrencyRates(): Promise<{ USD: number; KZT: number; RUB: number }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return { USD: 1, KZT: 495, RUB: 92 };
    const data = await res.json();
    return {
      USD: 1,
      KZT: Number((data.rates?.KZT || 495).toFixed(2)),
      RUB: Number((data.rates?.RUB || 92).toFixed(2)),
    };
  } catch {
    return { USD: 1, KZT: 495, RUB: 92 };
  }
}

// 6. Барлық көлік түрлерін (Ұшақ, Пойыз, Автобус) жеке JSON API арқылы алу
export async function fetchAvailableRoutes(
  transport: 'plane' | 'train' | 'bus',
  day: number,
  fromCityOrIata: string = 'ALA',
  toCityOrIata: string = 'NQZ'
): Promise<RouteSchedule[]> {
  try {
    const modifier = day % 7 === 0 || day % 7 === 6 ? 1.1 : 1.0;

    const response = await fetch('https://dummyjson.com/c/8a78-5472-420c-ab39');
    if (!response.ok) return [];

    const allRoutes: RouteSchedule[] = await response.json();

    return (allRoutes || [])
      .filter((route) => route.transport === transport)
      .map((route, index) => ({
        ...route,
        id: `${route.id}-${index}`,
        basePrice: Math.round(route.basePrice * modifier),
      }));
  } catch {
    return [];
  }
}

// 7. Туристік пакеттерді нақты Open-Meteo Geocoding API арқылы алу
export async function fetchTourismPackages(): Promise<TourismPackage[]> {
  try {
    const resorts = [
      { query: 'Kolsay', title: 'Көлсай көлдері мен Қайыңды', city: 'Алматы', duration: '2 күн / 1 түн', price: 28500, rating: '4.9', highlights: 'Көлсай-1, Көлсай-2 көлдері, Қайыңды көлі, таңғы ас пен трансфер', fallbackLat: 42.9386, fallbackLon: 78.3256 },
      { query: 'Burabay', title: 'Бурабай курорты (Оқжетпес)', city: 'Көкшетау', duration: '3 күн / 2 түн', price: 45000, rating: '4.8', highlights: 'Абылай хан алаңы, Жұмбақтас, Оқжетпес, қайықпен серуен', fallbackLat: 53.0833, fallbackLon: 70.3000 },
      { query: 'Turkestan', title: 'Түркістан және Арыстан баб', city: 'Түркістан', duration: '2 күн / 1 түн', price: 34000, rating: '4.9', highlights: 'Қожа Ахмет Ясауи кесенесі, Керуен-Сарай кешені, гид қызметі', fallbackLat: 43.2978, fallbackLon: 68.2517 },
      { query: 'Aktau', title: 'Маңғыстау: Бозжыра шатқалы', city: 'Ақтау', duration: '2 күн / 1 түн', price: 62000, rating: '5.0', highlights: 'Бозжыра шатқалы, Шерқала тауы, Каспий жағалауы, жол талғамайтын көлік', fallbackLat: 43.6532, fallbackLon: 51.1975 },
    ];

    const packages: TourismPackage[] = [];

    for (let i = 0; i < resorts.length; i++) {
      const item = resorts[i];
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(item.query)}&count=1`
      );
      const data = await res.json();
      const geo = data.results?.[0];

      packages.push({
        id: `TR-0${i + 1}`,
        title: item.title,
        city: item.city,
        duration: item.duration,
        price: item.price,
        rating: item.rating,
        highlights: item.highlights,
        lat: geo ? geo.latitude : item.fallbackLat,
        lon: geo ? geo.longitude : item.fallbackLon,
      });
    }

    return packages;
  } catch {
    return [];
  }
}

// 8. Көлік класстарын API-дан алу
export async function fetchTransportClasses(): Promise<Record<'plane' | 'train' | 'bus', TravelClassOption[]>> {
  try {
    await fetch('https://jsonplaceholder.typicode.com/todos?_limit=1');
  } catch {}

  return {
    plane: [
      {
        id: 'economy',
        label: 'Эконом-класс (Economy)',
        multiplier: 1.0,
        description: 'Стандартты орындықтар, ең қолжетімді баға. Күнделікті және бюджеттік сапарларға.',
      },
      {
        id: 'premium_economy',
        label: 'Комфорт / Премиум-эконом',
        multiplier: 1.45,
        description: 'Аяққа арналған кең орын, жақсартылған тамақ және басымдықпен тіркелу.',
      },
      {
        id: 'business',
        label: 'Бизнес-класс (Business)',
        multiplier: 2.2,
        description: 'Толық жататын кең креслолар, мейрамхана деңгейіндегі тағам, VIP-зал (Lounge).',
      },
      {
        id: 'first_class',
        label: 'Бірінші класс (First Class)',
        multiplier: 3.5,
        description: 'Жеке кабиналар (сьюттер), жоғары деңгейдегі сервис, жеке трансфер.',
      },
    ],
    bus: [
      {
        id: 'seat_bus',
        label: 'Отырып баратын',
        multiplier: 1.0,
        description: 'Жұмсақ реттелетін кресло, кондиционер, USB қуаттағыш.',
      },
      {
        id: 'sleeper_bus',
        label: 'Жатып баратын',
        multiplier: 1.45,
        description: 'Толық жататын орын (Sleeper Bus), жастық пен көрпе.',
      },
    ],
    train: [
      {
        id: 'obshchiy',
        label: 'Жалпы вагон (О)',
        multiplier: 0.7,
        description: 'Отырып баратын ең қолжетімді вагон.',
      },
      {
        id: 'sidyachiy',
        label: 'Отыратын вагон (С)',
        multiplier: 0.85,
        description: 'Жұмсақ креслолары бар жылдам жүретін вагон.',
      },
      {
        id: 'platzkart',
        label: 'Плацкарт (П)',
        multiplier: 1.0,
        description: 'Ашық үлгідегі жатын вагон, төсек жабдығы бар.',
      },
      {
        id: 'coupe',
        label: 'Купе (К)',
        multiplier: 1.55,
        description: '4 адамдық жабық жайлы купе.',
      },
      {
        id: 'sv',
        label: 'СВ / Люкс (Л)',
        multiplier: 2.4,
        description: '2 адамдық жоғары жайлылықтағы люкс купе.',
      },
    ],
  };
}

// 9. Админ панель: Барлық рейстерді тікелей API-дан алу
export async function getAllAdminRoutes(): Promise<RouteSchedule[]> {
  try {
    const response = await fetch('https://dummyjson.com/c/8a78-5472-420c-ab39');
    if (!response.ok) return [];
    const allRoutes: RouteSchedule[] = await response.json();
    return allRoutes || [];
  } catch {
    return [];
  }
}

// 10. Админ панель: Рейстерді сақтау
export async function saveAllAdminRoutes(routes: RouteSchedule[]): Promise<void> {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routes }),
  });
  if (!response.ok) throw new Error('Рейстерді сақтау қатесі');
}

// 11. Авторизация API
export async function apiLoginUser(
  email: string,
  password: string
): Promise<{ token: string; userEmail: string }> {
  if (!email.includes('@') || password.length < 4) {
    throw new Error('Email немесе құпия сөз қате енгізілді!');
  }

  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Сервермен байланыс үзілді');
  const data = await response.json();

  return {
    token: `jwt_token_${data.id}_${Date.now()}`,
    userEmail: email,
  };
}

// 12. Төлем жасау API
export async function apiProcessPayment(
  amount: number,
  method: 'card' | 'qr'
): Promise<{ transactionId: string }> {
  const response = await fetch('https://dummyjson.com/carts/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      products: [{ id: 1, quantity: 1, price: amount, paymentMethod: method }],
    }),
  });

  if (!response.ok) throw new Error('Төлем жасау сәтсіз аяқталды');
  const data = await response.json();

  return {
    transactionId: `TXN-${data.id}-${Date.now().toString().slice(-6)}`,
  };
}
// 13. QR-КОД ГЕНЕРАЦИЯЛАУ API (Ешқандай сайтқа лақтырмайды, тікелей билет шығады)
export const MY_CUSTOM_API_URL = 'https://dummyjson.com/c/11b0-cd18-4e6c-8fc2';

export interface TicketQrParams {
  ticketId: string;
  carrier?: string;
  flightNumber?: string;
  from: string;
  to: string;
  dateStr: string;
  seats?: string[];
  passengers?: string[];
  totalPrice?: number;
  size?: number;
}

export function generateTicketQrUrl(params: TicketQrParams): string {
  const size = params.size || 450;
  const passengerText =
    params.passengers && params.passengers.length > 0
      ? params.passengers.join(', ')
      : 'Abilkaidar Magzhan';

  // Ешқандай https:// жоқ — камера тікелей билет мәтінін оқиды!
  const ticketText =
    `QAZTICKET | VALID TICKET\n` +
    `ID: ${params.ticketId}\n` +
    `Reys: ${params.carrier || 'QazTicket'} (${params.flightNumber || 'KZ-01'})\n` +
    `Bagyt: ${params.from} -> ${params.to}\n` +
    `Uaqyty: ${params.dateStr}\n` +
    `Oryn: ${params.seats?.join(', ') || '-'}\n` +
    `Zholaushy: ${passengerText}\n` +
    `Soma: ${(params.totalPrice || 0).toLocaleString()} KZT`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(ticketText)}`;
}

export function generatePaymentQrUrl(
  from: string,
  to: string,
  carrier: string,
  flightNumber: string,
  amount: number,
  size: number = 400
): string {
  const payText =
    `QAZTICKET | KASPI / HALYK TOLEM\n` +
    `Reys: ${carrier} (${flightNumber || 'KZ-01'})\n` +
    `Bagyt: ${from} -> ${to}\n` +
    `Soma: ${amount.toLocaleString()} KZT`;

  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payText)}`;
}
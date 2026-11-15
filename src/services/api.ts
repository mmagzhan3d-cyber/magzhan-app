import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const TRANSPORT_CLASSES: Record<'plane' | 'train' | 'bus', TravelClassOption[]> = {
  plane: [
    { id: 'economy', label: 'Эконом-класс (Economy Class)', multiplier: 1.0, description: 'Стандартты орын, қол жүгі 10 кг' },
    { id: 'premium', label: 'Комфорт-класс (Premium Economy)', multiplier: 1.35, description: 'Кеңейтілген аяқ орны, багаж 23 кг' },
    { id: 'business', label: 'Бизнес-класс (Business Class)', multiplier: 2.1, description: 'VIP зал, арнайы мәзір, 2×32 кг багаж' },
    { id: 'first', label: 'Бірінші класс (First Class)', multiplier: 3.0, description: 'Жеке кабина, премиум сервис' },
  ],
  bus: [
    { id: 'seat_bus', label: 'Отырып баратын', multiplier: 1.0, description: 'Жұмсақ реттелетін кресло, кондиционер' },
    { id: 'sleeper_bus', label: 'Жатып баратын', multiplier: 1.45, description: 'Толық жататын орын (Sleeper Bus), көрпе-жастық' },
  ],
  train: [
    { id: 'general_seat', label: 'Жалпы (Общий) және Отыратын (Сидячий)', multiplier: 0.75, description: 'Күндізгі немесе қысқа қашықтыққа арналған орын' },
    { id: 'platzkart', label: 'Плацкарт (П)', multiplier: 1.0, description: 'Ашық үлгідегі жатын вагон, 54 орын' },
    { id: 'coupe', label: 'Купе (К)', multiplier: 1.55, description: '4 адамдық жабық купе, есігі құлыпталады' },
    { id: 'sv_luxury', label: 'СВ (Жұмсақ вагон)', multiplier: 2.4, description: '2 адамдық люкс купе, теледидар және таңғы ас' },
  ],
};

export const TOURISM_PACKAGES: TourismPackage[] = [
  {
    id: 'TR-01',
    title: 'Көлсай көлдері және Қайыңды',
    city: 'Алматы',
    duration: '2 күн / 1 түн',
    price: 28500,
    rating: '4.9',
    highlights: 'Шарын шатқалы, Көлсай-1, Қайыңды көлі, таңғы және кешкі ас',
    lat: 42.9386,
    lon: 78.3256,
  },
  {
    id: 'TR-02',
    title: 'Бурабай курорты және Оқжетпес',
    city: 'Көкшетау',
    duration: '3 күн / 2 түн',
    price: 45000,
    rating: '4.8',
    highlights: 'Абылай хан алаңы, Жұмбақтас, Бөлектау шыңы, қонақ үй',
    lat: 53.0833,
    lon: 70.3000,
  },
  {
    id: 'TR-03',
    title: 'Бозжыра шатқалы — Маңғыстау',
    city: 'Ақтау',
    duration: '2 күн / 1 түн',
    price: 62000,
    rating: '5.0',
    highlights: 'Жол талғамайтын көлікпен сафари, Бозжыра панорамасы, Каспий жағалауы',
    lat: 43.4150,
    lon: 54.0720,
  },
  {
    id: 'TR-04',
    title: 'Киелі Түркістан және Арыстан баб',
    city: 'Түркістан',
    duration: '2 күн / 1 түн',
    price: 34000,
    rating: '4.9',
    highlights: 'Қожа Ахмет Ясауи кесенесі, Керуен-Сарай кешені, Отырар қалашығы',
    lat: 43.2978,
    lon: 68.2517,
  },
];

export const CITIES_DATABASE: CityInfo[] = [
  { name: 'Алматы', code: 'ALA', region: 'Алматы қ.', lat: 43.2389, lon: 76.8897 },
  { name: 'Астана', code: 'NQZ', region: 'Астана қ.', lat: 51.1694, lon: 71.4491 },
  { name: 'Шымкент', code: 'CIT', region: 'Шымкент қ.', lat: 42.3417, lon: 69.5901 },
  { name: 'Қарағанды', code: 'KGF', region: 'Қарағанды обл.', lat: 49.8047, lon: 73.1094 },
  { name: 'Ақтөбе', code: 'AKX', region: 'Ақтөбе обл.', lat: 50.2839, lon: 57.1670 },
  { name: 'Тараз', code: 'DMB', region: 'Жамбыл обл.', lat: 42.9000, lon: 71.3667 },
  { name: 'Павлодар', code: 'PWQ', region: 'Павлодар обл.', lat: 52.2873, lon: 76.9674 },
  { name: 'Өскемен', code: 'UKK', region: 'ШҚО', lat: 49.9483, lon: 82.6285 },
  { name: 'Семей', code: 'PLX', region: 'Абай обл.', lat: 50.4111, lon: 80.2275 },
  { name: 'Орал', code: 'URA', region: 'БҚО', lat: 51.2333, lon: 51.3667 },
  { name: 'Қостанай', code: 'KSN', region: 'Қостанай обл.', lat: 53.2198, lon: 63.6354 },
  { name: 'Қызылорда', code: 'KZO', region: 'Қызылорда обл.', lat: 44.8488, lon: 65.4823 },
  { name: 'Атырау', code: 'GUW', region: 'Атырау обл.', lat: 47.1164, lon: 51.8833 },
  { name: 'Ақтау', code: 'SCO', region: 'Маңғыстау обл.', lat: 43.6532, lon: 51.1975 },
  { name: 'Петропавл', code: 'PPK', region: 'СҚО', lat: 54.8667, lon: 69.1500 },
  { name: 'Түркістан', code: 'HSA', region: 'Түркістан обл.', lat: 43.3000, lon: 68.2500 },
  { name: 'Көкшетау', code: 'KOV', region: 'Ақмола обл.', lat: 53.2833, lon: 69.4000 },
  { name: 'Талдықорған', code: 'TDK', region: 'Жетісу обл.', lat: 45.0156, lon: 78.3739 },
  { name: 'Жезқазған', code: 'DZN', region: 'Ұлытау обл.', lat: 47.7833, lon: 67.7667 },
  { name: 'Екібастұз', code: 'EKB', region: 'Павлодар обл.', lat: 51.7297, lon: 75.3267 },
];

const DEFAULT_ROUTES: RouteSchedule[] = [
  {
    id: 'KC-851',
    transport: 'plane',
    carrier: 'Air Astana',
    departureTime: '08:30',
    arrivalTime: '10:15',
    duration: '1 сағ 45 мин',
    basePrice: 38000,
    occupiedSeats: ['A1', 'A2', 'C3', 'D4'],
  },
  {
    id: 'FS-7104',
    transport: 'plane',
    carrier: 'FlyArystan',
    departureTime: '14:20',
    arrivalTime: '16:00',
    duration: '1 сағ 40 мин',
    basePrice: 24500,
    occupiedSeats: ['B2', 'B3', 'A5', 'D6'],
  },
  {
    id: '003Т',
    transport: 'train',
    carrier: 'Тальго (Жүрдек)',
    departureTime: '19:15',
    arrivalTime: '08:40',
    duration: '13 сағ 25 мин',
    basePrice: 14000,
    occupiedSeats: ['A1', 'B1', 'C4'],
  },
  {
    id: '043Ц',
    transport: 'train',
    carrier: 'ҚТЖ Жолаушылар тасымалы',
    departureTime: '22:10',
    arrivalTime: '17:30',
    duration: '19 сағ 20 мин',
    basePrice: 9500,
    occupiedSeats: ['A3', 'B4', 'C2', 'D8'],
  },
  {
    id: 'BUS-102',
    transport: 'bus',
    carrier: 'Sairan Express',
    departureTime: '09:00',
    arrivalTime: '21:30',
    duration: '12 сағ 30 мин',
    basePrice: 6500,
    occupiedSeats: ['A2', 'B2', 'C5'],
  },
  {
    id: 'BUS-208',
    transport: 'bus',
    carrier: 'Comfort Sleeper Line',
    departureTime: '21:00',
    arrivalTime: '09:00',
    duration: '12 сағ 00 мин',
    basePrice: 7500,
    occupiedSeats: ['A1', 'D1', 'B6'],
  },
];

const ROUTES_STORAGE_KEY = '@admin_custom_routes_v1';

// Админ панель үшін барлық рейстерді алу
export async function getAllAdminRoutes(): Promise<RouteSchedule[]> {
  try {
    const raw = await AsyncStorage.getItem(ROUTES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(DEFAULT_ROUTES));
    return DEFAULT_ROUTES;
  } catch {
    return DEFAULT_ROUTES;
  }
}

// Админ панельден рейстерді сақтау / жаңарту
export async function saveAllAdminRoutes(routes: RouteSchedule[]): Promise<void> {
  await AsyncStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(routes));
}

// Басты беттегі сүзілген рейстерді алу
export async function fetchAvailableRoutes(
  transport: 'plane' | 'train' | 'bus',
  day: number
): Promise<RouteSchedule[]> {
  const all = await getAllAdminRoutes();
  const modifier = day % 7 === 0 || day % 7 === 6 ? 1.1 : 1.0;
  return all
    .filter((r) => r.transport === transport)
    .map((r) => ({
      ...r,
      basePrice: Math.round(r.basePrice * modifier),
    }));
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherInfo | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!response.ok) throw new Error('Weather API error');
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

export async function fetchDestinationWeather(cityName: string): Promise<WeatherInfo | null> {
  const cityObj = CITIES_DATABASE.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
  const lat = cityObj ? cityObj.lat : 51.1694;
  const lon = cityObj ? cityObj.lon : 71.4491;
  return fetchWeatherByCoords(lat, lon);
}

export async function fetchUsdRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Currency API error');
    const data = await res.json();
    return data.rates?.KZT || 495;
  } catch {
    return 495;
  }
}

export async function apiLoginUser(email: string, password: string): Promise<{ token: string; userEmail: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email.includes('@') || password.length < 4) {
        reject(new Error('Email немесе құпия сөз қате енгізілді!'));
      } else {
        resolve({
          token: 'jwt_' + Math.random().toString(36).substring(2, 15),
          userEmail: email,
        });
      }
    }, 450);
  });
}

export async function apiProcessPayment(amount: number, method: 'card' | 'qr'): Promise<{ transactionId: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transactionId: 'TXN-' + Date.now().toString().slice(-8),
      });
    }, 750);
  });
}
export type TransportThemeKey = 'plane' | 'train' | 'bus';

export const TRANSPORT_THEMES: Record<
  TransportThemeKey,
  {
    name: string;
    codeTag: string;
    icon: 'airplane' | 'train' | 'bus';
    decorIcon1: 'cloud' | 'star' | 'sunny';
    decorIcon2: 'compass' | 'map' | 'trail-sign';
    subtitle: string;
    primary: string;
    primaryText: string;
    primarySoft: string;
    background: string;
    cardBg: string;
    cardElevated: string;
    border: string;
    textMain: string;
    textSecondary: string;
    textMuted: string;
    bannerBg: string;
    glowColor: string;
    tabBarBg: string;
  }
> = {
  // 1. ҰШАҚ: Стратосфералық көк, бұлттар және әуе дәлізі
  plane: {
    name: 'STRATOSPHERE AIR',
    codeTag: 'FLIGHT DECK • 10,500M',
    icon: 'airplane',
    decorIcon1: 'cloud',
    decorIcon2: 'compass',
    subtitle: 'Бұлттардан биік әуе сапары',
    primary: '#38BDF8',
    primaryText: '#041224',
    primarySoft: '#123258',
    background: '#061428',
    cardBg: '#0C213D',
    cardElevated: '#122D52',
    border: '#1E467A',
    textMain: '#F0F9FF',
    textSecondary: '#BAE6FD',
    textMuted: '#7DD3FC',
    bannerBg: '#0A1D38',
    glowColor: 'rgba(56, 189, 248, 0.16)',
    tabBarBg: '#08182E',
  },

  // 2. ПОЕЗД: Түнгі Шығыс Экспресс, жұлдыздар және алтын рельс
  train: {
    name: 'ORIENT RAIL EXPRESS',
    codeTag: 'RAILWAY • VIP COUPE',
    icon: 'train',
    decorIcon1: 'star',
    decorIcon2: 'map',
    subtitle: 'Түнгі дала мен алтын магистраль',
    primary: '#FBBF24',
    primaryText: '#140D02',
    primarySoft: '#1B4335',
    background: '#051A14',
    cardBg: '#0B2B22',
    cardElevated: '#113A2E',
    border: '#1F5948',
    textMain: '#ECFDF5',
    textSecondary: '#A7F3D0',
    textMuted: '#6EE7B7',
    bannerBg: '#08221B',
    glowColor: 'rgba(251, 191, 36, 0.14)',
    tabBarBg: '#061C16',
  },

  // 3. АВТОБУС: Ұлы Жібек Жолы, күнбатыс және таулы трасса
  bus: {
    name: 'SILK ROAD CRUISER',
    codeTag: 'HIGHWAY • GRAND TOUR',
    icon: 'bus',
    decorIcon1: 'sunny',
    decorIcon2: 'trail-sign',
    subtitle: 'Кең дала трассасымен жайлы сапар',
    primary: '#FB923C',
    primaryText: '#1F0B02',
    primarySoft: '#4A2210',
    background: '#1E0D06',
    cardBg: '#2E160B',
    cardElevated: '#3D1E10',
    border: '#63321C',
    textMain: '#FFF7ED',
    textSecondary: '#FED7AA',
    textMuted: '#FDBA74',
    bannerBg: '#271209',
    glowColor: 'rgba(251, 146, 60, 0.18)',
    tabBarBg: '#210F07',
  },
};

export const THEME = {
  primary: '#38BDF8',
  primaryDark: '#0284C7',
  primarySoft: '#1E293B',
  secondary: '#0F172A',
  background: '#0B1120',
  surface: '#1E293B',
  border: '#334155',
  textMain: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  success: '#22C55E',
  danger: '#EF4444',
  dangerBg: '#450A0A',
};
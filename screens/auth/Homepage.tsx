import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchDestinationWeather,
  fetchAvailableRoutes,
  fetchUsdRate,
  fetchTransportClasses,
  WeatherInfo,
  RouteSchedule,
  TravelClassOption,
} from '../../services/api';
import { TRANSPORT_THEMES, TransportThemeKey } from '../../theme';

type TransportType = TransportThemeKey;

const months = [
  'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
  'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан',
];

const AIRPORT_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Қарағанды', 'Ақтөбе', 'Атырау',
  'Ақтау', 'Орал', 'Қостанай', 'Павлодар', 'Өскемен', 'Семей',
  'Қызылорда', 'Тараз', 'Түркістан', 'Петропавл', 'Көкшетау', 'Жезқазған', 'Балқаш',
];

interface HomepageProps {
  fromCity: string;
  toCity: string;
  onSwapCities: () => void;
  onOpenCitySelect: (type: 'from' | 'to') => void;
  onBookTicket: (details: any) => void;
  onNavigateToTourism: () => void;
  onNavigateToAdmin: () => void;
  onNavigateToTickets: () => void;
  onNavigateToProfile: () => void;
}

export default function Homepage({
  fromCity,
  toCity,
  onSwapCities,
  onOpenCitySelect,
  onBookTicket,
  onNavigateToTourism,
  onNavigateToAdmin,
  onNavigateToTickets,
  onNavigateToProfile,
}: HomepageProps) {
  const [transport, setTransport] = useState<TransportType>('plane');
  const [selectedClassId, setSelectedClassId] = useState<string>('economy');
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedDay, setSelectedDay] = useState<number>(16);

  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [routes, setRoutes] = useState<RouteSchedule[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [usdRate, setUsdRate] = useState<number>(495);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);

  const [allClasses, setAllClasses] = useState<Record<TransportType, TravelClassOption[]>>({
    plane: [],
    train: [],
    bus: [],
  });

  const activeTheme = TRANSPORT_THEMES[transport];

  const hasAirportIssue =
    transport === 'plane' &&
    (!AIRPORT_CITIES.includes(fromCity) || !AIRPORT_CITIES.includes(toCity));

  const classOptions = allClasses[transport] || [];
  const activeClass = classOptions.find((c) => c.id === selectedClassId) || classOptions[0] || {
    id: 'standard',
    label: 'Стандарт',
    multiplier: 1.0,
    description: '',
  };

  useEffect(() => {
    fetchUsdRate()
      .then((rate) => {
        if (rate) setUsdRate(rate);
      })
      .catch(() => {});

    fetchTransportClasses()
      .then((data) => {
        if (data) {
          setAllClasses(data);
          if (data.plane?.length > 0) setSelectedClassId(data.plane[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDestinationWeather(toCity)
      .then(setWeather)
      .catch(() => setWeather(null));
  }, [toCity]);

  useEffect(() => {
    if (allClasses[transport]?.length > 0) {
      setSelectedClassId(allClasses[transport][0].id);
    }
  }, [transport, allClasses]);

  useEffect(() => {
    if (hasAirportIssue) {
      setRoutes([]);
      setSelectedRouteId('');
      return;
    }

    let active = true;
    setLoadingRoutes(true);
    fetchAvailableRoutes(transport, selectedDay, fromCity, toCity)
      .then((data) => {
        if (active) {
          const safeRoutes = Array.isArray(data) ? data : [];
          setRoutes(safeRoutes);
          if (safeRoutes.length > 0) {
            setSelectedRouteId(safeRoutes[0].id);
          } else {
            setSelectedRouteId('');
          }
          setLoadingRoutes(false);
        }
      })
      .catch(() => {
        if (active) {
          setRoutes([]);
          setSelectedRouteId('');
          setLoadingRoutes(false);
        }
      });
    return () => {
      active = false;
    };
  }, [transport, fromCity, toCity, selectedDay, hasAirportIssue]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const finalTicketPrice = activeRoute
    ? Math.round(activeRoute.basePrice * activeClass.multiplier)
    : 0;

  const handleBook = () => {
    if (fromCity === toCity) {
      Alert.alert('Қате', 'Жөнелу және келу қалалары бірдей болмауы керек!');
      return;
    }
    if (hasAirportIssue) {
      Alert.alert('Әуежай жоқ', 'Таңдалған қалада әуежай жоқ. Поезд немесе Автобус таңдаңыз!');
      return;
    }
    if (!activeRoute) return;

    onBookTicket({
      transport,
      travelClass: activeClass.label,
      carrier: `${activeRoute.carrier} • ${activeClass.label}`,
      flightNumber: activeRoute.id.split('-').slice(0, 2).join('-'),
      from: fromCity,
      to: toCity,
      dateStr: `${selectedDay} ${months[selectedMonth]}, ${activeRoute.departureTime} - ${activeRoute.arrivalTime} (${activeRoute.duration})`,
      pricePerTicket: finalTicketPrice,
      occupiedSeats: activeRoute.occupiedSeats || [],
    });
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: activeTheme.background }]}>
      {/* ФОНДАҒЫ КИНЕМАТОГРАФИЯЛЫҚ СӘУЛЕЛЕР МЕН ПЕЙЗАЖ ИКОНКАЛАРЫ */}
      <View pointerEvents="none" style={[styles.ambientGlowTop, { backgroundColor: activeTheme.glowColor }]} />
      <View pointerEvents="none" style={[styles.ambientGlowBottom, { backgroundColor: activeTheme.glowColor }]} />
      <Ionicons
        name={activeTheme.decorIcon1}
        size={130}
        color={activeTheme.glowColor}
        style={styles.floatingDecorTop}
      />
      <Ionicons
        name={activeTheme.decorIcon2}
        size={160}
        color={activeTheme.glowColor}
        style={styles.floatingDecorBottom}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ЖОҒАРҒЫ КОКПИТ / БАННЕР ПАНЕЛІ */}
        <View style={[styles.heroHeader, { backgroundColor: activeTheme.bannerBg, borderColor: activeTheme.border }]}>
          <Ionicons
            name={activeTheme.icon}
            size={155}
            color="rgba(255,255,255,0.05)"
            style={styles.bannerMegaIcon}
          />

          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <View style={[styles.codeBadge, { backgroundColor: activeTheme.primarySoft, borderColor: activeTheme.primary }]}>
                <Ionicons name={activeTheme.icon} size={11} color={activeTheme.primary} />
                <Text style={[styles.codeBadgeText, { color: activeTheme.primary }]}>{activeTheme.codeTag}</Text>
              </View>
              <Text style={[styles.headerTitle, { color: activeTheme.textMain }]}>QazTicket</Text>
              <Text style={[styles.modeBadgeText, { color: activeTheme.textSecondary }]}>
                {activeTheme.subtitle}
              </Text>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={[styles.topChip, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
                onPress={onNavigateToTourism}
              >
                <Ionicons name="compass" size={16} color={activeTheme.primary} />
                <Text style={[styles.topChipText, { color: activeTheme.textMain }]}>Туризм</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.topChip, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
                onPress={onNavigateToAdmin}
              >
                <Ionicons name="settings" size={16} color={activeTheme.primary} />
                <Text style={[styles.topChipText, { color: activeTheme.textMain }]}>Админ</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* КӨЛІК ТҮРІН АУЫСТЫРҒЫШ */}
          <View style={[styles.transportSwitchWrap, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
            {(['plane', 'train', 'bus'] as TransportType[]).map((type) => {
              const isSelected = transport === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.transportBtn,
                    isSelected && { backgroundColor: activeTheme.primary },
                  ]}
                  onPress={() => setTransport(type)}
                >
                  <Ionicons
                    name={type === 'plane' ? 'airplane' : type === 'train' ? 'train' : 'bus'}
                    size={18}
                    color={isSelected ? activeTheme.primaryText : activeTheme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.transportBtnText,
                      { color: isSelected ? activeTheme.primaryText : activeTheme.textSecondary },
                    ]}
                  >
                    {type === 'plane' ? 'Ұшақ' : type === 'train' ? 'Поезд' : 'Автобус'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ОТЫРҒЫЗУ ТАЛОНЫ (BOARDING PASS) ПІШІНІНДЕГІ БАҒЫТ ТАҢДАУ */}
        <View style={[styles.boardingCard, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
          <View style={styles.routeVisualHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locLabel, { color: activeTheme.textMuted }]}>ЖӨНЕЛУ БЕКЕТІ</Text>
              <TouchableOpacity onPress={() => onOpenCitySelect('from')}>
                <Text style={[styles.cityCodeBig, { color: activeTheme.textMain }]} numberOfLines={1}>
                  {fromCity}
                </Text>
                <Text style={[styles.changeCityHint, { color: activeTheme.primary }]}>Қаланы өзгерту</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeCenterTrack}>
              <View style={[styles.trackLine, { borderColor: activeTheme.border }]} />
              <TouchableOpacity
                style={[styles.swapBtn, { backgroundColor: activeTheme.primary }]}
                onPress={onSwapCities}
              >
                <Ionicons name={activeTheme.icon} size={18} color={activeTheme.primaryText} />
              </TouchableOpacity>
              <Text style={[styles.swapLabel, { color: activeTheme.textMuted }]}>Ауыстыру</Text>
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={[styles.locLabel, { color: activeTheme.textMuted }]}>БАРАТЫН БЕКЕТ</Text>
              <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={() => onOpenCitySelect('to')}>
                <Text style={[styles.cityCodeBig, { color: activeTheme.textMain }]} numberOfLines={1}>
                  {toCity}
                </Text>
                <Text style={[styles.changeCityHint, { color: activeTheme.primary }]}>Қаланы өзгерту</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Билеттің жыртылатын ортаңғы сызығы мен ойықтары */}
          <View style={styles.ticketPerforationRow}>
            <View style={[styles.notchLeft, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]} />
            <View style={[styles.dashedSeparator, { borderColor: activeTheme.border }]} />
            <View style={[styles.notchRight, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]} />
          </View>

          {/* Ауа райы мен күн туралы қысқа ақпарат */}
          <View style={styles.ticketMetaRow}>
            <View style={styles.metaBadge}>
              <Ionicons name="calendar" size={14} color={activeTheme.primary} />
              <Text style={[styles.metaText, { color: activeTheme.textSecondary }]}>
                {selectedDay} {months[selectedMonth]}
              </Text>
            </View>
            {weather && (
              <View style={styles.metaBadge}>
                <Ionicons name="partly-sunny" size={14} color={activeTheme.primary} />
                <Text style={[styles.metaText, { color: activeTheme.textSecondary }]}>
                  {toCity}: {weather.temperature}°C, {weather.description}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* КЛАСС / ВАГОН / САНАТ ТАҢДАУ */}
        <Text style={[styles.subLabel, { color: activeTheme.textSecondary }]}>
          {transport === 'plane'
            ? 'Ұшақ класын таңдаңыз:'
            : transport === 'train'
            ? 'Поезд вагон түрін таңдаңыз:'
            : 'Автобус санатын таңдаңыз:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {classOptions.map((cls: TravelClassOption, index: number) => {
            const isSelected = cls.id === activeClass.id;
            return (
              <TouchableOpacity
                key={`${cls.id}-${index}`}
                style={[
                  styles.classCard,
                  { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border },
                  isSelected && {
                    backgroundColor: activeTheme.primarySoft,
                    borderColor: activeTheme.primary,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <View style={styles.classTitleRow}>
                  <Ionicons
                    name={activeTheme.icon}
                    size={14}
                    color={isSelected ? activeTheme.primary : activeTheme.textMuted}
                  />
                  <Text style={[styles.classTitle, { color: isSelected ? activeTheme.primary : activeTheme.textMain }]}>
                    {cls.label}
                  </Text>
                </View>
                <Text style={[styles.classDesc, { color: activeTheme.textSecondary }]}>{cls.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* АЙ МЕН КҮН */}
        <Text style={[styles.subLabel, { color: activeTheme.textSecondary }]}>Айды таңдаңыз:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {months.map((month, index) => {
            const isSelected = selectedMonth === index;
            return (
              <TouchableOpacity
                key={`month-${index}`}
                style={[
                  styles.monthItem,
                  { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border },
                  isSelected && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text style={[styles.monthText, { color: isSelected ? activeTheme.primaryText : activeTheme.textSecondary }]}>
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.subLabel, { color: activeTheme.textSecondary }]}>Күнді таңдаңыз:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={`day-${day}`}
                style={[
                  styles.dayCard,
                  { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border },
                  isSelected && { backgroundColor: activeTheme.primary, borderColor: activeTheme.primary },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayNumber, { color: isSelected ? activeTheme.primaryText : activeTheme.textMain }]}>
                  {day}
                </Text>
                <Text style={[styles.dayPrice, { color: isSelected ? activeTheme.primaryText : activeTheme.textMuted }]}>
                  {months[selectedMonth].slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* РЕЙСТЕР ТІЗІМІ */}
        <Text style={[styles.subLabel, { color: activeTheme.textSecondary }]}>
          Қолжетімді рейстер ({activeClass.label}):
        </Text>
        {hasAirportIssue ? (
          <View style={styles.airportWarningCard}>
            <Ionicons name="alert-circle" size={24} color="#FCA5A5" />
            <Text style={styles.airportWarningText}>
              Таңдалған бағытта әуежай жоқ. Ұшақ тек әуежайы бар қалаларға ұшады — Поезд немесе Автобус таңдаңыз!
            </Text>
          </View>
        ) : loadingRoutes ? (
          <ActivityIndicator size="small" color={activeTheme.primary} style={{ marginVertical: 16 }} />
        ) : routes.length === 0 ? (
          <Text style={[styles.emptyRouteText, { color: activeTheme.textMuted }]}>Бұл бағытқа рейстер табылмады.</Text>
        ) : (
          routes.map((route, index) => {
            const isSelected = route.id === activeRoute?.id;
            const classPrice = Math.round(route.basePrice * activeClass.multiplier);
            const usdPrice = (classPrice / usdRate).toFixed(1);
            const cleanRouteNumber = route.id.split('-').slice(0, 2).join('-');
            return (
              <TouchableOpacity
                key={`${route.id}-${index}`}
                style={[
                  styles.routeCard,
                  { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border },
                  isSelected && {
                    borderColor: activeTheme.primary,
                    borderWidth: 2,
                    backgroundColor: activeTheme.primarySoft,
                  },
                ]}
                onPress={() => setSelectedRouteId(route.id)}
              >
                <View style={styles.routeTop}>
                  <View style={styles.carrierRow}>
                    <View style={[styles.carrierIconBox, { backgroundColor: activeTheme.cardElevated }]}>
                      <Ionicons name={activeTheme.icon} size={15} color={activeTheme.primary} />
                    </View>
                    <Text style={[styles.carrierName, { color: activeTheme.textMain }]}>
                      {route.carrier} ({cleanRouteNumber})
                    </Text>
                  </View>
                  <Text style={[styles.routePrice, { color: activeTheme.primary }]}>
                    {classPrice.toLocaleString()} ₸{' '}
                    <Text style={[styles.usdText, { color: activeTheme.textSecondary }]}>(~${usdPrice})</Text>
                  </Text>
                </View>
                <View style={styles.routeBottom}>
                  <View style={styles.inlineIconRow}>
                    <Ionicons name="time-outline" size={15} color={activeTheme.textSecondary} />
                    <Text style={[styles.routeTime, { color: activeTheme.textSecondary }]}>
                      {route.departureTime} — {route.arrivalTime}
                    </Text>
                  </View>
                  <View style={styles.inlineIconRow}>
                    <Ionicons name="hourglass-outline" size={14} color={activeTheme.textMuted} />
                    <Text style={[styles.routeDuration, { color: activeTheme.textMuted }]}>{route.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {activeRoute && !hasAirportIssue && (
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: activeTheme.primary }]} onPress={handleBook}>
            <Ionicons name={activeTheme.icon} size={20} color={activeTheme.primaryText} style={{ marginRight: 8 }} />
            <Text style={[styles.searchBtnText, { color: activeTheme.primaryText }]}>
              Брондау • {finalTicketPrice.toLocaleString()} ₸
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ТӨМЕНГІ НАВИГАЦИЯ ПАНЕЛІ */}
      <View style={[styles.bottomTabBar, { backgroundColor: activeTheme.tabBarBg, borderColor: activeTheme.border }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={23} color={activeTheme.primary} />
          <Text style={[styles.tabLabel, { color: activeTheme.primary }]}>Басты</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToTourism}>
          <Ionicons name="compass-outline" size={23} color={activeTheme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTheme.textSecondary }]}>Туризм</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToTickets}>
          <Ionicons name="ticket-outline" size={23} color={activeTheme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTheme.textSecondary }]}>Билеттер</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToAdmin}>
          <Ionicons name="construct-outline" size={23} color={activeTheme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTheme.textSecondary }]}>Админ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToProfile}>
          <Ionicons name="person-outline" size={23} color={activeTheme.textSecondary} />
          <Text style={[styles.tabLabel, { color: activeTheme.textSecondary }]}>Профиль</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, overflow: 'hidden' },
  ambientGlowTop: { position: 'absolute', width: 320, height: 320, borderRadius: 160, top: -90, right: -80 },
  ambientGlowBottom: { position: 'absolute', width: 280, height: 280, borderRadius: 140, bottom: 50, left: -100 },
  floatingDecorTop: { position: 'absolute', top: 150, right: -25, opacity: 0.7 },
  floatingDecorBottom: { position: 'absolute', bottom: 130, left: -30, opacity: 0.6 },

  container: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 120 },

  heroHeader: { padding: 18, borderRadius: 24, marginBottom: 14, borderWidth: 1, overflow: 'hidden' },
  bannerMegaIcon: { position: 'absolute', right: -15, top: -15, transform: [{ rotate: '-15deg' }] },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, marginBottom: 6 },
  codeBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  headerTitle: { fontSize: 27, fontWeight: '900', letterSpacing: 0.4 },
  modeBadgeText: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  headerIcons: { flexDirection: 'row', gap: 6 },
  topChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  topChipText: { fontSize: 12, fontWeight: '700', marginLeft: 4 },

  transportSwitchWrap: { flexDirection: 'row', padding: 4, borderRadius: 16, borderWidth: 1, gap: 4 },
  transportBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transportBtnText: { fontSize: 13, fontWeight: '800', marginLeft: 6 },

  // Boarding pass карточкасы
  boardingCard: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 12, overflow: 'hidden' },
  routeVisualHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 3 },
  cityCodeBig: { fontSize: 19, fontWeight: '900' },
  changeCityHint: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  routeCenterTrack: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  trackLine: { position: 'absolute', top: 18, width: 70, borderTopWidth: 1.5, borderStyle: 'dashed' },
  swapBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  swapLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },

  ticketPerforationRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14, marginHorizontal: -18 },
  notchLeft: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, marginLeft: -9 },
  dashedSeparator: { flex: 1, borderTopWidth: 1.5, borderStyle: 'dashed', marginHorizontal: 6 },
  notchRight: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, marginRight: -9 },

  ticketMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontWeight: '700' },

  subLabel: { fontSize: 13, marginBottom: 8, marginTop: 10, fontWeight: '800' },
  horizontalScroll: { flexDirection: 'row', marginBottom: 8 },
  classCard: { width: 215, padding: 13, borderRadius: 16, borderWidth: 1, marginRight: 10 },
  classTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  classTitle: { fontSize: 13, fontWeight: '800' },
  classDesc: { fontSize: 11, lineHeight: 15 },

  monthItem: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  monthText: { fontSize: 13, fontWeight: '700' },
  dayCard: { width: 62, height: 68, borderRadius: 16, borderWidth: 1, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontSize: 17, fontWeight: '800' },
  dayPrice: { fontSize: 11, marginTop: 2, fontWeight: '600' },

  airportWarningCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#450A0A', borderColor: '#991B1B', borderWidth: 1, padding: 14, borderRadius: 16, marginVertical: 8 },
  airportWarningText: { flex: 1, fontSize: 13, color: '#FECACA', fontWeight: '600', lineHeight: 18 },
  emptyRouteText: { fontSize: 13, fontStyle: 'italic', marginVertical: 10 },

  routeCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 10 },
  routeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  carrierRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 },
  carrierIconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  carrierName: { fontSize: 14, fontWeight: '800' },
  routePrice: { fontSize: 15, fontWeight: '900' },
  usdText: { fontSize: 11, fontWeight: '500' },
  routeBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  inlineIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  routeTime: { fontSize: 13, fontWeight: '600' },
  routeDuration: { fontSize: 12 },

  searchBtn: { flexDirection: 'row', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  searchBtnText: { fontSize: 16, fontWeight: '900' },

  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 78,
    paddingBottom: 16,
    borderTopWidth: 1,
    elevation: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, fontWeight: '700', marginTop: 3 },
});
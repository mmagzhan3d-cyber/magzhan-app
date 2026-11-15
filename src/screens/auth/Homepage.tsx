import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchDestinationWeather,
  fetchAvailableRoutes,
  fetchUsdRate,
  TRANSPORT_CLASSES,
  WeatherInfo,
  RouteSchedule,
} from '../../services/api';

type TransportType = 'plane' | 'train' | 'bus';

const months = [
  'Қаңтар', 'Ақпан', 'Наурыз', 'Сәуір', 'Мамыр', 'Маусым',
  'Шілде', 'Тамыз', 'Қыркүйек', 'Қазан', 'Қараша', 'Желтоқсан',
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

  const classOptions = TRANSPORT_CLASSES[transport];
  const activeClass = classOptions.find((c) => c.id === selectedClassId) || classOptions[0];

  useEffect(() => {
    fetchUsdRate().then(setUsdRate);
  }, []);

  useEffect(() => {
    fetchDestinationWeather(toCity).then(setWeather);
  }, [toCity]);

  useEffect(() => {
    setSelectedClassId(TRANSPORT_CLASSES[transport][0].id);
  }, [transport]);

  useEffect(() => {
    let active = true;
    setLoadingRoutes(true);
    fetchAvailableRoutes(transport, selectedDay).then((data) => {
      if (active) {
        setRoutes(data);
        if (data.length > 0) setSelectedRouteId(data[0].id);
        setLoadingRoutes(false);
      }
    });
    return () => {
      active = false;
    };
  }, [transport, fromCity, toCity, selectedDay]);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const finalTicketPrice = activeRoute
    ? Math.round(activeRoute.basePrice * activeClass.multiplier)
    : 0;

  const handleBook = () => {
    if (fromCity === toCity) {
      Alert.alert('Қате', 'Жөнелу және келу қалалары бірдей болмауы керек!');
      return;
    }
    if (!activeRoute) return;

    onBookTicket({
      transport,
      travelClass: activeClass.label,
      carrier: `${activeRoute.carrier} • ${activeClass.label}`,
      flightNumber: activeRoute.id,
      from: fromCity,
      to: toCity,
      dateStr: `${selectedDay} ${months[selectedMonth]}, ${activeRoute.departureTime} - ${activeRoute.arrivalTime} (${activeRoute.duration})`,
      pricePerTicket: finalTicketPrice,
      occupiedSeats: activeRoute.occupiedSeats,
    });
  };

  return (
    <View style={styles.mainWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QazTicket</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.topChip} onPress={onNavigateToTourism}>
              <Ionicons name="compass-outline" size={18} color="#FF4500" />
              <Text style={styles.topChipText}>Туризм</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topChip} onPress={onNavigateToAdmin}>
              <Ionicons name="settings-outline" size={18} color="#111827" />
              <Text style={[styles.topChipText, { color: '#111827' }]}>Админ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.transportSelector}>
          {(['plane', 'train', 'bus'] as TransportType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.transportBtn, transport === type && styles.activeTransportBtn]}
              onPress={() => setTransport(type)}
            >
              <Ionicons
                name={type === 'plane' ? 'airplane' : type === 'train' ? 'train' : 'bus'}
                size={20}
                color={transport === type ? '#FFF' : '#6B7280'}
              />
              <Text style={[styles.transportBtnText, transport === type && styles.activeTransportBtnText]}>
                {type === 'plane' ? 'Ұшақ' : type === 'train' ? 'Поезд' : 'Автобус'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subLabel}>
          {transport === 'plane'
            ? 'Ұшақ класын таңдаңыз:'
            : transport === 'train'
            ? 'Поезд вагон түрін таңдаңыз:'
            : 'Автобус санатын таңдаңыз:'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {classOptions.map((cls) => {
            const isSelected = cls.id === activeClass.id;
            return (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, isSelected && styles.activeClassCard]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Text style={[styles.classTitle, isSelected && styles.activeClassTitle]}>{cls.label}</Text>
                <Text style={[styles.classDesc, isSelected && styles.activeClassDesc]}>{cls.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.searchCard}>
          <TouchableOpacity style={styles.locationRow} onPress={() => onOpenCitySelect('from')}>
            <Ionicons name="location-outline" size={22} color="#FF4500" style={styles.fieldIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locLabel}>Қайдан</Text>
              <Text style={styles.locName}>{fromCity}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.swapBtn} onPress={onSwapCities}>
              <Ionicons name="swap-vertical" size={18} color="#FF4500" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.locationRow} onPress={() => onOpenCitySelect('to')}>
            <Ionicons name="flag-outline" size={22} color="#FF4500" style={styles.fieldIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locLabel}>Қайда</Text>
              <Text style={styles.locName}>{toCity}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {weather && (
          <View style={styles.weatherBanner}>
            <Ionicons name="partly-sunny-outline" size={22} color="#0284C7" />
            <Text style={styles.weatherText}>
              {toCity}: <Text style={{ fontWeight: '700' }}>{weather.temperature}°C</Text>, {weather.description} (жел {weather.windspeed} км/сағ)
            </Text>
          </View>
        )}

        <Text style={styles.subLabel}>Айды таңдаңыз:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.monthItem, selectedMonth === index && styles.activeMonthItem]}
              onPress={() => setSelectedMonth(index)}
            >
              <Text style={[styles.monthText, selectedMonth === index && styles.activeMonthText]}>{month}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.subLabel}>Күнді таңдаңыз:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCard, isSelected && styles.activeDayCard]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayNumber, isSelected && styles.activeDayNumber]}>{day}</Text>
                <Text style={[styles.dayPrice, isSelected && styles.activeDayPrice]}>
                  {months[selectedMonth].slice(0, 3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.subLabel}>Қолжетімді рейстер ({activeClass.label}):</Text>
        {loadingRoutes ? (
          <ActivityIndicator size="small" color="#FF4500" style={{ marginVertical: 16 }} />
        ) : routes.length === 0 ? (
          <Text style={styles.emptyRouteText}>Бұл көлік түріне рейстер жоқ. Админ панельден қосыңыз.</Text>
        ) : (
          routes.map((route) => {
            const isSelected = route.id === activeRoute?.id;
            const classPrice = Math.round(route.basePrice * activeClass.multiplier);
            const usdPrice = (classPrice / usdRate).toFixed(1);
            return (
              <TouchableOpacity
                key={route.id}
                style={[styles.routeCard, isSelected && styles.activeRouteCard]}
                onPress={() => setSelectedRouteId(route.id)}
              >
                <View style={styles.routeTop}>
                  <Text style={styles.carrierName}>{route.carrier} ({route.id})</Text>
                  <Text style={styles.routePrice}>
                    {classPrice.toLocaleString()} ₸ <Text style={styles.usdText}>(~${usdPrice})</Text>
                  </Text>
                </View>
                <View style={styles.routeBottom}>
                  <View style={styles.inlineIconRow}>
                    <Ionicons name="time-outline" size={15} color="#4B5563" />
                    <Text style={styles.routeTime}>{route.departureTime} - {route.arrivalTime}</Text>
                  </View>
                  <View style={styles.inlineIconRow}>
                    <Ionicons name="hourglass-outline" size={14} color="#6B7280" />
                    <Text style={styles.routeDuration}>{route.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {activeRoute && (
          <TouchableOpacity style={styles.searchBtn} onPress={handleBook}>
            <Text style={styles.searchBtnText}>
              Брондау • {finalTicketPrice.toLocaleString()} ₸
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={23} color="#FF4500" />
          <Text style={[styles.tabLabel, { color: '#FF4500' }]}>Басты</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToTourism}>
          <Ionicons name="compass-outline" size={23} color="#6B7280" />
          <Text style={styles.tabLabel}>Туризм</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToTickets}>
          <Ionicons name="ticket-outline" size={23} color="#6B7280" />
          <Text style={styles.tabLabel}>Билеттер</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToAdmin}>
          <Ionicons name="construct-outline" size={23} color="#6B7280" />
          <Text style={styles.tabLabel}>Админ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToProfile}>
          <Ionicons name="person-outline" size={23} color="#6B7280" />
          <Text style={styles.tabLabel}>Профиль</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 14 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  topChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  topChipText: { fontSize: 12, fontWeight: '700', color: '#FF4500', marginLeft: 4 },
  transportSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  transportBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 11, marginHorizontal: 3, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  activeTransportBtn: { backgroundColor: '#FF4500', borderColor: '#FF4500' },
  transportBtnText: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginLeft: 5 },
  activeTransportBtnText: { color: '#FFF' },
  subLabel: { fontSize: 13, color: '#4B5563', marginBottom: 8, marginTop: 10, fontWeight: '700' },
  horizontalScroll: { flexDirection: 'row', marginBottom: 8 },
  classCard: { width: 210, backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 10 },
  activeClassCard: { backgroundColor: '#FFF5F2', borderColor: '#FF4500', borderWidth: 2 },
  classTitle: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  activeClassTitle: { color: '#FF4500' },
  classDesc: { fontSize: 11, color: '#6B7280', lineHeight: 15 },
  activeClassDesc: { color: '#374151' },
  searchCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 6, marginBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  fieldIcon: { marginRight: 12 },
  locLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  locName: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  divider: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  swapBtn: { backgroundColor: '#FFF5F2', padding: 7, borderRadius: 20, borderWidth: 1, borderColor: '#FFEDD5', marginLeft: 10 },
  weatherBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', padding: 11, borderRadius: 12, marginBottom: 10 },
  weatherText: { fontSize: 13, color: '#0369A1', marginLeft: 8, flex: 1 },
  monthItem: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  activeMonthItem: { backgroundColor: '#FF4500', borderColor: '#FF4500' },
  monthText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  activeMonthText: { color: '#FFF' },
  dayCard: { width: 60, height: 66, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  activeDayCard: { backgroundColor: '#FF4500', borderColor: '#FF4500' },
  dayNumber: { fontSize: 17, fontWeight: '700', color: '#111827' },
  activeDayNumber: { color: '#FFF' },
  dayPrice: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activeDayPrice: { color: '#FFF' },
  emptyRouteText: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', marginVertical: 10 },
  routeCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  activeRouteCard: { borderColor: '#FF4500', borderWidth: 2, backgroundColor: '#FFF9F7' },
  routeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  carrierName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  routePrice: { fontSize: 15, fontWeight: '800', color: '#FF4500' },
  usdText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  routeBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  inlineIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  routeTime: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  routeDuration: { fontSize: 12, color: '#6B7280' },
  searchBtn: { backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  searchBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 78,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginTop: 3 },
});
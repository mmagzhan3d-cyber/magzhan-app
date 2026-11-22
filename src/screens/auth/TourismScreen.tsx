import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTourismPackages, fetchWeatherByCoords, WeatherInfo, TourismPackage } from '../../services/api';
import { BookingDetails } from '../../App';
import { THEME } from '../../theme';

interface Props {
  onBookTour: (details: BookingDetails) => void;
  onBack: () => void;
}

export default function TourismScreen({ onBookTour, onBack }: Props) {
  const [packages, setPackages] = useState<TourismPackage[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherInfo | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const tours = await fetchTourismPackages();
        if (!active) return;
        setPackages(Array.isArray(tours) ? tours : []);

        const results: Record<string, WeatherInfo | null> = {};
        for (const tour of Array.isArray(tours) ? tours : []) {
          if (tour?.lat && tour?.lon) {
            results[tour.id] = await fetchWeatherByCoords(tour.lat, tour.lon);
          }
        }
        if (active) {
          setWeatherMap(results);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleSelectTour = (tour: TourismPackage) => {
    const safePrice = Number(tour?.price || 0);
    onBookTour({
      transport: 'bus',
      travelClass: 'Туристік пакет (All-Inclusive)',
      carrier: `QazTourism • ${tour?.title || 'Тур'}`,
      flightNumber: tour?.id || 'TOUR-01',
      from: 'Алматы / Астана',
      to: tour?.city || 'Қазақстан',
      dateStr: `Тур ұзақтығы: ${tour?.duration || '2 күн'}`,
      pricePerTicket: isNaN(safePrice) ? 0 : safePrice,
      occupiedSeats: ['A1', 'B2'],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Қазақстан Туризмі</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.heroBanner}>
          <Ionicons name="compass" size={110} color="rgba(56, 189, 248, 0.12)" style={styles.bannerWatermark} />
          <Text style={styles.heroTitle}>Ішкі туризм және демалыс аймақтары</Text>
          <Text style={styles.heroSub}>
            Көлсай, Бурабай, Бозжыра және Түркістан бағыттарына дайын турпакеттер мен нақты ауа райы
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME.primary} style={{ marginVertical: 24 }} />
        ) : packages.length === 0 ? (
          <Text style={styles.emptyText}>Туристік пакеттер табылмады</Text>
        ) : (
          packages.map((tour, index) => {
            const w = weatherMap[tour?.id];
            const safePrice = Number(tour?.price || 0);
            return (
              <View key={`${tour?.id || index}-${index}`} style={styles.tourCard}>
                <View style={styles.tourTop}>
                  <View style={styles.cityBadge}>
                    <Ionicons name="location" size={14} color={THEME.primary} />
                    <Text style={styles.cityText}>{tour?.city || 'Қазақстан'}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="#FBBF24" />
                    <Text style={styles.ratingText}>{tour?.rating || '4.9'}</Text>
                  </View>
                </View>

                <Text style={styles.tourTitle}>{tour?.title || 'Туристік бағыт'}</Text>
                <View style={styles.durationRow}>
                  <Ionicons name="calendar-outline" size={15} color={THEME.textSecondary} />
                  <Text style={styles.tourDuration}>{tour?.duration || '2 күн'}</Text>
                </View>
                <Text style={styles.tourHighlights}>{tour?.highlights || ''}</Text>

                {w && (
                  <View style={styles.weatherStrip}>
                    <Ionicons name="sunny" size={16} color={THEME.primary} />
                    <Text style={styles.weatherStripText}>
                      Курорттағы ауа райы (API): {w.temperature}°C, {w.description}
                    </Text>
                  </View>
                )}

                <View style={styles.tourFooter}>
                  <View>
                    <Text style={styles.priceLabel}>1 адамға бағасы</Text>
                    <Text style={styles.priceValue}>{(isNaN(safePrice) ? 0 : safePrice).toLocaleString()} ₸</Text>
                  </View>
                  <TouchableOpacity style={styles.bookTourBtn} onPress={() => handleSelectTour(tour)}>
                    <Text style={styles.bookTourBtnText}>Турды брондау</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textMain },
  heroBanner: { backgroundColor: '#0F2544', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#1E3A5F', marginBottom: 18, overflow: 'hidden' },
  bannerWatermark: { position: 'absolute', right: -15, bottom: -15 },
  heroTitle: { color: THEME.textMain, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: THEME.textSecondary, fontSize: 13, lineHeight: 18 },
  emptyText: { textAlign: 'center', color: THEME.textMuted, marginTop: 20, fontSize: 15 },
  tourCard: { backgroundColor: THEME.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  tourTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#163356', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cityText: { fontSize: 12, fontWeight: '700', color: THEME.primary, marginLeft: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3B2B12', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#FBBF24', marginLeft: 4 },
  tourTitle: { fontSize: 18, fontWeight: '800', color: THEME.textMain, marginBottom: 4 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  tourDuration: { fontSize: 13, fontWeight: '600', color: THEME.textSecondary },
  tourHighlights: { fontSize: 13, color: THEME.textSecondary, lineHeight: 19, marginBottom: 12 },
  weatherStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#142C4A', padding: 9, borderRadius: 10, marginBottom: 14 },
  weatherStripText: { fontSize: 12, color: THEME.primary, fontWeight: '700', marginLeft: 6 },
  tourFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: THEME.border, paddingTop: 12 },
  priceLabel: { fontSize: 11, color: THEME.textMuted },
  priceValue: { fontSize: 19, fontWeight: '900', color: THEME.primary },
  bookTourBtn: { backgroundColor: THEME.primary, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 12 },
  bookTourBtnText: { color: '#090D16', fontWeight: '800', fontSize: 14 },
});
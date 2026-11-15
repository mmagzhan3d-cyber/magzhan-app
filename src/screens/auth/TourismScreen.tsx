import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TOURISM_PACKAGES, fetchWeatherByCoords, WeatherInfo, TourismPackage } from '../../services/api';
import { BookingDetails } from '../../App';

interface Props {
  onBookTour: (details: BookingDetails) => void;
  onBack: () => void;
}

export default function TourismScreen({ onBookTour, onBack }: Props) {
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherInfo | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results: Record<string, WeatherInfo | null> = {};
      for (const tour of TOURISM_PACKAGES) {
        results[tour.id] = await fetchWeatherByCoords(tour.lat, tour.lon);
      }
      setWeatherMap(results);
      setLoading(false);
    })();
  }, []);

  const handleSelectTour = (tour: TourismPackage) => {
    onBookTour({
      transport: 'bus',
      travelClass: 'Туристік пакет (All-Inclusive)',
      carrier: `QazTourism • ${tour.title}`,
      flightNumber: tour.id,
      from: 'Алматы / Астана',
      to: tour.city,
      dateStr: `Тур ұзақтығы: ${tour.duration}`,
      pricePerTicket: tour.price,
      occupiedSeats: ['A1', 'B2'],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Қазақстан Туризмі</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>Ішкі туризм және демалыс аймақтары</Text>
          <Text style={styles.heroSub}>
            Көлсай, Бурабай, Бозжыра және Түркістан бағыттарына дайын турпакеттер мен нақты ауа райы
          </Text>
        </View>

        {loading && <ActivityIndicator size="small" color="#FF4500" style={{ marginBottom: 14 }} />}

        {TOURISM_PACKAGES.map((tour) => {
          const w = weatherMap[tour.id];
          return (
            <View key={tour.id} style={styles.tourCard}>
              <View style={styles.tourTop}>
                <View style={styles.cityBadge}>
                  <Ionicons name="location" size={14} color="#FF4500" />
                  <Text style={styles.cityText}>{tour.city}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{tour.rating}</Text>
                </View>
              </View>

              <Text style={styles.tourTitle}>{tour.title}</Text>
              <View style={styles.durationRow}>
                <Ionicons name="calendar-outline" size={15} color="#6B7280" />
                <Text style={styles.tourDuration}>{tour.duration}</Text>
              </View>
              <Text style={styles.tourHighlights}>{tour.highlights}</Text>

              {w && (
                <View style={styles.weatherStrip}>
                  <Ionicons name="sunny-outline" size={16} color="#0284C7" />
                  <Text style={styles.weatherStripText}>
                    Курорттағы ауа райы (API): {w.temperature}°C, {w.description}
                  </Text>
                </View>
              )}

              <View style={styles.tourFooter}>
                <View>
                  <Text style={styles.priceLabel}>1 адамға бағасы</Text>
                  <Text style={styles.priceValue}>{tour.price.toLocaleString()} ₸</Text>
                </View>
                <TouchableOpacity style={styles.bookTourBtn} onPress={() => handleSelectTour(tour)}>
                  <Text style={styles.bookTourBtnText}>Турды брондау</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  heroBanner: { backgroundColor: '#111827', padding: 20, borderRadius: 16, marginBottom: 18 },
  heroTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: '#9CA3AF', fontSize: 13, lineHeight: 18 },
  tourCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  tourTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cityText: { fontSize: 12, fontWeight: '700', color: '#FF4500', marginLeft: 4 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#B45309', marginLeft: 4 },
  tourTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  tourDuration: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tourHighlights: { fontSize: 13, color: '#374151', lineHeight: 19, marginBottom: 12 },
  weatherStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', padding: 8, borderRadius: 8, marginBottom: 14 },
  weatherStripText: { fontSize: 12, color: '#0369A1', fontWeight: '600', marginLeft: 6 },
  tourFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  priceValue: { fontSize: 18, fontWeight: '800', color: '#FF4500' },
  bookTourBtn: { backgroundColor: '#FF4500', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  bookTourBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
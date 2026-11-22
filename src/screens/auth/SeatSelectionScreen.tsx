import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDetails } from '../../App';
import { TRANSPORT_THEMES } from '../../theme';

interface Props {
  bookingDetails: BookingDetails;
  onNext: (seats: string[], totalPrice: number) => void;
  onBack: () => void;
}

export default function SeatSelectionScreen({ bookingDetails, onNext, onBack }: Props) {
  const activeTheme = TRANSPORT_THEMES[bookingDetails?.transport || 'plane'];

  const requiredSeats = bookingDetails?.passengers?.length || 1;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const occupiedSeats = bookingDetails?.occupiedSeats || ['A2', 'B4', 'C1', 'D5', 'A6'];
  const rows = ['A', 'B', 'C', 'D'];
  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleSeatPress = (seatCode: string) => {
    if (occupiedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      if (selectedSeats.length >= requiredSeats) {
        Alert.alert('Назар аударыңыз', `Сіз тек ${requiredSeats} орын таңдай аласыз.`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const unitPrice = Number(bookingDetails?.pricePerTicket || 0);
  const rawTotal = Number(bookingDetails?.totalPrice ?? requiredSeats * unitPrice);
  const totalPrice = isNaN(rawTotal) ? 0 : rawTotal;

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <View pointerEvents="none" style={[styles.glowTop, { backgroundColor: activeTheme.glowColor }]} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color={activeTheme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeTheme.textMain }]}>
          Орын таңдау ({selectedSeats.length}/{requiredSeats})
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.legendRow, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border, borderWidth: 1 }]} />
          <Text style={[styles.legendText, { color: activeTheme.textSecondary }]}>Бос</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: activeTheme.primary }]} />
          <Text style={[styles.legendText, { color: activeTheme.textSecondary }]}>Таңдалған</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          <Text style={[styles.legendText, { color: activeTheme.textMuted }]}>Бос емес</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cabin} showsVerticalScrollIndicator={false}>
        <View style={[styles.frontIndicator, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}>
          <Ionicons name={activeTheme.icon} size={18} color={activeTheme.primary} />
          <Text style={[styles.frontText, { color: activeTheme.textSecondary }]}>
            Алдыңғы жағы ({bookingDetails?.carrier || 'Салон басы'})
          </Text>
        </View>

        {numbers.map((num) => (
          <View key={num} style={styles.row}>
            {rows.map((letter, idx) => {
              const seatCode = `${letter}${num}`;
              const isOccupied = occupiedSeats.includes(seatCode);
              const isSelected = selectedSeats.includes(seatCode);

              return (
                <React.Fragment key={seatCode}>
                  {idx === 2 && <View style={{ width: 22 }} />}
                  <TouchableOpacity
                    disabled={isOccupied}
                    style={[
                      styles.seat,
                      {
                        backgroundColor: isSelected
                          ? activeTheme.primary
                          : isOccupied
                          ? 'rgba(255,255,255,0.06)'
                          : activeTheme.cardBg,
                        borderColor: isSelected
                          ? activeTheme.primary
                          : isOccupied
                          ? 'transparent'
                          : activeTheme.border,
                      },
                    ]}
                    onPress={() => handleSeatPress(seatCode)}
                  >
                    <Text
                      style={[
                        styles.seatText,
                        {
                          color: isSelected
                            ? activeTheme.primaryText
                            : isOccupied
                            ? activeTheme.textMuted
                            : activeTheme.textMain,
                        },
                      ]}
                    >
                      {seatCode}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
        <Text style={[styles.totalText, { color: activeTheme.textMain }]}>
          Жалпы сомасы: <Text style={{ color: activeTheme.primary }}>{(totalPrice || 0).toLocaleString()} ₸</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: selectedSeats.length === requiredSeats ? activeTheme.primary : activeTheme.cardElevated },
          ]}
          disabled={selectedSeats.length !== requiredSeats}
          onPress={() => onNext(selectedSeats, totalPrice)}
        >
          <Text
            style={[
              styles.confirmBtnText,
              { color: selectedSeats.length === requiredSeats ? activeTheme.primaryText : activeTheme.textMuted },
            ]}
          >
            Төлемге өту
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, overflow: 'hidden' },
  glowTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, fontWeight: '700' },
  cabin: { alignItems: 'center', paddingVertical: 14 },
  frontIndicator: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, width: '100%', justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
  frontText: { fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  seat: { width: 48, height: 48, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  seatText: { fontSize: 12, fontWeight: '800' },
  footer: { marginTop: 'auto', padding: 16, borderRadius: 18, borderWidth: 1 },
  totalText: { fontSize: 16, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  confirmBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  confirmBtnText: { fontSize: 16, fontWeight: '800' },
});
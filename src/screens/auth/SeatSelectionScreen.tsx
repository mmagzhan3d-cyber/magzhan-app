import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDetails } from '../../App';
interface Props {
  bookingDetails: BookingDetails;
  onNext: (seats: string[], totalPrice: number) => void;
  onBack: () => void;
}

export default function SeatSelectionScreen({ bookingDetails, onNext, onBack }: Props) {
  const requiredSeats = bookingDetails.passengers?.length || 1;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const occupiedSeats = bookingDetails.occupiedSeats || ['A2', 'B4', 'C1', 'D5', 'A6'];
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

  const totalPrice = bookingDetails.totalPrice || requiredSeats * bookingDetails.pricePerTicket;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Орын таңдау ({selectedSeats.length}/{requiredSeats})
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#FFF', borderColor: '#D1D5DB', borderWidth: 1 }]} />
          <Text style={styles.legendText}>Бос</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#FF4500' }]} />
          <Text style={styles.legendText}>Таңдалған</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>Бос емес</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cabin} showsVerticalScrollIndicator={false}>
        <View style={styles.frontIndicator}>
          <Text style={styles.frontText}>Алдыңғы жағы ({bookingDetails.carrier || 'Салон басы'})</Text>
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
                      isOccupied && styles.occupiedSeat,
                      isSelected && styles.selectedSeat,
                    ]}
                    onPress={() => handleSeatPress(seatCode)}
                  >
                    <Text style={[styles.seatText, isSelected && styles.selectedSeatText]}>{seatCode}</Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalText}>Жалпы сомасы: {totalPrice.toLocaleString()} ₸</Text>
        <TouchableOpacity
          style={[styles.confirmBtn, selectedSeats.length !== requiredSeats && { backgroundColor: '#9CA3AF' }]}
          disabled={selectedSeats.length !== requiredSeats}
          onPress={() => onNext(selectedSeats, totalPrice)}
        >
          <Text style={styles.confirmBtnText}>Төлемге өту</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, backgroundColor: '#FFF', padding: 10, borderRadius: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  cabin: { alignItems: 'center', paddingVertical: 14 },
  frontIndicator: { backgroundColor: '#E5E7EB', padding: 8, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 22 },
  frontText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', marginBottom: 12, justifyContent: 'center' },
  seat: { width: 48, height: 48, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  occupiedSeat: { backgroundColor: '#E5E7EB', borderColor: '#E5E7EB' },
  selectedSeat: { backgroundColor: '#FF4500', borderColor: '#FF4500' },
  seatText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  selectedSeatText: { color: '#FFF' },
  footer: { marginTop: 'auto', backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  totalText: { fontSize: 16, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  confirmBtn: { backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
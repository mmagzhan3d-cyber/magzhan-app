import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDetails } from '../../App';
import { apiProcessPayment } from '../../services/api';

interface Props {
  bookingDetails: BookingDetails;
  onSuccess: (transactionId?: string) => void;
  onBack: () => void;
}

export default function PaymentScreen({ bookingDetails, onSuccess, onBack }: Props) {
  const [method, setMethod] = useState<'card' | 'qr'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    if (method === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        Alert.alert('Қате', 'Карта нөмірі 16 саннан тұруы тиіс!');
        return;
      }
      if (expiry.length < 4 || cvc.length < 3) {
        Alert.alert('Қате', 'Карта мерзімі мен CVC кодын толық енгізіңіз!');
        return;
      }
    }

    setProcessing(true);
    try {
      const res = await apiProcessPayment(bookingDetails.totalPrice || 0, method);
      Alert.alert('Сәтті төленді', `Транзакция ID: ${res.transactionId}`);
      onSuccess(res.transactionId);
    } catch {
      Alert.alert('Қате', 'Төлемді өңдеу кезінде қате шықты');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Төлем жасау</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.route}>
          {bookingDetails.from} - {bookingDetails.to}
        </Text>
        {bookingDetails.carrier && (
          <Text style={styles.carrier}>
            {bookingDetails.carrier} ({bookingDetails.flightNumber})
          </Text>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.date}>{bookingDetails.dateStr}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="grid-outline" size={16} color="#6B7280" />
          <Text style={styles.seats}>Таңдалған орындар: {bookingDetails.selectedSeats?.join(', ')}</Text>
        </View>

        <Text style={styles.price}>Төлем сомасы: {bookingDetails.totalPrice?.toLocaleString()} ₸</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, method === 'card' && styles.activeTab]} onPress={() => setMethod('card')}>
          <Text style={method === 'card' ? styles.activeTabText : styles.tabText}>Банк картасы</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, method === 'qr' && styles.activeTab]} onPress={() => setMethod('qr')}>
          <Text style={method === 'qr' ? styles.activeTabText : styles.tabText}>Kaspi / Halyk QR</Text>
        </TouchableOpacity>
      </View>

      {method === 'card' ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Карта нөмірі (16 таңба)"
            keyboardType="numeric"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput
              style={[styles.input, { flex: 0.45 }]}
              placeholder="Мерзімі (ММ/ЖЖ)"
              keyboardType="numeric"
              maxLength={5}
              value={expiry}
              onChangeText={setExpiry}
            />
            <TextInput
              style={[styles.input, { flex: 0.45 }]}
              placeholder="CVC"
              keyboardType="numeric"
              secureTextEntry
              maxLength={3}
              value={cvc}
              onChangeText={setCvc}
            />
          </View>
        </View>
      ) : (
        <View style={styles.qrContainer}>
          <Ionicons name="qr-code" size={170} color="#111827" />
          <Text style={styles.qrHint}>Kaspi.kz немесе Halyk қосымшасы арқылы QR-кодты сканерлеңіз</Text>
        </View>
      )}

      <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={processing}>
        {processing ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.payBtnText}>Төлемді растау</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  summaryCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
  route: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  carrier: { fontSize: 13, fontWeight: '600', color: '#FF4500', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  date: { fontSize: 14, color: '#6B7280' },
  seats: { fontSize: 14, color: '#6B7280' },
  price: { fontSize: 17, fontWeight: '800', color: '#FF4500', marginTop: 6 },
  tabContainer: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderColor: '#E5E7EB' },
  activeTab: { borderColor: '#FF4500' },
  tabText: { color: '#6B7280', fontWeight: '600' },
  activeTabText: { color: '#FF4500', fontWeight: '700' },
  form: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { borderBottomWidth: 1, borderColor: '#E5E7EB', paddingVertical: 10, fontSize: 16, marginBottom: 15 },
  qrContainer: { alignItems: 'center', padding: 16 },
  qrHint: { textAlign: 'center', color: '#6B7280', marginTop: 12, fontSize: 14 },
  payBtn: { backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
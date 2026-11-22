import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDetails, UserProfile } from '../../App';
import { TRANSPORT_THEMES } from '../../theme';

interface Props {
  bookingDetails: BookingDetails;
  defaultPassenger: UserProfile;
  onNext: (passengers: { name: string; document: string; type: 'adult' | 'child' }[], totalPrice: number) => void;
  onBack: () => void;
}

export default function PassengersScreen({ bookingDetails, defaultPassenger, onNext, onBack }: Props) {
  const activeTheme = TRANSPORT_THEMES[bookingDetails?.transport || 'plane'];

  const [passengers, setPassengers] = useState<{ name: string; document: string; type: 'adult' | 'child' }[]>([
    {
      name: defaultPassenger?.fullName || '',
      document: defaultPassenger?.iin || '',
      type: 'adult',
    },
  ]);

  const unitPrice = Number(bookingDetails?.pricePerTicket || 0);
  const childPrice = Math.round(unitPrice * 0.5);

  const addPassenger = (type: 'adult' | 'child') => {
    if (passengers.length >= 6) {
      Alert.alert('Шектеу', 'Бір ретте ең көбі 6 жолаушы қосуға болады.');
      return;
    }
    setPassengers([...passengers, { name: '', document: '', type }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const updatePassenger = (index: number, field: 'name' | 'document', value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const totalPrice = passengers.reduce((sum, p) => {
    const price = p.type === 'child' ? childPrice : unitPrice;
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const handleContinue = () => {
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim() || !passengers[i].document.trim()) {
        Alert.alert('Қате', `${i + 1}-жолаушының аты-жөні мен ЖСН/құжат нөмірін толтырыңыз!`);
        return;
      }
    }
    onNext(passengers, totalPrice);
  };

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
        <Text style={[styles.headerTitle, { color: activeTheme.textMain }]}>Жолаушылар ({passengers.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.routeSummary, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
        <View style={styles.routeTop}>
          <Ionicons name={activeTheme.icon} size={18} color={activeTheme.primary} />
          <Text style={[styles.routeTitle, { color: activeTheme.textMain }]} numberOfLines={1}>
            {bookingDetails?.from} — {bookingDetails?.to}
          </Text>
        </View>
        <Text style={[styles.routeSub, { color: activeTheme.textSecondary }]}>{bookingDetails?.dateStr}</Text>
      </View>

      {/* ЕРЕСЕК / БАЛА ҚОСУ БАТЫРМАЛАРЫ (СӨЗДЕРІ БАТЫРМАДАН АСПАЙТЫН ЕТІП ЖАСАЛҒАН) */}
      <View style={styles.addRow}>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.primary }]}
          onPress={() => addPassenger('adult')}
          activeOpacity={0.8}
        >
          <View style={styles.addBtnTop}>
            <Ionicons name="person-add" size={15} color={activeTheme.primary} />
            <Text style={[styles.addBtnTitle, { color: activeTheme.textMain }]}>+ Ересек</Text>
          </View>
          <Text style={[styles.addBtnPrice, { color: activeTheme.primary }]}>
            {unitPrice.toLocaleString()} ₸
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
          onPress={() => addPassenger('child')}
          activeOpacity={0.8}
        >
          <View style={styles.addBtnTop}>
            <Ionicons name="happy" size={15} color={activeTheme.primary} />
            <Text style={[styles.addBtnTitle, { color: activeTheme.textMain }]}>+ Бала (-50%)</Text>
          </View>
          <Text style={[styles.addBtnPrice, { color: activeTheme.primary }]}>
            {childPrice.toLocaleString()} ₸
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {passengers.map((p, index) => (
          <View
            key={index}
            style={[styles.passengerCard, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <Ionicons name="person" size={15} color={activeTheme.primary} />
                <Text style={[styles.cardTitle, { color: activeTheme.textMain }]} numberOfLines={1}>
                  {index + 1}-жолаушы • {p.type === 'adult' ? 'Ересек' : 'Бала (50%)'}
                </Text>
              </View>
              {passengers.length > 1 && (
                <TouchableOpacity style={styles.trashBtn} onPress={() => removePassenger(index)}>
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: activeTheme.background,
                  borderColor: activeTheme.border,
                  color: activeTheme.textMain,
                },
              ]}
              placeholder="Аты-жөні (Толық)"
              placeholderTextColor={activeTheme.textMuted}
              value={p.name}
              onChangeText={(val) => updatePassenger(index, 'name', val)}
            />

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: activeTheme.background,
                  borderColor: activeTheme.border,
                  color: activeTheme.textMain,
                  marginBottom: 0,
                },
              ]}
              placeholder="ЖСН немесе Паспорт нөмірі"
              placeholderTextColor={activeTheme.textMuted}
              keyboardType="numeric"
              maxLength={12}
              value={p.document}
              onChangeText={(val) => updatePassenger(index, 'document', val)}
            />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: activeTheme.tabBarBg, borderColor: activeTheme.border }]}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[styles.totalLabel, { color: activeTheme.textSecondary }]}>Жалпы сомасы:</Text>
          <Text style={[styles.totalValue, { color: activeTheme.primary }]} numberOfLines={1}>
            {(totalPrice || 0).toLocaleString()} ₸
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: activeTheme.primary }]}
          onPress={handleContinue}
        >
          <Text style={[styles.nextBtnText, { color: activeTheme.primaryText }]}>Орын таңдау</Text>
          <Ionicons name="arrow-forward" size={18} color={activeTheme.primaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, overflow: 'hidden' },
  glowTop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -80, right: -80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 19, fontWeight: '800' },
  routeSummary: { padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  routeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  routeTitle: { fontSize: 16, fontWeight: '800', flex: 1 },
  routeSub: { fontSize: 12 },

  addRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  addBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  addBtnTop: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  addBtnTitle: { fontSize: 13, fontWeight: '800' },
  addBtnPrice: { fontSize: 13, fontWeight: '900' },

  passengerCard: { padding: 16, borderRadius: 18, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', flex: 1 },
  trashBtn: { padding: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginBottom: 10 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 12, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '900' },
  nextBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14 },
  nextBtnText: { fontSize: 15, fontWeight: '800' },
});
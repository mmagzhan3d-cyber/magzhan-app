import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllAdminRoutes, saveAllAdminRoutes, RouteSchedule } from '../../services/api';

interface Props {
  onBack: () => void;
}

export default function AdminPanelScreen({ onBack }: Props) {
  const [routes, setRoutes] = useState<RouteSchedule[]>([]);
  const [transport, setTransport] = useState<'plane' | 'train' | 'bus'>('plane');
  const [carrier, setCarrier] = useState('');
  const [flightId, setFlightId] = useState('');
  const [depTime, setDepTime] = useState('10:00');
  const [arrTime, setArrTime] = useState('12:00');
  const [duration, setDuration] = useState('2 сағ 00 мин');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    getAllAdminRoutes().then(setRoutes);
  }, []);

  const resetForm = () => {
    setCarrier('');
    setFlightId('');
    setDepTime('10:00');
    setArrTime('12:00');
    setDuration('2 сағ 00 мин');
    setPrice('');
    setEditingId(null);
  };

  const handleSaveRoute = async () => {
    const numPrice = Number(price);
    if (!carrier.trim() || !flightId.trim() || isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Қате', 'Тасымалдаушы, рейс нөмірі және бағасын дұрыс толтырыңыз!');
      return;
    }

    let updated: RouteSchedule[];
    if (editingId) {
      updated = routes.map((r) =>
        r.id === editingId
          ? {
              ...r,
              transport,
              carrier: carrier.trim(),
              id: flightId.trim(),
              departureTime: depTime,
              arrivalTime: arrTime,
              duration,
              basePrice: numPrice,
            }
          : r
      );
      Alert.alert('Жаңартылды', 'Рейс деректері сәтті өзгертілді!');
    } else {
      const newRoute: RouteSchedule = {
        id: flightId.trim().toUpperCase(),
        transport,
        carrier: carrier.trim(),
        departureTime: depTime,
        arrivalTime: arrTime,
        duration,
        basePrice: numPrice,
        occupiedSeats: ['A1', 'B2'],
      };
      updated = [newRoute, ...routes];
      Alert.alert('Қосылды', 'Жаңа рейс жүйеге енгізілді!');
    }

    setRoutes(updated);
    await saveAllAdminRoutes(updated);
    resetForm();
  };

  const handleEditClick = (item: RouteSchedule) => {
    setEditingId(item.id);
    setTransport(item.transport);
    setCarrier(item.carrier);
    setFlightId(item.id);
    setDepTime(item.departureTime);
    setArrTime(item.arrivalTime);
    setDuration(item.duration);
    setPrice(String(item.basePrice));
  };

  const handleDeleteClick = (id: string) => {
    Alert.alert('Өшіру', 'Бұл рейсті жүйеден өшіруге сенімдісіз бе?', [
      { text: 'Жоқ', style: 'cancel' },
      {
        text: 'Өшіру',
        style: 'destructive',
        onPress: async () => {
          const updated = routes.filter((r) => r.id !== id);
          setRoutes(updated);
          await saveAllAdminRoutes(updated);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Админ Панель (Басқару)</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>
            {editingId ? `Рейсті өңдеу: ${editingId}` : 'Жаңа рейс / тариф қосу'}
          </Text>

          <View style={styles.typeRow}>
            {(['plane', 'train', 'bus'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, transport === t && styles.activeTypeBtn]}
                onPress={() => setTransport(t)}
              >
                <Text style={[styles.typeText, transport === t && styles.activeTypeText]}>
                  {t === 'plane' ? 'Ұшақ' : t === 'train' ? 'Поезд' : 'Автобус'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Тасымалдаушы (мысалы: Air Astana, Тальго)"
            value={carrier}
            onChangeText={setCarrier}
          />
          <TextInput
            style={styles.input}
            placeholder="Рейс нөмірі (мысалы: KC-999)"
            value={flightId}
            onChangeText={setFlightId}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Шығу (10:00)" value={depTime} onChangeText={setDepTime} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Келу (12:00)" value={arrTime} onChangeText={setArrTime} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Базалық бағасы (₸)"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[styles.saveBtn, { flex: 1 }]} onPress={handleSaveRoute}>
              <Text style={styles.saveBtnText}>{editingId ? 'Өзгерісті сақтау' : 'Рейсті қосу'}</Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Болдырмау</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.listHeader}>Барлық рейстер тізімі ({routes.length})</Text>
        {routes.map((item) => (
          <View key={item.id} style={styles.routeItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                [{item.transport.toUpperCase()}] {item.carrier} ({item.id})
              </Text>
              <View style={styles.itemSubRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.itemSub}>
                  {item.departureTime} - {item.arrivalTime} • {item.basePrice.toLocaleString()} ₸
                </Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.editIconBtn} onPress={() => handleEditClick(item)}>
                <Ionicons name="create-outline" size={20} color="#0284C7" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.delIconBtn} onPress={() => handleDeleteClick(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  formCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  activeTypeBtn: { backgroundColor: '#111827', borderColor: '#111827' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  activeTypeText: { color: '#FFF' },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, marginBottom: 10 },
  saveBtn: { backgroundColor: '#FF4500', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  cancelBtn: { backgroundColor: '#E5E7EB', padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtnText: { color: '#374151', fontWeight: '700', fontSize: 14 },
  listHeader: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  routeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  itemSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemSub: { fontSize: 12, color: '#6B7280' },
  itemActions: { flexDirection: 'row', gap: 8 },
  editIconBtn: { backgroundColor: '#E0F2FE', padding: 8, borderRadius: 8 },
  delIconBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8 },
});
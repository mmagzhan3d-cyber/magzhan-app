import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllAdminRoutes, saveAllAdminRoutes, RouteSchedule } from '../../services/api';
import { THEME } from '../../theme';

interface Props {
  onBack: () => void;
}

export default function AdminPanelScreen({ onBack }: Props) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminCode, setAdminCode] = useState('');

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
    if (isAuthorized) {
      getAllAdminRoutes()
        .then((data) => setRoutes(Array.isArray(data) ? data : []))
        .catch(() => setRoutes([]));
    }
  }, [isAuthorized]);

  const handleVerifyCode = () => {
    if (adminCode.trim() === 'admin2026') {
      setIsAuthorized(true);
    } else {
      Alert.alert('Қате код', 'Админ панельге кіру коды дұрыс емес!');
    }
  };

  if (!isAuthorized) {
    return (
      <View style={styles.lockContainer}>
        <TouchableOpacity style={styles.lockBackBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>

        <View style={styles.lockCard}>
          <View style={styles.lockIconCircle}>
            <Ionicons name="lock-closed" size={32} color={THEME.primary} />
          </View>
          <Text style={styles.lockTitle}>Админ панельге кіру</Text>
          <Text style={styles.lockSubtitle}>
            Басқару бөліміне өту үшін арнайы құпия кодты енгізіңіз
          </Text>

          <TextInput
            style={styles.lockInput}
            placeholder="Құпия код..."
            placeholderTextColor={THEME.textMuted}
            value={adminCode}
            onChangeText={setAdminCode}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.lockSubmitBtn} onPress={handleVerifyCode}>
            <Text style={styles.lockSubmitText}>Кіру</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        id: `${flightId.trim().toUpperCase()}-${Date.now().toString().slice(-3)}`,
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
    setTransport(item.transport || 'plane');
    setCarrier(item.carrier || '');
    setFlightId(item.id || '');
    setDepTime(item.departureTime || '10:00');
    setArrTime(item.arrivalTime || '12:00');
    setDuration(item.duration || '2 сағ 00 мин');
    setPrice(String(item.basePrice ?? 0));
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
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Админ Панель</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setIsAuthorized(false); setAdminCode(''); }}>
          <Ionicons name="lock-closed-outline" size={20} color={THEME.primary} />
        </TouchableOpacity>
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
                <Ionicons
                  name={t === 'plane' ? 'airplane' : t === 'train' ? 'train' : 'bus'}
                  size={15}
                  color={transport === t ? '#090D16' : THEME.textSecondary}
                />
                <Text style={[styles.typeText, transport === t && styles.activeTypeText]}>
                  {t === 'plane' ? 'Ұшақ' : t === 'train' ? 'Поезд' : 'Автобус'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Тасымалдаушы (мысалы: Air Astana, Тальго)"
            placeholderTextColor={THEME.textMuted}
            value={carrier}
            onChangeText={setCarrier}
          />
          <TextInput
            style={styles.input}
            placeholder="Рейс нөмірі (мысалы: KC-999)"
            placeholderTextColor={THEME.textMuted}
            value={flightId}
            onChangeText={setFlightId}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Шығу (10:00)"
              placeholderTextColor={THEME.textMuted}
              value={depTime}
              onChangeText={setDepTime}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Келу (12:00)"
              placeholderTextColor={THEME.textMuted}
              value={arrTime}
              onChangeText={setArrTime}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Базалық бағасы (₸)"
            placeholderTextColor={THEME.textMuted}
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
        {routes.map((item, idx) => {
          const safePrice = Number(item?.basePrice || 0);
          return (
            <View key={`${item?.id || idx}-${idx}`} style={styles.routeItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>
                  [{(item?.transport || 'plane').toUpperCase()}] {item?.carrier || 'Тасымалдаушы'} ({item?.id || '-'})
                </Text>
                <View style={styles.itemSubRow}>
                  <Ionicons name="time-outline" size={14} color={THEME.textSecondary} />
                  <Text style={styles.itemSub}>
                    {item?.departureTime || '--:--'} - {item?.arrivalTime || '--:--'} • {(isNaN(safePrice) ? 0 : safePrice).toLocaleString()} ₸
                  </Text>
                </View>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.editIconBtn} onPress={() => handleEditClick(item)}>
                  <Ionicons name="create-outline" size={20} color={THEME.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.delIconBtn} onPress={() => handleDeleteClick(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#F87171" />
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
  lockContainer: { flex: 1, backgroundColor: THEME.background, justifyContent: 'center', padding: 24 },
  lockBackBtn: { position: 'absolute', top: 45, left: 20, width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  lockCard: { backgroundColor: THEME.surface, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  lockIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#142C4A', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  lockTitle: { fontSize: 20, fontWeight: '800', color: THEME.textMain, marginBottom: 6 },
  lockSubtitle: { fontSize: 13, color: THEME.textSecondary, textAlign: 'center', marginBottom: 20 },
  lockInput: { width: '100%', backgroundColor: THEME.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: THEME.textMain, marginBottom: 16, textAlign: 'center', borderWidth: 1, borderColor: THEME.border },
  lockSubmitBtn: { width: '100%', backgroundColor: THEME.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  lockSubmitText: { color: '#090D16', fontSize: 16, fontWeight: '800' },

  container: { flex: 1, backgroundColor: THEME.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textMain },
  formCard: { backgroundColor: THEME.surface, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: THEME.border, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: THEME.textMain, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  activeTypeBtn: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  typeText: { fontSize: 13, fontWeight: '700', color: THEME.textSecondary },
  activeTypeText: { color: '#090D16', fontWeight: '800' },
  input: { backgroundColor: THEME.background, borderWidth: 1, borderColor: THEME.border, borderRadius: 12, padding: 12, fontSize: 14, color: THEME.textMain, marginBottom: 10 },
  saveBtn: { backgroundColor: THEME.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#090D16', fontWeight: '800', fontSize: 14 },
  cancelBtn: { backgroundColor: '#334155', padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtnText: { color: THEME.textMain, fontWeight: '700', fontSize: 14 },
  listHeader: { fontSize: 15, fontWeight: '800', color: THEME.textMain, marginBottom: 10 },
  routeItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 10 },
  itemTitle: { fontSize: 14, fontWeight: '800', color: THEME.textMain },
  itemSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  itemSub: { fontSize: 12, color: THEME.textSecondary },
  itemActions: { flexDirection: 'row', gap: 8 },
  editIconBtn: { backgroundColor: '#142C4A', padding: 8, borderRadius: 10 },
  delIconBtn: { backgroundColor: '#450A0A', padding: 8, borderRadius: 10 },
});
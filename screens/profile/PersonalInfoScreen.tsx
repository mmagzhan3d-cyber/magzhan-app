import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../App';

interface Props {
  initialProfile: UserProfile;
  ticketsCount?: number;
  onConfirm: (profile: UserProfile) => void;
  onOpenAdmin?: () => void;
  onOpenTickets?: () => void;
  onLogout?: () => void;
  onBack: () => void;
}

export default function PersonalInfoScreen({
  initialProfile,
  ticketsCount = 0,
  onConfirm,
  onOpenAdmin,
  onOpenTickets,
  onLogout,
  onBack,
}: Props) {
  const [fullName, setFullName] = useState(initialProfile.fullName || 'Абилкайдар Мағжан');
  const [phone, setPhone] = useState(initialProfile.phone || '+7 707 555 44 33');
  const [iin, setIin] = useState(initialProfile.iin || '040512500123');
  const [email, setEmail] = useState(initialProfile.email || 'magzhan@mail.kz');

  const handleSave = () => {
    if (fullName.trim().length < 3) {
      Alert.alert('Қате', 'Толық аты-жөніңізді енгізіңіз');
      return;
    }
    if (iin.replace(/\D/g, '').length !== 12) {
      Alert.alert('Қате', 'ЖСН (ИИН) 12 саннан тұруы тиіс');
      return;
    }

    onConfirm({
      fullName: fullName.trim(),
      phone: phone.trim(),
      iin: iin.trim(),
      email: email.trim(),
    });
    Alert.alert('Сақталды', 'Профиль мәліметтері жаңартылды!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Менің Профилім</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ПРОФИЛЬ КАРТОЧКАСЫ */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarLetter}>{fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{fullName}</Text>
        <Text style={styles.profileEmail}>{email}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{ticketsCount}</Text>
            <Text style={styles.statLbl}>Билеттер</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>VIP</Text>
            <Text style={styles.statLbl}>Мәртебе</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>2 450 ₸</Text>
            <Text style={styles.statLbl}>Бонус</Text>
          </View>
        </View>
      </View>

      {/* ЖЫЛДАМ БАТЫРМАЛАР */}
      <View style={styles.quickActions}>
        {onOpenTickets && (
          <TouchableOpacity style={styles.actionRow} onPress={onOpenTickets}>
            <Ionicons name="ticket-outline" size={22} color="#FF4500" />
            <Text style={styles.actionText}>Менің билеттерім</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        {onOpenAdmin && (
          <TouchableOpacity style={styles.actionRow} onPress={onOpenAdmin}>
            <Ionicons name="construct-outline" size={22} color="#0284C7" />
            <Text style={styles.actionText}>Админ панель (Тарифтерді өзгерту)</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ЖЕКЕ ДЕРЕКТЕРДІ ӨҢДЕУ */}
      <Text style={styles.sectionTitle}>Жеке құжат мәліметтері</Text>

      <Text style={styles.label}>Толық аты-жөні (ФИО)</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

      <Text style={styles.label}>ЖСН (ИИН - 12 таңба)</Text>
      <TextInput style={styles.input} value={iin} onChangeText={setIin} keyboardType="numeric" maxLength={12} />

      <Text style={styles.label}>Телефон нөмірі</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Email пошта</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Деректерді сақтау</Text>
      </TouchableOpacity>

      {onLogout && (
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Аккаунттан шығу</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  profileCard: { backgroundColor: '#111827', borderRadius: 20, padding: 22, alignItems: 'center', marginBottom: 18 },
  avatarCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FF4500', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarLetter: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 19, fontWeight: '800', color: '#FFF' },
  profileEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2, marginBottom: 16 },
  statsRow: { flexDirection: 'row', width: '100%', backgroundColor: '#1F2937', borderRadius: 14, paddingVertical: 12 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: '#FF4500' },
  statLbl: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#374151' },
  quickActions: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  actionText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827', marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: '#4B5563', marginBottom: 5 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 13, fontSize: 15, marginBottom: 14 },
  saveBtn: { backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 6 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, marginTop: 12 },
  logoutText: { color: '#DC2626', fontWeight: '700', fontSize: 15, marginLeft: 6 },
});
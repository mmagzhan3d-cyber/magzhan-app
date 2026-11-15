import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket, UserProfile } from '../../App';

interface Props {
  tickets: Ticket[];
  userProfile: UserProfile;
  onCancelTicket: (id: string) => void;
  onBackToHome: () => void;
}

export default function MyTicketsScreen({ tickets, userProfile, onCancelTicket, onBackToHome }: Props) {
  const [tab, setTab] = useState<'active' | 'archive'>('active');

  const filteredTickets = tickets.filter((t) => t.status === tab);

  const confirmCancel = (ticketId: string) => {
    Alert.alert(
      'Билетті қайтару',
      'Осы билетті қайтарып, архивке жіберуге сенімдісіз бе?',
      [
        { text: 'Жоқ', style: 'cancel' },
        { text: 'Иә, қайтару', style: 'destructive', onPress: () => onCancelTicket(ticketId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToHome}>
          <Ionicons name="home-outline" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Менің билеттерім</Text>
        <View style={{ width: 24 }} />
      </View>

      {userProfile.fullName ? (
        <View style={styles.userBanner}>
          <Ionicons name="person-circle-outline" size={28} color="#FF4500" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.userName}>{userProfile.fullName}</Text>
            <Text style={styles.userSub}>{userProfile.email} • ЖСН: {userProfile.iin}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'active' && styles.activeTabBtn]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.activeTabText]}>
            Белсенді ({tickets.filter((t) => t.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'archive' && styles.activeTabBtn]}
          onPress={() => setTab('archive')}
        >
          <Text style={[styles.tabText, tab === 'archive' && styles.activeTabText]}>
            Архив ({tickets.filter((t) => t.status === 'archive').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {filteredTickets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="ticket-outline" size={54} color="#D1D5DB" />
            <Text style={styles.emptyText}>Бұл бөлімде билеттер жоқ</Text>
          </View>
        ) : (
          filteredTickets.map((item) => (
            <View key={item.id} style={styles.ticketCard}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketId}>№ {item.id}</Text>
                <Text style={styles.carrierTag}>{item.booking.carrier || item.booking.transport.toUpperCase()}</Text>
              </View>

              <Text style={styles.routeTitle}>
                {item.booking.from} - {item.booking.to}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={15} color="#4B5563" />
                <Text style={styles.infoLine}>{item.booking.dateStr}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="grid-outline" size={15} color="#4B5563" />
                <Text style={styles.infoLine}>Орындар: {item.booking.selectedSeats?.join(', ')}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={15} color="#4B5563" />
                <Text style={styles.infoLine}>
                  Жолаушылар: {item.booking.passengers?.map((p) => p.name).join(', ')}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.ticketFooter}>
                <View>
                  <Text style={styles.priceLabel}>Төленген сома</Text>
                  <Text style={styles.priceVal}>{item.booking.totalPrice?.toLocaleString()} ₸</Text>
                </View>

                <Ionicons name="qr-code-outline" size={44} color="#111827" />

                {item.status === 'active' && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => confirmCancel(item.id)}>
                    <Text style={styles.cancelBtnText}>Қайтару</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  userBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  userName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  userSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 18 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#FFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  activeTabText: { color: '#FF4500', fontWeight: '700' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF', marginTop: 12, fontWeight: '600' },
  ticketCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ticketId: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  carrierTag: { backgroundColor: '#FFF5F2', color: '#FF4500', fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  routeTitle: { fontSize: 19, fontWeight: '800', color: '#111827', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoLine: { fontSize: 13, color: '#4B5563', flex: 1 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  priceVal: { fontSize: 17, fontWeight: '800', color: '#FF4500' },
  cancelBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  cancelBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 12 },
});
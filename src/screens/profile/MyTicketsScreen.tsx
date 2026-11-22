import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket, UserProfile } from '../../App';
import { THEME, TRANSPORT_THEMES } from '../../theme';
import TicketPdfView from '../../components/TicketPdfView';

interface Props {
  tickets: Ticket[];
  userProfile: UserProfile;
  onCancelTicket: (id: string) => void;
  onBackToHome: () => void;
}

export default function MyTicketsScreen({ tickets, userProfile, onCancelTicket, onBackToHome }: Props) {
  const [tab, setTab] = useState<'active' | 'archive'>('active');
  const [selectedPdfTicket, setSelectedPdfTicket] = useState<Ticket | null>(null);

  const filteredTickets = tickets.filter((t) => t.status === tab);

  const getMiniQr = (item: Ticket) => {
    const text = `QAZTICKET | ${item.id} | ${item.booking?.from}-${item.booking?.to}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

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
        <TouchableOpacity style={styles.backBtn} onPress={onBackToHome}>
          <Ionicons name="home-outline" size={22} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Менің билеттерім</Text>
        <View style={{ width: 40 }} />
      </View>

      {userProfile?.fullName ? (
        <View style={styles.userBanner}>
          <Ionicons name="person-circle" size={32} color={THEME.primary} />
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
            <Ionicons name="ticket-outline" size={54} color={THEME.textMuted} />
            <Text style={styles.emptyText}>Бұл бөлімде билеттер жоқ</Text>
          </View>
        ) : (
          filteredTickets.map((item) => {
            const tTheme = TRANSPORT_THEMES[item.booking?.transport || 'plane'];
            const safePrice = Number(item.booking?.totalPrice || 0);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => setSelectedPdfTicket(item)}
                style={[styles.ticketCard, { backgroundColor: tTheme.cardBg, borderColor: tTheme.border }]}
              >
                <View style={styles.ticketHeader}>
                  <Text style={[styles.ticketId, { color: tTheme.textMuted }]}>№ {item.id}</Text>
                  <View style={[styles.carrierTag, { backgroundColor: tTheme.primarySoft }]}>
                    <Ionicons name={tTheme.icon} size={13} color={tTheme.primary} />
                    <Text style={[styles.carrierTagText, { color: tTheme.primary }]} numberOfLines={1}>
                      {item.booking?.carrier || item.booking?.transport?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.routeTitle, { color: tTheme.textMain }]}>
                  {item.booking?.from} — {item.booking?.to}
                </Text>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={15} color={tTheme.textSecondary} />
                  <Text style={[styles.infoLine, { color: tTheme.textSecondary }]}>{item.booking?.dateStr}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="grid-outline" size={15} color={tTheme.textSecondary} />
                  <Text style={[styles.infoLine, { color: tTheme.textSecondary }]}>
                    Орындар: {item.booking?.selectedSeats?.join(', ')}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={15} color={tTheme.textSecondary} />
                  <Text style={[styles.infoLine, { color: tTheme.textSecondary }]}>
                    Жолаушылар: {item.booking?.passengers?.map((p) => p.name).join(', ')}
                  </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: tTheme.border }]} />

                <View style={styles.ticketFooter}>
                  <View>
                    <Text style={[styles.priceLabel, { color: tTheme.textMuted }]}>Төленген сома</Text>
                    <Text style={[styles.priceVal, { color: tTheme.primary }]}>{safePrice.toLocaleString()} ₸</Text>
                  </View>

                  <View style={styles.miniQrWrap}>
                    <Image source={{ uri: getMiniQr(item) }} style={styles.miniQrImg} />
                  </View>

                  {item.status === 'active' && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => confirmCancel(item.id)}>
                      <Text style={styles.cancelBtnText}>Қайтару</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.openPdfBtn}
                  onPress={() => setSelectedPdfTicket(item)}
                >
                  <Ionicons name="document-text" size={18} color="#FFFFFF" />
                  <Text style={styles.openPdfBtnText}>PDF Билетті көру / Жүктеу</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {selectedPdfTicket && (
        <TicketPdfView
          visible={!!selectedPdfTicket}
          ticketId={selectedPdfTicket.id}
          booking={selectedPdfTicket.booking}
          defaultPassengerName={userProfile?.fullName}
          defaultPassengerIin={userProfile?.iin}
          onClose={() => setSelectedPdfTicket(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.textMain },
  userBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.surface, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: THEME.border, marginBottom: 16 },
  userName: { fontSize: 15, fontWeight: '800', color: THEME.textMain },
  userSub: { fontSize: 12, color: THEME.textSecondary, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: THEME.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: THEME.border, marginBottom: 18 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: THEME.primary },
  tabText: { fontSize: 14, fontWeight: '700', color: THEME.textSecondary },
  activeTabText: { color: '#090D16', fontWeight: '800' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: THEME.textMuted, marginTop: 12, fontWeight: '600' },
  ticketCard: { borderRadius: 20, padding: 18, borderWidth: 1, marginBottom: 16 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 },
  ticketId: { fontSize: 13, fontWeight: '800' },
  carrierTag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, maxWidth: '65%' },
  carrierTagText: { fontWeight: '800', fontSize: 11 },
  routeTitle: { fontSize: 19, fontWeight: '900', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  infoLine: { fontSize: 13, flex: 1 },
  divider: { height: 1, marginVertical: 12 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 11 },
  priceVal: { fontSize: 18, fontWeight: '900' },
  miniQrWrap: { backgroundColor: '#F8FAFC', padding: 5, borderRadius: 8 },
  miniQrImg: { width: 46, height: 46 },
  cancelBtn: { backgroundColor: '#450A0A', borderColor: '#991B1B', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  cancelBtnText: { color: '#FCA5A5', fontWeight: '800', fontSize: 12 },
  openPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  openPdfBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
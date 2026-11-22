import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingDetails } from '../../App';
import {
  apiProcessPayment,
  generateTicketQrUrl,
  generatePaymentQrUrl,
} from '../../services/api';
import { TRANSPORT_THEMES } from '../../theme';
import TicketPdfView from '../../components/TicketPdfView';

interface Props {
  bookingDetails: BookingDetails;
  onSuccess: (transactionId?: string) => void;
  onBack: () => void;
}

export default function PaymentScreen({ bookingDetails, onSuccess, onBack }: Props) {
  const activeTheme = TRANSPORT_THEMES[bookingDetails?.transport || 'plane'];

  const [method, setMethod] = useState<'card' | 'qr'>('qr');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  const [completedTxnId, setCompletedTxnId] = useState<string | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [modalQrTitle, setModalQrTitle] = useState('');
  const [modalQrUrl, setModalQrUrl] = useState('');

  const safeAmount = Number(bookingDetails?.totalPrice || 0);

  const payQrImageUrl = generatePaymentQrUrl(
    bookingDetails?.from || '',
    bookingDetails?.to || '',
    bookingDetails?.carrier || 'QazTicket',
    bookingDetails?.flightNumber || 'KZ-01',
    safeAmount,
    400
  );

  const openBigQr = (title: string, url: string) => {
    setModalQrTitle(title);
    setModalQrUrl(url);
    setQrModalVisible(true);
  };

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
      const res = await apiProcessPayment(safeAmount, method);
      setCompletedTxnId(res.transactionId);
    } catch {
      Alert.alert('Қате', 'Төлемді өңдеу кезінде қате шықты');
    } finally {
      setProcessing(false);
    }
  };

  if (completedTxnId) {
    const ticketQrUrl = generateTicketQrUrl({
      ticketId: completedTxnId,
      carrier: bookingDetails?.carrier,
      flightNumber: bookingDetails?.flightNumber,
      from: bookingDetails?.from || '',
      to: bookingDetails?.to || '',
      dateStr: bookingDetails?.dateStr || '',
      seats: bookingDetails?.selectedSeats,
      passengers: bookingDetails?.passengers?.map((p) => p.name),
      totalPrice: safeAmount,
      size: 500,
    });

    return (
      <ScrollView
        style={[styles.container, { backgroundColor: activeTheme.background }]}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        <View style={styles.successHeader}>
          <Ionicons name="checkmark-circle" size={56} color="#22C55E" />
          <Text style={[styles.successTitle, { color: activeTheme.textMain }]}>Төлем сәтті расталды!</Text>
          <Text style={[styles.successSub, { color: activeTheme.textSecondary }]}>Билет ID: {completedTxnId}</Text>
        </View>

        <View style={[styles.ticketBox, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
          <Text style={[styles.route, { color: activeTheme.textMain }]}>
            {bookingDetails?.from} — {bookingDetails?.to}
          </Text>
          {bookingDetails?.carrier && (
            <Text style={[styles.carrier, { color: activeTheme.primary }]}>
              {bookingDetails.carrier} ({bookingDetails.flightNumber})
            </Text>
          )}
          <Text style={[styles.date, { color: activeTheme.textSecondary }]}>{bookingDetails?.dateStr}</Text>
          <Text style={[styles.seats, { color: activeTheme.textSecondary }]}>
            Орындар: {bookingDetails?.selectedSeats?.join(', ')}
          </Text>

          <TouchableOpacity
            style={styles.qrWhiteFrame}
            activeOpacity={0.85}
            onPress={() => openBigQr(`Билет QR: ${completedTxnId}`, ticketQrUrl)}
          >
            <Image source={{ uri: ticketQrUrl }} style={styles.qrImage} />
            <Text style={styles.tapToZoom}>QR-кодты үлкейту үшін басыңыз</Text>
          </TouchableOpacity>

          <View style={styles.ticketActionRow}>
            <TouchableOpacity
              style={[styles.bigQrBtn, { backgroundColor: activeTheme.cardElevated, borderColor: activeTheme.border }]}
              onPress={() => openBigQr(`Билет QR: ${completedTxnId}`, ticketQrUrl)}
            >
              <Ionicons name="qr-code-outline" size={18} color={activeTheme.textMain} />
              <Text style={[styles.bigQrBtnText, { color: activeTheme.textMain }]}>Үлкен QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pdfBtn}
              onPress={() => setPdfModalVisible(true)}
            >
              <Ionicons name="document-text" size={18} color="#FFFFFF" />
              <Text style={styles.pdfBtnText}>PDF Билет</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: activeTheme.primary }]}
          onPress={() => onSuccess(completedTxnId)}
        >
          <Text style={[styles.payBtnText, { color: activeTheme.primaryText }]}>Дайын (Билеттеріме өту)</Text>
        </TouchableOpacity>

        {/* РЕСМИ PDF-БИЛЕТ КӨРІНІСІ */}
        <TicketPdfView
          visible={pdfModalVisible}
          ticketId={completedTxnId}
          booking={bookingDetails}
          onClose={() => setPdfModalVisible(false)}
        />

        {/* ҮЛКЕН QR MODAL */}
        <Modal visible={qrModalVisible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalCard, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
              <Text style={[styles.modalTitle, { color: activeTheme.textMain }]}>{modalQrTitle}</Text>
              <View style={styles.modalQrWhiteWrap}>
                <Image source={{ uri: modalQrUrl }} style={styles.modalQrImg} />
              </View>

              <View style={[styles.qrFlightInfoBox, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
                <Text style={[styles.qrFlightHeader, { color: activeTheme.primary }]}>
                  {bookingDetails?.carrier} ({bookingDetails?.flightNumber})
                </Text>
                <Text style={[styles.qrFlightRoute, { color: activeTheme.textMain }]}>
                  {bookingDetails?.from} ➔ {bookingDetails?.to}
                </Text>
                <Text style={[styles.qrFlightDetail, { color: activeTheme.textSecondary }]}>
                  Уақыты: {bookingDetails?.dateStr}
                </Text>
                <Text style={[styles.qrFlightDetail, { color: activeTheme.textSecondary }]}>
                  Орындар: {bookingDetails?.selectedSeats?.join(', ')} • Сома: {safeAmount.toLocaleString()} ₸
                </Text>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.pdfBtn}
                  onPress={() => {
                    setQrModalVisible(false);
                    setPdfModalVisible(true);
                  }}
                >
                  <Ionicons name="document-text" size={18} color="#FFFFFF" />
                  <Text style={styles.pdfBtnText}>PDF Билет ашу</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: activeTheme.cardElevated }]}
                  onPress={() => setQrModalVisible(false)}
                >
                  <Text style={[styles.closeBtnText, { color: activeTheme.textMain }]}>Жабу</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: activeTheme.background }]}
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={22} color={activeTheme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeTheme.textMain }]}>Төлем жасау</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.summaryCard, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
        <Text style={[styles.route, { color: activeTheme.textMain }]}>
          {bookingDetails?.from} — {bookingDetails?.to}
        </Text>
        {bookingDetails?.carrier && (
          <Text style={[styles.carrier, { color: activeTheme.primary }]}>
            {bookingDetails.carrier} ({bookingDetails.flightNumber})
          </Text>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={activeTheme.textSecondary} />
          <Text style={[styles.date, { color: activeTheme.textSecondary }]}>{bookingDetails?.dateStr}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="grid-outline" size={16} color={activeTheme.textSecondary} />
          <Text style={[styles.seats, { color: activeTheme.textSecondary }]}>
            Таңдалған орындар: {bookingDetails?.selectedSeats?.join(', ')}
          </Text>
        </View>

        <Text style={[styles.price, { color: activeTheme.primary }]}>
          Төлем сомасы: {safeAmount.toLocaleString()} ₸
        </Text>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
        <TouchableOpacity
          style={[styles.tab, method === 'qr' && { backgroundColor: activeTheme.primary }]}
          onPress={() => setMethod('qr')}
        >
          <Text style={[styles.tabText, { color: method === 'qr' ? activeTheme.primaryText : activeTheme.textSecondary }]}>
            Kaspi / Halyk QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, method === 'card' && { backgroundColor: activeTheme.primary }]}
          onPress={() => setMethod('card')}
        >
          <Text style={[styles.tabText, { color: method === 'card' ? activeTheme.primaryText : activeTheme.textSecondary }]}>
            Банк картасы
          </Text>
        </TouchableOpacity>
      </View>

      {method === 'card' ? (
        <View style={[styles.form, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.textMain },
            ]}
            placeholder="Карта нөмірі (16 таңба)"
            placeholderTextColor={activeTheme.textMuted}
            keyboardType="numeric"
            maxLength={16}
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <TextInput
              style={[
                styles.input,
                { flex: 1, backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.textMain },
              ]}
              placeholder="Мерзімі (ММ/ЖЖ)"
              placeholderTextColor={activeTheme.textMuted}
              keyboardType="numeric"
              maxLength={5}
              value={expiry}
              onChangeText={setExpiry}
            />
            <TextInput
              style={[
                styles.input,
                { flex: 1, backgroundColor: activeTheme.background, borderColor: activeTheme.border, color: activeTheme.textMain },
              ]}
              placeholder="CVC"
              placeholderTextColor={activeTheme.textMuted}
              keyboardType="numeric"
              secureTextEntry
              maxLength={3}
              value={cvc}
              onChangeText={setCvc}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.qrContainer, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
          <TouchableOpacity
            style={styles.qrWhiteFrame}
            activeOpacity={0.85}
            onPress={() => openBigQr(`Төлем QR: ${safeAmount.toLocaleString()} ₸`, payQrImageUrl)}
          >
            <Image source={{ uri: payQrImageUrl }} style={styles.payQrImage} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.expandPayQrBtn, { backgroundColor: activeTheme.primarySoft }]}
            onPress={() => openBigQr(`Төлем QR: ${safeAmount.toLocaleString()} ₸`, payQrImageUrl)}
          >
            <Ionicons name="expand-outline" size={16} color={activeTheme.primary} />
            <Text style={[styles.expandPayQrText, { color: activeTheme.primary }]}>QR-кодты үлкен қылып ашу</Text>
          </TouchableOpacity>

          <Text style={[styles.qrHint, { color: activeTheme.textSecondary }]}>
            Kaspi.kz немесе Halyk қосымшасы арқылы QR-кодты сканерлеңіз
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.payBtn, { backgroundColor: activeTheme.primary, marginTop: 20 }]}
        onPress={handlePay}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color={activeTheme.primaryText} />
        ) : (
          <Text style={[styles.payBtnText, { color: activeTheme.primaryText }]}>Төлемді растау</Text>
        )}
      </TouchableOpacity>

      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: activeTheme.cardBg, borderColor: activeTheme.border }]}>
            <Text style={[styles.modalTitle, { color: activeTheme.textMain }]}>{modalQrTitle}</Text>
            <View style={styles.modalQrWhiteWrap}>
              <Image source={{ uri: modalQrUrl }} style={styles.modalQrImg} />
            </View>

            <View style={[styles.qrFlightInfoBox, { backgroundColor: activeTheme.background, borderColor: activeTheme.border }]}>
              <Text style={[styles.qrFlightHeader, { color: activeTheme.primary }]}>
                {bookingDetails?.carrier} ({bookingDetails?.flightNumber})
              </Text>
              <Text style={[styles.qrFlightRoute, { color: activeTheme.textMain }]}>
                {bookingDetails?.from} ➔ {bookingDetails?.to}
              </Text>
              <Text style={[styles.qrFlightDetail, { color: activeTheme.textSecondary }]}>
                Уақыты: {bookingDetails?.dateStr}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { width: '100%', backgroundColor: activeTheme.primary }]}
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={[styles.closeBtnText, { color: activeTheme.primaryText }]}>Жабу</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  summaryCard: { padding: 20, borderRadius: 18, borderWidth: 1, marginBottom: 18 },
  route: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  carrier: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  date: { fontSize: 13 },
  seats: { fontSize: 13 },
  price: { fontSize: 18, fontWeight: '900', marginTop: 8 },
  tabContainer: { flexDirection: 'row', padding: 4, borderRadius: 14, borderWidth: 1, marginBottom: 18, gap: 4 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  tabText: { fontWeight: '800', fontSize: 13 },
  form: { padding: 16, borderRadius: 16, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 12 },
  qrContainer: { alignItems: 'center', padding: 20, borderRadius: 18, borderWidth: 1 },
  qrWhiteFrame: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  payQrImage: { width: 185, height: 185 },
  expandPayQrBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 10 },
  expandPayQrText: { fontSize: 13, fontWeight: '700' },
  qrHint: { textAlign: 'center', fontSize: 13 },
  payBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  payBtnText: { fontSize: 16, fontWeight: '900' },

  successHeader: { alignItems: 'center', marginBottom: 18 },
  successTitle: { fontSize: 20, fontWeight: '900', marginTop: 8 },
  successSub: { fontSize: 13, marginTop: 2 },
  ticketBox: { padding: 20, borderRadius: 22, borderWidth: 1, alignItems: 'center', marginBottom: 18 },
  qrImage: { width: 185, height: 185 },
  tapToZoom: { fontSize: 11, color: '#0F172A', marginTop: 6, fontWeight: '700', textAlign: 'center' },
  ticketActionRow: { flexDirection: 'row', gap: 10, width: '100%' },
  bigQrBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  bigQrBtnText: { fontSize: 13, fontWeight: '800' },
  pdfBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: '#DC2626' },
  pdfBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 24, borderWidth: 1, padding: 22, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  modalQrWhiteWrap: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 18, marginBottom: 14 },
  modalQrImg: { width: 230, height: 230 },
  qrFlightInfoBox: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  qrFlightHeader: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  qrFlightRoute: { fontSize: 17, fontWeight: '900', marginBottom: 4 },
  qrFlightDetail: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  modalBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  closeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '800' },
});
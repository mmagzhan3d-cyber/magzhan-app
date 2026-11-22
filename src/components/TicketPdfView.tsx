import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { BookingDetails } from '../App';

interface Props {
  visible: boolean;
  ticketId: string;
  booking: BookingDetails;
  defaultPassengerName?: string;
  defaultPassengerIin?: string;
  onClose: () => void;
}

export default function TicketPdfView({
  visible,
  ticketId,
  booking,
  defaultPassengerName = 'Абилкайдар Мағжан',
  defaultPassengerIin = '040512500123',
  onClose,
}: Props) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const displayTicketId = ticketId || 'TK-202601';
  const safePrice = Number(booking?.totalPrice || 0);
  const passengers =
    booking?.passengers && booking.passengers.length > 0
      ? booking.passengers
      : [{ name: defaultPassengerName, document: defaultPassengerIin, type: 'adult' as const }];

  const seatsList = booking?.selectedSeats || [];

  const qrText =
    `QAZTICKET E-TICKET\n` +
    `ID: ${displayTicketId}\n` +
    `Reys: ${booking?.carrier || 'QazTicket'} (${booking?.flightNumber || 'KZ-01'})\n` +
    `Bagyt: ${booking?.from} -> ${booking?.to}\n` +
    `Uaqyty: ${booking?.dateStr}\n` +
    `Oryn: ${seatsList.join(', ') || '-'}\n` +
    `Soma: ${safePrice.toLocaleString()} KZT`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`;

  const handleExportRealPdf = async () => {
    setGeneratingPdf(true);
    try {
      const passengersRowsHtml = passengers
        .map(
          (p, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.document || '-'}</td>
            <td>${p.type === 'child' ? 'Бала (50%)' : 'Ересек'}</td>
            <td><strong>${seatsList[i] || seatsList[0] || '-'}</strong></td>
          </tr>`
        )
        .join('');

      const html = `
      <!DOCTYPE html>
      <html lang="kk">
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Helvetica, Arial, sans-serif; padding: 28px; color: #0f172a; background: #ffffff; }
          .doc-border { border: 2px solid #0f172a; border-radius: 12px; padding: 24px; }
          .top-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 14px; }
          .logo { font-size: 26px; font-weight: 900; color: #0284c7; letter-spacing: 1px; }
          .ticket-num-bar { background: #0f172a; color: #ffffff; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
          .ticket-num-bar span { font-size: 11px; color: #94a3b8; font-weight: 700; }
          .ticket-num-bar strong { font-size: 16px; letter-spacing: 0.5px; }
          .route-banner { background: #f1f5f9; border-left: 5px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
          .cities { font-size: 22px; font-weight: 900; }
          .carrier { font-size: 13px; color: #0284c7; font-weight: 700; margin-top: 4px; }
          .stamp { border: 2px solid #16a34a; color: #16a34a; font-weight: 900; padding: 6px 12px; border-radius: 6px; font-size: 12px; transform: rotate(-4deg); }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; }
          td { border-bottom: 1px solid #cbd5e1; padding: 10px; }
          .bottom-box { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #94a3b8; }
          .total-sum { font-size: 20px; font-weight: 900; color: #0f172a; }
          .note { font-size: 11px; color: #64748b; margin-top: 6px; max-width: 360px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="doc-border">
          <div class="top-header">
            <div>
              <div class="logo">QAZTICKET</div>
              <div style="font-size:11px;color:#475569;">Электронды жол жүру құжаты / E-Ticket</div>
            </div>
            <div style="text-align:right;font-size:12px;font-weight:800;color:#0f172a;">
              МАРШРУТТЫҚ ТҮБІРТЕК
            </div>
          </div>

          <div class="ticket-num-bar">
            <span>БИЛЕТ НӨМІРІ / TICKET №</span>
            <strong>№ ${displayTicketId}</strong>
          </div>

          <div class="route-banner">
            <div>
              <div class="cities">${booking?.from} ➔ ${booking?.to}</div>
              <div class="carrier">${booking?.carrier || 'Ресми тасымалдаушы'} • Рейс ${booking?.flightNumber || 'KZ-01'}</div>
              <div style="font-size:13px;margin-top:4px;">Уақыты: <strong>${booking?.dateStr}</strong></div>
            </div>
            <div class="stamp">ТӨЛЕНДІ / PAID</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Жолаушының аты-жөні</th>
                <th>ЖСН / Құжат</th>
                <th>Тариф</th>
                <th>Орын</th>
              </tr>
            </thead>
            <tbody>
              ${passengersRowsHtml}
            </tbody>
          </table>

          <div class="bottom-box">
            <div>
              <div class="total-sum">Жалпы сомасы: ${safePrice.toLocaleString()} ₸</div>
              <div class="note">
                Бұл электронды билет ресми жол жүру құжаты болып табылады. Отырғызу кезінде жеке куәлік пен осы құжатты көрсетіңіз.
              </div>
            </div>
            <img src="${qrImageUrl}" width="110" height="110" />
          </div>
        </div>
      </body>
      </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `QazTicket-${displayTicketId}.pdf`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Дайын', `PDF файл сақталды: ${uri}`);
      }
    } catch {
      Alert.alert('Қате', 'PDF файл жасау кезінде қате шықты.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* ЖОҒАРҒЫ ПАНЕЛЬ */}
        <View style={styles.topBar}>
          <View style={styles.pdfBadge}>
            <Ionicons name="document-text" size={15} color="#EF4444" />
            <Text style={styles.pdfBadgeText}>E-TICKET • {displayTicketId}.pdf</Text>
          </View>
          <TouchableOpacity style={styles.closeIconBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ОРТАСЫНДАҒЫ АЙНАЛДЫРЫЛАТЫН PDF ПАРАҒЫ (ДО КОНЦА АШЫЛАДЫ) */}
        <ScrollView
          style={{ flex: 1, width: '100%' }}
          contentContainerStyle={styles.paperScroll}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.a4Paper}>
            {/* 1-қатар: Логотип пен Құжат атауы */}
            <View style={styles.paperHeader}>
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text style={styles.brandName}>QAZTICKET</Text>
                <Text style={styles.brandSub}>Электронды билет / E-Ticket</Text>
              </View>
              <Text style={styles.docTypeTag}>МАРШРУТТЫҚ{'\n'}ТҮБІРТЕК</Text>
            </View>

            {/* 2-қатар: БИЛЕТ НӨМІРІ (Оң жағы ешқашан қиылмайды!) */}
            <View style={styles.ticketNumberBanner}>
              <Text style={styles.ticketNumberLabel}>БИЛЕТ НӨМІРІ:</Text>
              <Text style={styles.ticketNumberValue}>№ {displayTicketId}</Text>
            </View>

            {/* Бағыт және Мөр блогы */}
            <View style={styles.routeBox}>
              <View style={{ flex: 1, paddingRight: 6 }}>
                <Text style={styles.smallLabel}>БАҒЫТ / ROUTE</Text>
                <Text style={styles.routeCities}>
                  {booking?.from} ➔ {booking?.to}
                </Text>
                <Text style={styles.carrierText}>
                  {booking?.carrier || 'Тасымалдаушы'} ({booking?.flightNumber || 'KZ-01'})
                </Text>
              </View>

              <View style={styles.officialStamp}>
                <Text style={styles.stampTop}>РАСТАЛҒАН</Text>
                <Text style={styles.stampBottom}>PAID • VALID</Text>
              </View>
            </View>

            {/* Уақыт пен Орын кестесі */}
            <View style={styles.gridTable}>
              <View style={styles.gridCell}>
                <Text style={styles.cellLabel}>ЖӨНЕЛУ КҮНІ МЕН УАҚЫТЫ</Text>
                <Text style={styles.cellValue}>{booking?.dateStr}</Text>
              </View>
              <View style={[styles.gridCell, { borderLeftWidth: 1, borderLeftColor: '#CBD5E1' }]}>
                <Text style={styles.cellLabel}>ТАҢДАЛҒАН ОРЫНДАР</Text>
                <Text style={styles.cellValueHighlight}>{seatsList.join(', ') || '-'}</Text>
              </View>
            </View>

            {/* Жолаушылар кестесі */}
            <Text style={styles.sectionHeader}>ЖОЛАУШЫЛАР ТІЗІМІ / PASSENGERS</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.5 }]}>Аты-жөні</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>ЖСН / Құжат</Text>
              <Text style={[styles.th, { flex: 0.6, textAlign: 'right' }]}>Орын</Text>
            </View>

            {passengers.map((p, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={{ flex: 1.5, paddingRight: 4 }}>
                  <Text style={styles.tdBold}>{p.name}</Text>
                  <Text style={styles.tdSub}>{p.type === 'child' ? 'Балалар тарифі' : 'Ересек'}</Text>
                </View>
                <Text style={[styles.td, { flex: 1.1 }]}>{p.document || '-'}</Text>
                <Text style={[styles.tdSeat, { flex: 0.6, textAlign: 'right' }]}>
                  {seatsList[idx] || seatsList[0] || '-'}
                </Text>
              </View>
            ))}

            <View style={styles.dashedDivider} />

            {/* Төменгі төлем және QR бөлігі */}
            <View style={styles.bottomDocRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.smallLabel}>ТӨЛЕНГЕН ЖАЛПЫ СОМА</Text>
                <Text style={styles.totalAmount}>{safePrice.toLocaleString()} ₸</Text>
                <Text style={styles.legalNote}>
                  Отырғызу кезінде жеке басты куәландыратын құжатты және осы электронды билетті көрсетіңіз.
                </Text>
              </View>

              <View style={styles.qrDocBox}>
                <Image source={{ uri: qrImageUrl }} style={styles.docQrImg} />
                <Text style={styles.qrCodeLabel}>№ {displayTicketId}</Text>
              </View>
            </View>

            {/* Төменгі штрих-код */}
            <View style={styles.barcodeRow}>
              {[3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2, 4, 1, 2].map((w, i) => (
                <View key={i} style={[styles.barLine, { width: w }]} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* ТӨМЕНГІ PDF ЖҮКТЕУ БАТЫРМАСЫ (ҚАҒАЗДЫ ЖАППАЙДЫ) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.downloadPdfBtn}
            onPress={handleExportRealPdf}
            disabled={generatingPdf}
          >
            {generatingPdf ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="document-attach" size={20} color="#FFF" />
                <Text style={styles.downloadPdfText}>PDF файл қылып сақтау / Жіберу</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 22, 0.96)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pdfBadgeText: { color: '#F8FAFC', fontSize: 12, fontWeight: '800' },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paperScroll: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 28,
  },
  a4Paper: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandName: { fontSize: 20, fontWeight: '900', color: '#0284C7', letterSpacing: 0.5 },
  brandSub: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  docTypeTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'right',
    lineHeight: 12,
  },

  ticketNumberBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 12,
  },
  ticketNumberLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },
  ticketNumberValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  routeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 11,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
    marginBottom: 12,
  },
  smallLabel: { fontSize: 9, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  routeCities: { fontSize: 17, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  carrierText: { fontSize: 11, fontWeight: '700', color: '#0284C7', marginTop: 2 },

  officialStamp: {
    borderWidth: 2,
    borderColor: '#16A34A',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    alignItems: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  stampTop: { fontSize: 9, fontWeight: '900', color: '#16A34A' },
  stampBottom: { fontSize: 7, fontWeight: '800', color: '#16A34A' },

  gridTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    marginBottom: 12,
  },
  gridCell: { flex: 1, padding: 9 },
  cellLabel: { fontSize: 8, fontWeight: '800', color: '#64748B', marginBottom: 3 },
  cellValue: { fontSize: 11, fontWeight: '700', color: '#0F172A' },
  cellValueHighlight: { fontSize: 14, fontWeight: '900', color: '#0284C7' },

  sectionHeader: { fontSize: 10, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  th: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  tdBold: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  tdSub: { fontSize: 9, color: '#64748B' },
  td: { fontSize: 10, color: '#334155', fontWeight: '600' },
  tdSeat: { fontSize: 12, fontWeight: '900', color: '#0284C7' },

  dashedDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#94A3B8', marginVertical: 12 },

  bottomDocRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalAmount: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 2 },
  legalNote: { fontSize: 9, color: '#64748B', marginTop: 5, lineHeight: 13 },
  qrDocBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  docQrImg: { width: 80, height: 80 },
  qrCodeLabel: { fontSize: 9, fontWeight: '900', color: '#0F172A', marginTop: 3 },

  barcodeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  barLine: { height: 22, backgroundColor: '#0F172A' },

  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  downloadPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
  },
  downloadPdfText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WelcomeProps {
  onNavigateToLogin: () => void;
}

export default function WelcomeScreen({ onNavigateToLogin }: WelcomeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topCircle}>
        <Ionicons name="airplane" size={64} color="#FFFFFF" />
      </View>

      <Text style={styles.brandTitle}>QazTicket</Text>
      <Text style={styles.subtitle}>
        Қазақстан бойынша ұшақ, поезд және автобус билеттерін жылдам әрі тиімді брондаңыз
      </Text>

      <View style={styles.featuresBox}>
        <View style={styles.featureRow}>
          <Ionicons name="flash-outline" size={22} color="#FF4500" />
          <Text style={styles.featureText}>Барлық бағыттар бір қосымшада</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="cloud-outline" size={22} color="#FF4500" />
          <Text style={styles.featureText}>Баратын қаланың нақты ауа райы</Text>
        </View>
        <View style={styles.featureRow}>
          <Ionicons name="qr-code-outline" size={22} color="#FF4500" />
          <Text style={styles.featureText}>Электронды билет әрқашан қалтаңызда</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={onNavigateToLogin}>
        <Text style={styles.startBtnText}>Бастау</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  topCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresBox: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 36,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF4500',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { apiLoginUser } from '../../services/api';

interface RegisterProps {
  onRegisterSuccess: (email: string) => void;
  onBack: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onBack }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.includes('@')) {
      Alert.alert('Қате', 'Дұрыс Email мекенжайын енгізіңіз');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Қате', 'Құпия сөз кемінде 6 таңбадан тұруы тиіс');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Қате', 'Құпия сөздер сәйкес келмейді');
      return;
    }

    setLoading(true);
    try {
      const res = await apiLoginUser(email.trim(), password);
      onRegisterSuccess(res.userEmail);
    } catch (e: any) {
      Alert.alert('Қате', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тіркелу</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Құпия сөз (кемінде 6 таңба)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Құпия сөзді қайталаңыз"
        value={confirmPass}
        onChangeText={setConfirmPass}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Тіркелуді аяқтау</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Артқа</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#111827' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', padding: 14, borderRadius: 12, marginBottom: 16, fontSize: 16, backgroundColor: '#F9FAFB' },
  button: { backgroundColor: '#FF4500', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backButton: { padding: 10, alignItems: 'center' },
  backButtonText: { color: '#9CA3AF' },
});
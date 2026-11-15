import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITIES_DATABASE } from '../../services/api';

interface Props {
  type: 'from' | 'to';
  currentSelection: string;
  onSelect: (city: string) => void;
  onBack: () => void;
}

export default function CitySelectionScreen({ type, currentSelection, onSelect, onBack }: Props) {
  const [search, setSearch] = useState('');

  const filteredCities = CITIES_DATABASE.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="close" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'from' ? 'Жөнелу қаласы' : 'Келу қаласы'}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Қала немесе IATA код (ALA, NQZ)..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.code}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = item.name === currentSelection;
          return (
            <TouchableOpacity
              style={[styles.cityItem, isSelected && styles.selectedCityItem]}
              onPress={() => onSelect(item.name)}
            >
              <View style={styles.cityRow}>
                <Ionicons name="location-outline" size={20} color={isSelected ? '#FF4500' : '#6B7280'} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.cityName, isSelected && styles.selectedCityName]}>{item.name}</Text>
                  <Text style={styles.regionText}>{item.region}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.iataCode}>{item.code}</Text>
                {isSelected && <Ionicons name="checkmark" size={20} color="#FF4500" style={{ marginLeft: 8 }} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20 },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: '#111827', padding: 0 },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  selectedCityItem: { borderBottomColor: '#FF4500' },
  cityRow: { flexDirection: 'row', alignItems: 'center' },
  cityName: { fontSize: 16, color: '#374151', fontWeight: '600' },
  regionText: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  iataCode: { fontSize: 13, fontWeight: '700', color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  selectedCityName: { color: '#FF4500', fontWeight: '700' },
});
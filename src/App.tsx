import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import SignupSuccessScreen from './screens/auth/SignupSuccessScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import PersonalInfoScreen from './screens/profile/PersonalInfoScreen';
import Homepage from './screens/auth/Homepage';
import PassengersScreen from './screens/auth/PassengersScreen';
import SeatSelectionScreen from './screens/auth/SeatSelectionScreen';
import PaymentScreen from './screens/auth/PaymentScreen';
import MyTicketsScreen from './screens/profile/MyTicketsScreen';
import CitySelectionScreen from './screens/auth/CitySelectionScreen';
import AdminPanelScreen from './screens/profile/AdminPanelScreen';
import TourismScreen from './screens/auth/TourismScreen';

export interface UserProfile {
  fullName: string;
  phone: string;
  iin: string;
  email: string;
}

export interface BookingDetails {
  transport: 'plane' | 'train' | 'bus';
  travelClass?: string;
  carrier?: string;
  flightNumber?: string;
  from: string;
  to: string;
  dateStr: string;
  pricePerTicket: number;
  occupiedSeats?: string[];
  passengers?: { name: string; document: string; type: 'adult' | 'child' }[];
  selectedSeats?: string[];
  totalPrice?: number;
}

export interface Ticket {
  id: string;
  transactionId?: string;
  booking: BookingDetails;
  purchaseDate: string;
  status: 'active' | 'archive';
}

type ScreenType =
  | 'welcome'
  | 'login'
  | 'register'
  | 'success'
  | 'reset_password'
  | 'info'
  | 'home'
  | 'passengers'
  | 'seats'
  | 'payment'
  | 'my_tickets'
  | 'city_select'
  | 'admin'
  | 'tourism';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [ticketsList, setTicketsList] = useState<Ticket[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Абилкайдар Мағжан',
    phone: '+7 707 555 44 33',
    iin: '040512500123',
    email: 'magzhan@mail.kz',
  });

  const [citySelectType, setCitySelectType] = useState<'from' | 'to'>('from');
  const [fromCity, setFromCity] = useState('Алматы');
  const [toCity, setToCity] = useState('Астана');

  useEffect(() => {
    (async () => {
      try {
        const savedTickets = await AsyncStorage.getItem('@tickets_list');
        if (savedTickets) setTicketsList(JSON.parse(savedTickets));

        const savedUser = await AsyncStorage.getItem('@user_profile');
        if (savedUser) setUserProfile(JSON.parse(savedUser));
      } catch (e) {
        console.log('Storage error:', e);
      }
    })();
  }, []);

  const handleSaveUserProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
    setCurrentScreen('home');
  };

  const handleStartBooking = (details: BookingDetails) => {
    setBookingDetails(details);
    setCurrentScreen('passengers');
  };

  const handleConfirmPassengers = (passengers: any[], calculatedTotal: number) => {
    if (bookingDetails) {
      setBookingDetails({
        ...bookingDetails,
        passengers,
        totalPrice: calculatedTotal,
      });
      setCurrentScreen('seats');
    }
  };

  const handleConfirmSeats = (seats: string[], totalPrice: number) => {
    if (bookingDetails) {
      setBookingDetails({
        ...bookingDetails,
        selectedSeats: seats,
        totalPrice,
      });
      setCurrentScreen('payment');
    }
  };

  const handlePaymentSuccess = async (transactionId?: string) => {
    if (bookingDetails) {
      const newTicket: Ticket = {
        id: 'TK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        transactionId: transactionId || 'TXN-' + Date.now().toString().slice(-6),
        booking: bookingDetails,
        purchaseDate: new Date().toLocaleString('kk-KZ'),
        status: 'active',
      };
      const updatedTickets = [newTicket, ...ticketsList];
      setTicketsList(updatedTickets);
      await AsyncStorage.setItem('@tickets_list', JSON.stringify(updatedTickets));
      setCurrentScreen('my_tickets');
    }
  };

  const handleCancelTicket = async (ticketId: string) => {
    const updated = ticketsList.map((t) =>
      t.id === ticketId ? { ...t, status: 'archive' as const } : t
    );
    setTicketsList(updated);
    await AsyncStorage.setItem('@tickets_list', JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={currentScreen === 'welcome' ? 'light-content' : 'dark-content'} />

      {currentScreen === 'welcome' && (
        <WelcomeScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      )}

      {currentScreen === 'login' && (
        <LoginScreen
          onLoginSuccess={(email) => {
            setUserProfile((prev) => ({ ...prev, email }));
            setCurrentScreen('home');
          }}
          onForgotPassword={() => setCurrentScreen('reset_password')}
          onRegister={() => setCurrentScreen('register')}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          onRegisterSuccess={(email) => {
            setUserProfile((prev) => ({ ...prev, email }));
            setCurrentScreen('success');
          }}
          onBack={() => setCurrentScreen('login')}
        />
      )}

      {currentScreen === 'success' && (
        <SignupSuccessScreen onContinue={() => setCurrentScreen('info')} />
      )}

      {currentScreen === 'reset_password' && (
        <ResetPasswordScreen onBack={() => setCurrentScreen('login')} />
      )}

      {currentScreen === 'info' && (
        <PersonalInfoScreen
          initialProfile={userProfile}
          ticketsCount={ticketsList.length}
          onConfirm={handleSaveUserProfile}
          onOpenAdmin={() => setCurrentScreen('admin')}
          onOpenTickets={() => setCurrentScreen('my_tickets')}
          onLogout={() => setCurrentScreen('welcome')}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminPanelScreen onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'tourism' && (
        <TourismScreen
          onBookTour={handleStartBooking}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'home' && (
        <Homepage
          fromCity={fromCity}
          toCity={toCity}
          onSwapCities={() => {
            const temp = fromCity;
            setFromCity(toCity);
            setToCity(temp);
          }}
          onOpenCitySelect={(type) => {
            setCitySelectType(type);
            setCurrentScreen('city_select');
          }}
          onBookTicket={handleStartBooking}
          onNavigateToTourism={() => setCurrentScreen('tourism')}
          onNavigateToAdmin={() => setCurrentScreen('admin')}
          onNavigateToTickets={() => setCurrentScreen('my_tickets')}
          onNavigateToProfile={() => setCurrentScreen('info')}
        />
      )}

      {currentScreen === 'city_select' && (
        <CitySelectionScreen
          type={citySelectType}
          currentSelection={citySelectType === 'from' ? fromCity : toCity}
          onSelect={(city) => {
            if (citySelectType === 'from') setFromCity(city);
            else setToCity(city);
            setCurrentScreen('home');
          }}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'passengers' && (
        <PassengersScreen
          bookingDetails={bookingDetails!}
          defaultPassenger={userProfile}
          onNext={handleConfirmPassengers}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'seats' && (
        <SeatSelectionScreen
          bookingDetails={bookingDetails!}
          onNext={handleConfirmSeats}
          onBack={() => setCurrentScreen('passengers')}
        />
      )}

      {currentScreen === 'payment' && (
        <PaymentScreen
          bookingDetails={bookingDetails!}
          onSuccess={handlePaymentSuccess}
          onBack={() => setCurrentScreen('seats')}
        />
      )}

      {currentScreen === 'my_tickets' && (
        <MyTicketsScreen
          tickets={ticketsList}
          userProfile={userProfile}
          onCancelTicket={handleCancelTicket}
          onBackToHome={() => setCurrentScreen('home')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
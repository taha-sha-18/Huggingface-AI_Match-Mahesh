import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { useAuthStore } from './src/stores/authStore';

export default function RootLayout() {
  const { isLoading, isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/welcome');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Slot, usePathname } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { initAnalytics } from '../src/utils/analytics';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/debug', '/auth/welcome', '/auth/login', '/auth/register'];

export default function RootLayout() {
  const { isLoading, isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadUser();
    // Initialize analytics on app start
    initAnalytics();
  }, []);

  useEffect(() => {
    // Skip redirect for public routes
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    
    if (!isLoading && !isPublicRoute) {
      if (!isAuthenticated) {
        router.replace('/auth/welcome');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isLoading, isAuthenticated, pathname]);

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

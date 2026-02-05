import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Slot, useSegments, usePathname } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { initAnalytics } from '../src/utils/analytics';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['debug', 'auth'];

export default function RootLayout() {
  const { isLoading, isAuthenticated, loadUser } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    loadUser().finally(() => setInitialLoadDone(true));
    // Initialize analytics on app start
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!initialLoadDone) return;
    
    // Get the first segment of the path
    const firstSegment = segments[0];
    
    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(firstSegment as string);
    
    // Don't redirect if on a public route
    if (isPublicRoute) return;
    
    // Only redirect from index/root
    if (!isAuthenticated && (pathname === '/' || !firstSegment)) {
      router.replace('/auth/welcome');
    }
  }, [initialLoadDone, isAuthenticated, segments, pathname]);

  if (isLoading || !initialLoadDone) {
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

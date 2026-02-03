import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FloatingArcMenu from '../../src/components/FloatingArcMenu';

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Slot />
        <FloatingArcMenu />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'visible', // allow FAB to overflow
    pointerEvents: 'box-none',
  },
});

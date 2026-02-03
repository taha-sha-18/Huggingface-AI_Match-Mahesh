import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import FloatingArcMenu from '../../src/components/FloatingArcMenu';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <FloatingArcMenu />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

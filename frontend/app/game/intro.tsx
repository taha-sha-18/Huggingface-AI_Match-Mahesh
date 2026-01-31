import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameIntroScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.iconGradient}
            >
              <Ionicons name="game-controller" size={60} color="#FFF" />
            </LinearGradient>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Discover Your Values</Text>
            <Text style={styles.description}>
              Play a quick 8-round word game to help us understand what matters most to you.
              There are no right or wrong answers - just choose the word that resonates with you!
            </Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Ionicons name="time" size={28} color="#6366F1" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>2 minutes</Text>
                <Text style={styles.infoSubtitle}>Quick and easy</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="grid" size={28} color="#8B5CF6" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>8 rounds</Text>
                <Text style={styles.infoSubtitle}>Choose 1 of 4 words</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="analytics" size={28} color="#EC4899" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>AI Analysis</Text>
                <Text style={styles.infoSubtitle}>Personalized insights</Text>
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/game/play')}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  infoCards: {
    gap: 16,
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

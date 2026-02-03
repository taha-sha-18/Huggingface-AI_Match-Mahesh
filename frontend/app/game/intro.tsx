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
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  iconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  infoCards: {
    gap: 10,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

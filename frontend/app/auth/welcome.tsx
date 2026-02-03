import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="people-circle" size={80} color="#6366F1" />
            <Text style={styles.title}>Value Match</Text>
            <Text style={styles.subtitle}>
              Find communities that truly align with your values
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="game-controller" size={28} color="#6366F1" />
              <Text style={styles.featureText}>Interactive Value Discovery</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="sparkles" size={28} color="#8B5CF6" />
              <Text style={styles.featureText}>AI-Powered Matching</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="heart" size={28} color="#EC4899" />
              <Text style={styles.featureText}>Meaningful Connections</Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/auth/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/auth/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  features: {
    gap: 10,
    marginVertical: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  buttons: {
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

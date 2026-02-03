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
    paddingVertical: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  features: {
    gap: 14,
    marginVertical: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  buttons: {
    gap: 14,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

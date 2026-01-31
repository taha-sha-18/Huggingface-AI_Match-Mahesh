import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  const getValueLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      community_oriented: 'Community Oriented',
      structured: 'Structured',
      competitive: 'Competitive',
      intellectual: 'Intellectual',
      tradition: 'Tradition Oriented',
    };
    return labels[key] || key;
  };

  const getValuePercentage = (value: number): number => {
    return Math.round(value * 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* User Card */}
          <View style={styles.userCard}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.avatarGradient}
            >
              <Ionicons name="person" size={48} color="#FFF" />
            </LinearGradient>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.game_completed && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.completedText}>Profile Complete</Text>
                </View>
              )}
            </View>
          </View>

          {/* Value Profile */}
          {user?.value_profile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Value Profile</Text>
              <Text style={styles.sectionDescription}>
                Based on your value discovery game
              </Text>

              <View style={styles.valuesContainer}>
                {Object.entries(user.value_profile).map(([key, value]) => (
                  <View key={key} style={styles.valueItem}>
                    <View style={styles.valueHeader}>
                      <Text style={styles.valueLabel}>{getValueLabel(key)}</Text>
                      <Text style={styles.valuePercentage}>
                        {getValuePercentage(value as number)}%
                      </Text>
                    </View>
                    <View style={styles.valueBar}>
                      <View
                        style={[
                          styles.valueBarFill,
                          { width: `${getValuePercentage(value as number)}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Environment Preferences */}
          {user?.environment_preferences && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environment Preferences</Text>
              
              <View style={styles.preferencesGrid}>
                <View style={styles.preferenceCard}>
                  <Ionicons name="people" size={28} color="#6366F1" />
                  <Text style={styles.preferenceLabel}>Group Size</Text>
                  <Text style={styles.preferenceValue}>
                    {user.environment_preferences.group_size}
                  </Text>
                </View>

                <View style={styles.preferenceCard}>
                  <Ionicons name="chatbubbles" size={28} color="#8B5CF6" />
                  <Text style={styles.preferenceLabel}>Interaction</Text>
                  <Text style={styles.preferenceValue} numberOfLines={2}>
                    {user.environment_preferences.interaction_style}
                  </Text>
                </View>

                <View style={styles.preferenceCard}>
                  <Ionicons name="speedometer" size={28} color="#EC4899" />
                  <Text style={styles.preferenceLabel}>Pace</Text>
                  <Text style={styles.preferenceValue}>
                    {user.environment_preferences.pace}
                  </Text>
                </View>

                <View style={styles.preferenceCard}>
                  <Ionicons name="calendar" size={28} color="#F59E0B" />
                  <Text style={styles.preferenceLabel}>Frequency</Text>
                  <Text style={styles.preferenceValue} numberOfLines={2}>
                    {user.environment_preferences.frequency}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            {!user?.game_completed && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/game/intro')}
              >
                <Ionicons name="game-controller" size={24} color="#6366F1" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Complete Value Discovery</Text>
                  <Text style={styles.actionSubtitle}>
                    Get personalized community matches
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}

            {user?.game_completed && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/game/intro')}
              >
                <Ionicons name="refresh" size={24} color="#6366F1" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Retake Value Discovery</Text>
                  <Text style={styles.actionSubtitle}>
                    Update your profile
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Logout</Text>
                <Text style={styles.actionSubtitle}>
                  Sign out of your account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Value Match v1.0</Text>
            <Text style={styles.footerText}>AI-Powered Community Matching</Text>
          </View>
        </ScrollView>
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
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    gap: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  valuesContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  valueItem: {
    gap: 8,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  valuePercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
  },
  valueBar: {
    height: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  valueBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  preferenceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

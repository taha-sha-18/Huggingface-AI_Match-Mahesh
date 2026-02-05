import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useCommunityStore } from '../../src/stores/communityStore';

interface CommunityDetail {
  community_id: string;
  name: string;
  description: string;
  member_count: number;
  image?: string;
  value_profile?: Record<string, number>;
  created_at?: string;
}

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { myCommunities, fetchMyCommunities } = useCommunityStore();
  
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    loadCommunity();
  }, [id]);

  useEffect(() => {
    // Check if user has already joined this community
    if (community && myCommunities) {
      setIsJoined(myCommunities.some(c => c.community_id === community.community_id));
    }
  }, [community, myCommunities]);

  const loadCommunity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/communities/${id}`);
      setCommunity(response.data);
    } catch (error) {
      console.error('Failed to load community:', error);
      Alert.alert('Error', 'Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!community) return;
    
    try {
      setJoining(true);
      await api.post(`/api/communities/${community.community_id}/join`);
      setIsJoined(true);
      await fetchMyCommunities();
      Alert.alert('Success! 🎉', `You've joined ${community.name}!`);
    } catch (error: any) {
      console.error('Failed to join community:', error);
      const message = error.response?.data?.detail || 'Failed to join community';
      Alert.alert('Error', message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!community) return;
    
    Alert.alert(
      'Leave Community',
      `Are you sure you want to leave ${community.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setJoining(true);
              await api.post(`/api/communities/${community.community_id}/leave`);
              setIsJoined(false);
              await fetchMyCommunities();
              Alert.alert('Left Community', `You've left ${community.name}`);
            } catch (error: any) {
              console.error('Failed to leave community:', error);
              const message = error.response?.data?.detail || 'Failed to leave community';
              Alert.alert('Error', message);
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  // Calculate compatibility score
  const getCompatibilityScore = (): number => {
    if (!user?.value_profile || !community?.value_profile) return 0;
    
    const userValues = user.value_profile;
    const commValues = community.value_profile;
    
    const similarities: number[] = [];
    for (const key in userValues) {
      if (key in commValues) {
        const diff = Math.abs(userValues[key as keyof typeof userValues] - commValues[key as keyof typeof commValues]);
        similarities.push(1 - diff);
      }
    }
    
    return similarities.length > 0 ? (similarities.reduce((a, b) => a + b, 0) / similarities.length) * 100 : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Community not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const compatibilityScore = getCompatibilityScore();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Image */}
      <View style={styles.headerImage}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#A855F7']}
          style={styles.gradient}
        >
          <Ionicons name="people" size={80} color="rgba(255,255,255,0.3)" />
        </LinearGradient>
        
        {/* Back Button */}
        <SafeAreaView style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Compatibility Badge */}
        {compatibilityScore > 0 && (
          <View style={styles.compatibilityBadge}>
            <Ionicons name="heart" size={14} color="#FFF" />
            <Text style={styles.compatibilityText}>{Math.round(compatibilityScore)}% Match</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Community Info */}
        <View style={styles.infoSection}>
          <Text style={styles.communityName}>{community.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people" size={20} color="#6366F1" />
              <Text style={styles.statText}>{community.member_count} members</Text>
            </View>
            {isJoined && (
              <View style={styles.joinedIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.joinedIndicatorText}>Joined</Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{community.description}</Text>
        </View>

        {/* Values Section */}
        {community.value_profile && Object.keys(community.value_profile).length > 0 && (
          <View style={styles.valuesSection}>
            <Text style={styles.sectionTitle}>Community Values</Text>
            <View style={styles.valuesList}>
              {Object.entries(community.value_profile)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([key, value]) => (
                  <View key={key} style={styles.valueItem}>
                    <View style={styles.valueHeader}>
                      <Text style={styles.valueName}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                      </Text>
                      <Text style={styles.valuePercent}>{Math.round(value * 100)}%</Text>
                    </View>
                    <View style={styles.valueBar}>
                      <View style={[styles.valueBarFill, { width: `${value * 100}%` }]} />
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Join/Leave Button */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        {isJoined ? (
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={handleLeave}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="exit-outline" size={20} color="#EF4444" />
                <Text style={styles.leaveButtonText}>Leave Community</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.joinButtonText}>Join Community</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerImage: {
    height: 250,
    position: 'relative',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  compatibilityBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  compatibilityText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginTop: -30,
    backgroundColor: '#000',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  infoSection: {
    padding: 24,
  },
  communityName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  joinedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  joinedIndicatorText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  valuesSection: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  valuesList: {
    gap: 16,
  },
  valueItem: {
    gap: 8,
  },
  valueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueName: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  valuePercent: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  valueBar: {
    height: 8,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
  },
  valueBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '700',
  },
});

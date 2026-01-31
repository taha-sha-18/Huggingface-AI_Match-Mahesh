import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/authStore';
import { useCommunityStore } from '../../src/stores/communityStore';
import { CommunityMatch } from '../../src/types';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { matches, myCommunities, fetchMatches, fetchMyCommunities, joinCommunity, skipCommunity } = useCommunityStore();
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user?.game_completed) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    await Promise.all([fetchMatches(), fetchMyCommunities()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleJoin = async (communityId: string) => {
    try {
      setJoiningId(communityId);
      await joinCommunity(communityId);
      Alert.alert('Success', 'Joined community!');
    } catch (error) {
      Alert.alert('Error', 'Failed to join community');
    } finally {
      setJoiningId(null);
    }
  };

  const handleSkip = async (communityId: string) => {
    await skipCommunity(communityId);
  };

  if (!user?.game_completed) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContent}>
            <Ionicons name="game-controller" size={80} color="#6366F1" />
            <Text style={styles.emptyTitle}>Complete Your Profile</Text>
            <Text style={styles.emptyText}>
              Take our quick value discovery game to get personalized community matches!
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/game/intro')}
            >
              <Text style={styles.primaryButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle" size={32} color="#6366F1" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
            />
          }
        >
          {/* My Communities */}
          {myCommunities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Communities</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {myCommunities.map((community) => (
                  <TouchableOpacity
                    key={community.community_id}
                    style={styles.myCommu nityCard}
                    onPress={() => Alert.alert(community.name, community.description)}
                  >
                    {community.image ? (
                      <Image source={{ uri: community.image }} style={styles.myCommunityImage} />
                    ) : (
                      <LinearGradient
                        colors={['#6366F1', '#8B5CF6']}
                        style={styles.myCommunityImage}
                      >
                        <Ionicons name="people" size={32} color="#FFF" />
                      </LinearGradient>
                    )}
                    <Text style={styles.myCommunityName} numberOfLines={1}>
                      {community.name}
                    </Text>
                    <Text style={styles.myCommunityMembers}>
                      {community.member_count} members
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* AI Matched Communities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
            <Text style={styles.sectionSubtitle}>AI-matched based on your values</Text>

            {matches.length === 0 ? (
              <View style={styles.emptyMatches}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.emptyMatchesText}>
                  You've explored all available communities!
                </Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(tabs)/create')}
                >
                  <Text style={styles.secondaryButtonText}>Create One</Text>
                </TouchableOpacity>
              </View>
            ) : (
              matches.map((match) => (
                <CommunityMatchCard
                  key={match.community_id}
                  match={match}
                  onJoin={() => handleJoin(match.community_id)}
                  onSkip={() => handleSkip(match.community_id)}
                  isJoining={joiningId === match.community_id}
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CommunityMatchCard({
  match,
  onJoin,
  onSkip,
  isJoining,
}: {
  match: CommunityMatch;
  onJoin: () => void;
  onSkip: () => void;
  isJoining: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#6366F1';
    return '#F59E0B';
  };

  return (
    <View style={styles.matchCard}>
      {/* Image */}
      <View style={styles.matchImageContainer}>
        {match.image ? (
          <Image source={{ uri: match.image }} style={styles.matchImage} />
        ) : (
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.matchImage}>
            <Ionicons name="people" size={48} color="#FFF" />
          </LinearGradient>
        )}
        {/* Compatibility Badge */}
        <View style={[styles.compatibilityBadge, { backgroundColor: getScoreColor(match.compatibility_score) }]}>
          <Text style={styles.compatibilityText}>{Math.round(match.compatibility_score)}%</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.matchContent}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchName}>{match.community_name}</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="people" size={14} color="#9CA3AF" />
            <Text style={styles.memberCount}>{match.member_count}</Text>
          </View>
        </View>

        <Text style={styles.matchDescription} numberOfLines={2}>
          {match.description}
        </Text>

        <Text style={styles.matchReasonTitle}>Why it matches:</Text>
        <Text style={styles.matchReason}>{match.why_it_matches}</Text>

        {match.possible_friction && (
          <View style={styles.frictionContainer}>
            <Ionicons name="alert-circle" size={16} color="#F59E0B" />
            <Text style={styles.frictionText}>{match.possible_friction}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            disabled={isJoining}
          >
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.joinButton, isJoining && styles.buttonDisabled]}
            onPress={onJoin}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.joinButtonText}>Join</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  myCommunityCard: {
    width: 140,
  },
  myCommunityImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myCommunityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  myCommunityMembers: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emptyMatches: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    gap: 16,
  },
  emptyMatchesText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compatibilityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  matchContent: {
    padding: 20,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
  },
  memberCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  matchDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  matchReasonTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  matchReason: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
  },
  frictionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#0A0A0A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  frictionText: {
    flex: 1,
    fontSize: 13,
    color: '#F59E0B',
    lineHeight: 18,
  },
  matchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  joinButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

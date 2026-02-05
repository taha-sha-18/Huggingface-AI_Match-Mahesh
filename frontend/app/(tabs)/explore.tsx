import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useAuthStore } from '../../src/stores/authStore';
import { Community } from '../../src/types';

export default function ExploreScreen() {
  const { communities, myCommunities, fetchCommunities, fetchMyCommunities } = useCommunityStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchCommunities(), fetchMyCommunities()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate compatibility score between user and community
  const getCompatibilityScore = (community: Community): number => {
    if (!user?.value_profile) return 0;
    
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

  // Filter communities based on user's value profile
  const getFilteredCommunities = () => {
    if (!user?.game_completed) {
      return communities; // Show all if game not completed
    }

    // Only show communities with compatibility > 40%
    return communities
      .map(community => ({
        ...community,
        compatibilityScore: getCompatibilityScore(community),
      }))
      .filter(c => c.compatibilityScore > 40)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  };

  const filteredCommunities = getFilteredCommunities().filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isJoined = (communityId: string) => {
    return myCommunities.some((c) => c.community_id === communityId);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Communities matched to your values</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search communities..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
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
          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{filteredCommunities.length}</Text>
              <Text style={styles.statLabel}>Matched</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{myCommunities.length}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>

          {/* Communities Grid */}
          {filteredCommunities.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={64} color="#374151" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No communities found' : user?.game_completed ? 'No matching communities available' : 'Complete the game to see matched communities'}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.community_id}
                  community={community}
                  isJoined={isJoined(community.community_id)}
                  compatibilityScore={(community as any).compatibilityScore}
                  onPress={() => router.push(`/communities/${community.community_id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function CommunityCard({ 
  community, 
  isJoined,
  compatibilityScore 
}: { 
  community: Community; 
  isJoined: boolean;
  compatibilityScore?: number;
}) {
  return (
    <TouchableOpacity style={styles.communityCard} activeOpacity={0.8}>
      {/* Image */}
      {community.image ? (
        <Image source={{ uri: community.image }} style={styles.communityImage} />
      ) : (
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.communityImage}
        >
          <Ionicons name="people" size={40} color="#FFF" />
        </LinearGradient>
      )}

      {/* Compatibility Badge */}
      {compatibilityScore && compatibilityScore > 0 && (
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>{Math.round(compatibilityScore)}%</Text>
        </View>
      )}

      {/* Joined Badge */}
      {isJoined && (
        <View style={styles.joinedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.joinedText}>Joined</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.communityContent}>
        <Text style={styles.communityName} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.communityDescription} numberOfLines={2}>
          {community.description}
        </Text>
        <View style={styles.communityFooter}>
          <View style={styles.memberInfo}>
            <Ionicons name="people" size={14} color="#9CA3AF" />
            <Text style={styles.memberText}>{community.member_count} members</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  communityCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  communityImage: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatibilityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compatibilityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  joinedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  communityContent: {
    padding: 16,
  },
  communityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  communityDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});

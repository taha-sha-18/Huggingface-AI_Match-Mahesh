import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

const GAME_TILES = [
  ['adventure', 'stability', 'knowledge', 'belonging'],
  ['autonomy', 'cooperation', 'winning', 'innovation'],
  ['organization', 'spontaneity', 'heritage', 'action'],
  ['excellence', 'harmony', 'learning', 'exploration'],
  ['independence', 'together', 'discipline', 'creativity'],
  ['self-reliance', 'support', 'analysis', 'practice'],
  ['achievement', 'teamwork', 'roots', 'surprise'],
  ['family', 'freedom', 'planning', 'doing'],
];

export default function GamePlayScreen() {
  const [currentRound, setCurrentRound] = useState(0);
  const [selections, setSelections] = useState<Array<{ round: number; word: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const router = useRouter();
  const { refreshUser } = useAuthStore();

  const currentTiles = GAME_TILES[currentRound];
  const progress = ((currentRound + 1) / GAME_TILES.length) * 100;

  const handleTileSelect = (word: string) => {
    setSelectedTile(word);
    
    // Add selection
    const newSelections = [...selections, { round: currentRound, word }];
    setSelections(newSelections);

    // Check if this is the last round (round 7 = 8th round)
    const isLastRound = currentRound >= GAME_TILES.length - 1;

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Move to next round or submit
    setTimeout(() => {
      if (isLastRound) {
        // Game complete, submit
        submitGame(newSelections);
      } else {
        setCurrentRound(currentRound + 1);
        setSelectedTile(null);
      }
    }, 400);
  };

  const submitGame = async (finalSelections: Array<{ round: number; word: string }>) => {
    try {
      setIsSubmitting(true);
      await api.post('/api/game/submit', { selections: finalSelections });
      await refreshUser();
      
      Alert.alert(
        'Profile Created!',
        'Your value profile has been created. Let\'s find your perfect communities!',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)/home') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit game');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Analyzing your values...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Round {currentRound + 1} of {GAME_TILES.length}
            </Text>
          </View>

          {/* Question */}
          <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
            <Text style={styles.question}>Which word resonates with you most?</Text>
            <Text style={styles.hint}>Choose what feels right, not what sounds right</Text>
          </Animated.View>

          {/* Tiles */}
          <Animated.View style={[styles.tilesContainer, { opacity: fadeAnim }]}>
            {currentTiles.map((word, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tile}
                onPress={() => handleTileSelect(word)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[
                    index === 0 ? '#6366F1' : index === 1 ? '#8B5CF6' : index === 2 ? '#EC4899' : '#F59E0B',
                    index === 0 ? '#8B5CF6' : index === 1 ? '#EC4899' : index === 2 ? '#F59E0B' : '#6366F1',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tileGradient}
                >
                  <Text style={styles.tileText}>{word}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Skip */}
          <TouchableOpacity onPress={() => Alert.alert('Tip', 'There are no wrong answers! Just choose what feels natural to you.')}>
            <Text style={styles.skipText}>Need help?</Text>
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
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  questionContainer: {
    marginBottom: 40,
  },
  question: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  hint: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tilesContainer: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  tile: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tileGradient: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  tileText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  skipText: {
    fontSize: 15,
    color: '#6366F1',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
  },
});

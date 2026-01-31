import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCommunityStore } from '../../src/stores/communityStore';
import { useAuthStore } from '../../src/stores/authStore';

export default function CreateCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Value sliders state (0-1 scale)
  const [communityOriented, setCommunityOriented] = useState(0.7);
  const [structured, setStructured] = useState(0.5);
  const [competitive, setCompetitive] = useState(0.3);
  const [intellectual, setIntellectual] = useState(0.6);
  const [tradition, setTradition] = useState(0.4);
  
  // Environment settings
  const [groupSize, setGroupSize] = useState('medium');
  const [interactionStyle, setInteractionStyle] = useState('casual mingling');
  const [pace, setPace] = useState('balanced');
  
  const router = useRouter();
  const { createCommunity } = useCommunityStore();
  const { user } = useAuthStore();

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user?.game_completed) {
      Alert.alert('Complete Your Profile', 'Please complete the value discovery game first');
      router.push('/game/intro');
      return;
    }

    try {
      setIsLoading(true);
      
      await createCommunity({
        name: name.trim(),
        description: description.trim(),
        value_profile: {
          community_oriented: communityOriented,
          structured,
          competitive,
          intellectual,
          tradition,
        },
        environment_settings: {
          group_size: groupSize,
          interaction_style: interactionStyle,
          pace,
        },
      });

      Alert.alert('Success', 'Community created successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/home') },
      ]);
      
      // Reset form
      setName('');
      setDescription('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create community');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Community</Text>
            <Text style={styles.subtitle}>Build your perfect community</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Community Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Tech Innovators Network"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe your community's purpose and goals..."
                  placeholderTextColor="#6B7280"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Value Profile */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Community Values</Text>
              <Text style={styles.sectionDescription}>
                These help match your community with the right people
              </Text>

              <ValueSlider
                label="Community Oriented"
                value={communityOriented}
                onChange={setCommunityOriented}
                leftLabel="Independent"
                rightLabel="Collaborative"
              />

              <ValueSlider
                label="Structure Level"
                value={structured}
                onChange={setStructured}
                leftLabel="Spontaneous"
                rightLabel="Organized"
              />

              <ValueSlider
                label="Engagement Style"
                value={competitive}
                onChange={setCompetitive}
                leftLabel="Relaxed"
                rightLabel="Competitive"
              />

              <ValueSlider
                label="Focus Type"
                value={intellectual}
                onChange={setIntellectual}
                leftLabel="Hands-on"
                rightLabel="Intellectual"
              />

              <ValueSlider
                label="Change Orientation"
                value={tradition}
                onChange={setTradition}
                leftLabel="Innovative"
                rightLabel="Traditional"
              />
            </View>

            {/* Environment Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environment</Text>

              <View style={styles.selectContainer}>
                <Text style={styles.label}>Group Size</Text>
                <View style={styles.optionsRow}>
                  {['small', 'medium', 'large'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.option,
                        groupSize === size && styles.optionSelected,
                      ]}
                      onPress={() => setGroupSize(size)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          groupSize === size && styles.optionTextSelected,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.selectContainer}>
                <Text style={styles.label}>Interaction Style</Text>
                <View style={styles.optionsRow}>
                  {['casual mingling', 'deep conversations', 'activity-based'].map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.option,
                        interactionStyle === style && styles.optionSelected,
                      ]}
                      onPress={() => setInteractionStyle(style)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          interactionStyle === style && styles.optionTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {style}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.selectContainer}>
                <Text style={styles.label}>Pace</Text>
                <View style={styles.optionsRow}>
                  {['relaxed', 'balanced', 'fast-paced'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.option,
                        pace === p && styles.optionSelected,
                      ]}
                      onPress={() => setPace(p)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          pace === p && styles.optionTextSelected,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>Create Community</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ValueSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  const steps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.label}>{label}</Text>
      <View style={sliderStyles.slider}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step}
            style={[
              sliderStyles.step,
              value === step && sliderStyles.stepActive,
            ]}
            onPress={() => onChange(step)}
          />
        ))}
      </View>
      <View style={sliderStyles.labels}>
        <Text style={sliderStyles.labelText}>{leftLabel}</Text>
        <Text style={sliderStyles.labelText}>{rightLabel}</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  slider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  step: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#374151',
  },
  stepActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#FFF',
  },
  createButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

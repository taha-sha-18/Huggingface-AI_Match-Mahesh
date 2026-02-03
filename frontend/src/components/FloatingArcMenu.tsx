import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

interface MenuButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
  color: string;
}

const MENU_BUTTONS: MenuButton[] = [
  { icon: 'home', label: 'Home', route: '/(tabs)/home', color: '#6366F1' },
  { icon: 'compass', label: 'Explore', route: '/(tabs)/explore', color: '#8B5CF6' },
  { icon: 'add-circle', label: 'Create', route: '/(tabs)/create', color: '#EC4899' },
  { icon: 'person', label: 'Profile', route: '/(tabs)/profile', color: '#F59E0B' },
];

export default function FloatingArcMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  // Animation values
  const rotation = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        setIsOpen(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isOpen]);

  // Toggle menu
  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    rotation.value = withSpring(newState ? 45 : 0, {
      damping: 15,
      stiffness: 150,
    });

    overlayOpacity.value = withTiming(newState ? 1 : 0, {
      duration: 200,
    });
  };

  // Handle navigation
  const handleNavigate = (route: string) => {
    setIsOpen(false);
    rotation.value = withSpring(0);
    overlayOpacity.value = withTiming(0);
    router.push(route);
  };

  // FAB animation
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Overlay animation
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  return (
    <>
      {/* Dimmed Overlay */}
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
      </Animated.View>

      {/* Arc Menu Buttons */}
      {isOpen && (
        <View style={[styles.arcContainer, { bottom: insets.bottom + 108, right: 20 }]}>
          {MENU_BUTTONS.map((button, index) => (
            <ArcButton
              key={button.route}
              button={button}
              index={index}
              isActive={pathname === button.route}
              onPress={() => handleNavigate(button.route)}
            />
          ))}
        </View>
      )}

      {/* Main FAB */}
      <Animated.View
        style={[
          styles.fab,
          fabAnimatedStyle,
          { bottom: insets.bottom + 40, right: 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isOpen ? 'close' : 'menu'}
            size={28}
            color="#FFF"
          />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

interface ArcButtonProps {
  button: MenuButton;
  index: number;
  isActive: boolean;
  onPress: () => void;
}

function ArcButton({ button, index, isActive, onPress }: ArcButtonProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Calculate arc positions - reduced radius to keep on screen
    const radius = 110;
    const angleStep = 20; // Degrees between buttons
    const startAngle = 75; // Starting angle (upward-left)
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;

    const targetX = -Math.cos(radian) * radius;
    const targetY = -Math.sin(radian) * radius;

    // Staggered animation
    const delay = index * 50;

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      })
    );

    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));

    translateX.value = withDelay(
      delay,
      withSpring(targetX, {
        damping: 15,
        stiffness: 100,
      })
    );

    translateY.value = withDelay(
      delay,
      withSpring(targetY, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.arcButton, animatedStyle]}>
      <TouchableOpacity
        style={[
          styles.arcButtonInner,
          { backgroundColor: button.color },
          isActive && styles.arcButtonActive,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={button.icon} size={24} color="#FFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  arcContainer: {
    position: 'absolute',
    right: 28,
    zIndex: 999,
  },
  arcButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  arcButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arcButtonActive: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  fab: {
    position: 'absolute',
    right: 24,
    zIndex: 1000,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
});

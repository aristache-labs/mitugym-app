import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';

interface NotificationBellProps {
  unreadCount: number;
  onPress: () => void;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onPress,
  size = 24,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  // Pulse animation for badge when unread count changes
  React.useEffect(() => {
    if (unreadCount > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Bell shake animation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unreadCount]);

  // Continuous pulse for unread notifications
  React.useEffect(() => {
    if (unreadCount > 0) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Glow animation - using opacity which works with useNativeDriver: true
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();

      return () => {
        pulseAnimation.stop();
        glowAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [unreadCount, pulseAnim, glowAnim, scaleAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Animated.View
        style={{
          transform: [{ rotate: rotation }],
        }}
      >
        <Bell 
          size={size} 
          color={unreadCount > 0 ? theme.colors.primary.DEFAULT : theme.colors.text.primary} 
          strokeWidth={2.5} 
        />
      </Animated.View>
      {unreadCount > 0 && (
        <>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.primary.DEFAULT, theme.colors.accent.DEFAULT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </LinearGradient>
          </Animated.View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 20,
    backgroundColor: theme.colors.primary.DEFAULT,
    opacity: 0.3,
  },
  badgeContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  badge: {
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2.5,
    borderColor: theme.colors.background.DEFAULT,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

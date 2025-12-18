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
  const bellShake = React.useRef(new Animated.Value(0)).current;
  const dotPulse = React.useRef(new Animated.Value(1)).current;
  const ringPulse = React.useRef(new Animated.Value(0)).current;

  // New notification animation - Badge pop + Bell shake
  React.useEffect(() => {
    if (unreadCount > 0) {
      // Badge pop animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Bell shake
      Animated.sequence([
        Animated.timing(bellShake, {
          toValue: -8,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 8,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: -6,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 6,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bellShake, {
          toValue: 0,
          duration: 50,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [unreadCount, scaleAnim, bellShake]);

  // Continuous pulse animations when unread
  React.useEffect(() => {
    if (unreadCount > 0) {
      // Dot pulse
      const dotAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dotPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      dotAnimation.start();

      // Ring pulse
      const ringAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringPulse, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      ringAnimation.start();

      return () => {
        dotAnimation.stop();
        ringAnimation.stop();
      };
    } else {
      dotPulse.setValue(1);
      ringPulse.setValue(0);
    }
  }, [unreadCount, dotPulse, ringPulse]);

  const ringScale = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });

  const ringOpacity = ringPulse.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.4, 0.2, 0],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.wrapper}>
        {/* Pulsing ring effect */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
        )}

        {/* Bell icon with shake animation */}
        <Animated.View
          style={{
            transform: [{ translateX: bellShake }],
          }}
        >
          <View style={styles.bellContainer}>
            <Bell
              size={size}
              color={unreadCount > 0 ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.7)'}
              strokeWidth={2}
              fill={unreadCount > 0 ? 'rgba(77, 212, 212, 0.1)' : 'none'}
            />
          </View>
        </Animated.View>

        {/* Modern badge indicator - dot style */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.badgeWrapper,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, dotPulse) },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FF3B5C', '#FF0844']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeDot}
            >
              {unreadCount > 9 && (
                <View style={styles.badgeCountContainer}>
                  <Text style={styles.badgeCount}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </LinearGradient>
            
            {/* Outer glow ring */}
            <View style={styles.badgeGlow} />
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  wrapper: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary.DEFAULT,
  },
  bellContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  badgeDot: {
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: theme.colors.background.DEFAULT,
    shadowColor: '#FF0844',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 10,
  },
  badgeGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 12,
    backgroundColor: '#FF0844',
    opacity: 0.3,
    zIndex: -1,
  },
  badgeCountContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 10,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
});

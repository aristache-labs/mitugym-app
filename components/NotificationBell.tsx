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
  const rippleAnim = React.useRef(new Animated.Value(0)).current;
  const badgeBounce = React.useRef(new Animated.Value(1)).current;

  // Pulse animation for badge when unread count changes
  React.useEffect(() => {
    if (unreadCount > 0) {
      // Badge pop animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Bell shake animation - more pronounced
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.5,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();

      // Ripple effect
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [unreadCount, scaleAnim, rotateAnim, rippleAnim]);

  // Continuous pulse for unread notifications
  React.useEffect(() => {
    if (unreadCount > 0) {
      // Badge subtle bounce
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(badgeBounce, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(badgeBounce, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();

      // Glow pulse animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();

      // Bell subtle pulse
      const bellPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      bellPulse.start();

      return () => {
        bounceAnimation.stop();
        glowAnimation.stop();
        bellPulse.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      badgeBounce.setValue(1);
    }
  }, [unreadCount, pulseAnim, glowAnim, badgeBounce]);

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '20deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.7],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.6}
    >
      <View style={styles.bellWrapper}>
        {/* Ripple effect on notification */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.ripple,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
              },
            ]}
          />
        )}
        
        {/* Glow background */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Bell icon with animations */}
        <Animated.View
          style={{
            transform: [
              { rotate: rotation },
              { scale: pulseAnim },
            ],
          }}
        >
          <View style={[
            styles.bellIconContainer,
            unreadCount > 0 && styles.bellIconContainerActive,
          ]}>
            <Bell 
              size={size} 
              color={unreadCount > 0 ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.6)'} 
              strokeWidth={2.5} 
            />
          </View>
        </Animated.View>

        {/* Badge with gradient */}
        {unreadCount > 0 && (
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, badgeBounce) },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={[
                '#FF6B6B',
                '#FF4757',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <View style={styles.badgeInner}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  bellWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary.DEFAULT,
  },
  glowRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary.DEFAULT,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  bellIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIconContainerActive: {
    backgroundColor: 'rgba(77, 212, 212, 0.15)',
    borderColor: 'rgba(77, 212, 212, 0.3)',
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  badge: {
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: theme.colors.background.DEFAULT,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  badgeInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

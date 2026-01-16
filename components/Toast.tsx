import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, TouchableOpacity, PanResponder, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react-native';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration: number | undefined;
  description: string | undefined;
}

export function Toast({
  message,
  type,
  visible,
  onDismiss,
  duration = 5000,
  description,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(400)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [isPaused, setIsPaused] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(duration);
  const currentProgressRef = useRef<number>(1);

  const handleDismiss = useCallback(() => {
    if (isLeaving) {
      return;
    }
    setIsLeaving(true);

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 400,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [translateX, opacityAnim, scaleAnim, onDismiss, isLeaving]);

  // Pan responder for swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderGrant: () => {
        setIsPaused(true);
        // Store current progress when pausing
        remainingTimeRef.current = currentProgressRef.current * duration;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 100) {
          handleDismiss();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
          setIsPaused(false);
          startTimeRef.current = Date.now();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setIsLeaving(false);
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;

      // Slide in animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      // Shimmer animation
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 2,
          duration: 1500,
          useNativeDriver: true,
        }),
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [visible, duration, translateX, opacityAnim, scaleAnim, shimmerAnim, pulseAnim]);

  // Progress countdown
  useEffect(() => {
    if (visible && !isPaused) {
      const currentValue = remainingTimeRef.current / duration;
      progressAnim.setValue(currentValue);
      currentProgressRef.current = currentValue;

      const animation = Animated.timing(progressAnim, {
        toValue: 0,
        duration: remainingTimeRef.current,
        useNativeDriver: false,
      });

      // Track progress
      const listenerId = progressAnim.addListener(({ value }) => {
        currentProgressRef.current = value;
      });

      animation.start(({ finished }) => {
        if (finished) {
          handleDismiss();
        }
      });

      return () => {
        progressAnim.removeListener(listenerId);
        animation.stop();
      };
    }
    return undefined;
  }, [visible, isPaused, handleDismiss, progressAnim, duration]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          Icon: CheckCircle,
          iconColor: '#22c55e',
          iconBgColor: 'rgba(34, 197, 94, 0.15)',
          borderColor: 'rgba(34, 197, 94, 0.25)',
          gradientColors: ['#0e1512', '#0a110d'] as const,
          shadowColor: 'rgba(34, 197, 94, 0.3)',
          progressColor: '#22c55e',
          progressBg: 'rgba(34, 197, 94, 0.15)',
        };
      case 'error':
        return {
          Icon: XCircle,
          iconColor: '#ef4444',
          iconBgColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.25)',
          gradientColors: ['#1a0e0e', '#140a0a'] as const,
          shadowColor: 'rgba(239, 68, 68, 0.3)',
          progressColor: '#ef4444',
          progressBg: 'rgba(239, 68, 68, 0.15)',
        };
      case 'warning':
        return {
          Icon: AlertTriangle,
          iconColor: '#eab308',
          iconBgColor: 'rgba(234, 179, 8, 0.15)',
          borderColor: 'rgba(234, 179, 8, 0.25)',
          gradientColors: ['#1a1810', '#14120c'] as const,
          shadowColor: 'rgba(234, 179, 8, 0.3)',
          progressColor: '#eab308',
          progressBg: 'rgba(234, 179, 8, 0.15)',
        };
      case 'info':
        return {
          Icon: CheckCircle,
          iconColor: '#3b82f6',
          iconBgColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.25)',
          gradientColors: ['#0e1419', '#0a0f14'] as const,
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          progressColor: '#3b82f6',
          progressBg: 'rgba(59, 130, 246, 0.15)',
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.Icon;

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        position: 'absolute',
        top: insets.top + 72,
        left: 8,
        right: 8,
        zIndex: 9999,
        transform: [
          { translateX },
          { scale: scaleAnim },
        ],
        opacity: opacityAnim,
      }}
    >
      {/* Outer glow effect */}
      <View
        style={{
          borderRadius: 18,
          padding: 2,
          backgroundColor: 'transparent',
        }}
      >
        {/* Enhanced shadow container */}
        <View
          style={{
            borderRadius: 16,
            ...Platform.select({
              ios: {
                shadowColor: styles.iconColor,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.6,
                shadowRadius: 28,
              },
              android: {
                elevation: 24,
              },
            }),
          }}
        >
          <View
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: styles.borderColor,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.7,
                  shadowRadius: 32,
                },
                android: {
                  elevation: 16,
                },
              }),
            }}
          >
        <LinearGradient
          colors={styles.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'relative' }}
        >
          {/* Top glow line */}
          <LinearGradient
            colors={['transparent', styles.iconColor + '66', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              opacity: 0.4,
            }}
          />

          {/* Main content */}
          <View style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              {/* Icon with background */}
              <View style={{ position: 'relative', marginTop: 2 }}>
                {/* Icon shadow layer */}
                <View
                  style={{
                    position: 'absolute',
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    ...Platform.select({
                      ios: {
                        shadowColor: styles.iconColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.6,
                        shadowRadius: 8,
                      },
                      android: {
                        elevation: 8,
                      },
                    }),
                  }}
                />
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: styles.iconBgColor,
                    borderWidth: 1.5,
                    borderColor: styles.iconColor + '35',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={20} color={styles.iconColor} strokeWidth={2.5} />
                </View>

                {/* Animated pulse ring */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 12,
                    backgroundColor: styles.iconColor,
                    opacity: 0.15,
                    transform: [{ scale: pulseAnim }],
                  }}
                />
              </View>

              {/* Text content */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#ffffff',
                    lineHeight: 18,
                    marginBottom: description ? 4 : 0,
                  }}
                  numberOfLines={2}
                >
                  {message}
                </Text>
                {description && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 16,
                    }}
                    numberOfLines={2}
                  >
                    {description}
                  </Text>
                )}
              </View>

              {/* Close button */}
              <TouchableOpacity
                onPress={handleDismiss}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  marginTop: -2,
                }}
                activeOpacity={0.6}
              >
                <X size={16} color="rgba(255, 255, 255, 0.5)" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress bar */}
          <View
            style={{
              height: 4,
              width: '100%',
              backgroundColor: styles.progressBg,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                height: '100%',
                backgroundColor: styles.progressColor,
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            >
              {/* Shimmer effect */}
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transform: [
                    {
                      translateX: shimmerAnim.interpolate({
                        inputRange: [-1, 2],
                        outputRange: ['-100%', '200%'],
                      }),
                    },
                  ],
                }}
              />
            </Animated.View>
          </View>
        </LinearGradient>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}


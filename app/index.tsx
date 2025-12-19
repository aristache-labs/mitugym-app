import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, Image, StyleSheet, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Calendar, CreditCard, Dumbbell, ChevronRight, X } from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { theme } from '../lib/theme';
import { StyledButton } from '../components/StyledButton';
import { SplashScreen } from '../components/SplashScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: any;
  icon: any;
  gradient: readonly [string, string];
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Quick Check-In',
    description: 'Get into the gym fast with our secure QR code system. No more waiting in line.',
    image: require('../assets/images/onboarding-qr.png'),
    icon: QrCode,
    gradient: ['rgba(77, 212, 212, 0.15)', 'rgba(77, 212, 212, 0.05)'] as const,
  },
  {
    id: 2,
    title: 'Track Your Progress',
    description: 'Monitor your gym visits, membership status, and stay updated with announcements.',
    image: require('../assets/images/onboarding-home.png'),
    icon: Calendar,
    gradient: ['rgba(92, 223, 223, 0.15)', 'rgba(92, 223, 223, 0.05)'] as const,
  },
  {
    id: 3,
    title: 'Browse Services',
    description: 'Explore and purchase personal training sessions and other gym services.',
    image: require('../assets/images/onboarding-services.png'),
    icon: Dumbbell,
    gradient: ['rgba(68, 228, 228, 0.15)', 'rgba(68, 228, 228, 0.05)'] as const,
  },
  {
    id: 4,
    title: 'Manage Membership',
    description: 'Easily track your membership status and renew directly from the app.',
    image: require('../assets/images/onboarding-membership.png'),
    icon: CreditCard,
    gradient: ['rgba(77, 212, 212, 0.15)', 'rgba(77, 212, 212, 0.05)'] as const,
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const { checkAuthState } = useAppStore();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const currentSlideRef = useRef(0);
  const isAnimatingRef = useRef(false);

  // Keep refs in sync with state
  React.useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  React.useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  // Check authentication and load data on mount
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app - checking auth state...');
        await checkAuthState();

        // Wait a minimum of 2 seconds for splash screen animations
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check auth state after waiting
        const authState = useAppStore.getState().isAuthenticated;
        console.log('Auth state after check:', authState);

        if (authState) {
          console.log('User is authenticated, redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('User is not authenticated, showing onboarding');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsCheckingAuth(false);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    const current = currentSlideRef.current;
    const animating = isAnimatingRef.current;

    if (current < onboardingSlides.length - 1 && !animating) {
      setIsAnimating(true);
      isAnimatingRef.current = true;

      // Fade out and slide left
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -screenWidth * 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update slide
        const newSlide = current + 1;
        setCurrentSlide(newSlide);
        currentSlideRef.current = newSlide;

        // Reset position for fade in from right
        slideAnim.setValue(screenWidth * 0.3);
        fadeAnim.setValue(0);

        // Fade in and slide to center
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
            isAnimatingRef.current = false;
          });
        }, 50);
      });
    }
  };

  const handlePrevious = () => {
    const current = currentSlideRef.current;
    const animating = isAnimatingRef.current;

    if (current > 0 && !animating) {
      setIsAnimating(true);
      isAnimatingRef.current = true;

      // Fade out and slide right
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenWidth * 0.3,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Update slide
        const newSlide = current - 1;
        setCurrentSlide(newSlide);
        currentSlideRef.current = newSlide;

        // Reset position for fade in from left
        slideAnim.setValue(-screenWidth * 0.3);
        fadeAnim.setValue(0);

        // Fade in and slide to center
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsAnimating(false);
            isAnimatingRef.current = false;
          });
        }, 50);
      });
    }
  };

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // User started touching
      },
      onPanResponderMove: (_, _gestureState) => {
        // Optional: Add visual feedback during swipe
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right - go to previous
          if (currentSlideRef.current > 0 && !isAnimatingRef.current) {
            handlePrevious();
          }
        } else if (gestureState.dx < -50) {
          // Swipe left - go to next
          if (currentSlideRef.current < onboardingSlides.length - 1 && !isAnimatingRef.current) {
            handleNext();
          }
        }
      },
      onPanResponderTerminate: () => {
        // Gesture was interrupted
      },
    }),
  ).current;


  // Show animated splash screen while checking auth state
  if (isCheckingAuth) {
    return (
      <SplashScreen
        onFinish={() => {
          // This callback is no longer used since we control timing in useEffect
          // but kept for component compatibility
        }}
      />
    );
  }

  const slide = onboardingSlides[currentSlide];

  if (!slide) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
        style={styles.gradient}
      >
        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Phone Mockup Container */}
          <View style={styles.phoneContainer}>
            <View style={styles.phoneFrame}>
              <Image
                source={slide.image}
                style={styles.phoneImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>

          {/* Pagination Dots - Hidden on last slide */}
          {currentSlide < onboardingSlides.length - 1 && (
            <View style={styles.pagination}>
              {onboardingSlides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSlide && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Bottom Section */}
        {currentSlide < onboardingSlides.length - 1 ? (
          <View style={styles.bottomSection}>
            <TouchableOpacity onPress={handleGetStarted} style={styles.skipButton}>
              <LinearGradient
                colors={['rgba(71, 85, 105, 0.3)', 'rgba(20, 78, 99, 0.2)']}
                style={styles.skipGradient}
              >
                <X size={16} color={theme.colors.text.secondary} strokeWidth={2} />
                <Text style={styles.skipText}>Skip</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={['rgba(71, 85, 105, 0.75)', 'rgba(20, 78, 99, 0.45)', 'rgba(71, 85, 105, 0.75)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.nextGradient}
              >
                <Text style={styles.nextText}>Next</Text>
                <ChevronRight size={16} color="#cbd5e1" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.lastSlideBottomSection}>
            <StyledButton
              title="Get Started"
              onPress={handleGetStarted}
              fullWidth
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    paddingTop: theme.spacing.xxl * 2,
    justifyContent: 'flex-start',
  },
  phoneContainer: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  phoneFrame: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneImage: {
    width: '100%',
    height: '100%',
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: screenWidth * 0.8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(77, 212, 212, 0.2)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: theme.colors.primary.DEFAULT,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  skipButton: {
    minWidth: 80,
  },
  skipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 212, 212, 0.2)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  nextButton: {
    minWidth: 100,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#164e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  nextText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  lastSlideBottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
});

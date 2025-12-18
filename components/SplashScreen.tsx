import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [loadingText, setLoadingText] = useState('Initializing...');

  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(30)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const loaderScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const versionOpacity = useRef(new Animated.Value(0)).current;

  // Pulsing animations
  const logoPulse = useRef(new Animated.Value(1)).current;
  const loaderRotate = useRef(new Animated.Value(0)).current;
  const centerDotScale = useRef(new Animated.Value(1)).current;

  // Generate random stars data
  const [starsData] = useState(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1, // 1-3px
      left: Math.random() * 100, // 0-100%
      top: Math.random() * 100, // 0-100%
      initialOpacity: Math.random(),
      delay: Math.random() * 2000, // 0-2s delay
    }));
  });

  // Create animated values for stars
  const starAnimations = useRef(
    starsData.map(() => new Animated.Value(Math.random())),
  ).current;

  useEffect(() => {
    // Start animations sequence
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Title entrance
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 800,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 800,
          delay: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Subtitle entrance
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 800,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleSlide, {
          toValue: 0,
          duration: 800,
          delay: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Loader entrance
      Animated.parallel([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 600,
          delay: 700,
          useNativeDriver: true,
        }),
        Animated.spring(loaderScale, {
          toValue: 1,
          delay: 700,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Text entrance
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 900,
        useNativeDriver: true,
      }),
      // Version entrance
      Animated.timing(versionOpacity, {
        toValue: 1,
        duration: 800,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.08,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Animate stars twinkling
    starsData.forEach((star, index) => {
      const starAnim = starAnimations[index];
      if (!starAnim) {return;}

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(starAnim, {
              toValue: 1,
              duration: 1000 + Math.random() * 1000, // 1-2s
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(starAnim, {
              toValue: 0.2,
              duration: 1000 + Math.random() * 1000, // 1-2s
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, star.delay);
    });

    // Continuous loader rotation
    Animated.loop(
      Animated.timing(loaderRotate, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Continuous center dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(centerDotScale, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(centerDotScale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    // Continuous text fade
    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Simulate loading stages - extended timing
    const loadingStages = [
      { text: 'Initializing...', delay: 0 },
      { text: 'Loading configuration...', delay: 3000 },
      { text: 'Preparing services...', delay: 6000 },
      { text: 'Connecting to database...', delay: 9000 },
      { text: 'Checking authentication...', delay: 12000 },
      { text: 'Loading user data...', delay: 15000 },
      { text: 'Finalizing...', delay: 18000 },
    ];

    loadingStages.forEach(({ text, delay }) => {
      setTimeout(() => setLoadingText(text), delay);
    });

    // Finish after minimum splash time - 20 seconds to properly see all animations
    setTimeout(() => {
      onFinish();
    }, 20000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotation = loaderRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const centerDotOpacity = centerDotScale.interpolate({
    inputRange: [1, 1.5],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.container}>
      {/* Radial gradient background - matching Flutter design */}
      <LinearGradient
        colors={[
          '#1a4444', // Darker teal from center
          '#0d2828', // Even darker teal
          theme.colors.background.DEFAULT, // Fade to dark background
        ]}
        start={{ x: 0.3, y: 0.1 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated particles */}
      {Array.from({ length: 20 }).map((_, index) => {
        const random = (index * 137.5) % 100;
        return (
          <AnimatedParticle
            key={index}
            left={(random * 10) % width}
            top={((random * 20) % height)}
            delay={index * 100}
          />
        );
      })}

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo with circular background */}
        <View style={styles.logoWrapper}>
          {/* Outer fade rings for smooth color transition */}
          <View style={styles.fadeRingOuter} />
          <View style={styles.fadeRingMiddle} />

          {/* Static circular background with fade effect */}
          <View style={styles.logoCircleOuter}>
            <View style={styles.logoCircle}>
              {/* Animated stars */}
              {starsData.map((star, index) => (
                <Animated.View
                  key={star.id}
                  style={[
                    styles.star,
                    {
                      width: star.size,
                      height: star.size,
                      left: `${star.left}%`,
                      top: `${star.top}%`,
                      opacity: starAnimations[index],
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Animated logo image */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, logoPulse) },
                ],
              },
            ]}
          >
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* App title */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleSlide }],
            },
          ]}
        >
          MITUGYM
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleSlide }],
            },
          ]}
        >
          FITNESS TRACKER
        </Animated.Text>

        {/* Loading indicator - matching Flutter design */}
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              opacity: loaderOpacity,
              transform: [{ scale: loaderScale }],
            },
          ]}
        >
          {/* Circular progress ring */}
          <Animated.View
            style={[
              styles.loaderRing,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          />

          {/* Pulsing center dot */}
          <Animated.View
            style={[
              styles.centerDot,
              {
                opacity: centerDotOpacity,
                transform: [{ scale: centerDotScale }],
              },
            ]}
          />
        </Animated.View>

        {/* Loading text */}
        <Animated.Text
          style={[
            styles.loadingText,
            { opacity: textOpacity },
          ]}
        >
          {loadingText}
        </Animated.Text>
      </View>

      {/* Version info */}
      <Animated.View
        style={[
          styles.versionContainer,
          { opacity: versionOpacity },
        ]}
      >
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.copyright}>© 2025 MituGym. All rights reserved.</Text>
      </Animated.View>
    </View>
  );
};

// Animated particle component
const AnimatedParticle: React.FC<{ left: number; top: number; delay: number }> = ({
  left,
  top,
  delay,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 2000,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left,
          top,
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.DEFAULT,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary.DEFAULT,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 50,
    width: 420,
    height: 420,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Outermost fade ring - blends with page background
  fadeRingOuter: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 80,
    elevation: 5,
  },
  // Middle fade ring - transition layer
  fadeRingMiddle: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 60,
    elevation: 10,
  },
  logoCircleOuter: {
    position: 'absolute',
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 170,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    // Outer fade/blur effect
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 15,
  },
  logoCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    // Inner soft glow for smooth fade
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 20,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: theme.colors.primary.DEFAULT,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  logoContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 280,
    height: 280,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary.DEFAULT,
    letterSpacing: 6,
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.DEFAULT,
    letterSpacing: 8,
    marginTop: 8,
    opacity: 0.7,
  },
  loaderContainer: {
    marginTop: 80,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loaderRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.background.surface,
    borderTopColor: theme.colors.primary.DEFAULT,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary.DEFAULT,
  },
  loadingText: {
    marginTop: 30,
    fontSize: 13,
    color: 'rgba(77, 212, 212, 0.6)',
    letterSpacing: 1,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: 'rgba(77, 212, 212, 0.4)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 11,
    color: 'rgba(77, 212, 212, 0.3)',
    letterSpacing: 0.3,
  },
});

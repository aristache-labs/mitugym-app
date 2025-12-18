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
          toValue: 1.05,
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

    // Continuous loader rotation
    Animated.loop(
      Animated.timing(loaderRotate, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Continuous center dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(centerDotScale, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(centerDotScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
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

    // Simulate loading stages
    const loadingStages = [
      { text: 'Initializing...', delay: 0 },
      { text: 'Loading configuration...', delay: 800 },
      { text: 'Preparing services...', delay: 1600 },
      { text: 'Checking authentication...', delay: 2400 },
    ];

    loadingStages.forEach(({ text, delay }) => {
      setTimeout(() => setLoadingText(text), delay);
    });

    // Finish after minimum splash time
    setTimeout(() => {
      onFinish();
    }, 3000);
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
      {/* Radial gradient background */}
      <LinearGradient
        colors={[
          'rgba(77, 212, 212, 0.12)',
          theme.colors.background.DEFAULT,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1}}
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
        {/* Logo with glow */}
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
          <View style={styles.logoGlow} />
          <View style={styles.logo}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* App title with gradient */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
          }}
        >
          <LinearGradient
            colors={[
              theme.colors.primary.DEFAULT,
              theme.colors.accent.DEFAULT,
              theme.colors.primary.DEFAULT,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>MITUGYM</Text>
          </LinearGradient>
        </Animated.View>

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

        {/* Loading indicator */}
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              opacity: loaderOpacity,
              transform: [{ scale: loaderScale }],
            },
          ]}
        >
          {/* Rotating ring */}
          <Animated.View
            style={[
              styles.loaderRing,
              {
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <View style={styles.loaderSegment} />
          </Animated.View>

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
  logoContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  logoGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.primary.DEFAULT,
    opacity: 0.4,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
    elevation: 20,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.background.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.DEFAULT,
    letterSpacing: 8,
    marginTop: 12,
    opacity: 0.8,
  },
  loaderContainer: {
    marginTop: 80,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: theme.colors.background.surface,
    borderTopColor: theme.colors.primary.DEFAULT,
  },
  loaderSegment: {
    width: '100%',
    height: '100%',
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
    color: theme.colors.text.secondary,
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
    color: theme.colors.text.secondary,
    opacity: 0.5,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 11,
    color: theme.colors.text.secondary,
    opacity: 0.4,
    letterSpacing: 0.3,
  },
});

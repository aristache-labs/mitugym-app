import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { theme } from '../lib/theme';
import { PillButton } from '../components/PillButton';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Quick Check-In',
    description: 'Get into the gym fast with our secure QR code system. No more waiting in line.',
    image: '../assets/images/onboarding-1.png',
  },
  {
    id: 2,
    title: 'Book Your Classes',
    description: 'Reserve spots in your favorite classes and never miss out on the sessions you love.',
    image: '../assets/images/onboarding-2.png',
  },
  {
    id: 3,
    title: 'Manage Membership',
    description: 'Easily track your membership status and renew directly from the app.',
    image: '../assets/images/onboarding-3.png',
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated } = useAppStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  const slide = onboardingSlides[currentSlide];

  if (!slide) {
    return null;
  }

  return (
    <LinearGradient
      colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.xxl * 2,
          paddingBottom: theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Brand */}
        <View style={{
          alignItems: 'center',
          marginBottom: theme.spacing.xxl,
        }}>
          <Text style={{
            fontSize: 40,
            fontWeight: '700',
            color: theme.colors.primary.DEFAULT,
            letterSpacing: -1,
          }}>
            MITUGYM
          </Text>
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.xs,
          }}>
            Your fitness journey starts here
          </Text>
        </View>

        {/* Slide Content */}
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Image Placeholder */}
          <View style={{
            width: screenWidth * 0.7,
            height: screenWidth * 0.7,
            backgroundColor: 'rgba(30, 155, 113, 0.1)',
            borderRadius: theme.borderRadius.xl,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.xxl,
            borderWidth: 2,
            borderColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <Text style={{
              fontSize: theme.typography.h1.fontSize,
              color: theme.colors.primary.DEFAULT,
              fontWeight: '700',
            }}>
              {slide.id}
            </Text>
          </View>

          {/* Title */}
          <Text style={{
            fontSize: theme.typography.h1.fontSize,
            fontWeight: theme.typography.h1.fontWeight,
            color: theme.colors.text.primary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            {slide.title}
          </Text>

          {/* Description */}
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: theme.spacing.md,
          }}>
            {slide.description}
          </Text>
        </View>

        {/* Pagination Dots */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginVertical: theme.spacing.xl,
        }}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentSlide ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentSlide 
                  ? theme.colors.primary.DEFAULT 
                  : 'rgba(167, 195, 186, 0.3)',
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {currentSlide > 0 ? (
            <PillButton
              title="Previous"
              onPress={handlePrevious}
              variant="outline"
              icon={ChevronLeft}
              iconPosition="left"
            />
          ) : <View />}

          {currentSlide < onboardingSlides.length - 1 ? (
            <PillButton
              title="Next"
              onPress={handleNext}
              variant="primary"
              icon={ChevronRight}
              iconPosition="right"
            />
          ) : (
            <PillButton
              title="Get Started"
              onPress={handleGetStarted}
              variant="primary"
              size="large"
            />
          )}
        </View>

        {/* Skip option */}
        {currentSlide < onboardingSlides.length - 1 && (
          <View style={{
            alignItems: 'center',
            marginTop: theme.spacing.lg,
          }}>
            <PillButton
              title="Skip"
              onPress={handleGetStarted}
              variant="outline"
              size="small"
            />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

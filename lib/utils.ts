import { Platform } from 'react-native';
import type { TranslationKey } from './translations';

// Timer utilities for QR countdown
export const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getCountdownColor = (seconds: number): string => {
  if (seconds <= 10) {return '#e74c3c';} // error red
  if (seconds <= 30) {return '#f1c40f';} // warning yellow
  return '#1e9b71'; // primary green
};

// Date and time formatting utilities
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const date = new Date(dateString);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isTomorrow = (dateString: string): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const formatRelativeDate = (dateString: string): string => {
  if (isToday(dateString)) {return 'Today';}
  if (isTomorrow(dateString)) {return 'Tomorrow';}

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime12Hour = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Membership utilities
export const getMembershipStatusColor = (status: 'active' | 'expired'): string => {
  return status === 'active' ? '#2ecc71' : '#e74c3c';
};

export const getDaysLeftText = (daysLeft?: number, t?: (key: TranslationKey) => string): string => {
  if (!daysLeft || daysLeft <= 0) {
    return t ? t('expired') : 'Expired';
  }
  if (daysLeft === 1) {
    return t ? `1 ${t('dayLeft')}` : '1 day left';
  }
  return t ? `${daysLeft} ${t('daysLeft')}` : `${daysLeft} days left`;
};

export const getVisitsLeftText = (visitsLeft?: number): string => {
  if (!visitsLeft || visitsLeft <= 0) {return 'No visits left';}
  if (visitsLeft === 1) {return '1 visit left';}
  return `${visitsLeft} visits left`;
};

// Class level utilities
export const getLevelColor = (level: 'Beginner' | 'Intermediate' | 'Advanced'): string => {
  switch (level) {
    case 'Beginner':
      return '#2ecc71'; // success green
    case 'Intermediate':
      return '#f1c40f'; // warning yellow
    case 'Advanced':
      return '#e74c3c'; // error red
    default:
      return '#a7c3ba'; // secondary text
  }
};

export const getSpotsLeftText = (spotsLeft: number): string => {
  if (spotsLeft <= 0) {return 'Full';}
  if (spotsLeft === 1) {return '1 spot left';}
  if (spotsLeft <= 3) {return `${spotsLeft} spots left`;}
  return `${spotsLeft} available`;
};

// Haptic feedback utility
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium'): void => {
  if (Platform.OS === 'ios') {
    // In a real app, you would use Haptics.impactAsync() from expo-haptics
    console.log(`Haptic feedback: ${type}`);
  }
};

// Animation utilities
export const getCardElevation = (pressed: boolean) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: pressed ? 2 : 4 },
  shadowOpacity: pressed ? 0.1 : 0.15,
  shadowRadius: pressed ? 8 : 16,
  elevation: pressed ? 2 : 4,
});

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

// Platform-specific utilities
export const getHeaderHeight = (): number => {
  if (Platform.OS === 'ios') {
    return 100; // Includes safe area
  }
  return 80;
};

export const getTabBarHeight = (): number => {
  if (Platform.OS === 'ios') {
    return 90; // Includes safe area
  }
  return 70;
};

// Storage utilities (for future backend integration)
export const generateStorageKey = (prefix: string, id: string): string => {
  return `mitugym_${prefix}_${id}`;
};

// Price formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

// Random ID generation
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Deep clone utility
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

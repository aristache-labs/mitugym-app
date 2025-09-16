import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, Info, X } from 'lucide-react-native';
import { theme } from '../lib/theme';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  type,
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, duration, slideAnim, opacityAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(46, 204, 113, 0.9)',
          borderColor: theme.colors.status.success,
          iconColor: '#ffffff',
          textColor: '#ffffff',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(231, 76, 60, 0.9)',
          borderColor: theme.colors.status.error,
          iconColor: '#ffffff',
          textColor: '#ffffff',
        };
      default: // info
        return {
          backgroundColor: 'rgba(30, 155, 113, 0.9)',
          borderColor: theme.colors.primary.DEFAULT,
          iconColor: '#ffffff',
          textColor: '#ffffff',
        };
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      default:
        return Info;
    }
  };

  const colors = getToastColors();
  const Icon = getToastIcon();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top + theme.spacing.md,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={{
          backgroundColor: colors.backgroundColor,
          borderLeftWidth: 4,
          borderLeftColor: colors.borderColor,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          ...theme.shadows.strong,
          ...(Platform.OS === 'android' && {
            elevation: 8,
          }),
        }}
      >
        {/* Icon */}
        <Icon
          size={24}
          color={colors.iconColor}
          style={{ marginRight: theme.spacing.md }}
        />

        {/* Message */}
        <Text
          style={{
            flex: 1,
            fontSize: theme.typography.body.fontSize,
            fontWeight: '500',
            color: colors.textColor,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {message}
        </Text>

        {/* Dismiss button */}
        <TouchableOpacity
          onPress={handleDismiss}
          style={{
            padding: theme.spacing.xs,
            marginLeft: theme.spacing.sm,
          }}
          activeOpacity={0.7}
        >
          <X
            size={20}
            color={colors.iconColor}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

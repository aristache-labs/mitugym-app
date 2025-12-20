import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogIn, Check, Save, RefreshCw, Calendar, X } from 'lucide-react-native';

interface StyledButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: 'login' | 'check' | 'save' | 'refresh' | 'calendar' | 'x';
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = 'login',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const iconTranslateX = React.useRef(new Animated.Value(0)).current;
  const iconScale = React.useRef(new Animated.Value(1)).current;
  const textOpacity = React.useRef(new Animated.Value(1)).current;

  const renderIcon = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="#a0f0f0" />;
    }

    const iconProps = { size: 16, color: '#a0f0f099', strokeWidth: 2 };

    switch (icon) {
      case 'check':
        return <Check {...iconProps} />;
      case 'save':
        return <Save {...iconProps} />;
      case 'refresh':
        return <RefreshCw {...iconProps} />;
      case 'calendar':
        return <Calendar {...iconProps} />;
      case 'x':
        return <X {...iconProps} />;
      case 'login':
      default:
        return <LogIn {...iconProps} />;
    }
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconTranslateX, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1.25,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconTranslateX, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        <LinearGradient
          colors={
            disabled
              ? ['#1e293b', '#1e293b', '#1e293b']
              : ['#475569bf', '#164e6373', '#475569bf']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            disabled && styles.gradientDisabled,
          ]}
        >
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { translateX: iconTranslateX },
                  { scale: iconScale },
                ],
              },
            ]}
          >
            {renderIcon()}
          </Animated.View>

          {/* Text */}
          <Animated.Text
            style={[
              styles.text,
              { opacity: textOpacity },
              disabled && styles.textDisabled,
            ]}
          >
            {title}
          </Animated.Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  fullWidth: {
    width: '100%',
    maxWidth: 240,
  },
  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#164e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    height: 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    position: 'relative',
    zIndex: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: '#64748b',
  },
});

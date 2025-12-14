import React, { useState } from 'react';
import { View, TextInput, TextInputProps, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../lib/theme';

interface StyledInputProps extends Omit<TextInputProps, 'style'> {
  icon?: 'email' | 'password';
  label?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  isPassword?: boolean;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  icon,
  label,
  onChangeText,
  value,
  isPassword = false,
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#00d4d4', '#00e5e5'],
  });

  const borderWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const iconOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const labelOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const renderIcon = () => {
    if (icon === 'email') {
      return <Mail size={20} color="#00d4d4" />;
    } else if (icon === 'password') {
      return <Lock size={20} color="#00d4d4" />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              opacity: labelOpacity,
              color: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(255, 255, 255, 0.6)', '#00d4d4'],
              }),
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor: borderColor,
            borderWidth: borderWidth,
            shadowColor: '#00d4d4',
            shadowOpacity: shadowOpacity,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {/* Background overlay */}
        <View style={styles.innerBackground} />

        {/* Top decorator */}
        <Animated.View
          style={[
            styles.decoratorTop,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 20],
              }),
              left: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['80%', '20%'],
              }),
            },
          ]}
        />

        {/* Bottom decorator */}
        <Animated.View
          style={[
            styles.decoratorBottom,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 20],
              }),
              left: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '80%'],
              }),
            },
          ]}
        />

        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { opacity: iconOpacity }]}>
          {renderIcon()}
        </Animated.View>

        {/* Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          secureTextEntry={isPassword && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          {...props}
        />

        {/* Eye icon for password */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="rgba(255, 255, 255, 0.7)" />
            ) : (
              <Eye size={20} color="rgba(255, 255, 255, 0.7)" />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'visible',
    elevation: 5,
  },
  innerBackground: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    backgroundColor: '#0f1419',
    borderRadius: 6,
  },
  decoratorTop: {
    position: 'absolute',
    top: -2.5,
    height: 3,
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#00d4d4',
    transform: [{ translateX: -2.5 }],
    zIndex: 10,
  },
  decoratorBottom: {
    position: 'absolute',
    bottom: -2.5,
    height: 3,
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#00d4d4',
    transform: [{ translateX: -2.5 }],
    zIndex: 10,
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -16 }],
    zIndex: 5,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    paddingLeft: 56,
    paddingRight: 50,
    paddingVertical: 16,
    fontSize: 15,
    color: '#ffffff',
    zIndex: 1,
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -16 }],
    zIndex: 5,
    padding: 5,
  },
});

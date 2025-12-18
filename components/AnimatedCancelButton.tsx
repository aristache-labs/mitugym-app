import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

interface AnimatedCancelButtonProps {
  onPress: () => void;
  size?: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const AnimatedCancelButton: React.FC<AnimatedCancelButtonProps> = ({
  onPress,
  size = 32,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Trigger cancel animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation after a short delay
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, 100);
    });

    // Call the actual onPress handler
    onPress();
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate: rotation }],
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 100 100" fill="none">
          <AnimatedCircle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255, 193, 7, 0.9)"
            strokeWidth="4"
            fill="none"
          />
          <AnimatedLine
            x1="30"
            y1="30"
            x2="70"
            y2="70"
            stroke="rgba(255, 193, 7, 0.9)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <AnimatedLine
            x1="70"
            y1="30"
            x2="30"
            y2="70"
            stroke="rgba(255, 193, 7, 0.9)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    shadowColor: 'rgba(255, 193, 7, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});

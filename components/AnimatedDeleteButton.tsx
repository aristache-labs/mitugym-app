import React, { useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import Svg, { Line, Path, Mask } from 'react-native-svg';

interface AnimatedDeleteButtonProps {
  onPress: () => void;
  size?: number;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const AnimatedDeleteButton: React.FC<AnimatedDeleteButtonProps> = ({
  onPress,
  size = 32,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const lidRotation = useRef(new Animated.Value(0)).current;
  const binTranslateY = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    // Trigger delete animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(lidRotation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(binTranslateY, {
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
          Animated.timing(lidRotation, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(binTranslateY, {
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

  const rotation = lidRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg'],
  });

  const binTranslate = binTranslateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
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
          transform: [{ scale: scaleAnim }],
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Bin Lid (Top) */}
        <Animated.View
          style={{
            position: 'absolute',
            top: '18%',
            transform: [{ rotate: rotation }],
            transformOrigin: 'center',
          }}
        >
          <Svg width={size * 0.55} height={size * 0.15} viewBox="0 0 39 7" fill="none">
            <AnimatedLine
              y1="5"
              x2="39"
              y2="5"
              stroke="rgba(255, 107, 107, 0.9)"
              strokeWidth="4"
            />
            <AnimatedLine
              x1="12"
              y1="1.5"
              x2="26"
              y2="1.5"
              stroke="rgba(255, 107, 107, 0.9)"
              strokeWidth="3"
            />
          </Svg>
        </Animated.View>

        {/* Bin Body (Bottom) */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: '18%',
            transform: [{ translateY: binTranslate }],
          }}
        >
          <Svg width={size * 0.45} height={size * 0.55} viewBox="0 0 33 39" fill="none">
            <Mask id="path-1-inside-1" fill="rgba(255, 107, 107, 0.9)">
              <Path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" />
            </Mask>
            <AnimatedPath
              d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
              fill="rgba(255, 107, 107, 0.9)"
              mask="url(#path-1-inside-1)"
            />
            <AnimatedLine
              x1="12"
              y1="6"
              x2="12"
              y2="29"
              stroke="rgba(255, 107, 107, 0.9)"
              strokeWidth="4"
            />
            <AnimatedLine
              x1="21"
              y1="6"
              x2="21"
              y2="29"
              stroke="rgba(255, 107, 107, 0.9)"
              strokeWidth="4"
            />
          </Svg>
        </Animated.View>
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
    borderColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: 'rgba(255, 107, 107, 0.5)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});

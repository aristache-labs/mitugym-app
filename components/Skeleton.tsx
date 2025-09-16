import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.sm,
  style,
}: SkeletonProps) {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          opacity: fadeAnim,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['rgba(167, 195, 186, 0.1)', 'rgba(167, 195, 186, 0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flex: 1,
          borderRadius,
        }}
      />
    </Animated.View>
  );
}

// Predefined skeleton components for common use cases
export function SkeletonCard() {
  return (
    <View style={{
      backgroundColor: theme.colors.background.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.md,
      }}>
        <Skeleton width="60%" height={24} borderRadius={theme.borderRadius.sm} />
        <Skeleton width={60} height={20} borderRadius={theme.borderRadius.lg} />
      </View>

      <Skeleton width="40%" height={16} borderRadius={theme.borderRadius.xs} />
      <View style={{ marginTop: theme.spacing.sm }}>
        <Skeleton width="80%" height={16} borderRadius={theme.borderRadius.xs} />
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.lg,
      }}>
        <Skeleton width="30%" height={16} borderRadius={theme.borderRadius.xs} />
        <Skeleton width="25%" height={16} borderRadius={theme.borderRadius.xs} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

export function SkeletonHeader() {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Skeleton
          width={40}
          height={40}
          borderRadius={theme.borderRadius.full}
          style={{ marginRight: theme.spacing.md }}
        />
        <View>
          <Skeleton width={120} height={20} borderRadius={theme.borderRadius.xs} />
          <Skeleton
            width={80}
            height={14}
            borderRadius={theme.borderRadius.xs}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>
      <Skeleton
        width={40}
        height={40}
        borderRadius={theme.borderRadius.full}
      />
    </View>
  );
}

import { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, RefreshCw } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { formatCountdown, getCountdownColor } from '../lib/utils';
import { PillButton } from './PillButton';

interface QRCardProps {
  token: string;
  expiresAt: number;
  isValid: boolean;
  onRefresh: () => void;
}

export function QRCard({ token, expiresAt, isValid, onRefresh }: QRCardProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(remaining);

      // Start pulsing animation when time is running out
      if (remaining <= 10 && remaining > 0) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, pulseAnim]);

  const countdownColor = getCountdownColor(timeLeft);
  const isExpired = timeLeft <= 0;

  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    }}>
      {/* Status Banner */}
      <View style={{
        backgroundColor: isValid && !isExpired
          ? 'rgba(46, 204, 113, 0.2)'
          : 'rgba(231, 76, 60, 0.2)',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <Text style={{
          fontSize: theme.typography.caption.fontSize,
          fontWeight: '600',
          color: isValid && !isExpired
            ? theme.colors.status.success
            : theme.colors.status.error,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {isValid && !isExpired ? 'Valid Now' : 'Expired — Renew'}
        </Text>
      </View>

      {/* QR Code Container */}
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
        }}
      >
        <LinearGradient
          colors={[
            'rgba(30, 155, 113, 0.1)',
            'rgba(17, 22, 24, 0.9)',
          ]}
          style={{
            width: 280,
            height: 280,
            borderRadius: theme.borderRadius.xl,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: isValid && !isExpired
              ? theme.colors.primary.DEFAULT
              : theme.colors.status.error,
            ...theme.shadows.strong,
          }}
        >
          {/* QR Icon placeholder */}
          <QrCode
            size={120}
            color={isValid && !isExpired
              ? theme.colors.primary.DEFAULT
              : theme.colors.text.secondary}
          />

          {/* Token Display */}
          <Text style={{
            fontSize: theme.typography.h2.fontSize,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginTop: theme.spacing.md,
            fontFamily: 'monospace',
            letterSpacing: 2,
          }}>
            {token}
          </Text>

          {/* Member ID (mock) */}
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.sm,
          }}>
            Member ID: #001234
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Countdown Timer */}
      <View style={{
        marginTop: theme.spacing.xl,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.sm,
        }}>
          {isExpired ? 'Expired' : 'Valid for'}
        </Text>

        <Text style={{
          fontSize: theme.typography.h1.fontSize,
          fontWeight: '700',
          color: countdownColor,
          fontFamily: 'monospace',
          marginBottom: theme.spacing.md,
        }}>
          {isExpired ? '00:00' : formatCountdown(timeLeft)}
        </Text>

        {/* Progress bar */}
        <View style={{
          width: 200,
          height: 4,
          backgroundColor: 'rgba(167, 195, 186, 0.3)',
          borderRadius: 2,
          overflow: 'hidden',
          marginBottom: theme.spacing.lg,
        }}>
          <View style={{
            width: `${isExpired ? 0 : (timeLeft / 60) * 100}%`,
            height: '100%',
            backgroundColor: countdownColor,
            borderRadius: 2,
          }} />
        </View>

        {/* Refresh Button */}
        <PillButton
          title={isExpired ? 'Generate New QR' : 'Refresh'}
          onPress={onRefresh}
          icon={RefreshCw}
          variant={isExpired ? 'primary' : 'outline'}
          size="medium"
        />
      </View>

      {/* Instructions */}
      <View style={{
        marginTop: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
      }}>
        <Text style={{
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          lineHeight: 20,
        }}>
          {isValid && !isExpired
            ? 'Show this QR code to gym staff for entry. QR codes expire every 60 seconds for security.'
            : 'QR code has expired. Generate a new one to enter the gym.'
          }
        </Text>
      </View>
    </View>
  );
}

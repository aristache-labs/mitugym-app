import { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Shield } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../lib/theme';
import { formatCountdown, getCountdownColor } from '../lib/utils';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../lib/LanguageContext';
import { generateQRContent, formatTOTPCode } from '../utils/totp';

interface QRCardProps {
  token: string;
  expiresAt: number;
  isValid: boolean;
  onRefresh: () => void;
  useTOTP?: boolean;
  totpCode?: string;
  totpTimeRemaining?: number;
  memberId?: string;
}

export function QRCard({
  token,
  expiresAt,
  isValid,
  onRefresh,
  useTOTP = false,
  totpCode = '',
  totpTimeRemaining = 30,
  memberId = '',
}: QRCardProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Use TOTP time remaining if TOTP is enabled, otherwise use legacy timer
  const effectiveTimeLeft = useTOTP ? totpTimeRemaining : timeLeft;
  const effectiveToken = useTOTP ? totpCode : token;
  const qrContent = useTOTP && memberId ? generateQRContent(memberId, totpCode) : token;
  const effectiveIsValid = useTOTP ? (totpCode.length === 6 && totpTimeRemaining > 0) : isValid;

  useEffect(() => {
    if (!useTOTP) {
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
    }
    return undefined;
  }, [expiresAt, pulseAnim, useTOTP]);

  // Pulse animation for TOTP when time is running out
  useEffect(() => {
    if (useTOTP && totpTimeRemaining <= 10 && totpTimeRemaining > 0) {
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
  }, [totpTimeRemaining, useTOTP, pulseAnim]);

  const countdownColor = getCountdownColor(effectiveTimeLeft);
  const isExpired = effectiveTimeLeft <= 0;

  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    }}>
      {/* Status Banner */}
      <View style={{
        backgroundColor: effectiveIsValid && !isExpired
          ? 'rgba(46, 204, 113, 0.2)'
          : 'rgba(231, 76, 60, 0.2)',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {useTOTP && (
          <Shield
            size={14}
            color={effectiveIsValid && !isExpired
              ? theme.colors.status.success
              : theme.colors.status.error}
            style={{ marginRight: theme.spacing.xs }}
          />
        )}
        <Text style={{
          fontSize: theme.typography.caption.fontSize,
          fontWeight: '600',
          color: effectiveIsValid && !isExpired
            ? theme.colors.status.success
            : theme.colors.status.error,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          {useTOTP
            ? (effectiveIsValid && !isExpired ? t('validNow') + ' • TOTP' : t('expiredRenew'))
            : (effectiveIsValid && !isExpired ? t('validNow') : t('expiredRenew'))
          }
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
            width: 320,
            height: 380,
            borderRadius: theme.borderRadius.xl,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: effectiveIsValid && !isExpired
              ? theme.colors.primary.DEFAULT
              : theme.colors.status.error,
            ...theme.shadows.strong,
            paddingVertical: theme.spacing.lg,
          }}
        >
          {/* Actual QR Code */}
          {useTOTP && qrContent ? (
            <View style={{
              padding: theme.spacing.sm,
              backgroundColor: 'white',
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.md,
            }}>
              <QRCode
                value={qrContent}
                size={200}
                color="#000000"
                backgroundColor="white"
              />
            </View>
          ) : (
            <>
              {/* QR Icon placeholder for legacy */}
              <QrCode
                size={120}
                color={effectiveIsValid && !isExpired
                  ? theme.colors.primary.DEFAULT
                  : theme.colors.text.secondary}
              />
            </>
          )}

          {/* Token Display */}
          <Text style={{
            fontSize: useTOTP ? 32 : theme.typography.h2.fontSize,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginTop: useTOTP ? theme.spacing.sm : theme.spacing.md,
            fontFamily: 'monospace',
            letterSpacing: useTOTP ? 6 : 2,
          }}>
            {useTOTP ? formatTOTPCode(effectiveToken) : token}
          </Text>

          {/* Member ID */}
          {memberId && useTOTP && (
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.xs,
            }}>
              ID: {memberId.substring(0, 8)}...
            </Text>
          )}
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
          {isExpired ? t('expired') : t('validFor')}
        </Text>

        <Text style={{
          fontSize: theme.typography.h1.fontSize,
          fontWeight: '700',
          color: countdownColor,
          fontFamily: 'monospace',
          marginBottom: theme.spacing.md,
        }}>
          {isExpired ? '00:00' : formatCountdown(effectiveTimeLeft)}
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
            width: `${isExpired ? 0 : (effectiveTimeLeft / (useTOTP ? 30 : 60)) * 100}%`,
            height: '100%',
            backgroundColor: countdownColor,
            borderRadius: 2,
          }} />
        </View>

        {/* Refresh Button - Only show for legacy token system */}
        {!useTOTP && (
          <View style={{ width: '100%', maxWidth: 300 }}>
            <StyledButton
              title={isExpired ? t('generateNewQr') : t('refresh')}
              onPress={onRefresh}
              fullWidth
            />
          </View>
        )}
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
          {effectiveIsValid && !isExpired
            ? t('qrInstructions')
            : t('qrExpiredInstructions')
          }
        </Text>
      </View>
    </View>
  );
}

import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { QRCard } from '../../components/QRCard';
import { useLanguage } from '../../lib/LanguageContext';

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const {
    token,
    expiresAt,
    isValid,
    totpSecret,
    totpCode,
    totpTimeRemaining,
    member,
    generateNewToken,
    checkExpiry,
    initializeTOTP,
    generateTOTPCode,
    updateTOTPTimeRemaining,
  } = useAppStore();

  // Initialize TOTP on mount
  useEffect(() => {
    initializeTOTP();
  }, [initializeTOTP]);

  // Update TOTP time remaining every second
  useEffect(() => {
    if (totpSecret) {
      const interval = setInterval(() => {
        updateTOTPTimeRemaining();
      }, 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [totpSecret, updateTOTPTimeRemaining]);

  // Check expiry every second (legacy)
  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiry();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkExpiry]);

  // Auto-regenerate token when it expires (legacy)
  useEffect(() => {
    if (!isValid && !totpSecret) {
      const timer = setTimeout(() => {
        generateNewToken();
      }, 2000); // Wait 2 seconds before auto-generating new token

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isValid, totpSecret, generateNewToken]);

  const handleRefresh = () => {
    if (totpSecret) {
      generateTOTPCode();
    } else {
      generateNewToken();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={t('gymEntry')}
        subtitle={t('showQrToStaff')}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        <QRCard
          token={token}
          expiresAt={expiresAt}
          isValid={isValid}
          onRefresh={handleRefresh}
          useTOTP={!!totpSecret}
          totpCode={totpCode}
          totpTimeRemaining={totpTimeRemaining}
          memberId={member?.id || ''}
        />
      </ScrollView>
    </View>
  );
}

import React, { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { QRCard } from '../../components/QRCard';

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  
  const { 
    token,
    expiresAt,
    isValid,
    generateNewToken,
    checkExpiry
  } = useAppStore();

  // Check expiry every second
  useEffect(() => {
    const interval = setInterval(() => {
      checkExpiry();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkExpiry]);

  // Auto-regenerate token when it expires
  useEffect(() => {
    if (!isValid) {
      const timer = setTimeout(() => {
        generateNewToken();
      }, 2000); // Wait 2 seconds before auto-generating new token

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isValid, generateNewToken]);

  const handleRefresh = () => {
    generateNewToken();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title="Gym Entry"
        subtitle="Show QR code to staff"
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
        />
      </ScrollView>
    </View>
  );
}

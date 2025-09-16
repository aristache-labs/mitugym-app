import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Apple, Chrome } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAppStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleMagicLinkLogin = async () => {
    if (!isValidEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      // Mock magic link login
      await login(email);
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'apple' | 'google') => {
    // Mock social login
    console.log(`${provider} login initiated`);
    // In real app, implement social auth here
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
      style={{ flex: 1 }}
    >
      <AppHeader
        title="Welcome Back"
        subtitle="Sign in to continue"
        showBack
        onBack={handleBack}
        transparent
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: 120, // Account for transparent header
            paddingBottom: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={{
            alignItems: 'center',
            marginBottom: theme.spacing.xxl,
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '700',
              color: theme.colors.primary.DEFAULT,
              letterSpacing: -1,
              marginBottom: theme.spacing.sm,
            }}>
              MITUGYM
            </Text>
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              Your fitness journey continues
            </Text>
          </View>

          {/* Magic Link Form */}
          <View style={{
            backgroundColor: theme.colors.background.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
            borderWidth: 1,
            borderColor: 'rgba(30, 155, 113, 0.2)',
            ...theme.shadows.medium,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
            }}>
              <Mail
                size={24}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                Sign in with Email
              </Text>
            </View>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              style={{
                backgroundColor: 'rgba(30, 155, 113, 0.05)',
                borderWidth: 1,
                borderColor: isValidEmail(email)
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(167, 195, 186, 0.3)',
                borderRadius: theme.borderRadius.lg,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
              }}
            />

            <PillButton
              title="Send Magic Link"
              onPress={handleMagicLinkLogin}
              variant="primary"
              size="large"
              fullWidth
              disabled={!isValidEmail(email)}
              loading={isLoading}
            />

            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              marginTop: theme.spacing.md,
              lineHeight: 18,
            }}>
              We'll send you a secure link to sign in instantly
            </Text>
          </View>

          {/* Divider */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: theme.spacing.xl,
          }}>
            <View style={{
              flex: 1,
              height: 1,
              backgroundColor: 'rgba(167, 195, 186, 0.3)',
            }} />
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              paddingHorizontal: theme.spacing.lg,
            }}>
              OR
            </Text>
            <View style={{
              flex: 1,
              height: 1,
              backgroundColor: 'rgba(167, 195, 186, 0.3)',
            }} />
          </View>

          {/* Social Login Buttons */}
          <View style={{ gap: theme.spacing.md }}>
            <PillButton
              title="Continue with Apple"
              onPress={() => handleSocialLogin('apple')}
              variant="outline"
              size="large"
              fullWidth
              icon={Apple}
            />

            <PillButton
              title="Continue with Google"
              onPress={() => handleSocialLogin('google')}
              variant="outline"
              size="large"
              fullWidth
              icon={Chrome}
            />
          </View>

          {/* Terms */}
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
            lineHeight: 18,
          }}>
            By continuing, you agree to our{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              Privacy Policy
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

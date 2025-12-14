import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Key, ArrowLeft } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StyledButton } from '../../components/StyledButton';
import { StyledInput } from '../../components/StyledInput';
import { PillButton } from '../../components/PillButton';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../utils/supabase';

export default function RecoveryScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useAppStore();
  const { t } = useLanguage();

  const handlePasswordReset = async () => {
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'mitugym://reset-password',
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      showToast('Password reset email sent! Check your inbox.', 'success');
    } catch (error) {
      showToast('Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleResendEmail = async () => {
    setEmailSent(false);
    await handlePasswordReset();
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
      style={{ flex: 1 }}
    >
      <AppHeader
        title={t('resetPassword')}
        subtitle={t('recoverYourAccount')}
        showBack
        onBack={handleBack}
        transparent={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={{
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 120,
                height: 120,
                marginBottom: theme.spacing.sm,
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              {t('recoveryFormSubtitle')}
            </Text>
          </View>

          {!emailSent ? (
            /* Reset Form */
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.xl,
              borderWidth: 1,
              borderColor: 'rgba(77, 212, 212, 0.2)',
              ...theme.shadows.medium,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <Key
                  size={24}
                  color={theme.colors.primary.DEFAULT}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: theme.typography.h3.fontWeight,
                  color: theme.colors.text.primary,
                }}>
                  {t('resetPassword')}
                </Text>
              </View>

              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                lineHeight: 22,
                marginBottom: theme.spacing.lg,
              }}>
                {t('resetPasswordDescription')}
              </Text>

              {/* Email Input */}
              <StyledInput
                icon="email"
                label={t('emailAddress').toUpperCase()}
                value={email}
                onChangeText={setEmail}
                placeholder={t('emailAddress')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />

              {/* Reset Button */}
              <StyledButton
                title={t('sendResetLink')}
                onPress={handlePasswordReset}
                fullWidth
                disabled={!isValidEmail(email)}
                loading={isLoading}
              />

              <Text style={{
                fontSize: theme.typography.small.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: theme.spacing.md,
                lineHeight: 18,
              }}>
                {t('linkExpiresInfo')}
              </Text>
            </View>
          ) : (
            /* Success Message */
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xl,
              marginBottom: theme.spacing.xl,
              borderWidth: 1,
              borderColor: 'rgba(77, 212, 212, 0.2)',
              ...theme.shadows.medium,
            }}>
              <View style={{
                alignItems: 'center',
                marginBottom: theme.spacing.lg,
              }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(77, 212, 212, 0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.lg,
                }}>
                  <Mail
                    size={32}
                    color={theme.colors.primary.DEFAULT}
                  />
                </View>
                <Text style={{
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: theme.typography.h3.fontWeight,
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  marginBottom: theme.spacing.md,
                }}>
                  {t('checkYourEmail')}
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  lineHeight: 22,
                  marginBottom: theme.spacing.lg,
                }}>
                  {t('resetEmailSent')}{'\n'}
                  <Text style={{ fontWeight: '600', color: theme.colors.text.primary }}>
                    {email}
                  </Text>
                </Text>
              </View>

              <PillButton
                title={t('resendEmail')}
                onPress={handleResendEmail}
                variant="outline"
                size="small"
                fullWidth
                loading={isLoading}
              />

              <Text style={{
                fontSize: theme.typography.small.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: theme.spacing.md,
                lineHeight: 18,
              }}>
                Didn't receive the email? Check your spam folder or try again.
              </Text>
            </View>
          )}

          {/* Back to Login Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}>
            <ArrowLeft
              size={16}
              color={theme.colors.text.secondary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  {t('backToSignIn')}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Help */}
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
            lineHeight: 18,
          }}>
            {t('stillHavingTrouble')}{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              {t('contactSupport')}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

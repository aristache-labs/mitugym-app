import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithSupabase, isAuthenticated, showToast } = useAppStore();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithSupabase(email, password);
      // Don't manually navigate - let the auth state change handle navigation
    } catch (error) {
      showToast('Invalid email or password', 'error');
    } finally {
      setIsLoading(false);
    }
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
        subtitle="Sign in to your account"
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

          {/* Login Form */}
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
              marginBottom: theme.spacing.lg,
            }}>
              <Lock
                size={24}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                Sign In
              </Text>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: isValidEmail(email)
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <Mail
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{ marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  style={{
                    flex: 1,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: password.length >= 6
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <Lock
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{ marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  style={{
                    flex: 1,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{
                    padding: theme.spacing.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={theme.colors.text.secondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <PillButton
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="medium"
              fullWidth
              disabled={!isValidEmail(email) || password.length < 6}
              loading={isLoading}
            />

            {/* Forgot Password Link */}
            <View style={{
              alignItems: 'center',
              marginTop: theme.spacing.lg,
            }}>
              <Link href="/(auth)/recovery" asChild>
                <TouchableOpacity>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.primary.DEFAULT,
                    textAlign: 'center',
                  }}>
                    Forgot your password?
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Register Link */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}>
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              marginRight: theme.spacing.sm,
            }}>
              Don't have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Terms */}
          <Text style={{
            fontSize: theme.typography.small.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
            lineHeight: 18,
          }}>
            By signing in, you agree to our{' '}
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

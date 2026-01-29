import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Check, Fingerprint } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { SecureStorage } from '../../utils/secureStorage';
import { useLanguage } from '../../lib/LanguageContext';
import { StyledInput } from '../../components/StyledInput';
import { StyledButton } from '../../components/StyledButton';
import {
  authenticateWithBiometrics,
  getBiometricTypeName,
  recordBiometricFailure,
  clearBiometricFailure,
} from '../../utils/biometricAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const { loginWithSupabase, isAuthenticated, showToast } = useAppStore();
  const { t } = useLanguage();

  const validateEmail = (showEmptyError = true) => {
    if (!email.trim()) {
      if (showEmptyError) {
        setEmailError(t('emailRequired'));
      }
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError(t('invalidEmail'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (showEmptyError = true) => {
    if (!password) {
      if (showEmptyError) {
        setPasswordError(t('passwordRequired'));
      }
      return false;
    }
    if (password.length < 6) {
      setPasswordError(t('passwordTooShort'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleBiometricLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Attempting biometric login...');

      // Get the last user who used biometrics on this device
      const lastUserId = await SecureStorage.getLastBiometricUserId();
      if (!lastUserId) {
        console.log('No biometric user found on this device');
        showToast(t('biometricFailed'), 'error');
        return;
      }

      // Authenticate with biometrics
      const result = await authenticateWithBiometrics(t('biometricPrompt'));

      if (result.success) {
        // Get stored credentials for this user
        const credentials = await SecureStorage.getBiometricCredentials(lastUserId);

        if (!credentials) {
          console.log('No biometric credentials found for user:', lastUserId);
          showToast(t('biometricFailed'), 'error');
          await recordBiometricFailure(lastUserId);
          return;
        }

        // Login with stored credentials
        console.log('Logging in with biometric credentials...');
        await loginWithSupabase(credentials.email, credentials.password, false);

        // Clear any previous failure records on success
        await clearBiometricFailure(lastUserId);
      } else {
        // User cancelled or authentication failed
        console.log('Biometric authentication failed:', result.error);
        await recordBiometricFailure(lastUserId);

        // Don't show error toast for user cancellation
        if (result.error && !result.error.includes('cancel')) {
          showToast(t('biometricFailed'), 'error');
        }
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      const lastUserId = await SecureStorage.getLastBiometricUserId();
      if (lastUserId) {
        await recordBiometricFailure(lastUserId);
      }
      showToast(t('biometricFailed'), 'error');
    } finally {
      setIsLoading(false);
    }
  }, [t, showToast, loginWithSupabase]);

  // Check biometric availability (no auto-prompt, user chooses)
  React.useEffect(() => {
    const initializeBiometric = async () => {
      try {
        // Check if biometric is available for manual use
        const typeName = await getBiometricTypeName();
        setBiometricType(typeName);

        // Get the last user who used biometrics on this device
        const lastUserId = await SecureStorage.getLastBiometricUserId();
        if (lastUserId) {
          const enabled = await SecureStorage.isBiometricEnabled(lastUserId);
          const hasCredentials = await SecureStorage.hasBiometricCredentials(lastUserId);
          console.log('Biometric check for last user:', lastUserId, '- enabled:', enabled, 'hasCredentials:', hasCredentials);
          setBiometricAvailable(enabled && hasCredentials);
        } else {
          console.log('No previous biometric user found');
          setBiometricAvailable(false);
        }
      } catch (error) {
        console.log('Failed to initialize biometric:', error);
      }
    };

    const loadRememberedEmail = async () => {
      try {
        const rememberMeData = await SecureStorage.getRememberMeData();
        if (rememberMeData?.email) {
          setEmail(rememberMeData.email);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Failed to load remembered email:', error);
      }
    };

    initializeBiometric();
    loadRememberedEmail();
  }, []);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoginError('');
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      await loginWithSupabase(email, password, rememberMe);
      // Don't manually navigate - let the auth state change handle navigation
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(t('invalidCredentials'));
      showToast(t('invalidCredentials'), 'error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <LinearGradient
      colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
      style={{ flex: 1 }}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xxl * 2,
            paddingBottom: theme.spacing.xl,
            justifyContent: 'center',
          }}
        >
          {/* Brand */}
          <View style={{
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 100,
                height: 100,
                marginBottom: theme.spacing.xs,
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: theme.typography.small.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              {t('fitnessJourneySubtitle')}
            </Text>
          </View>

          {/* Login Form */}
          <View style={{
            backgroundColor: theme.colors.background.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
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
                {t('signIn')}
              </Text>
            </View>

            {/* Biometric Login Button - Compact at top */}
            {biometricAvailable && !isLoading && (
              <>
                <View style={{
                  alignItems: 'center',
                  marginBottom: theme.spacing.sm,
                }}>
                  <TouchableOpacity
                    onPress={handleBiometricLogin}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: theme.spacing.sm + 2,
                      paddingHorizontal: theme.spacing.lg,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.colors.primary.DEFAULT,
                      ...theme.shadows.medium,
                    }}
                    activeOpacity={0.8}
                  >
                    <Fingerprint
                      size={18}
                      color="#ffffff"
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.small.fontSize,
                      color: '#ffffff',
                      fontWeight: '600',
                    }}>
                      {t('useBiometric').replace('{type}', biometricType)}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: theme.spacing.md,
                }}>
                  <View style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: 'rgba(179, 217, 217, 0.3)',
                  }} />
                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.text.secondary,
                    marginHorizontal: theme.spacing.sm,
                    fontWeight: '500',
                  }}>
                    {t('or')}
                  </Text>
                  <View style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: 'rgba(179, 217, 217, 0.3)',
                  }} />
                </View>
              </>
            )}

            {/* Email Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <StyledInput
                icon="email"
                label={t('emailAddress').toUpperCase()}
                value={email}
                hasError={!!emailError}
                onChangeText={(text) => {
                  setEmail(text);
                  // Clear error immediately when user types
                  if (emailError) {
                    setEmailError('');
                  }
                  setLoginError('');
                }}
                onBlur={() => {
                  // Only validate if field has content or if it was previously filled
                  if (email.trim()) {
                    validateEmail();
                  }
                }}
                placeholder={t('emailAddress')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              {emailError ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: 4,
                  marginLeft: theme.spacing.sm,
                }}>
                  {emailError}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <StyledInput
                icon="password"
                label={t('password').toUpperCase()}
                value={password}
                hasError={!!passwordError}
                onChangeText={(text) => {
                  setPassword(text);
                  // Clear error immediately when user types
                  if (passwordError) {
                    setPasswordError('');
                  }
                  setLoginError('');
                }}
                onBlur={() => {
                  // Only validate if field has content or if it was previously filled
                  if (password.trim()) {
                    validatePassword();
                  }
                }}
                placeholder={t('password')}
                isPassword={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
              {passwordError ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: 4,
                  marginLeft: theme.spacing.sm,
                }}>
                  {passwordError}
                </Text>
              ) : null}
            </View>

            {/* Login Error Message */}
            {loginError ? (
              <View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
              }}>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.status.error,
                  textAlign: 'center',
                }}>
                  {loginError}
                </Text>
              </View>
            ) : null}

            {/* Remember Me Checkbox */}
             <View style={{
               alignItems: 'center',
               justifyContent: 'center',
               marginBottom: theme.spacing.lg,
             }}>
               <TouchableOpacity
                 onPress={() => setRememberMe(!rememberMe)}
                 style={{
                   flexDirection: 'row',
                   alignItems: 'center',
                 }}
                 activeOpacity={0.7}
               >
                 <View style={{
                   width: 20,
                   height: 20,
                   borderRadius: 4,
                   borderWidth: 2,
                   borderColor: rememberMe ? theme.colors.primary.DEFAULT : theme.colors.text.secondary,
                   backgroundColor: rememberMe ? theme.colors.primary.DEFAULT : 'transparent',
                   alignItems: 'center',
                   justifyContent: 'center',
                   marginRight: theme.spacing.sm,
                 }}>
                   {rememberMe && (
                     <Check size={12} color={theme.colors.background.DEFAULT} strokeWidth={3} />
                   )}
                 </View>
                 <Text style={{
                   fontSize: theme.typography.body.fontSize,
                   color: theme.colors.text.primary,
                 }}>
                   {t('rememberMe')}
                 </Text>
               </TouchableOpacity>
             </View>

            {/* Login Button */}
            <StyledButton
              title={t('signIn')}
              onPress={handleLogin}
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
                    {t('forgotPassword')}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Social Login Divider */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 0,
            marginBottom: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
          }}>
            <View style={{
              flex: 1,
              height: 1,
              backgroundColor: 'rgba(179, 217, 217, 0.3)',
            }} />
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
              marginHorizontal: theme.spacing.lg,
              fontWeight: '400',
            }}>
              {t('orContinueWith')}
            </Text>
            <View style={{
              flex: 1,
              height: 1,
              backgroundColor: 'rgba(179, 217, 217, 0.3)',
            }} />
          </View>

          {/* Social Login Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            gap: theme.spacing.md,
          }}>
            {/* Google Login Button */}
            <TouchableOpacity
              onPress={() => console.log('Google login pressed')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderWidth: 1.5,
                borderColor: 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                height: 54,
                ...theme.shadows.soft,
              }}
              activeOpacity={0.8}
            >
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#4285F4',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.sm,
              }}>
                <Text style={{
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: '700',
                }}>
                  G
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: '#1f2937',
                fontWeight: '500',
              }}>
                {t('google')}
              </Text>
            </TouchableOpacity>

            {/* Facebook Login Button */}
            <TouchableOpacity
              onPress={() => console.log('Facebook login pressed')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1877F2',
                borderWidth: 1.5,
                borderColor: '#1877F2',
                borderRadius: theme.borderRadius.lg,
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                height: 54,
                ...theme.shadows.soft,
              }}
              activeOpacity={0.8}
            >
              <View style={{
                width: 20,
                height: 20,
                backgroundColor: '#ffffff',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.sm,
              }}>
                <Text style={{
                  color: '#1877F2',
                  fontSize: 12,
                  fontWeight: '700',
                }}>
                  f
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: '#ffffff',
                fontWeight: '500',
              }}>
                {t('facebook')}
              </Text>
            </TouchableOpacity>
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
              {t('dontHaveAccount')}
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  {t('signUp')}
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
            {t('bySigningIn')}{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              {t('termsOfService')}
            </Text>{' '}
            {t('and')}{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              {t('privacyPolicy')}
            </Text>
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

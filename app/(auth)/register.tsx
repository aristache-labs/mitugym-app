import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Eye, EyeOff, Phone, MapPin } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';
import { NativeDatePicker } from '../../components/NativeDatePicker';
import { DropdownPicker, DropdownOption } from '../../components/DropdownPicker';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithSupabase, isAuthenticated, showToast } = useAppStore();

  const genderOptions: DropdownOption[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    // Validate required fields
    if (!firstName.trim()) {
      showToast('Please enter your first name', 'error');
      return;
    }

    if (!lastName.trim()) {
      showToast('Please enter your last name', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!dateOfBirth) {
      showToast('Please select your date of birth', 'error');
      return;
    }

    if (!phone.trim()) {
      showToast('Please enter your phone number', 'error');
      return;
    }

    if (!gender) {
      showToast('Please select your gender', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        county: county.trim(),
        gender: gender,
      };

      await signUpWithSupabase(email, password, profileData);
      // Redirect to login page after successful registration
      router.replace('/(auth)/login');
    } catch (error) {
      showToast('Failed to create account. Email may already be in use.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isFormValid = () => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isValidEmail(email) &&
      dateOfBirth &&
      phone.trim().length > 0 &&
      gender &&
      password.length >= 6 &&
      password === confirmPassword
    );
  };

  return (
    <LinearGradient
      colors={[theme.colors.background.DEFAULT, theme.colors.background.surface]}
      style={{ flex: 1 }}
    >
      <AppHeader
        title="Create Account"
        subtitle="Join the fitness community"
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
            marginBottom: theme.spacing.md,
          }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 120,
                height: 120,
                marginBottom: theme.spacing.xs,
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              Start your fitness journey today
            </Text>
          </View>

          {/* Register Form */}
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
              <User
                size={24}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                Sign Up
              </Text>
            </View>

            {/* First Name Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: firstName.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <User
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="given-name"
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

            {/* Last Name Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: lastName.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <User
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="family-name"
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

            {/* Date of Birth */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <NativeDatePicker
                value={dateOfBirth}
                onDateChange={setDateOfBirth}
                placeholder="Select your date of birth"
                maximumDate={new Date(new Date().getFullYear() - 13, 11, 31)} // Must be at least 13 years old
                minimumDate={new Date(new Date().getFullYear() - 120, 0, 1)} // Max 120 years old
              />
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
                  style={{marginLeft: theme.spacing.lg }}
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

            {/* Phone Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: phone.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <Phone
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="phone-pad"
                  autoComplete="tel"
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

            {/* Address Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: address.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <MapPin
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Address (optional)"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoComplete="street-address"
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

            {/* City Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: city.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <MapPin
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City (optional)"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoComplete="address-line2"
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

            {/* County Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: county.trim().length > 0
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <MapPin
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={county}
                  onChangeText={setCounty}
                  placeholder="County (optional)"
                  placeholderTextColor={theme.colors.text.secondary}
                  autoComplete="address-line1"
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

            {/* Gender Selection */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <DropdownPicker
                value={gender}
                onValueChange={setGender}
                options={genderOptions}
                placeholder="Select your gender"
                label="Gender"
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: theme.spacing.md }}>
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
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
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

            {/* Confirm Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(77, 212, 212, 0.05)',
                borderWidth: 1,
                borderColor: (confirmPassword.length >= 6 && password === confirmPassword)
                  ? theme.colors.primary.DEFAULT
                  : 'rgba(179, 217, 217, 0.3)',
                borderRadius: theme.borderRadius.lg,
              }}>
                <Lock
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{marginLeft: theme.spacing.lg }}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor={theme.colors.text.secondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password-new"
                  style={{
                    flex: 1,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    padding: theme.spacing.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={theme.colors.text.secondary} />
                  ) : (
                    <Eye size={20} color={theme.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  Passwords do not match
                </Text>
              )}
            </View>

            {/* Register Button */}
            <PillButton
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="medium"
              fullWidth
              disabled={!isFormValid()}
              loading={isLoading}
            />
          </View>

          {/* Login Link */}
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
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  Sign In
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
            By creating an account, you agree to our{' '}
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

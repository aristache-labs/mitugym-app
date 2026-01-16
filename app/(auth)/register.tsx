import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { isValidEmail } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StyledButton } from '../../components/StyledButton';
import { StyledInput } from '../../components/StyledInput';
import { useLanguage } from '../../lib/LanguageContext';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phone: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const { signUpWithSupabase, isAuthenticated, showToast } = useAppStore();
  const { t } = useLanguage();

  const genderOptions: DropdownOption[] = [
    { label: t('male'), value: 'male' },
    { label: t('female'), value: 'female' },
    { label: t('other'), value: 'other' },
  ];

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'firstName':
        return !value?.trim() ? t('firstNameRequired') : '';
      case 'lastName':
        return !value?.trim() ? t('lastNameRequired') : '';
      case 'email':
        if (!value?.trim()) {return t('emailRequired');}
        if (!isValidEmail(value)) {return t('invalidEmail');}
        return '';
      case 'dateOfBirth':
        return !value ? t('dateOfBirthRequired') : '';
      case 'phone':
        return !value?.trim() ? t('phoneRequired') : '';
      case 'gender':
        return !value ? t('genderRequired') : '';
      case 'password':
        if (!value) {return t('passwordRequired');}
        if (value.length < 6) {return t('passwordTooShort');}
        return '';
      case 'confirmPassword':
        if (!value) {return t('passwordRequired');}
        if (value !== password) {return t('passwordsDoNotMatch');}
        return '';
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const newErrors = {
      firstName: validateField('firstName', firstName),
      lastName: validateField('lastName', lastName),
      email: validateField('email', email),
      dateOfBirth: validateField('dateOfBirth', dateOfBirth),
      phone: validateField('phone', phone),
      gender: validateField('gender', gender),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleRegister = async () => {
    if (!validateAllFields()) {
      showToast(t('pleaseFillAllRequiredFields'), 'error');
      return;
    }

    setIsLoading(true);
    try {
      const profileData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth!.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
      showToast(t('failedToCreateAccount'), 'error');
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
        title={t('createAccount')}
        subtitle={t('createAccountSubtitle')}
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
                marginBottom: theme.spacing.xs,
              }}
              resizeMode="contain"
            />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
            }}>
              {t('registerFormSubtitle')}
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
                {t('signUp')}
              </Text>
            </View>

            {/* First Name Input */}
            <View style={{ marginBottom: errors.firstName ? theme.spacing.xs : theme.spacing.md }}>
              <StyledInput
                icon="user"
                label={t('firstName').toUpperCase()}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setErrors(prev => ({ ...prev, firstName: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, firstName: validateField('firstName', firstName) }))}
                placeholder={t('firstName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="given-name"
              />
              {errors.firstName ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.firstName}
                </Text>
              ) : null}
            </View>

            {/* Last Name Input */}
            <View style={{ marginBottom: errors.lastName ? theme.spacing.xs : theme.spacing.md }}>
              <StyledInput
                icon="user"
                label={t('lastName').toUpperCase()}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setErrors(prev => ({ ...prev, lastName: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, lastName: validateField('lastName', lastName) }))}
                placeholder={t('lastName')}
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="family-name"
              />
              {errors.lastName ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.lastName}
                </Text>
              ) : null}
            </View>

            {/* Date of Birth */}
            <View style={{ marginBottom: errors.dateOfBirth ? theme.spacing.xs : theme.spacing.md }}>
              <NativeDatePicker
                value={dateOfBirth}
                onDateChange={(date) => {
                  setDateOfBirth(date);
                  setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                }}
                placeholder={t('selectDateOfBirth')}
                label={t('dateOfBirth').toUpperCase()}
                maximumDate={new Date(new Date().getFullYear() - 13, 11, 31)} // Must be at least 13 years old
                minimumDate={new Date(new Date().getFullYear() - 120, 0, 1)} // Max 120 years old
              />
              {errors.dateOfBirth ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.dateOfBirth}
                </Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: errors.email ? theme.spacing.xs : theme.spacing.md }}>
              <StyledInput
                icon="email"
                label={t('emailAddress').toUpperCase()}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, email: validateField('email', email) }))}
                placeholder={t('emailAddress')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
              {errors.email ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.email}
                </Text>
              ) : null}
            </View>

            {/* Phone Input */}
            <View style={{ marginBottom: errors.phone ? theme.spacing.xs : theme.spacing.md }}>
              <StyledInput
                icon="phone"
                label={t('phone').toUpperCase()}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setErrors(prev => ({ ...prev, phone: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, phone: validateField('phone', phone) }))}
                placeholder={t('phone')}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {errors.phone ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.phone}
                </Text>
              ) : null}
            </View>

            {/* Address Input */}
            <StyledInput
              icon="location"
              label={t('addressOptional').toUpperCase()}
                  value={address}
                  onChangeText={setAddress}
                  placeholder={t('addressOptional')}
                  autoComplete="street-address"
            />

            {/* City Input */}
            <StyledInput
              icon="location"
              label={t('cityOptional').toUpperCase()}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('cityOptional')}
                  autoComplete="address-line2"
            />

            {/* County Input */}
            <StyledInput
              icon="location"
              label={t('countyOptional').toUpperCase()}
                  value={county}
                  onChangeText={setCounty}
                  placeholder={t('countyOptional')}
                  autoComplete="address-line1"
            />

            {/* Gender Selection */}
            <View style={{ marginBottom: errors.gender ? theme.spacing.xs : theme.spacing.md }}>
              <DropdownPicker
                value={gender}
                onValueChange={(value) => {
                  setGender(value);
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
                options={genderOptions}
                placeholder={t('selectGender')}
                label={t('gender').toUpperCase()}
                doneButtonText={t('done')}
              />
              {errors.gender ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.gender}
                </Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: errors.password ? theme.spacing.xs : theme.spacing.md }}>
              <StyledInput
                icon="password"
                label={t('password').toUpperCase()}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors(prev => ({ ...prev, password: '', confirmPassword: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, password: validateField('password', password) }))}
                placeholder={t('password')}
                isPassword={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
              />
              {errors.password ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.password}
                </Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <StyledInput
                icon="password"
                label={t('confirmPassword').toUpperCase()}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                onBlur={() => setErrors(prev => ({ ...prev, confirmPassword: validateField('confirmPassword', confirmPassword) }))}
                placeholder={t('confirmPassword')}
                isPassword={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
              />
              {errors.confirmPassword ? (
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  color: theme.colors.status.error,
                  marginTop: theme.spacing.xs,
                  marginLeft: theme.spacing.sm,
                }}>
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

            {/* Register Button */}
            <StyledButton
              title={t('createAccount')}
              onPress={handleRegister}
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
              {t('alreadyHaveAccount')}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  {t('signIn')}
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
            {t('byCreatingAccount')}{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              {t('termsOfService')}
            </Text>{' '}
            {t('and')}{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              {t('privacyPolicy')}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

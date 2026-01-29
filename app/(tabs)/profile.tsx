import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Shield,
  FileText,
  Star,
  LogOut,
  Globe,
  Fingerprint,
  Mail,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';
import { ProfileHeader } from '../../components/ProfileHeader';
import { PersonalInfoSection } from '../../components/PersonalInfoSection';
import { SecuritySection } from '../../components/SecuritySection';
import { AppSettingsSection } from '../../components/AppSettingsSection';
import { LegalSection } from '../../components/LegalSection';
import { EditProfileModal } from '../../components/EditProfileModal';
import { PasswordChangeModal } from '../../components/PasswordChangeModal';
import { NotificationModal } from '../../components/NotificationModal';
import { supabase } from '../../utils/supabase';
import { useLanguage, Language } from '../../lib/LanguageContext';
import { authenticateWithBiometrics } from '../../utils/biometricAuth';
import { SecureStorage } from '../../utils/secureStorage';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  county?: string;
  date_of_birth?: string;
  gender?: string;
  avatar_url?: string;
  membership_status: string;
  membership_plan: string;
  join_date: string;
  expiry_date?: string;
  visits_left?: number;
  days_left?: number;
  last_check_in?: string;
}


export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [servicesReminders, setServicesReminders] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

// Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    county: '',
    date_of_birth: '',
    gender: '',
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());


  // Password change modal state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications modal state
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    member,
    logout,
    session,
    showToast,
    pushNotificationsEnabled,
    registerPushNotifications,
    unregisterPushNotifications,
    biometricEnabled,
    biometricAvailable,
    setBiometricEnabled,
    checkBiometricAvailability,
  } = useAppStore();
  const { language, setLanguage, t } = useLanguage();

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
  }, [checkBiometricAvailability]);

  // Load profile data from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          showToast('Failed to load profile data', 'error');
        } else if (data) {
          // Resolve membership plan ID to plan name
          let profileData = { ...data };

          if (data.membership_plan) {
            const { data: planData } = await supabase
              .from('membership_plans')
              .select('name')
              .eq('id', data.membership_plan)
              .single();

            if (planData?.name) {
              profileData.membership_plan = planData.name;
            }
          }

          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session?.user?.id, showToast]);

  // Handle avatar upload
  const handleAvatarPress = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          t('permissionRequired'),
          t('cameraPermissionMessage'),
          [{ text: t('ok') }],
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        return;
      }

      setIsUploadingAvatar(true);

      // Get file extension
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${session?.user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${session?.user?.id}/${fileName}`;

      // Convert URI to ArrayBuffer for upload (better for React Native)
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        // Extract the path from the URL
        const urlParts = profile.avatar_url.split('/storage/v1/object/public/avatars/');
        if (urlParts.length > 1) {
          const oldPath = urlParts[1];
          if (oldPath) {
            await supabase.storage
              .from('avatars')
              .remove([oldPath]);
          }
        }
      }

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileData, {
          contentType: asset.mimeType || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session?.user?.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      showToast(t('avatarUpdated'), 'success');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast(t('avatarUploadFailed'), 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('signOut'),
      t('signOutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      t('rateAppTitle'),
      t('rateAppMessage'),
      [
        { text: t('maybeLater'), style: 'cancel' },
        { text: t('rateApp'), onPress: () => console.log('Open app store rating') },
      ],
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      t('contactSupportTitle'),
      t('contactSupportMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('sendEmail'), onPress: () => console.log('Open email support') },
      ],
    );
  };

  const handleLanguageChange = () => {
    const languages: { code: Language; name: string }[] = [
      { code: 'en', name: 'English' },
      { code: 'ro', name: 'Română' },
    ];

    Alert.alert(
      t('changeLanguage'),
      t('selectLanguage'),
      [
        { text: t('cancel'), style: 'cancel' },
        ...languages.map(lang => ({
          text: `${lang.name} ${language === lang.code ? '✓' : ''}`,
          onPress: () => {
            if (language !== lang.code) {
              setLanguage(lang.code);
              showToast(
                lang.code === 'en' ? 'Language changed to English' : 'Limba schimbată în română',
                'success',
              );
            }
          },
        })),
      ],
    );
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        county: profile.county || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
      });
      // Set temp date for date picker
      if (profile.date_of_birth) {
        setTempDate(new Date(profile.date_of_birth));
      } else {
        setTempDate(new Date());
      }
      setEditModalVisible(true);
    }
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        // On Android, immediately update the form
        const dateString = selectedDate.toISOString().split('T')[0] || '';
        setEditForm({ ...editForm, date_of_birth: dateString });
      }
    }
  };

  const handleDateDone = () => {
    const dateString = tempDate.toISOString().split('T')[0] || '';
    setEditForm({ ...editForm, date_of_birth: dateString });
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    // Reset temp date to original value
    if (editForm.date_of_birth) {
      setTempDate(new Date(editForm.date_of_birth));
    }
    setShowDatePicker(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please fill in all password fields', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) {
        console.error('Error updating password:', error);
        showToast(t('failedToUpdatePassword'), 'error');
      } else {
        showToast(t('passwordUpdatedSuccessfully'), 'success');
        setPasswordModalVisible(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('Failed to update password', 'error');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccount'),
      t('deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Call the database function to safely delete all user data
              const { error: deleteError } = await supabase
                .rpc('delete_user_account');

              if (deleteError) {
                console.error('Error deleting account:', deleteError);
                showToast(t('failedToDeleteAccount'), 'error');
                return;
              }

              showToast(t('accountDeletedSuccessfully'), 'success');
              logout();
            } catch (error) {
              console.error('Error deleting account:', error);
              showToast(t('failedToDeleteAccount'), 'error');
            }
          },
        },
      ],
    );
  };

  const handleSaveProfile = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone: editForm.phone,
          address: editForm.address,
          city: editForm.city,
          county: editForm.county,
          date_of_birth: editForm.date_of_birth,
          gender: editForm.gender,
        })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        showToast(t('failedToUpdateProfile'), 'error');
      } else {
        showToast(t('profileUpdatedSuccessfully'), 'success');
        setEditModalVisible(false);
        // Reload profile data
        reloadProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(t('failedToUpdateProfile'), 'error');
    }
  };

  const reloadProfile = async () => {
    if (!session?.user?.id) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile', 'error');
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Enable push notifications
      const success = await registerPushNotifications();
      if (!success) {
        // Registration failed, keep toggle off
        return;
      }
    } else {
      // Disable push notifications
      await unregisterPushNotifications();
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      showToast(t('biometricNotAvailable'), 'error');
      return;
    }

    if (enabled) {
      // Prompt user to authenticate once to verify they can use biometrics
      const result = await authenticateWithBiometrics(t('enableBiometric'));

      if (!result.success) {
        console.log('Biometric authentication failed, not enabling');
        return;
      }

      // Enable biometric - credentials will be stored on next login
      await setBiometricEnabled(true);

      // Check if user has already stored credentials
      const hasCredentials = await SecureStorage.hasBiometricCredentials();

      if (!hasCredentials) {
        // First time enabling - need to login with password once
        Alert.alert(
          t('biometricAuth'),
          'Biometric authentication enabled. Please log out and log in with your password once to complete the setup. Your credentials will be securely stored for future biometric logins.',
          [{ text: t('ok') }],
        );
      }

      showToast(t('biometricEnabled'), 'success');
    } else {
      // Disable biometric
      await setBiometricEnabled(false);
      showToast(t('biometricDisabled'), 'success');
    }
  };

  const appSettings: SettingItem[] = [
    {
      id: 'language',
      title: t('language'),
      subtitle: language === 'en' ? 'English' : 'Română',
      icon: Globe,
      type: 'action',
      onPress: handleLanguageChange,
    },
    {
      id: 'biometric',
      title: t('biometricAuth'),
      subtitle: biometricAvailable ? t('biometricSubtitle') : t('biometricNotAvailable'),
      icon: Fingerprint,
      type: 'toggle',
      value: biometricEnabled,
      onToggle: handleBiometricToggle,
    },
    {
      id: 'push',
      title: t('pushNotifications'),
      icon: Bell,
      type: 'toggle',
      value: pushNotificationsEnabled,
      onToggle: handlePushNotificationToggle,
    },
    {
      id: 'email',
      title: t('emailNotifications'),
      icon: Mail,
      type: 'toggle',
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      id: 'reminders',
      title: t('servicesReminders'),
      icon: Bell,
      type: 'toggle',
      value: servicesReminders,
      onToggle: setServicesReminders,
    },
  ];

  const legalSettings: SettingItem[] = [
    {
      id: 'terms',
      title: t('termsOfService'),
      icon: FileText,
      type: 'navigation',
      onPress: () => console.log('Open terms'),
    },
    {
      id: 'privacy',
      title: t('privacyPolicy'),
      icon: Shield,
      type: 'navigation',
      onPress: () => console.log('Open privacy policy'),
    },
    {
      id: 'rate',
      title: t('rateApp'),
      icon: Star,
      type: 'action',
      onPress: handleRateApp,
    },
    {
      id: 'support',
      title: t('contactSupport'),
      icon: Mail,
      type: 'action',
      onPress: handleContactSupport,
    },
  ];

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: theme.typography.body.fontSize,
          color: theme.colors.text.secondary,
        }}>
          {t('loadingProfile')}
        </Text>
      </View>
    );
  }

  if (!member || !profile) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={t('profile')}
        subtitle={t('manageAccount')}
        showNotifications
        onNotificationPress={() => setNotificationsModalVisible(true)}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onAvatarPress={handleAvatarPress}
          isUploadingAvatar={isUploadingAvatar}
        />

        {/* Personal Information */}
        <PersonalInfoSection profile={profile} onEdit={handleEditProfile} />

        {/* Account Security */}
        <SecuritySection
          onChangePassword={() => setPasswordModalVisible(true)}
          onDeleteAccount={handleDeleteAccount}
        />

        {/* App Settings */}
        <AppSettingsSection settings={appSettings} />

        {/* App & Legal */}
        <LegalSection settings={legalSettings} />

        {/* Sign Out */}
        <PillButton
          title={t('signOut')}
          onPress={handleLogout}
          variant="danger"
          size="medium"
          fullWidth
          icon={LogOut}
        />

        {/* App Version */}
        <Text style={{
          fontSize: theme.typography.small.fontSize,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginTop: theme.spacing.lg,
        }}>
          MITUGYM v1.0.0
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveProfile}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        tempDate={tempDate}
        onDateChange={handleDateChange}
        onDateDone={handleDateDone}
        onDateCancel={handleDateCancel}
      />

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Password Change Modal */}
      <PasswordChangeModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        onChangePassword={handleChangePassword}
      />

      {/* Notifications Modal */}
      <NotificationModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />

    </View>
  );
}

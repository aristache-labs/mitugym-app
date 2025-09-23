import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail,
  Phone,
  Bell,
  Shield,
  FileText,
  Star,
  LogOut,
  ChevronRight,
  Settings,
  MapPin,
  Calendar,
  User,
  Edit,
  Globe,
  Fingerprint,
  Smartphone,
  X,
  Save,
  ChevronDown,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';
import { supabase } from '../../utils/supabase';
import { useLanguage, Language } from '../../lib/LanguageContext';
import { translateGender } from '../../lib/utils';

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
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [classReminders, setClassReminders] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // App Settings States
  const [biometricAuth, setBiometricAuth] = useState(false);

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

  // Gender dropdown state
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const { member, logout, session, showToast } = useAppStore();
  const { language, setLanguage, t } = useLanguage();

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

  const formatDate = (dateString?: string) => {
    if (!dateString) {return t('notSet');}
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) {return null;}
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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
        showToast('Failed to update profile', 'error');
      } else {
        showToast('Profile updated successfully', 'success');
        setEditModalVisible(false);
        // Reload profile data
        reloadProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to update profile', 'error');
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

  const notificationSettings: SettingItem[] = [
    {
      id: 'push',
      title: t('pushNotifications'),
      icon: Bell,
      type: 'toggle',
      value: pushNotifications,
      onToggle: setPushNotifications,
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
      title: t('classReminders'),
      icon: Bell,
      type: 'toggle',
      value: classReminders,
      onToggle: setClassReminders,
    },
  ];

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
      subtitle: t('biometricSubtitle'),
      icon: Fingerprint,
      type: 'toggle',
      value: biometricAuth,
      onToggle: setBiometricAuth,
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
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}>
          <LinearGradient
            colors={[
              'rgba(30, 155, 113, 0.15)',
              'rgba(17, 22, 24, 0.9)',
              'rgba(11, 15, 14, 0.95)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xl,
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.3)',
              ...theme.shadows.strong,
            }}
          >
            {/* Compact Profile Section */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}>
              {/* Compact Premium Avatar */}
              <View style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: theme.colors.primary.DEFAULT,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: theme.spacing.lg,
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                ...theme.shadows.medium,
              }}>
                <LinearGradient
                  colors={[
                    theme.colors.primary.DEFAULT,
                    'rgba(30, 155, 113, 0.8)',
                  ]}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 33,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: '#ffffff',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    {profile.first_name?.[0]?.toUpperCase() || ''}
                    {profile.last_name?.[0]?.toUpperCase() || ''}
                  </Text>
                </LinearGradient>
              </View>

              {/* User Info - Compact */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: theme.typography.h2.fontSize,
                  fontWeight: '700',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xs,
                }}>
                  {profile.first_name} {profile.last_name}
                </Text>

                <View style={{
                  backgroundColor: 'rgba(30, 155, 113, 0.15)',
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  alignSelf: 'flex-start',
                  marginBottom: theme.spacing.xs,
                }}>
                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.primary.DEFAULT,
                    fontWeight: '600',
                  }}>
                    {t('memberSince')} {(() => {
                      const date = new Date(profile.join_date).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
                        month: 'short',
                        year: 'numeric',
                      }).replace(/\./g, '');

                      // Capitalize first letter for proper formatting
                      return date.charAt(0).toUpperCase() + date.slice(1);
                    })()}
                  </Text>
                </View>

                {/* Compact Contact Info */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Mail
                      size={12}
                      color={theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                    }} numberOfLines={1}>
                      {profile.email.length > 20 ? profile.email.substring(0, 20) + '...' : profile.email}
                    </Text>
                  </View>

                  {profile.phone && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Phone
                        size={12}
                        color={theme.colors.text.secondary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                      }} numberOfLines={1}>
                        {profile.phone}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Information */}
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
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
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
                {t('personalInformation')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleEditProfile}
              style={{
                padding: theme.spacing.sm,
                backgroundColor: 'rgba(77, 212, 212, 0.1)',
                borderRadius: theme.borderRadius.md,
              }}
            >
              <Edit
                size={16}
                color={theme.colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          </View>

          {/* Personal Details Grid */}
          <View style={{ gap: theme.spacing.md }}>
            {/* Date of Birth */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <Calendar
                  size={16}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}>
                  {t('dateOfBirth')}
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {formatDate(profile.date_of_birth)}
                {profile.date_of_birth && calculateAge(profile.date_of_birth) ?
                  ` (${calculateAge(profile.date_of_birth)} ${t('years')})` : ''}
              </Text>
            </View>

            {/* Gender */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <User
                  size={16}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}>
                  {t('gender')}
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {translateGender(profile.gender, t)}
              </Text>
            </View>

            {/* Phone */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <Phone
                  size={16}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}>
                  {t('phone')}
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {profile.phone || t('notProvided')}
              </Text>
            </View>

            {/* Address */}
            {(profile.address || profile.city || profile.county) && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingVertical: theme.spacing.sm,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                }}>
                  <MapPin
                    size={16}
                    color={theme.colors.text.secondary}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.secondary,
                    flex: 1,
                  }}>
                    {t('address')}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  {profile.address && (
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                      fontWeight: '500',
                      textAlign: 'right',
                    }}>
                      {profile.address}
                    </Text>
                  )}
                  {(profile.city || profile.county) && (
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                      fontWeight: '500',
                      textAlign: 'right',
                      marginTop: 2,
                    }}>
                      {[profile.city, profile.county].filter(Boolean).join(', ')}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Member ID */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <Fingerprint
                  size={16}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}>
                  {t('memberID')}
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
                fontFamily: 'monospace',
              }}>
                #{profile.id.slice(-8).toUpperCase()}
              </Text>
            </View>

          </View>
        </View>

        {/* Notification Settings */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
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
            <Settings
              size={24}
              color={theme.colors.primary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('notifications')}
            </Text>
          </View>

          {notificationSettings.map((setting, index) => (
            <View
              key={setting.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: index < notificationSettings.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(167, 195, 186, 0.1)',
              }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <setting.icon
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.md }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.primary,
                }}>
                  {setting.title}
                </Text>
              </View>

              <Switch
                value={setting.value}
                onValueChange={setting.onToggle}
                trackColor={{
                  false: 'rgba(167, 195, 186, 0.3)',
                  true: theme.colors.primary.DEFAULT,
                }}
                thumbColor={'#ffffff'}
              />
            </View>
          ))}
        </View>

        {/* App Settings */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
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
            <Smartphone
              size={24}
              color={theme.colors.primary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('appSettings')}
            </Text>
          </View>

          {appSettings.map((setting, index) => {
            if (setting.type === 'toggle') {
              return (
                <View
                  key={setting.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: index < appSettings.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(167, 195, 186, 0.1)',
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                    <setting.icon
                      size={20}
                      color={theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.md }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        color: theme.colors.text.primary,
                      }}>
                        {setting.title}
                      </Text>
                      {setting.subtitle && (
                        <Text style={{
                          fontSize: theme.typography.caption.fontSize,
                          color: theme.colors.text.secondary,
                          marginTop: 2,
                        }}>
                          {setting.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={setting.onToggle}
                    trackColor={{
                      false: 'rgba(167, 195, 186, 0.3)',
                      true: theme.colors.primary.DEFAULT,
                    }}
                    thumbColor={'#ffffff'}
                  />
                </View>
              );
            } else {
              return (
                <TouchableOpacity
                  key={setting.id}
                  onPress={setting.onPress}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: index < appSettings.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(167, 195, 186, 0.1)',
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                    <setting.icon
                      size={20}
                      color={theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.md }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        color: theme.colors.text.primary,
                      }}>
                        {setting.title}
                      </Text>
                      {setting.subtitle && (
                        <Text style={{
                          fontSize: theme.typography.caption.fontSize,
                          color: theme.colors.text.secondary,
                          marginTop: 2,
                        }}>
                          {setting.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  <ChevronRight
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              );
            }
          })}
        </View>

        {/* App & Legal */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
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
            <Shield
              size={24}
              color={theme.colors.secondary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('appLegal')}
            </Text>
          </View>

          {legalSettings.map((setting, index) => (
            <TouchableOpacity
              key={setting.id}
              onPress={setting.onPress}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: index < legalSettings.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(167, 195, 186, 0.1)',
              }}
              activeOpacity={0.7}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <setting.icon
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                  }}>
                    {setting.title}
                  </Text>
                  {setting.subtitle && (
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                      marginTop: 2,
                    }}>
                      {setting.subtitle}
                    </Text>
                  )}
                </View>
              </View>

              <ChevronRight
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>

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
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.background.DEFAULT,
          paddingTop: theme.spacing.md,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xs,
            paddingBottom: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Edit size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('editPersonalInformation')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            {/* Form Fields */}
            <View style={{ gap: theme.spacing.lg }}>
              {/* First Name */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('firstName')}
                </Text>
                <TextInput
                  value={editForm.first_name}
                  onChangeText={(text) => setEditForm({ ...editForm, first_name: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('firstName')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              {/* Last Name */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('lastName')}
                </Text>
                <TextInput
                  value={editForm.last_name}
                  onChangeText={(text) => setEditForm({ ...editForm, last_name: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('lastName')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              {/* Phone */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('phone')}
                </Text>
                <TextInput
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('phone')}
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Address */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('address')}
                </Text>
                <TextInput
                  value={editForm.address}
                  onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('address')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              {/* City */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('city')}
                </Text>
                <TextInput
                  value={editForm.city}
                  onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('city')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              {/* County */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('county')}
                </Text>
                <TextInput
                  value={editForm.county}
                  onChangeText={(text) => setEditForm({ ...editForm, county: text })}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                  }}
                  placeholder={t('county')}
                  placeholderTextColor={theme.colors.text.secondary}
                />
              </View>

              {/* Date of Birth */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('dateOfBirth')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: editForm.date_of_birth ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}>
                    {editForm.date_of_birth ? new Date(editForm.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : t('selectDate')}
                  </Text>
                  <Calendar size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Gender */}
              <View>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {t('gender')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowGenderDropdown(true)}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    borderWidth: 1,
                    borderColor: 'rgba(30, 155, 113, 0.2)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: editForm.gender ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}>
                    {editForm.gender ? (editForm.gender === 'male' ? t('male') : editForm.gender === 'female' ? t('female') : t('other')) : t('selectGender')}
                  </Text>
                  <ChevronDown size={20} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={{
              marginTop: theme.spacing.xl,
              gap: theme.spacing.md,
            }}>
              <PillButton
                title={t('saveChanges')}
                onPress={handleSaveProfile}
                variant="primary"
                size="large"
                fullWidth
                icon={Save}
              />
              <PillButton
                title={t('cancel')}
                onPress={() => setEditModalVisible(false)}
                variant="outline"
                size="large"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>

        {/* Date Picker for iOS */}
        {Platform.OS === 'ios' && showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-end',
              }}
              activeOpacity={1}
              onPress={handleDateCancel}
            >
              <View style={{
                backgroundColor: theme.colors.background.surface,
                borderTopLeftRadius: theme.borderRadius.xl,
                borderTopRightRadius: theme.borderRadius.xl,
                paddingBottom: insets.bottom,
              }}>
                {/* Picker Header */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <TouchableOpacity onPress={handleDateCancel}>
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.secondary,
                    }}>
                      {t('cancel')}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                  }}>
                    {t('dateOfBirth')}
                  </Text>
                  <TouchableOpacity onPress={handleDateDone}>
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.primary.DEFAULT,
                      fontWeight: '600',
                    }}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Date Picker */}
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: theme.spacing.lg,
                }}>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor={theme.colors.text.primary}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Gender Dropdown Modal */}
        {showGenderDropdown && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showGenderDropdown}
            onRequestClose={() => setShowGenderDropdown(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: theme.spacing.xl,
              }}
              activeOpacity={1}
              onPress={() => setShowGenderDropdown(false)}
            >
              <View style={{
                backgroundColor: theme.colors.background.surface,
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.lg,
                width: '100%',
                maxWidth: 300,
                ...theme.shadows.strong,
              }}>
                <Text style={{
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  marginBottom: theme.spacing.lg,
                }}>
                  {t('selectGender')}
                </Text>

                <View style={{ gap: theme.spacing.sm }}>
                  {['male', 'female', 'other'].map((genderOption) => (
                    <TouchableOpacity
                      key={genderOption}
                      onPress={() => {
                        setEditForm({ ...editForm, gender: genderOption });
                        setShowGenderDropdown(false);
                      }}
                      style={{
                        backgroundColor: editForm.gender === genderOption
                          ? theme.colors.primary.DEFAULT
                          : 'rgba(30, 155, 113, 0.1)',
                        borderRadius: theme.borderRadius.lg,
                        padding: theme.spacing.md,
                        borderWidth: 1,
                        borderColor: editForm.gender === genderOption
                          ? theme.colors.primary.DEFAULT
                          : 'rgba(30, 155, 113, 0.2)',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        color: editForm.gender === genderOption
                          ? 'white'
                          : theme.colors.text.primary,
                        fontWeight: '600',
                      }}>
                        {genderOption === 'male' ? t('male') : genderOption === 'female' ? t('female') : t('other')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => setShowGenderDropdown(false)}
                  style={{
                    backgroundColor: 'rgba(30, 155, 113, 0.1)',
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.md,
                    marginTop: theme.spacing.lg,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.secondary,
                    fontWeight: '600',
                  }}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </Modal>
    </View>
  );
}

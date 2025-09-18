import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
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
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';
import { supabase } from '../../utils/supabase';
import { useLanguage, Language } from '../../lib/LanguageContext';

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
          setProfile(data);
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
    if (!dateString) {return 'Not set';}
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate MITUGYM',
      'Thank you for using MITUGYM! We would love to hear your feedback.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate App', onPress: () => console.log('Open app store rating') },
      ],
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? Our support team is here for you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Email', onPress: () => console.log('Open email support') },
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
                'success'
              );
            }
          },
        })),
      ],
    );
  };

  const notificationSettings: SettingItem[] = [
    {
      id: 'push',
      title: 'Push Notifications',
      icon: Bell,
      type: 'toggle',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      icon: Mail,
      type: 'toggle',
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      id: 'reminders',
      title: 'Class Reminders',
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
      title: 'Terms of Service',
      icon: FileText,
      type: 'navigation',
      onPress: () => console.log('Open terms'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      type: 'navigation',
      onPress: () => console.log('Open privacy policy'),
    },
    {
      id: 'rate',
      title: 'Rate the App',
      icon: Star,
      type: 'action',
      onPress: handleRateApp,
    },
    {
      id: 'support',
      title: 'Contact Support',
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
          Loading profile...
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
        subtitle="Manage your account"
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
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.medium,
        }}>
          <LinearGradient
            colors={['rgba(30, 155, 113, 0.1)', 'rgba(49, 215, 166, 0.05)']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: theme.borderRadius.xl,
            }}
          />

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            {/* Avatar */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primary.DEFAULT,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.lg,
            }}>
              <Text style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#ffffff',
              }}>
                {profile.first_name?.[0]?.toUpperCase() || ''}
                {profile.last_name?.[0]?.toUpperCase() || ''}
              </Text>
            </View>

            {/* User Info */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.xs,
              }}>
                {profile.first_name} {profile.last_name}
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                {profile.email}
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  marginRight: theme.spacing.md,
                }}>
                  Member since {new Date(profile.join_date).getFullYear()}
                </Text>
                <View style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 2,
                  backgroundColor: profile.membership_status === 'active'
                    ? 'rgba(77, 212, 212, 0.2)'
                    : 'rgba(255, 107, 107, 0.2)',
                  borderRadius: theme.borderRadius.sm,
                }}>
                  <Text style={{
                    fontSize: theme.typography.small.fontSize,
                    color: profile.membership_status === 'active'
                      ? theme.colors.primary.DEFAULT
                      : theme.colors.status.error,
                    fontWeight: '600',
                  }}>
                    {profile.membership_status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}>
              <Mail
                size={16}
                color={theme.colors.text.secondary}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Email verified
              </Text>
            </View>

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
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                {profile.phone || 'Not provided'}
              </Text>
            </View>
          </View>
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
                Personal Information
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => console.log('Edit profile')}
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
                  Date of Birth
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {formatDate(profile.date_of_birth)}
                {profile.date_of_birth && calculateAge(profile.date_of_birth) ?
                  ` (${calculateAge(profile.date_of_birth)} years)` : ''}
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
                  Gender
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {profile.gender ?
                  profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) :
                  'Not specified'}
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
                  Phone
                </Text>
              </View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.primary,
                fontWeight: '500',
              }}>
                {profile.phone || 'Not provided'}
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
                    Address
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

            {/* Membership Plan */}
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
                <Star
                  size={16}
                  color={theme.colors.text.secondary}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  flex: 1,
                }}>
                  Membership Plan
                </Text>
              </View>
              <View style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                backgroundColor: 'rgba(77, 212, 212, 0.1)',
                borderRadius: theme.borderRadius.md,
              }}>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.primary.DEFAULT,
                  fontWeight: '600',
                }}>
                  {profile.membership_plan}
                </Text>
              </View>
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
              Notifications
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
              App & Legal
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
          title="Sign Out"
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
    </View>
  );
}

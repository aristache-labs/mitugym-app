import React, { useState } from 'react';
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
  Settings
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';

interface SettingItem {
  id: string;
  title: string;
  icon: any;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [classReminders, setClassReminders] = useState(true);
  
  const { member, logout } = useAppStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate MITUGYM',
      'Thank you for using MITUGYM! We would love to hear your feedback.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Rate App', onPress: () => console.log('Open app store rating') },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Need help? Our support team is here for you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Email', onPress: () => console.log('Open email support') },
      ]
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

  if (!member) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title="Profile"
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
                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                {member.name}
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xs,
              }}>
                {member.email}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Member since {new Date(member.joinDate).getFullYear()}
              </Text>
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
                {member.phone}
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

          {appSettings.map((setting, index) => (
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
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.primary,
                }}>
                  {setting.title}
                </Text>
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
          size="large"
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

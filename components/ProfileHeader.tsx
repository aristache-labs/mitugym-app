import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Camera, Calendar } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';

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

interface ProfileHeaderProps {
  profile: Profile;
  onAvatarPress?: () => void;
  isUploadingAvatar?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onAvatarPress,
  isUploadingAvatar = false,
}) => {
  const { language, t } = useLanguage();

  return (
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
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.3)',
          ...theme.shadows.strong,
        }}
      >
        {/* Profile Section - Compact Row Layout */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={onAvatarPress}
            disabled={isUploadingAvatar}
            activeOpacity={0.7}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primary.DEFAULT,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: 'rgba(30, 155, 113, 0.4)',
              marginRight: theme.spacing.md,
              ...theme.shadows.medium,
            }}
          >
            {profile.avatar_url ? (
              <>
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 38,
                  }}
                  resizeMode="cover"
                />
                {/* Camera overlay */}
                <View style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary.DEFAULT,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: theme.colors.background.DEFAULT,
                }}>
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Camera size={12} color="#ffffff" />
                  )}
                </View>
              </>
            ) : (
              <LinearGradient
                colors={[
                  theme.colors.primary.DEFAULT,
                  'rgba(30, 155, 113, 0.8)',
                ]}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 38,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text style={{
                      fontSize: 32,
                      fontWeight: '700',
                      color: '#ffffff',
                      textShadowColor: 'rgba(0, 0, 0, 0.3)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    }}>
                      {profile.first_name?.[0]?.toUpperCase() || ''}
                      {profile.last_name?.[0]?.toUpperCase() || ''}
                    </Text>
                    {/* Camera overlay */}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: theme.colors.primary.DEFAULT,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: theme.colors.background.DEFAULT,
                    }}>
                      <Camera size={12} color="#ffffff" />
                    </View>
                  </>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* User Info - Compact */}
          <View style={{ flex: 1 }}>
            {/* Name */}
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: '700',
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
            }}>
              {profile.first_name} {profile.last_name}
            </Text>

            {/* Member Since - Compact */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing.xs,
            }}>
              <Calendar
                size={14}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text style={{
                fontSize: theme.typography.small.fontSize,
                color: theme.colors.text.secondary,
                fontWeight: '500',
              }}>
                {t('memberSince')} {(() => {
                  const date = new Date(profile.join_date).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
                    month: 'short',
                    year: 'numeric',
                  }).replace(/\./g, '');
                  return date.charAt(0).toUpperCase() + date.slice(1);
                })()}
              </Text>
            </View>

            {/* Email - Compact */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Mail
                size={14}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Text style={{
                fontSize: theme.typography.small.fontSize,
                color: theme.colors.text.secondary,
                fontWeight: '500',
              }} numberOfLines={1} ellipsizeMode="middle">
                {profile.email}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail } from 'lucide-react-native';
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
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
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

             {/* Email Only */}
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

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Edit, Calendar, Phone, MapPin, Fingerprint } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';
import { translateGender } from '../lib/utils';

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

interface PersonalInfoSectionProps {
  profile: Profile;
  onEdit: () => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ profile, onEdit }) => {
  const { t } = useLanguage();

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return t('notSet');
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) {
      return null;
    }
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
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
          onPress={onEdit}
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
  );
};

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Lock, Key, Trash2, ChevronRight } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';

interface SecuritySectionProps {
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  onChangePassword,
  onDeleteAccount,
}) => {
  const { t } = useLanguage();

  return (
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
          {t('accountSecurity')}
        </Text>
      </View>

      {/* Change Password */}
      <TouchableOpacity
        onPress={onChangePassword}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(30, 155, 113, 0.1)',
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
          <Key
            size={16}
            color={theme.colors.text.secondary}
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.primary,
            flex: 1,
          }}>
            {t('changePassword')}
          </Text>
        </View>
        <ChevronRight
          size={16}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        onPress={onDeleteAccount}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.spacing.md,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}>
          <Trash2
            size={16}
            color={theme.colors.status.error}
            style={{ marginRight: theme.spacing.sm }}
          />
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.status.error,
            flex: 1,
          }}>
            {t('deleteAccount')}
          </Text>
        </View>
        <ChevronRight
          size={16}
          color={theme.colors.status.error}
        />
      </TouchableOpacity>
    </View>
  );
};

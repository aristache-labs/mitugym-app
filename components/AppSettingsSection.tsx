import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Smartphone, ChevronRight } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';

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

interface AppSettingsSectionProps {
  settings: SettingItem[];
}

export const AppSettingsSection: React.FC<AppSettingsSectionProps> = ({ settings }) => {
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

      {settings.map((setting, index) => {
        if (setting.type === 'toggle') {
          return (
            <View
              key={setting.id}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.md,
                borderBottomWidth: index < settings.length - 1 ? 1 : 0,
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
                borderBottomWidth: index < settings.length - 1 ? 1 : 0,
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
  );
};

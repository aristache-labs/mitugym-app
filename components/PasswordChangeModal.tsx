import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { X, Key } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { PillButton } from './PillButton';
import { useLanguage } from '../lib/LanguageContext';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
  passwordForm: PasswordForm;
  setPasswordForm: React.Dispatch<React.SetStateAction<PasswordForm>>;
  onChangePassword: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  visible,
  onClose,
  passwordForm,
  setPasswordForm,
  onChangePassword,
}) => {
  const { t } = useLanguage();

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
      }}>
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          width: '100%',
          maxWidth: 400,
          ...theme.shadows.strong,
        }}>
          {/* Modal Header */}
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
              <Key size={20} color={theme.colors.primary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}>
                {t('changePassword')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Password Form */}
          <View style={{ gap: theme.spacing.md }}>
            {/* Current Password */}
            <View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
              }}>
                {t('currentPassword')}
              </Text>
              <TextInput
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                secureTextEntry
                style={{
                  backgroundColor: theme.colors.background.DEFAULT,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.primary,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}
                placeholder={t('currentPassword')}
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            {/* New Password */}
            <View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
              }}>
                {t('newPassword')}
              </Text>
              <TextInput
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                secureTextEntry
                style={{
                  backgroundColor: theme.colors.background.DEFAULT,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.primary,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}
                placeholder={t('newPassword')}
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            {/* Confirm Password */}
            <View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
              }}>
                {t('confirmPassword')}
              </Text>
              <TextInput
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                secureTextEntry
                style={{
                  backgroundColor: theme.colors.background.DEFAULT,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.primary,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}
                placeholder={t('confirmPassword')}
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            marginTop: theme.spacing.xl,
            gap: theme.spacing.sm,
          }}>
            <PillButton
              title={t('updatePassword')}
              onPress={onChangePassword}
              variant="primary"
              size="large"
              fullWidth
              icon={Key}
            />
            <PillButton
              title={t('cancel')}
              onPress={onClose}
              variant="outline"
              size="large"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

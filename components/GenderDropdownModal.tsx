import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';

interface EditForm {
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  county: string;
  date_of_birth: string;
  gender: string;
}

interface GenderDropdownModalProps {
  visible: boolean;
  onClose: () => void;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
}

export const GenderDropdownModal: React.FC<GenderDropdownModalProps> = ({
  visible,
  onClose,
  editForm,
  setEditForm,
}) => {
  const { t } = useLanguage();

  const handleGenderSelect = (genderOption: string) => {
    setEditForm({ ...editForm, gender: genderOption });
    onClose();
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
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
        onPress={onClose}
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
                onPress={() => handleGenderSelect(genderOption)}
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
            onPress={onClose}
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
  );
};

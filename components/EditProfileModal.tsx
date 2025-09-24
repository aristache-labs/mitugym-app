import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Edit, X, Save, ChevronDown } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { PillButton } from './PillButton';
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

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSave: () => void;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
  tempDate: Date;
  onDateChange: (_event: any, selectedDate?: Date) => void;
  onDateDone: () => void;
  onDateCancel: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  editForm,
  setEditForm,
  onSave,
  showDatePicker,
  setShowDatePicker,
  tempDate,
  onDateChange,
  onDateDone,
  onDateCancel,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
          <TouchableOpacity onPress={onClose}>
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
              onPress={onSave}
              variant="primary"
              size="large"
              fullWidth
              icon={Save}
            />
            <PillButton
              title={t('cancel')}
              onPress={onClose}
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
            onPress={onDateCancel}
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
                <TouchableOpacity onPress={onDateCancel}>
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
                <TouchableOpacity onPress={onDateDone}>
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
                  onChange={onDateChange}
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
          onChange={onDateChange}
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
  );
};

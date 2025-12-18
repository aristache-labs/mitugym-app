import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Edit, X } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { StyledInput } from './StyledInput';
import { NativeDatePicker } from './NativeDatePicker';
import { DropdownPicker } from './DropdownPicker';
import { StyledButton } from './StyledButton';
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
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [cancelScale] = useState(new Animated.Value(1));
  const shineAnim = useRef(new Animated.Value(-1)).current;

  const handleCancelPressIn = () => {
    Animated.spring(cancelScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Trigger shine animation
    shineAnim.setValue(-1);
    Animated.timing(shineAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelPressOut = () => {
    Animated.spring(cancelScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
            {/* First Name */}
          <StyledInput
            icon="user"
            label={t('firstName').toUpperCase()}
                value={editForm.first_name}
                onChangeText={(text) => setEditForm({ ...editForm, first_name: text })}
                placeholder={t('firstName')}
            autoCapitalize="words"
            autoCorrect={false}
              />

            {/* Last Name */}
          <StyledInput
            icon="user"
            label={t('lastName').toUpperCase()}
                value={editForm.last_name}
                onChangeText={(text) => setEditForm({ ...editForm, last_name: text })}
                placeholder={t('lastName')}
            autoCapitalize="words"
            autoCorrect={false}
              />

            {/* Phone */}
          <StyledInput
            icon="phone"
            label={t('phone').toUpperCase()}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                placeholder={t('phone')}
                keyboardType="phone-pad"
              />

            {/* Address */}
          <StyledInput
            icon="location"
            label={t('address').toUpperCase()}
                value={editForm.address}
                onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                placeholder={t('address')}
              />

            {/* City */}
          <StyledInput
            icon="location"
            label={t('city').toUpperCase()}
                value={editForm.city}
                onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                placeholder={t('city')}
              />

            {/* County */}
          <StyledInput
            icon="location"
            label={t('county').toUpperCase()}
                value={editForm.county}
                onChangeText={(text) => setEditForm({ ...editForm, county: text })}
                placeholder={t('county')}
              />

            {/* Date of Birth */}
          <NativeDatePicker
            value={editForm.date_of_birth ? new Date(editForm.date_of_birth) : undefined}
            onDateChange={(date) => {
              const dateString = date.toISOString().split('T')[0] || '';
              setEditForm({ ...editForm, date_of_birth: dateString });
            }}
            placeholder={t('selectDateOfBirth')}
            label={t('dateOfBirth').toUpperCase()}
            maximumDate={new Date()}
          />

            {/* Gender */}
          <DropdownPicker
            value={editForm.gender || ''}
            onValueChange={(value) => setEditForm({ ...editForm, gender: value })}
            options={[
              { label: t('male'), value: 'male' },
              { label: t('female'), value: 'female' },
              { label: t('other'), value: 'other' },
            ]}
            placeholder={t('selectGender')}
            label={t('gender').toUpperCase()}
            doneButtonText={t('done')}
          />

          {/* Action Buttons */}
          <View style={{
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
            alignItems: 'center',
          }}>
            <StyledButton
              title={t('saveChanges')}
              onPress={onSave}
              fullWidth
            />
          <TouchableOpacity
              onPress={onClose}
              onPressIn={handleCancelPressIn}
              onPressOut={handleCancelPressOut}
              activeOpacity={1}
            style={{
                width: '50%',
            }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: cancelScale }],
                  overflow: 'hidden',
                  borderRadius: theme.borderRadius.lg,
                }}
              >
                <LinearGradient
                  colors={['rgba(51, 65, 85, 0.75)', 'rgba(30, 41, 59, 0.45)', 'rgba(51, 65, 85, 0.75)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
            style={{
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.md,
              alignItems: 'center',
                    borderRadius: theme.borderRadius.lg,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      transform: [
                        {
                          translateX: shineAnim.interpolate({
                            inputRange: [-1, 1],
                            outputRange: ['-100%', '100%'],
                          }),
                        },
                      ],
                    }}
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flex: 1,
                        width: '100%',
                    }}
                    />
                  </Animated.View>
                  <Text
                    style={{
                      fontSize: theme.typography.body.fontSize,
                      color: '#ffffff',
                      fontWeight: '500',
                      zIndex: 10,
                }}
              >
                  {t('cancel')}
                </Text>
                </LinearGradient>
              </Animated.View>
              </TouchableOpacity>
            </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

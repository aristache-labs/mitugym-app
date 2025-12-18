import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Key } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { StyledInput } from './StyledInput';
import { StyledButton } from './StyledButton';
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
  const [cancelScale] = useState(new Animated.Value(1));
  const shineAnim = useRef(new Animated.Value(-1)).current;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
      }}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }} />
        </TouchableWithoutFeedback>

        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          width: '90%',
          maxWidth: 400,
          marginHorizontal: theme.spacing.xl,
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
          {/* Current Password */}
          <StyledInput
            icon="password"
            label={t('currentPassword').toUpperCase()}
            value={passwordForm.currentPassword}
            onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
            placeholder={t('currentPassword')}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* New Password */}
          <StyledInput
            icon="password"
            label={t('newPassword').toUpperCase()}
            value={passwordForm.newPassword}
            onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
            placeholder={t('newPassword')}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Confirm Password */}
          <StyledInput
            icon="password"
            label={t('confirmPassword').toUpperCase()}
            value={passwordForm.confirmPassword}
            onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
            placeholder={t('confirmPassword')}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={onChangePassword}
          />

          {/* Action Buttons */}
          <View style={{
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
            alignItems: 'center',
          }}>
            <StyledButton
              title={t('updatePassword')}
              onPress={onChangePassword}
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
        </View>
      </View>
    </Modal>
  );
};

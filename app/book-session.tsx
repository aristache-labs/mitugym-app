import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
} from 'lucide-react-native';
import { useAppStore } from '../lib/store';
import { theme } from '../lib/theme';
import { AppHeader } from '../components/AppHeader';
import { StyledInput } from '../components/StyledInput';
import { NativeDatePicker } from '../components/NativeDatePicker';
import { StyledButton } from '../components/StyledButton';
import { useLanguage } from '../lib/LanguageContext';

export default function BookSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams();

  // Parse the purchased service from params
  const purchasedService = params.service ? JSON.parse(params.service as string) : null;
  const editSession = params.editSession ? JSON.parse(params.editSession as string) : null;
  const isEditMode = !!editSession;

  // Session booking state
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [bookingTime, setBookingTime] = useState<Date | undefined>(undefined);
  const [sessionNotes, setSessionNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Cancel button animation
  const [cancelScale] = useState(new Animated.Value(1));
  const shineAnim = useRef(new Animated.Value(-1)).current;

  const { bookSession, updateSession, sessionBookings } = useAppStore();

  useEffect(() => {
    if (initialized) return; // Prevent infinite loop

    if (isEditMode && editSession) {
      // Pre-fill with existing session data
      const sessionDateTime = new Date(editSession.booking_date);
      setBookingDate(sessionDateTime);
      setBookingTime(sessionDateTime);
      setSessionNotes(editSession.notes || '');
    } else {
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setBookingDate(tomorrow);

      // Set default time to 10:00 AM
      const defaultTime = new Date();
      defaultTime.setHours(10, 0, 0, 0);
      setBookingTime(defaultTime);
    }
    
    setInitialized(true);
  }, [initialized, isEditMode, editSession]);

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

  const handleSubmit = async () => {
    if (!purchasedService || !bookingDate || !bookingTime) {
      // Could use toast notification here instead of Alert if you have showToast in store
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    // Combine date and time into a single datetime
    const combinedDateTime = new Date(bookingDate);
    combinedDateTime.setHours(bookingTime.getHours(), bookingTime.getMinutes(), 0, 0);

    // Check if booking is in the past
    const now = new Date();
    if (combinedDateTime <= now) {
      // Could use toast notification here instead of Alert if you have showToast in store
      Alert.alert(t('error'), t('cannotBookInPast'));
      return;
    }

    // Check for time conflicts (1 hour minimum gap between sessions)
    const oneHourBefore = new Date(combinedDateTime.getTime() - (60 * 60 * 1000));
    const oneHourAfter = new Date(combinedDateTime.getTime() + (60 * 60 * 1000));

    const conflictingBookings = sessionBookings.filter((booking: any) => {
      if (booking.status !== 'pending' && booking.status !== 'confirmed') {return false;}

      const sessionTime = new Date(booking.booking_date);
      return sessionTime > oneHourBefore && sessionTime < oneHourAfter;
    });

    if (conflictingBookings.length > 0) {
      Alert.alert(t('error'), t('bookingTimeConflict'));
      return;
    }

    const bookingDateTime = combinedDateTime.toISOString();

    try {
      let success;
      if (isEditMode && editSession) {
        // Update existing session
        success = await updateSession(editSession.id, bookingDateTime, sessionNotes);
      } else {
        // Create new session
        success = await bookSession(purchasedService.id, bookingDateTime, sessionNotes);
      }
      
      // Only navigate back if booking/update was successful
      if (success) {
        router.back();
      }
      // If not successful, stay on page so user can select different date/time
    } catch (error) {
      console.error('Session booking/update failed:', error);
      // The store will show an error toast notification
      // Stay on page so user can try again
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!purchasedService) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
        <AppHeader
          title={t('bookSession')}
          showBack
          onBack={() => router.back()}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.lg,
        }}>
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}>
            {t('noServiceSelected')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={isEditMode ? t('editSession') : t('bookSession')}
        showBack
        onBack={handleCancel}
      />

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Details */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
        }}>
          <Text style={{
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            {purchasedService.services?.name || 'Service'}
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
          }}>
            <Clock size={16} color={theme.colors.text.secondary} style={{ marginRight: theme.spacing.xs }} />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {purchasedService.services?.duration_minutes} {t('minutes')}
            </Text>
          </View>
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
          }}>
            {t('sessionsRemaining')}: {purchasedService.sessions_remaining} / {purchasedService.sessions_total}
          </Text>
        </View>

        {/* Date Input */}
        <NativeDatePicker
          value={bookingDate}
          onDateChange={setBookingDate}
          placeholder={t('selectDate')}
          label={t('selectDate').toUpperCase()}
          minimumDate={new Date()}
        />

        {/* Time Input */}
        <NativeDatePicker
          value={bookingTime}
          onDateChange={setBookingTime}
          placeholder={t('selectTime')}
          label={t('selectTime').toUpperCase()}
          mode="time"
        />

        {/* Notes Input */}
        <StyledInput
          label={`${t('notes').toUpperCase()} (${t('optional').toUpperCase()})`}
          value={sessionNotes}
          onChangeText={setSessionNotes}
          placeholder={t('addNotesPlaceholder')}
          multiline
          numberOfLines={4}
          style={{
            minHeight: 100,
            textAlignVertical: 'top',
          }}
        />

        {/* Action Buttons */}
        <View style={{ 
          gap: theme.spacing.md,
          marginTop: theme.spacing.xl,
          alignItems: 'center',
        }}>
          <StyledButton
            title={isEditMode ? t('updateSession') : t('submitBooking')}
            onPress={handleSubmit}
            fullWidth
          />

          <TouchableOpacity
            onPress={handleCancel}
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
  );
}

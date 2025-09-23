import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Clock,
  Check,
  X,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../lib/store';
import { theme } from '../lib/theme';
import { AppHeader } from '../components/AppHeader';
import { useLanguage } from '../lib/LanguageContext';

export default function BookSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const params = useLocalSearchParams();

  // Parse the purchased service from params
  const purchasedService = params.service ? JSON.parse(params.service as string) : null;
  // Session booking state
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const { bookSession } = useAppStore();

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow);

    // Set default time to 10:00 AM
    const defaultTime = new Date();
    defaultTime.setHours(10, 0, 0, 0);
    setBookingTime(defaultTime);
  }, []);

  // Temporary state for picker values (only committed on Done)
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());

  // DateTimePicker handlers - only update temp values, not final ones
  const onDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  // Handle Done button for date picker
  const handleDateDone = () => {
    setBookingDate(tempDate);
    setShowDatePicker(false);
  };

  // Handle Done button for time picker
  const handleTimeDone = () => {
    setBookingTime(tempTime);
    setShowTimePicker(false);
  };

  // Handle backdrop press or cancel
  const handleDateCancel = () => {
    setTempDate(bookingDate); // Reset to original value
    setShowDatePicker(false);
  };

  const handleTimeCancel = () => {
    setTempTime(bookingTime); // Reset to original value
    setShowTimePicker(false);
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

    const bookingDateTime = combinedDateTime.toISOString();

    try {
      await bookSession(purchasedService.id, bookingDateTime, sessionNotes);
      // The store will show a success toast notification
      router.back();
    } catch (error) {
      console.error('Session booking failed:', error);
      // The store will show an error toast notification
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
        title={t('bookSession')}
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
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            {t('selectDate')}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={() => {
              setTempDate(bookingDate); // Initialize temp value
              setShowDatePicker(true);
            }}
          >
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.primary,
            }}>
              {bookingDate.toLocaleDateString()}
            </Text>
            <Calendar size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Time Input */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            {t('selectTime')}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onPress={() => {
              setTempTime(bookingTime); // Initialize temp value
              setShowTimePicker(true);
            }}
          >
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.primary,
            }}>
              {bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Clock size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Notes Input */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            fontWeight: '600',
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            {t('notes')} ({t('optional')})
          </Text>
          <TextInput
            style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.2)',
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.primary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
            placeholder={t('addNotesPlaceholder')}
            placeholderTextColor={theme.colors.text.secondary}
            value={sessionNotes}
            onChangeText={setSessionNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={{ gap: theme.spacing.md }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleSubmit}
          >
            <Check size={20} color="white" style={{ marginRight: theme.spacing.sm }} />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              fontWeight: '600',
              color: 'white',
            }}>
              {t('submitBooking')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.text.secondary,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleCancel}
          >
            <X size={20} color={theme.colors.text.secondary} style={{ marginRight: theme.spacing.sm }} />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              fontWeight: '600',
              color: theme.colors.text.secondary,
            }}>
              {t('cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={handleDateCancel}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            activeOpacity={1}
            onPress={handleDateCancel}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: theme.colors.background.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: theme.colors.primary.DEFAULT,
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(30, 155, 113, 0.2)',
              }}>
                <TouchableOpacity onPress={handleDateCancel}>
                  <Text style={{
                    color: theme.colors.text.secondary,
                    fontSize: 17,
                  }}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                <Text style={{
                  fontSize: 17,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {t('selectDate')}
                </Text>
                <TouchableOpacity onPress={handleDateDone}>
                  <Text style={{
                    color: theme.colors.primary.DEFAULT,
                    fontSize: 17,
                    fontWeight: '600',
                  }}>
                    {t('done')}
                  </Text>
                </TouchableOpacity>
              </View>
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
                  minimumDate={new Date()}
                  textColor={theme.colors.text.primary}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* iOS Time Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          animationType="slide"
          onRequestClose={handleTimeCancel}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            activeOpacity={1}
            onPress={handleTimeCancel}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: theme.colors.background.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: theme.colors.primary.DEFAULT,
              }}
            >
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(30, 155, 113, 0.2)',
              }}>
                <TouchableOpacity onPress={handleTimeCancel}>
                  <Text style={{
                    color: theme.colors.text.secondary,
                    fontSize: 17,
                  }}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                <Text style={{
                  fontSize: 17,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {t('selectTime')}
                </Text>
                <TouchableOpacity onPress={handleTimeDone}>
                  <Text style={{
                    color: theme.colors.primary.DEFAULT,
                    fontSize: 17,
                    fontWeight: '600',
                  }}>
                    {t('done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: theme.spacing.lg,
              }}>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  textColor={theme.colors.text.primary}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android DateTimePickers */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={bookingDate}
          mode="date"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={bookingTime}
          mode="time"
          onChange={onTimeChange}
        />
      )}
    </View>
  );
}

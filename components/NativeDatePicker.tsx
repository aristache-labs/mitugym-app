import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, ChevronDown } from 'lucide-react-native';
import { theme } from '../lib/theme';

interface NativeDatePickerProps {
  value?: Date | undefined;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  label?: string;
}

export function NativeDatePicker({
  value,
  onDateChange,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  label,
}: NativeDatePickerProps) {
  const [show, setShow] = useState(false);

  const onChange = (_event: any, selectedDate?: Date) => {
    // Always hide picker on Android after selection
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const handleIOSConfirm = () => {
    setShow(false);
  };

  const handleIOSCancel = () => {
    setShow(false);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View>
      {label && (
        <Text style={{
          fontSize: theme.typography.body.fontSize,
          fontWeight: '600',
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.xs,
        }}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={showDatepicker}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(77, 212, 212, 0.05)',
          borderWidth: 1,
          borderColor: value
            ? theme.colors.primary.DEFAULT
            : 'rgba(179, 217, 217, 0.3)',
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        }}
      >
        <Calendar
          size={20}
          color={theme.colors.text.secondary}
          style={{ marginRight: theme.spacing.md }}
        />
        <Text style={{
          flex: 1,
          fontSize: theme.typography.body.fontSize,
          color: value ? theme.colors.text.primary : theme.colors.text.secondary,
        }}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

      {show && Platform.OS === 'ios' && (
        <Modal
          transparent
          animationType="slide"
          visible={show}
          onRequestClose={handleIOSCancel}
        >
          <TouchableWithoutFeedback onPress={handleIOSCancel}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end',
            }}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={{
                  backgroundColor: theme.colors.background.surface,
                  borderTopLeftRadius: theme.borderRadius.xl,
                  borderTopRightRadius: theme.borderRadius.xl,
                  paddingBottom: 34, // Safe area for iOS
                }}>
                  {/* Header */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(179, 217, 217, 0.2)',
                  }}>
                    <TouchableOpacity onPress={handleIOSCancel}>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        color: theme.colors.primary.DEFAULT,
                      }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <Text style={{
                      fontSize: theme.typography.h3.fontSize,
                      fontWeight: theme.typography.h3.fontWeight,
                      color: theme.colors.text.primary,
                    }}>
                      Select Date
                    </Text>
                    <TouchableOpacity onPress={handleIOSConfirm}>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        color: theme.colors.primary.DEFAULT,
                        fontWeight: '600',
                      }}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Date Picker */}
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={value || new Date()}
                    mode="date"
                    is24Hour={true}
                    display="spinner"
                    onChange={onChange}
                    {...(minimumDate && { minimumDate })}
                    {...(maximumDate && { maximumDate })}
                    style={{
                      backgroundColor: theme.colors.background.surface,
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onChange}
          {...(minimumDate && { minimumDate })}
          {...(maximumDate && { maximumDate })}
        />
      )}
    </View>
  );
}

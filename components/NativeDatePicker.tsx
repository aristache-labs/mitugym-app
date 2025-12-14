import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, Animated, StyleSheet } from 'react-native';
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
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animatedValue]);

  const onChange = (_event: any, selectedDate?: Date) => {
    // Always hide picker on Android after selection
    if (Platform.OS === 'android') {
      setShow(false);
      setIsFocused(false);
    }

    if (selectedDate) {
      onDateChange(selectedDate);
      // On iOS, when date changes, we're still in the modal
      // Don't close focus state yet
    }
  };

  const handleIOSConfirm = () => {
    setShow(false);
    setIsFocused(false);
  };

  const handleIOSCancel = () => {
    setShow(false);
    setIsFocused(false);
  };

  const showDatepicker = () => {
    setShow(true);
    setIsFocused(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 212, 212, 0.3)', '#00d4d4'],
  });

  const borderWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const iconOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const labelOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.6)', '#00d4d4'],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              opacity: labelOpacity,
              color: labelColor,
            },
          ]}
        >
          {label}
        </Animated.Text>
      )}

      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            borderWidth,
            shadowColor: '#00d4d4',
            shadowOpacity,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {/* Inner Background */}
        <View style={styles.innerBackground} />

        {/* Top decorator */}
        <Animated.View
          style={[
            styles.decoratorTop,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 20],
              }),
              left: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['80%', '20%'],
              }),
            },
          ]}
        />

        {/* Bottom decorator */}
        <Animated.View
          style={[
            styles.decoratorBottom,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [7, 20],
              }),
              left: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['20%', '80%'],
              }),
            },
          ]}
        />

        <TouchableOpacity
          onPress={showDatepicker}
          style={styles.touchable}
        >
          <Animated.View style={{ opacity: iconOpacity }}>
            <Calendar
              size={20}
              color="#00d4d4"
              style={styles.icon}
            />
          </Animated.View>
          <Text style={[
            styles.text,
            { color: value ? '#ffffff' : 'rgba(255, 255, 255, 0.3)' },
          ]}>
            {value ? formatDate(value) : placeholder}
          </Text>
          <ChevronDown
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
      </Animated.View>

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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'visible',
    elevation: 5,
    shadowColor: '#00d4d4',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
  },
  innerBackground: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    backgroundColor: '#141A1A',
    borderRadius: 6,
  },
  decoratorTop: {
    position: 'absolute',
    top: -2.5,
    height: 3,
    backgroundColor: '#141A1A',
    borderWidth: 1,
    borderColor: '#00d4d4',
    transform: [{ translateX: -2.5 }],
    zIndex: 10,
  },
  decoratorBottom: {
    position: 'absolute',
    bottom: -2.5,
    height: 3,
    backgroundColor: '#141A1A',
    borderWidth: 1,
    borderColor: '#00d4d4',
    transform: [{ translateX: -2.5 }],
    zIndex: 10,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 1,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

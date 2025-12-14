import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Animated, StyleSheet } from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { PillButton } from './PillButton';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownPickerProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  doneButtonText?: string;
}

export function DropdownPicker({
  value,
  onValueChange,
  options,
  placeholder = 'Select option',
  label,
  doneButtonText = 'Done',
}: DropdownPickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isVisible ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [isVisible, animatedValue]);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsVisible(false);
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
          onPress={() => setIsVisible(true)}
          style={styles.touchable}
        >
          <Text style={[
            styles.text,
            { color: selectedOption ? '#ffffff' : 'rgba(255, 255, 255, 0.3)' },
          ]}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDown
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: theme.colors.background.surface,
            borderTopLeftRadius: theme.borderRadius.xl,
            borderTopRightRadius: theme.borderRadius.xl,
            paddingTop: theme.spacing.lg,
            maxHeight: '70%',
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(179, 217, 217, 0.2)',
            }}>
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <X size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <ScrollView style={{ maxHeight: 300 }}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(179, 217, 217, 0.1)',
                  }}
                >
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.primary,
                    flex: 1,
                  }}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Check
                      size={20}
                      color={theme.colors.primary.DEFAULT}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Close Button */}
            <View style={{
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
              paddingTop: theme.spacing.md,
            }}>
              <PillButton
                title={doneButtonText}
                onPress={() => setIsVisible(false)}
                variant="primary"
                size="medium"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
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
  text: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
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

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsVisible(false);
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
        onPress={() => setIsVisible(true)}
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
        <Text style={{
          flex: 1,
          fontSize: theme.typography.body.fontSize,
          color: selectedOption ? theme.colors.text.primary : theme.colors.text.secondary,
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown
          size={20}
          color={theme.colors.text.secondary}
        />
      </TouchableOpacity>

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

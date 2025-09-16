import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../lib/theme';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface ListFiltersProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  showCounts?: boolean;
}

export function ListFilters({
  options,
  selectedId,
  onSelect,
  showCounts = false,
}: ListFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
      }}
      style={{
        flexGrow: 0,
      }}
    >
      {options.map((option, index) => {
        const isSelected = option.id === selectedId;
        
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={{
              backgroundColor: isSelected 
                ? theme.colors.primary.DEFAULT 
                : 'rgba(30, 155, 113, 0.1)',
              borderWidth: 1,
              borderColor: isSelected 
                ? theme.colors.primary.DEFAULT 
                : 'rgba(30, 155, 113, 0.3)',
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.lg,
              marginRight: index < options.length - 1 ? theme.spacing.md : 0,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '600',
              color: isSelected 
                ? '#ffffff' 
                : theme.colors.primary.DEFAULT,
            }}>
              {option.label}
            </Text>
            
            {showCounts && option.count !== undefined && (
              <View style={{
                backgroundColor: isSelected 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(30, 155, 113, 0.2)',
                borderRadius: theme.borderRadius.sm,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 2,
                marginLeft: theme.spacing.sm,
                minWidth: 24,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: theme.typography.small.fontSize,
                  fontWeight: '600',
                  color: isSelected 
                    ? '#ffffff' 
                    : theme.colors.primary.DEFAULT,
                }}>
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

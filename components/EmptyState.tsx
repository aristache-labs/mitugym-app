import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { PillButton } from './PillButton';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xxl,
    }}>
      {/* Icon */}
      <View style={{
        backgroundColor: 'rgba(30, 155, 113, 0.1)',
        borderRadius: theme.borderRadius.full,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
      }}>
        <Icon
          size={48}
          color={theme.colors.primary.DEFAULT}
        />
      </View>

      {/* Title */}
      <Text style={{
        fontSize: theme.typography.h2.fontSize,
        fontWeight: theme.typography.h2.fontWeight,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
      }}>
        {title}
      </Text>

      {/* Description */}
      <Text style={{
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: actionLabel ? theme.spacing.xl : 0,
      }}>
        {description}
      </Text>

      {/* Action button */}
      {actionLabel && onAction && (
        <PillButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
        />
      )}
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, MapPin, User } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { 
  formatTime12Hour, 
  formatRelativeDate, 
  getLevelColor, 
  getSpotsLeftText,
  getCardElevation 
} from '../lib/utils';
import { GymClass } from '../lib/mock';

interface ClassCardProps {
  gymClass: GymClass;
  isReserved?: boolean;
  onPress: () => void;
  onReserve?: () => void;
  showDate?: boolean;
  compact?: boolean;
}

export function ClassCard({
  gymClass,
  isReserved = false,
  onPress,
  onReserve,
  showDate = false,
  compact = false,
}: ClassCardProps) {
  const levelColor = getLevelColor(gymClass.level);
  const spotsText = getSpotsLeftText(gymClass.spotsLeft);
  const isFull = gymClass.spotsLeft <= 0;
  
  const cardHeight = compact ? undefined : 160;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        marginBottom: theme.spacing.md,
      }}
    >
      <LinearGradient
        colors={[
          'rgba(30, 155, 113, 0.05)',
          'rgba(17, 22, 24, 0.8)',
          'rgba(11, 15, 14, 0.9)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: isReserved 
            ? theme.colors.primary.DEFAULT 
            : 'rgba(30, 155, 113, 0.2)',
          height: cardHeight,
          ...getCardElevation(false),
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        }}>
          <View style={{ flex: 1, marginRight: theme.spacing.md }}>
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
              lineHeight: theme.typography.h3.lineHeight,
            }}>
              {gymClass.title}
            </Text>
            
            {showDate && (
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                marginTop: 2,
              }}>
                {formatRelativeDate(gymClass.startAt)}
              </Text>
            )}
          </View>

          {/* Level badge */}
          <View style={{
            backgroundColor: `${levelColor}20`,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.sm,
            borderWidth: 1,
            borderColor: `${levelColor}40`,
          }}>
            <Text style={{
              fontSize: theme.typography.small.fontSize,
              fontWeight: '600',
              color: levelColor,
            }}>
              {gymClass.level}
            </Text>
          </View>
        </View>

        {/* Details row */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: compact ? theme.spacing.sm : theme.spacing.md,
        }}>
          <Clock
            size={16}
            color={theme.colors.text.secondary}
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
            marginRight: theme.spacing.md,
          }}>
            {formatTime12Hour(gymClass.startAt)} • {gymClass.duration}min
          </Text>

          <MapPin
            size={16}
            color={theme.colors.text.secondary}
            style={{ marginRight: theme.spacing.xs }}
          />
          <Text style={{
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
          }}>
            {gymClass.room}
          </Text>
        </View>

        {/* Trainer and spots */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: compact ? 0 : theme.spacing.md,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <User
              size={16}
              color={theme.colors.text.secondary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {gymClass.trainer}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Users
              size={16}
              color={isFull ? theme.colors.status.error : theme.colors.text.secondary}
              style={{ marginRight: theme.spacing.xs }}
            />
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: isFull ? theme.colors.status.error : theme.colors.text.secondary,
              fontWeight: isFull ? '600' : '400',
            }}>
              {spotsText}
            </Text>
          </View>
        </View>

        {/* Action button (if not compact) */}
        {!compact && onReserve && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onReserve();
            }}
            disabled={isFull && !isReserved}
            style={{
              backgroundColor: isReserved 
                ? 'rgba(231, 76, 60, 0.2)' 
                : isFull 
                ? 'rgba(167, 195, 186, 0.2)'
                : 'rgba(30, 155, 113, 0.2)',
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.borderRadius.sm,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isReserved 
                ? theme.colors.status.error 
                : isFull 
                ? theme.colors.text.secondary
                : theme.colors.primary.DEFAULT,
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '600',
              color: isReserved 
                ? theme.colors.status.error 
                : isFull 
                ? theme.colors.text.secondary
                : theme.colors.primary.DEFAULT,
            }}>
              {isReserved ? 'Cancel Reservation' : isFull ? 'Full' : 'Reserve Spot'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Reserved indicator */}
        {isReserved && (
          <View style={{
            position: 'absolute',
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            backgroundColor: theme.colors.primary.DEFAULT,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.sm,
          }}>
            <Text style={{
              fontSize: theme.typography.small.fontSize,
              fontWeight: '600',
              color: '#ffffff',
            }}>
              Reserved
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

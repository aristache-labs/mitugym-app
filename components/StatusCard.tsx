
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, XCircle, Calendar, Users } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { getMembershipStatusColor, getDaysLeftText, getVisitsLeftText } from '../lib/utils';

interface StatusCardProps {
  status: 'active' | 'expired';
  membershipPlan: string;
  daysLeft?: number | undefined;
  visitsLeft?: number | undefined;
  onPress?: () => void;
  onRenew?: (() => void) | undefined;
}

export function StatusCard({
  status,
  membershipPlan,
  daysLeft,
  visitsLeft,
  onPress,
  onRenew,
}: StatusCardProps) {
  const statusColor = getMembershipStatusColor(status);
  const StatusIcon = status === 'active' ? CheckCircle : XCircle;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <LinearGradient
        colors={[
          'rgba(30, 155, 113, 0.1)',
          'rgba(17, 22, 24, 0.8)',
          'rgba(11, 15, 14, 0.9)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: status === 'active'
            ? 'rgba(30, 155, 113, 0.3)'
            : 'rgba(231, 76, 60, 0.3)',
          ...theme.shadows.medium,
        }}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StatusIcon
              size={24}
              color={statusColor}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              Membership Status
            </Text>
          </View>
        </View>

        {/* Status and Plan */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <View>
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              marginBottom: 4,
            }}>
              Current Plan
            </Text>
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {membershipPlan}
            </Text>
          </View>

          <View style={{
            backgroundColor: status === 'active'
              ? 'rgba(46, 204, 113, 0.2)'
              : 'rgba(231, 76, 60, 0.2)',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
          }}>
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '600',
              color: statusColor,
              textTransform: 'uppercase',
            }}>
              {status}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: status === 'expired' ? theme.spacing.lg : 0,
        }}>
          {daysLeft !== undefined && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
            }}>
              <Calendar
                size={18}
                color={theme.colors.text.secondary}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                {getDaysLeftText(daysLeft)}
              </Text>
            </View>
          )}

          {visitsLeft !== undefined && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              justifyContent: daysLeft !== undefined ? 'flex-end' : 'flex-start',
            }}>
              <Users
                size={18}
                color={theme.colors.text.secondary}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                {getVisitsLeftText(visitsLeft)}
              </Text>
            </View>
          )}
        </View>

        {/* Renew Button (if expired) */}
        {status === 'expired' && onRenew && (
          <TouchableOpacity
            onPress={onRenew}
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              alignItems: 'center',
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              fontWeight: '600',
              color: '#ffffff',
            }}>
              Renew Membership
            </Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}


import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, XCircle, Calendar } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { getMembershipStatusColor, getDaysLeftText } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

interface StatusCardProps {
  status: 'active' | 'expired' | 'pending' | 'inactive' | 'frozen';
  membershipPlan: string;
  daysLeft?: number | undefined;
  expiryDate?: string | undefined;
  planStartDate?: string | undefined;
  onPress?: () => void;
  onRenew?: (() => void) | undefined;
  showDetails?: boolean;
}

export function StatusCard({
  status,
  membershipPlan,
  daysLeft,
  expiryDate,
  planStartDate,
  onPress,
  onRenew,
  showDetails = false,
}: StatusCardProps) {
  const { t } = useLanguage();
  const statusColor = getMembershipStatusColor(status);
  const StatusIcon = status === 'active' ? CheckCircle : (status === 'pending' ? Calendar : XCircle);

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
          justifyContent: 'center',
          marginBottom: theme.spacing.md,
        }}>
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
            {t('membershipStatus')}
          </Text>
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
              {t('currentPlan')}
            </Text>
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {membershipPlan || t('none')}
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
              {t(status)}
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
                {getDaysLeftText(daysLeft, t)}
              </Text>
            </View>
          )}

          {((status === 'pending' && planStartDate) || (status !== 'pending' && expiryDate)) && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              justifyContent: daysLeft !== undefined ? 'flex-end' : 'flex-start',
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
                {status === 'pending' && planStartDate 
                  ? `${t('starts')}: ${new Date(planStartDate).toLocaleDateString()}`
                  : `${t('expires')}: ${new Date(expiryDate!).toLocaleDateString()}`
                }
              </Text>
            </View>
          )}
        </View>

        {/* Additional Details */}
        {showDetails && (
          <View style={{
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            paddingTop: theme.spacing.md,
            marginTop: theme.spacing.md,
            gap: theme.spacing.sm,
          }}>
            {/* Plan Purchased Date */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              }}>
                {t('planPurchased')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}>
                {planStartDate ? new Date(planStartDate).toLocaleDateString() : new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {/* Renew Button */}
        {showDetails && onRenew && (
          <View style={{ marginTop: theme.spacing.lg }}>
            <TouchableOpacity
              onPress={onRenew}
              style={{
                backgroundColor: status === 'expired' 
                  ? theme.colors.primary.DEFAULT 
                  : 'rgba(30, 155, 113, 0.15)',
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                alignItems: 'center',
                borderWidth: status === 'active' ? 1 : 0,
                borderColor: theme.colors.primary.DEFAULT,
              }}
              activeOpacity={0.8}
            >
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: status === 'expired' ? '#ffffff' : theme.colors.primary.DEFAULT,
              }}>
                {status === 'expired' ? t('renewMembership') : t('renewEarly')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </LinearGradient>
    </TouchableOpacity>
  );
}

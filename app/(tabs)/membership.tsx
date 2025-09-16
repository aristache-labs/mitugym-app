import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CreditCard,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatPrice, formatRelativeDate } from '../../lib/utils';
import { mockMembershipPlans, mockBookingHistory } from '../../lib/mock';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { PillButton } from '../../components/PillButton';

export default function MembershipScreen() {
  const insets = useSafeAreaInsets();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const {
    member,
    renewMembership,
    toggleMembershipStatus, // For demo purposes
  } = useAppStore();

  const handleRenewPress = () => {
    setShowRenewModal(true);
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleConfirmRenewal = () => {
    if (selectedPlanId) {
      renewMembership(selectedPlanId);
      setShowRenewModal(false);
      setSelectedPlanId('');
    }
  };

  const handleCancelRenewal = () => {
    setShowRenewModal(false);
    setSelectedPlanId('');
  };

  // Demo function to toggle membership status
  const handleToggleDemo = () => {
    toggleMembershipStatus();
  };

  if (!member) {
    return null;
  }

  const recentBookings = mockBookingHistory.slice(0, 5);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title="Membership"
        subtitle="Manage your plan"
        showNotifications
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Membership Status */}
        <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
          <StatusCard
            status={member.membershipStatus}
            membershipPlan={member.membershipPlan}
            daysLeft={member.daysLeft}
            visitsLeft={member.visitsLeft}
            onRenew={member.membershipStatus === 'expired' ? handleRenewPress : undefined}
          />
        </View>

        {/* Demo Toggle Button */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <PillButton
            title={`Demo: Switch to ${member.membershipStatus === 'active' ? 'Expired' : 'Active'}`}
            onPress={handleToggleDemo}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>

        {/* Membership Details */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.medium,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <CreditCard
              size={24}
              color={theme.colors.primary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              Membership Details
            </Text>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Member Since
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}>
                {formatRelativeDate(member.joinDate)}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Renewal Date
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: member.membershipStatus === 'expired'
                  ? theme.colors.status.error
                  : theme.colors.text.primary,
              }}>
                {formatRelativeDate(member.expiryDate)}
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}>
                Member ID
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                fontFamily: 'monospace',
              }}>
                #001234
              </Text>
            </View>
          </View>

          {member.membershipStatus === 'active' && (
            <View style={{ marginTop: theme.spacing.lg }}>
              <PillButton
                title="Renew Early"
                onPress={handleRenewPress}
                variant="outline"
                fullWidth
              />
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.medium,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <Clock
              size={24}
              color={theme.colors.secondary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              Recent Activity
            </Text>
          </View>

          {recentBookings.length > 0 ? (
            <View style={{ gap: theme.spacing.md }}>
              {recentBookings.map(booking => (
                <View
                  key={booking.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(167, 195, 186, 0.1)',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: '500',
                      color: theme.colors.text.primary,
                      marginBottom: 2,
                    }}>
                      {booking.className}
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                    }}>
                      {formatRelativeDate(booking.date)}
                    </Text>
                  </View>

                  <View style={{
                    backgroundColor: booking.status === 'completed'
                      ? 'rgba(46, 204, 113, 0.2)'
                      : booking.status === 'upcoming'
                      ? 'rgba(30, 155, 113, 0.2)'
                      : 'rgba(231, 76, 60, 0.2)',
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 4,
                    borderRadius: theme.borderRadius.sm,
                  }}>
                    <Text style={{
                      fontSize: theme.typography.small.fontSize,
                      fontWeight: '600',
                      color: booking.status === 'completed'
                        ? theme.colors.status.success
                        : booking.status === 'upcoming'
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.status.error,
                      textTransform: 'capitalize',
                    }}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              No recent activity
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Renewal Modal */}
      <Modal
        visible={showRenewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelRenewal}
      >
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.background.DEFAULT,
        }}>
          <AppHeader
            title="Renew Membership"
            subtitle="Choose your plan"
            showBack
            onBack={handleCancelRenewal}
          />

          <ScrollView
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            {mockMembershipPlans.map(plan => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => handlePlanSelect(plan.id)}
                style={{
                  marginBottom: theme.spacing.lg,
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={selectedPlanId === plan.id
                    ? ['rgba(30, 155, 113, 0.2)', 'rgba(17, 22, 24, 0.9)']
                    : ['rgba(30, 155, 113, 0.05)', 'rgba(17, 22, 24, 0.8)']}
                  style={{
                    borderRadius: theme.borderRadius.xl,
                    padding: theme.spacing.lg,
                    borderWidth: 2,
                    borderColor: selectedPlanId === plan.id
                      ? theme.colors.primary.DEFAULT
                      : 'rgba(30, 155, 113, 0.2)',
                    ...theme.shadows.medium,
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: theme.spacing.md,
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: theme.typography.h3.fontWeight,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.xs,
                      }}>
                        {plan.name}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.h1.fontSize,
                        fontWeight: '700',
                        color: theme.colors.primary.DEFAULT,
                      }}>
                        {formatPrice(plan.price)}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                      }}>
                        {plan.type === 'visits' ? `${plan.visits} visits` : 'Unlimited'} • {plan.duration} days
                      </Text>
                    </View>

                    {selectedPlanId === plan.id && (
                      <CheckCircle
                        size={24}
                        color={theme.colors.primary.DEFAULT}
                      />
                    )}
                  </View>

                  <View style={{ gap: theme.spacing.xs }}>
                    {plan.features.map((feature, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <CheckCircle
                          size={16}
                          color={theme.colors.status.success}
                          style={{ marginRight: theme.spacing.sm }}
                        />
                        <Text style={{
                          fontSize: theme.typography.caption.fontSize,
                          color: theme.colors.text.secondary,
                        }}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <View style={{
              marginTop: theme.spacing.lg,
              gap: theme.spacing.md,
            }}>
              <PillButton
                title="Confirm Renewal"
                onPress={handleConfirmRenewal}
                variant="primary"
                size="large"
                fullWidth
                disabled={!selectedPlanId}
              />

              <PillButton
                title="Cancel"
                onPress={handleCancelRenewal}
                variant="outline"
                size="large"
                fullWidth
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

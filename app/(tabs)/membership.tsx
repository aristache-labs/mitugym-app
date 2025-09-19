import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CreditCard,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatPrice, formatRelativeDateI18n } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { PillButton } from '../../components/PillButton';
import { useLanguage } from '../../lib/LanguageContext';

export default function MembershipScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [checkinFilter, setCheckinFilter] = useState('1M'); // 1M, 3M, 6M, 1Y, ALL

  const {
    member,
    membershipPlans,
    membershipPlansLoading,
    fetchMembershipPlans,
    renewMembership,
    toggleMembershipStatus, // For demo purposes
    checkins,
    checkinsLoading,
    fetchCheckins,
  } = useAppStore();

  // Fetch membership plans and checkins on component mount
  useEffect(() => {
    fetchMembershipPlans();
    fetchCheckins();
  }, [fetchMembershipPlans, fetchCheckins]);

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

  // Filter checkins based on selected period
  const getFilteredCheckins = () => {
    if (checkinFilter === 'ALL') return checkins;
    
    const now = new Date();
    const monthsToSubtract = checkinFilter === '1M' ? 1 : 
                           checkinFilter === '3M' ? 3 : 
                           checkinFilter === '6M' ? 6 : 12;
    
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, 1);
    
    return checkins.filter(checkin => {
      const checkinDate = new Date(checkin.check_in_time);
      return checkinDate >= startDate;
    });
  };

  const filteredCheckins = getFilteredCheckins();
  const recentCheckins = filteredCheckins.slice(0, 10); // Show more when filtered
  
  // Format checkin data for display
  const formatDuration = (minutes?: number) => {
    if (!minutes) return t('inProgress');
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={t('membership')}
        subtitle={t('managePlan')}
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
            expiryDate={member.expiryDate}
            onRenew={member.membershipStatus === 'expired' ? handleRenewPress : undefined}
          />
        </View>

        {/* Demo Toggle Button */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <PillButton
            title={`${t('demo')}: ${t('switchTo')} ${member.membershipStatus === 'active' ? t('expired') : t('active')}`}
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
              {t('membershipDetails')}
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
                {t('memberSince')}
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}>
                {formatRelativeDateI18n(member.joinDate, t)}
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
                {t('renewalDate')}
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: member.membershipStatus === 'expired'
                  ? theme.colors.status.error
                  : theme.colors.text.primary,
              }}>
                {formatRelativeDateI18n(member.expiryDate, t)}
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
                {t('memberId')}
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
                title={t('renewEarly')}
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
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <MapPin
                size={24}
                color={theme.colors.secondary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('recentCheckins')}
              </Text>
            </View>
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {filteredCheckins.length} {t('visits')}
            </Text>
          </View>

          {/* Filter Buttons */}
          <View style={{
            flexDirection: 'row',
            marginBottom: theme.spacing.lg,
            gap: theme.spacing.sm,
          }}>
            {['1M', '3M', '6M', '1Y', 'ALL'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setCheckinFilter(filter)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: checkinFilter === filter 
                    ? theme.colors.primary.DEFAULT 
                    : 'rgba(30, 155, 113, 0.1)',
                  borderWidth: 1,
                  borderColor: checkinFilter === filter 
                    ? theme.colors.primary.DEFAULT 
                    : 'rgba(30, 155, 113, 0.3)',
                }}
              >
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  fontWeight: '600',
                  color: checkinFilter === filter 
                    ? '#FFFFFF' 
                    : theme.colors.primary.DEFAULT,
                }}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {checkinsLoading ? (
            <View style={{
              padding: theme.spacing.xl,
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}>
                {t('loadingCheckins')}
              </Text>
            </View>
          ) : recentCheckins.length > 0 ? (
            <View style={{ gap: theme.spacing.md }}>
              {recentCheckins.map(checkin => (
                <View
                  key={checkin.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(30, 155, 113, 0.1)',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 2,
                    }}>
                      <MapPin
                        size={16}
                        color={theme.colors.text.secondary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        fontWeight: '500',
                        color: theme.colors.text.primary,
                      }}>
                        {checkin.location}
                      </Text>
                    </View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Calendar
                        size={14}
                        color={theme.colors.text.secondary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                      }}>
                        {formatRelativeDateI18n(checkin.check_in_time, t)}
                      </Text>
                    </View>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Clock
                      size={16}
                      color={checkin.check_out_time ? theme.colors.status.success : theme.colors.primary.DEFAULT}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: checkin.check_out_time ? theme.colors.status.success : theme.colors.primary.DEFAULT,
                      fontWeight: '600',
                    }}>
                      {formatDuration(checkin.duration_minutes)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{
              padding: theme.spacing.xl,
              alignItems: 'center',
            }}>
              <MapPin
                size={48}
                color={theme.colors.text.secondary}
                style={{ marginBottom: theme.spacing.md }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}>
                {t('noCheckinsYet')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: theme.spacing.xs,
              }}>
                {t('useQrToCheckin')}
              </Text>
            </View>
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
            title={t('renewMembership')}
            subtitle={t('choosePlan')}
            showBack
            onBack={handleCancelRenewal}
          />

          <ScrollView
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            {membershipPlansLoading ? (
              <View style={{
                padding: theme.spacing.xl,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  {t('loadingPlans')}
                </Text>
              </View>
            ) : (
              membershipPlans.map(plan => (
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
                        {formatPrice(plan.price, t)}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                      }}>
                        {plan.plan_type === 'day_entry' 
                          ? t('oneDayAccess') 
                          : plan.duration_months 
                            ? `${plan.duration_months} ${plan.duration_months > 1 ? t('months') : t('month')}`
                            : t('unlimitedAccess')
                        }
                        {plan.plan_type === 'student' && ` • ${t('studentDiscount')}`}
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
            ))
            )}

            <View style={{
              marginTop: theme.spacing.lg,
              gap: theme.spacing.md,
            }}>
              <PillButton
                title={t('confirmRenewal')}
                onPress={handleConfirmRenewal}
                variant="primary"
                size="large"
                fullWidth
                disabled={!selectedPlanId}
              />

              <PillButton
                title={t('cancel')}
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

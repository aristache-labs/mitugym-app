import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  CheckCircle,
  MapPin,
  UserCheck,
  LogIn,
  LogOut,
  Calendar,
  X,
  PlayCircle,
  History,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatPrice, formatCheckinDateTime } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { StyledButton } from '../../components/StyledButton';
import { AnimatedDeleteButton } from '../../components/AnimatedDeleteButton';
import { AnimatedEditButton } from '../../components/AnimatedEditButton';
import { AnimatedCancelButton } from '../../components/AnimatedCancelButton';
import { CancellationDetailsModal } from '../../components/CancellationDetailsModal';
import { NotificationModal } from '../../components/NotificationModal';
import { useLanguage } from '../../lib/LanguageContext';

export default function MembershipScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [checkinFilter, setCheckinFilter] = useState('1M'); // 1M, 3M, 6M, 1Y, ALL

  // Cancel button animation
  const [cancelScale] = useState(new Animated.Value(1));
  const shineAnim = useRef(new Animated.Value(-1)).current;

  // Session history modal state
  const [sessionHistoryModalVisible, setSessionHistoryModalVisible] = useState(false);
  const [selectedServiceForHistory, setSelectedServiceForHistory] = useState<any>(null);
  const [sessionFilter, setSessionFilter] = useState('1M'); // 1W, 1M, 3M, ALL

  // Cancellation details modal state
  const [cancellationModalVisible, setCancellationModalVisible] = useState(false);
  const [selectedCancelledService, setSelectedCancelledService] = useState<any>(null);

  // Notifications modal state
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);

  const {
    member,
    membershipPlans,
    membershipPlansLoading,
    fetchMembershipPlans,
    renewMembership,
    loadMemberProfile,
    // toggleMembershipStatus removed - using live data
    checkins,
    checkinsLoading,
    fetchCheckins,
    purchasedServices,
    fetchPurchasedServices,
    sessionBookings,
    fetchSessionBookings,
    cancelSession,
  } = useAppStore();

  const handleRenewPress = () => {
    setShowRenewModal(true);
  };

  const handleCancelPressIn = () => {
    Animated.spring(cancelScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Trigger shine animation
    shineAnim.setValue(-1);
    Animated.timing(shineAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelPressOut = () => {
    Animated.spring(cancelScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Fetch membership plans, checkins, and services on component mount
  useEffect(() => {
    loadMemberProfile();
    fetchMembershipPlans();
    fetchCheckins();
    fetchPurchasedServices();
    fetchSessionBookings();
  }, [loadMemberProfile, fetchMembershipPlans, fetchCheckins, fetchPurchasedServices, fetchSessionBookings]);



  // Session booking handlers
  const handleBookSessionPress = (purchasedService: any) => {
    // Check membership status before allowing booking
    if (!member || member.membershipStatus !== 'active') {
      Alert.alert(
        t('membershipRequired' as any),
        t('activeMembershipNeeded' as any),
        [{ text: t('ok'), style: 'default' }],
      );
      return;
    }

    router.push({
      pathname: '/book-session',
      params: {
        service: JSON.stringify(purchasedService),
      },
    });
  };



  // Get count of pending session bookings
  const getPendingSessionsCount = () => {
    return sessionBookings.filter(booking => booking.status === 'pending').length;
  };

  // Get filtered and sorted sessions with smart grouping
  const getFilteredAndSortedSessions = (purchasedServiceId: string) => {
    const now = new Date();
    const allSessions = sessionBookings.filter(booking => booking.purchased_service_id === purchasedServiceId);

    // Calculate filter period boundaries (both past and future)
    const getFilterDates = () => {
      if (sessionFilter === 'ALL') {return { startDate: null, endDate: null };}

      const startDate = new Date(now);
      const endDate = new Date(now);

      if (sessionFilter === '1W') {
        // This Week: Start of current week (Monday) to end of current week (Sunday)
        const currentDay = now.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // 0=Sunday, 1=Monday

        // Set to Monday of current week
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysFromMonday);
        monday.setHours(0, 0, 0, 0);

        // Set to Sunday of current week
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { startDate: monday, endDate: sunday };
      } else if (sessionFilter === '1M') {
        // This Month: Start to end of current month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);

        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);

        return { startDate: firstDay, endDate: lastDay };
      } else if (sessionFilter === '3M') {
        // Next 3 months from today
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        today.setHours(0, 0, 0, 0);

        const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        threeMonthsAhead.setHours(23, 59, 59, 999);

        return { startDate: today, endDate: threeMonthsAhead };
      }

      return { startDate, endDate };
    };

    const { startDate, endDate } = getFilterDates();

    // Helper function to check if session is within filter period
    const isWithinFilterPeriod = (sessionDate: Date) => {
      if (!startDate || !endDate) {return true;} // ALL filter
      return sessionDate >= startDate && sessionDate <= endDate;
    };

    // Group sessions by category
    const upcoming: typeof allSessions = [];
    const pending: typeof allSessions = [];
    const completed: typeof allSessions = [];
    const cancelled: typeof allSessions = [];

    allSessions.forEach(session => {
      const sessionDate = new Date(session.booking_date);

      if (session.status === 'upcoming') {
        // Apply filter to upcoming sessions
        if (isWithinFilterPeriod(sessionDate)) {
          upcoming.push(session);
        }
      } else if (session.status === 'pending') {
        // Apply filter to pending sessions
        if (isWithinFilterPeriod(sessionDate)) {
          pending.push(session);
        }
      } else if (session.status === 'completed') {
        // Apply filter to completed sessions
        if (isWithinFilterPeriod(sessionDate)) {
          completed.push(session);
        }
      } else if (session.status === 'cancelled') {
        // Apply filter to cancelled sessions
        if (isWithinFilterPeriod(sessionDate)) {
          cancelled.push(session);
        }
      }
    });

    // Sort each group
    const sortAscending = (a: any, b: any) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
    const sortDescending = (a: any, b: any) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();

    upcoming.sort(sortAscending);
    pending.sort(sortAscending);
    completed.sort(sortDescending);
    cancelled.sort(sortDescending);

    return {
      upcoming,
      pending,
      completed,
      cancelled,
    };
  };

  // Handler for showing session history
  const handleShowSessionHistory = (purchasedService: any) => {
    setSelectedServiceForHistory(purchasedService);
    setSessionHistoryModalVisible(true);
  };

  // Handler for showing cancellation details
  const handleShowCancellationDetails = (purchasedService: any) => {
    setSelectedCancelledService(purchasedService);
    setCancellationModalVisible(true);
  };

  // Handler for service card press
  const handleServicePress = (purchasedService: any) => {
    if (purchasedService.status === 'cancelled') {
      handleShowCancellationDetails(purchasedService);
    } else {
      handleShowSessionHistory(purchasedService);
    }
  };

  // Handler for canceling a pending session
  const handleCancelSession = async (sessionId: string) => {
    Alert.alert(
      t('cancelSession'),
      t('confirmCancelSession'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            await cancelSession(sessionId);
            // Refresh session bookings to update the UI
            await fetchSessionBookings();
          },
        },
      ],
    );
  };

  // Handler for editing a pending session
  const handleEditSession = (session: any) => {
    // Close the modal first
    setSessionHistoryModalVisible(false);

    // Find the purchased service for this session
    const purchasedService = purchasedServices.find(
      ps => ps.id === session.purchased_service_id,
    );

    if (purchasedService) {
      // Small delay to allow modal to close
      setTimeout(() => {
        router.push({
          pathname: '/book-session',
          params: {
            service: JSON.stringify(purchasedService),
            editSession: JSON.stringify(session),
          },
        });
      }, 100);
    }
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


  if (!member) {
    return null;
  }

  // Filter checkins based on selected period
  const getFilteredCheckins = () => {
    // First, filter out denied checkins
    const successfulCheckins = checkins.filter(checkin => checkin.status !== 'denied');

    if (checkinFilter === 'ALL') {return successfulCheckins;}

    const now = new Date();
    const monthsToSubtract = checkinFilter === '1M' ? 1 :
                           checkinFilter === '3M' ? 3 :
                           checkinFilter === '6M' ? 6 : 12;

    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, 1);

    return successfulCheckins.filter(checkin => {
      const checkinDate = new Date(checkin.check_in_time);
      return checkinDate >= startDate;
    });
  };

  const filteredCheckins = getFilteredCheckins();
  const recentCheckins = filteredCheckins.slice(0, 10); // Show more when filtered

  // Format checkin data for display
  const formatDuration = (minutes?: number) => {
    if (!minutes) {return t('inProgress');}
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
        onNotificationPress={() => setNotificationsModalVisible(true)}
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
            planStartDate={member.planStartDate}
            onRenew={(member.membershipStatus === 'expired' || member.membershipStatus === 'active') ? handleRenewPress : undefined}
            showDetails={member.membershipPlan != null && member.planStartDate != null}
          />
        </View>



        {/* My Services */}
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
              <PlayCircle
                size={24}
                color={theme.colors.secondary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('myServices')}
              </Text>
              {getPendingSessionsCount() > 0 && (
                <View style={{
                  backgroundColor: 'rgba(77, 212, 212, 0.2)',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: theme.spacing.sm,
                  borderWidth: 1,
                  borderColor: 'rgba(77, 212, 212, 0.3)',
                }}>
                  <Text style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: '#4DD4D4',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>
                    {getPendingSessionsCount()} {t('pending')}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {purchasedServices.length} {t('total')}
            </Text>
          </View>

          {purchasedServices.length === 0 ? (
            <View style={{
              padding: theme.spacing.xl,
              alignItems: 'center',
            }}>
              <PlayCircle
                size={48}
                color={theme.colors.text.secondary}
                style={{ marginBottom: theme.spacing.md }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginBottom: theme.spacing.sm,
              }}>
                {t('noApprovedServices')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.tertiary,
                textAlign: 'center',
              }}>
                {t('purchaseServicesFromServicesTab')}
              </Text>
            </View>
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {purchasedServices
                .sort((a, b) => {
                  // First, handle approved status (highest priority)
                  if (a.status === 'approved' && b.status !== 'approved') {
                    return -1; // a comes first
                  }
                  if (b.status === 'approved' && a.status !== 'approved') {
                    return 1; // b comes first
                  }

                  // If both are same status, sort by purchased date (newest first)
                  if (a.status === b.status) {
                    return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
                  }

                  // Handle other status comparisons (pending before cancelled)
                  if (a.status === 'pending' && b.status === 'cancelled') {
                    return -1;
                  }
                  if (a.status === 'cancelled' && b.status === 'pending') {
                    return 1;
                  }

                  // Default to purchased date if unclear
                  return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
                })
                .map((purchasedService) => (
                  <View
                    key={purchasedService.id}
                    style={{
                      backgroundColor: theme.colors.background.DEFAULT,
                      borderRadius: theme.borderRadius.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(30, 155, 113, 0.2)',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleServicePress(purchasedService)}
                      style={{
                        padding: theme.spacing.md,
                      }}
                      activeOpacity={0.7}
                    >
                    <View style={{
                      marginBottom: theme.spacing.sm,
                    }}>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.xs,
                      }}>
                        {purchasedService.services?.name || 'Service'}
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: theme.spacing.sm,
                      }}>
                        <Text style={{
                          fontSize: theme.typography.caption.fontSize,
                          color: theme.colors.text.secondary,
                        }}>
                          {t('sessionsRemaining')}: {purchasedService.sessions_remaining} / {purchasedService.sessions_total}
                        </Text>
                        {purchasedService.status === 'pending' && (
                          <View style={{
                            backgroundColor: 'rgba(77, 212, 212, 0.2)',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderWidth: 1,
                            borderColor: 'rgba(77, 212, 212, 0.3)',
                            marginLeft: theme.spacing.sm,
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: '#4DD4D4',
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                            }}>
                              {t('pending')}
                            </Text>
                          </View>
                        )}
                        {purchasedService.status === 'cancelled' && (
                          <View style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderWidth: 1,
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            marginLeft: theme.spacing.sm,
                          }}>
                      <Text style={{
                              fontSize: 10,
                              fontWeight: '600',
                              color: '#ef4444',
                              textTransform: 'uppercase',
                              letterSpacing: 1,
                      }}>
                              {t('cancelled')}
                      </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={{
                      backgroundColor: 'rgba(30, 155, 113, 0.1)',
                      height: 4,
                      borderRadius: 2,
                      marginBottom: theme.spacing.sm,
                    }}>
                      <View style={{
                        backgroundColor: theme.colors.primary.DEFAULT,
                        height: 4,
                        borderRadius: 2,
                        width: `${(purchasedService.sessions_total - purchasedService.sessions_remaining) / purchasedService.sessions_total * 100}%`,
                      }} />
                    </View>

                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.tertiary,
                    }}>
                      {t('purchasedOn')}: {new Date(purchasedService.purchase_date).toLocaleDateString()}
                    </Text>
                    </TouchableOpacity>

                    {/* Book Session Button - Only for approved services */}
                    {purchasedService.sessions_remaining > 0 && purchasedService.status === 'approved' && (
                      <View style={{
                          margin: theme.spacing.md,
                          marginTop: theme.spacing.sm,
                      }}>
                        <StyledButton
                          title={t('bookSession')}
                          onPress={() => handleBookSessionPress(purchasedService)}
                          fullWidth
                        />
                      </View>
                    )}
                  </View>
                ))}
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
            {[
              { value: '1M', label: t('oneMonth') },
              { value: '3M', label: t('threeMonths') },
              { value: '6M', label: t('sixMonths') },
              { value: '1Y', label: t('oneYear') },
              { value: 'ALL', label: t('all') },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setCheckinFilter(filter.value)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: checkinFilter === filter.value
                    ? theme.colors.primary.DEFAULT
                    : 'rgba(30, 155, 113, 0.1)',
                  borderWidth: 1,
                  borderColor: checkinFilter === filter.value
                    ? theme.colors.primary.DEFAULT
                    : 'rgba(30, 155, 113, 0.3)',
                }}
              >
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  fontWeight: '600',
                  color: checkinFilter === filter.value
                    ? '#FFFFFF'
                    : theme.colors.primary.DEFAULT,
                }}>
                  {filter.label}
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
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(30, 155, 113, 0.1)',
                  }}
                >
                  {/* Membership Plan Row */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                  }}>
                    <UserCheck
                      size={16}
                      color={theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: '500',
                      color: theme.colors.text.primary,
                    }}>
                      {checkin.membership_plan_name || checkin.location || 'Basic Plan'}
                    </Text>
                  </View>

                  {/* Check-in Time Row */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.xs,
                  }}>
                    <LogIn
                      size={14}
                      color={theme.colors.primary.DEFAULT}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                      marginRight: theme.spacing.sm,
                    }}>
                      {t('checkedIn')}:
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.primary,
                      fontWeight: '500',
                    }}>
                      {formatCheckinDateTime(checkin.check_in_time)}
                    </Text>
                  </View>

                  {/* Check-out Time Row (if exists) */}
                  {checkin.check_out_time && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <LogOut
                        size={14}
                        color={theme.colors.status.success}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                        marginRight: theme.spacing.sm,
                      }}>
                        {t('checkedOut')}:
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.primary,
                        fontWeight: '500',
                      }}>
                        {formatCheckinDateTime(checkin.check_out_time)}
                      </Text>
                    </View>
                  )}

                  {/* Duration (if checked out) or In Progress */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: theme.spacing.xs,
                  }}>
                    <Clock
                      size={14}
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
              alignItems: 'center',
            }}>
              <StyledButton
                title={t('confirmRenewal')}
                onPress={handleConfirmRenewal}
                fullWidth
                disabled={!selectedPlanId}
              />

              <TouchableOpacity
                onPress={handleCancelRenewal}
                onPressIn={handleCancelPressIn}
                onPressOut={handleCancelPressOut}
                activeOpacity={1}
                style={{
                  width: '50%',
                }}
              >
                <Animated.View
                  style={{
                    transform: [{ scale: cancelScale }],
                    overflow: 'hidden',
                    borderRadius: theme.borderRadius.lg,
                  }}
                >
                  <LinearGradient
                    colors={['rgba(51, 65, 85, 0.75)', 'rgba(30, 41, 59, 0.45)', 'rgba(51, 65, 85, 0.75)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: theme.spacing.sm,
                      paddingHorizontal: theme.spacing.md,
                      alignItems: 'center',
                      borderRadius: theme.borderRadius.lg,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Animated.View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        transform: [
                          {
                            translateX: shineAnim.interpolate({
                              inputRange: [-1, 1],
                              outputRange: ['-100%', '100%'],
                            }),
                          },
                        ],
                      }}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          flex: 1,
                          width: '100%',
                        }}
                      />
                    </Animated.View>
                    <Text
                      style={{
                        fontSize: theme.typography.body.fontSize,
                        color: '#ffffff',
                        fontWeight: '500',
                        zIndex: 10,
                      }}
                    >
                      {t('cancel')}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>


      {/* Session History Modal */}
      <Modal
        visible={sessionHistoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSessionHistoryModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.background.DEFAULT,
          paddingTop: theme.spacing.md,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xs,
            paddingBottom: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <History size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('sessionHistory')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSessionHistoryModalVisible(false)}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg }}>
            {selectedServiceForHistory && (
              <>
                {/* Compact Service Header */}
                <View style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.15)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 2,
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: '700',
                    color: theme.colors.text.primary,
                    textAlign: 'center',
                    marginBottom: theme.spacing.sm,
                  }}>
                    {selectedServiceForHistory.services?.name || 'Service'}
                  </Text>

                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                        fontWeight: '500',
                      }}>
                        {t('purchasedOn')}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.body.fontSize,
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                      }}>
                        {(() => {
                          const options: Intl.DateTimeFormatOptions = {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          };
                          return new Date(selectedServiceForHistory.purchase_date)
                            .toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', options)
                            .replace(/\./g, '') // Remove all dots
                            .replace(/,/g, ', '); // Ensure proper comma spacing
                        })()}
                      </Text>
                    </View>

                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                        fontWeight: '500',
                      }}>
                        {t('sessionsRemaining')}
                      </Text>
                      <Text style={{
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: '700',
                        color: theme.colors.primary.DEFAULT,
                      }}>
                        {selectedServiceForHistory.sessions_remaining} / {selectedServiceForHistory.sessions_total}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Filter Buttons */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.lg,
                  gap: theme.spacing.sm,
                }}>
                  {[
                    { value: '1W', label: t('thisWeek') },
                    { value: '1M', label: t('oneMonth') },
                    { value: '3M', label: t('threeMonths') },
                    { value: 'ALL', label: t('all') },
                  ].map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      onPress={() => setSessionFilter(filter.value)}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: sessionFilter === filter.value
                          ? theme.colors.primary.DEFAULT
                          : 'rgba(30, 155, 113, 0.1)',
                        borderWidth: 1,
                        borderColor: sessionFilter === filter.value
                          ? theme.colors.primary.DEFAULT
                          : 'rgba(30, 155, 113, 0.3)',
                      }}
                    >
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: '600',
                        color: sessionFilter === filter.value
                          ? '#FFFFFF'
                          : theme.colors.primary.DEFAULT,
                      }}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Sessions List */}
                {(() => {
                  const sections = getFilteredAndSortedSessions(selectedServiceForHistory.id);
                  const totalSessions = sections.upcoming.length + sections.pending.length +
                                       sections.completed.length + sections.cancelled.length;

                  if (totalSessions === 0) {
                    return (
                      <View style={{
                        padding: theme.spacing.xl,
                        alignItems: 'center',
                      }}>
                        <Calendar
                          size={48}
                          color={theme.colors.text.secondary}
                          style={{ marginBottom: theme.spacing.md }}
                        />
                        <Text style={{
                          fontSize: theme.typography.body.fontSize,
                          color: theme.colors.text.secondary,
                          textAlign: 'center',
                        }}>
                          {t('noSessionsYet')}
                        </Text>
                      </View>
                    );
                  }

                  const renderSession = (session: any) => {
                      const sessionDate = new Date(session.booking_date);
                      const isPending = session.status === 'pending';
                      const isUpcoming = session.status === 'upcoming';
                      const isCompleted = session.status === 'completed';
                      const isCancelled = session.status === 'cancelled';

                      // Check if session is today
                      const today = new Date();
                      const isToday = sessionDate.toDateString() === today.toDateString();

                      // Determine border and badge colors based on status
                      const getBorderColor = () => {
                        if (isPending) {return '#4DD4D4';} // Primary cyan/teal color
                        if (isUpcoming) {return '#3B82F6';} // Blue for upcoming
                        if (isCompleted) {return theme.colors.status.success;}
                        if (isCancelled) {return theme.colors.status.error;}
                        return 'rgba(30, 155, 113, 0.2)';
                      };

                      const getBadgeStyles = () => {
                        if (isPending) {
                          return {
                            backgroundColor: 'rgba(77, 212, 212, 0.2)', // Primary color (cyan/teal) with 20% opacity
                            borderColor: 'rgba(77, 212, 212, 0.3)',
                            textColor: '#4DD4D4',
                          };
                        }
                        if (isUpcoming) {
                          return {
                            backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue with opacity
                            borderColor: 'rgba(59, 130, 246, 0.3)',
                            textColor: '#3b82f6',
                          };
                        }
                        if (isCompleted) {
                          return {
                            backgroundColor: 'rgba(34, 197, 94, 0.2)', // Green with opacity
                            borderColor: 'rgba(34, 197, 94, 0.3)',
                            textColor: '#22c55e',
                          };
                        }
                        if (isCancelled) {
                          return {
                            backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red with opacity
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                            textColor: '#ef4444',
                          };
                        }
                        return {
                          backgroundColor: 'rgba(30, 155, 113, 0.2)',
                          borderColor: 'rgba(30, 155, 113, 0.3)',
                          textColor: theme.colors.primary.DEFAULT,
                        };
                      };

                      return (
                        <View
                          key={session.id}
                          style={{
                            backgroundColor: theme.colors.background.surface,
                            borderRadius: theme.borderRadius.lg,
                            padding: theme.spacing.lg,
                            borderWidth: 1,
                            borderColor: getBorderColor(),
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: isPending ? 0.1 : 0.06,
                            shadowRadius: 8,
                            elevation: isPending ? 3 : 2,
                            opacity: isCancelled ? 0.6 : 1,
                          }}
                        >
                          <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}>
                            {/* Left Side - Prominent Date & Time */}
                            <View style={{ flex: 1 }}>
                              {/* Date with Status Row */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: theme.spacing.sm,
                                flexWrap: 'wrap',
                              }}>
                                <Text style={{
                                  fontSize: theme.typography.h3.fontSize,
                                  fontWeight: '700',
                                  color: theme.colors.text.primary,
                                  marginRight: theme.spacing.sm,
                                  textTransform: 'capitalize',
                                }}>
                                {(() => {
                                  const options: Intl.DateTimeFormatOptions = {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  };
                                  return sessionDate.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', options)
                                    .replace(/\./g, '') // Remove all dots
                                    .replace(/,/g, ', '); // Ensure proper comma spacing
                                })()}
                                </Text>

                                {/* Status Badge */}
                                <View style={{
                                  backgroundColor: getBadgeStyles().backgroundColor,
                                  borderRadius: 12,
                                  paddingHorizontal: 12,
                                  paddingVertical: 6,
                                  marginRight: isUpcoming && isToday ? theme.spacing.sm : 0,
                                  borderWidth: 1,
                                  borderColor: getBadgeStyles().borderColor,
                                }}>
                                  <Text style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: getBadgeStyles().textColor,
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                  }}>
                                    {t(session.status)}
                                  </Text>
                                </View>

                                {/* TODAY Badge for upcoming sessions */}
                                {isUpcoming && isToday && (
                                  <View style={{
                                    backgroundColor: 'rgba(30, 155, 113, 0.2)',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderWidth: 1,
                                    borderColor: 'rgba(30, 155, 113, 0.3)',
                                  }}>
                                    <Text style={{
                                      fontSize: 10,
                                      fontWeight: '600',
                                      color: theme.colors.primary.DEFAULT,
                                      textTransform: 'uppercase',
                                      letterSpacing: 1,
                                    }}>
                                      {t('today')}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Time with Clock Icon */}
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: session.notes ? theme.spacing.sm : 0,
                              }}>
                                <Clock size={16} color={theme.colors.text.secondary} style={{ marginRight: theme.spacing.xs }} />
                                <Text style={{
                                  fontSize: theme.typography.body.fontSize,
                                  fontWeight: '600',
                                  color: theme.colors.text.secondary,
                                }}>
                                  {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                              </View>

                              {/* Notes */}
                              {session.notes && (
                                <Text style={{
                                  fontSize: theme.typography.caption.fontSize,
                                  color: theme.colors.text.tertiary,
                                  fontStyle: 'italic',
                                  backgroundColor: 'rgba(30, 155, 113, 0.05)',
                                  borderRadius: theme.borderRadius.sm,
                                  padding: theme.spacing.sm,
                                  borderLeftWidth: 2,
                                  borderLeftColor: theme.colors.primary.DEFAULT,
                                }}>
                                  "{session.notes}"
                                </Text>
                              )}
                            </View>

                            {/* Action Buttons */}
                            {isPending && (
                              <View style={{
                                flexDirection: 'row',
                                marginLeft: theme.spacing.md,
                                gap: theme.spacing.xs,
                              }}>
                                <AnimatedEditButton
                                  onPress={() => handleEditSession(session)}
                                  size={32}
                                />
                                <AnimatedDeleteButton
                                onPress={() => handleCancelSession(session.id)}
                                  size={32}
                                />
                              </View>
                            )}
                            {isUpcoming && (
                              <View style={{
                                  marginLeft: theme.spacing.md,
                              }}>
                                <AnimatedCancelButton
                                  onPress={() => handleCancelSession(session.id)}
                                  size={32}
                                />
                              </View>
                            )}
                          </View>
                        </View>
                      );
                  };

                  const renderSectionHeader = (title: string, count: number, icon: any, color: string) => {
                    if (count === 0) {return null;}

                    // Convert solid color to rgba with opacity for background
                    const getHeaderBadgeStyles = (solidColor: string) => {
                      const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
                        '#3B82F6': { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6' },
                        [theme.colors.status.warning]: { bg: 'rgba(77, 212, 212, 0.2)', border: 'rgba(77, 212, 212, 0.3)', text: '#4DD4D4' },
                        [theme.colors.status.success]: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
                        [theme.colors.status.error]: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
                      };
                      return colorMap[solidColor] || { bg: 'rgba(30, 155, 113, 0.2)', border: 'rgba(30, 155, 113, 0.3)', text: theme.colors.primary.DEFAULT };
                    };

                    const badgeStyles = getHeaderBadgeStyles(color);

                    return (
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: theme.spacing.lg,
                        marginBottom: theme.spacing.md,
                        paddingBottom: theme.spacing.sm,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        {icon}
                        <Text style={{
                          fontSize: theme.typography.body.fontSize,
                          fontWeight: '700',
                          color: theme.colors.text.primary,
                          marginLeft: theme.spacing.sm,
                        }}>
                          {title}
                        </Text>
                        <View style={{
                          backgroundColor: badgeStyles.bg,
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginLeft: theme.spacing.sm,
                          borderWidth: 1,
                          borderColor: badgeStyles.border,
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '600',
                            color: badgeStyles.text,
                          }}>
                            {count}
                          </Text>
                        </View>
                      </View>
                    );
                  };

                  const getSectionTitle = () => {
                    if (sessionFilter === '1W') {return t('upcomingThisWeek');}
                    if (sessionFilter === '1M') {return t('upcomingThisMonth');}
                    if (sessionFilter === '3M') {return t('upcomingSessions');}
                    return t('upcomingSessions');
                  };

                  return (
                    <View style={{ gap: theme.spacing.sm }}>
                      {/* Upcoming */}
                      {renderSectionHeader(
                        getSectionTitle(),
                        sections.upcoming.length,
                        <Calendar size={18} color="#3B82F6" />,
                        '#3B82F6',
                      )}
                      {sections.upcoming.map(renderSession)}

                      {/* Pending */}
                      {renderSectionHeader(
                        t('pendingConfirmation'),
                        sections.pending.length,
                        <Clock size={18} color="#4DD4D4" />,
                        theme.colors.status.warning,
                      )}
                      {sections.pending.map(renderSession)}

                      {/* Completed */}
                      {renderSectionHeader(
                        t('completedSessions'),
                        sections.completed.length,
                        <CheckCircle size={18} color={theme.colors.status.success} />,
                        theme.colors.status.success,
                      )}
                      {sections.completed.map(renderSession)}

                      {/* Cancelled */}
                      {renderSectionHeader(
                        t('cancelledSessions'),
                        sections.cancelled.length,
                        <X size={18} color={theme.colors.status.error} />,
                        theme.colors.status.error,
                      )}
                      {sections.cancelled.map(renderSession)}
                    </View>
                  );
                })()}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Cancellation Details Modal */}
      <CancellationDetailsModal
        visible={cancellationModalVisible}
        onClose={() => setCancellationModalVisible(false)}
        service={selectedCancelledService}
      />

      {/* Notifications Modal */}
      <NotificationModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />

    </View>
  );
}

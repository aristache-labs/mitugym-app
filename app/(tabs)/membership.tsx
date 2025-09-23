import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CreditCard,
  Clock,
  CheckCircle,
  MapPin,
  UserCheck,
  LogIn,
  LogOut,
  Calendar,
  X,
  Check,
  PlayCircle,
  Trash2,
  History,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatPrice, formatRelativeDateI18n, formatCheckinDateTime } from '../../lib/utils';
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

  // Session booking state
  const [sessionBookingModalVisible, setSessionBookingModalVisible] = useState(false);
  const [selectedPurchasedService, setSelectedPurchasedService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Session history modal state
  const [sessionHistoryModalVisible, setSessionHistoryModalVisible] = useState(false);
  const [selectedServiceForHistory, setSelectedServiceForHistory] = useState<any>(null);

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
    purchasedServices,
    fetchPurchasedServices,
    sessionBookings,
    fetchSessionBookings,
    bookSession,
    cancelSession,
  } = useAppStore();

  // Fetch membership plans, checkins, and services on component mount
  useEffect(() => {
    fetchMembershipPlans();
    fetchCheckins();
    fetchPurchasedServices();
    fetchSessionBookings();
  }, [fetchMembershipPlans, fetchCheckins, fetchPurchasedServices, fetchSessionBookings]);

  const handleRenewPress = () => {
    setShowRenewModal(true);
  };

  // Session booking handlers
  const handleBookSessionPress = (purchasedService: any) => {
    setSelectedPurchasedService(purchasedService);
    setSessionBookingModalVisible(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow);
    // Set default time to 10:00 AM
    const defaultTime = new Date();
    defaultTime.setHours(10, 0, 0, 0);
    setBookingTime(defaultTime);
    setSessionNotes('');
  };

  const handleSessionBookingSubmit = async () => {
    if (!selectedPurchasedService || !bookingDate || !bookingTime) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    // Combine date and time into a single datetime
    const combinedDateTime = new Date(bookingDate);
    combinedDateTime.setHours(bookingTime.getHours(), bookingTime.getMinutes(), 0, 0);

    // Check if booking is in the past
    const now = new Date();
    if (combinedDateTime <= now) {
      Alert.alert(t('error'), t('cannotBookInPast'));
      return;
    }

    const bookingDateTime = combinedDateTime.toISOString();

    try {
      await bookSession(selectedPurchasedService.id, bookingDateTime, sessionNotes);
      setSessionBookingModalVisible(false);
      setSelectedPurchasedService(null);
      setSessionNotes('');
    } catch (error) {
      console.error('Session booking failed:', error);
    }
  };

  const handleSessionBookingCancel = () => {
    setSessionBookingModalVisible(false);
    setSelectedPurchasedService(null);
    setBookingDate(new Date());
    setBookingTime(new Date());
    setSessionNotes('');
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  // Date/Time picker handlers
  const onDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBookingDate(selectedDate);
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setBookingTime(selectedTime);
    }
  };

  const handleDateDone = () => {
    // Validate that a future date is selected
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Alert.alert(t('error'), t('cannotBookInPast'));
      return;
    }

    setShowDatePicker(false);
  };

  const handleTimeDone = () => {
    // If booking is today, validate that time is in the future
    const now = new Date();
    const selectedDate = new Date(bookingDate);

    if (selectedDate.toDateString() === now.toDateString()) {
      const combinedDateTime = new Date(bookingDate);
      combinedDateTime.setHours(bookingTime.getHours(), bookingTime.getMinutes(), 0, 0);

      if (combinedDateTime <= now) {
        Alert.alert(t('error'), t('cannotBookInPast'));
        return;
      }
    }

    setShowTimePicker(false);
  };

  // Get count of pending session bookings
  const getPendingSessionsCount = () => {
    return sessionBookings.filter(booking => booking.status === 'pending').length;
  };

  // Get sessions for a specific purchased service, sorted with pending first
  const getSessionsForService = (purchasedServiceId: string) => {
    return sessionBookings
      .filter(booking => booking.purchased_service_id === purchasedServiceId)
      .sort((a, b) => {
        // Sort by status: pending first, then by booking date descending
        if (a.status === 'pending' && b.status !== 'pending') {
          return -1;
        }
        if (a.status !== 'pending' && b.status === 'pending') {
          return 1;
        }
        return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
      });
  };

  // Handler for showing session history
  const handleShowSessionHistory = (purchasedService: any) => {
    setSelectedServiceForHistory(purchasedService);
    setSessionHistoryModalVisible(true);
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
          },
        },
      ],
    );
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
    if (checkinFilter === 'ALL') {return checkins;}

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
            planStartDate={member.planStartDate}
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
                  backgroundColor: theme.colors.status.warning,
                  borderRadius: theme.borderRadius.xs,
                  paddingHorizontal: theme.spacing.xs,
                  paddingVertical: 2,
                  marginLeft: theme.spacing.sm,
                }}>
                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    fontWeight: '600',
                    color: '#000',
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
              {purchasedServices.filter(ps => ps.status === 'approved').length} {t('active')}
            </Text>
          </View>

          {purchasedServices.filter(ps => ps.status === 'approved').length === 0 ? (
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
                .filter(ps => ps.status === 'approved')
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
                      onPress={() => handleShowSessionHistory(purchasedService)}
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
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing.sm,
                      }}>
                        {t('sessionsRemaining')}: {purchasedService.sessions_remaining} / {purchasedService.sessions_total}
                      </Text>
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

                    {/* Book Session Button - Outside TouchableOpacity */}
                    {purchasedService.sessions_remaining > 0 && (
                      <TouchableOpacity
                        onPress={() => handleBookSessionPress(purchasedService)}
                        style={{
                          backgroundColor: theme.colors.primary.DEFAULT,
                          borderRadius: theme.borderRadius.md,
                          margin: theme.spacing.md,
                          marginTop: theme.spacing.sm,
                          padding: theme.spacing.md,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Calendar size={18} color="white" style={{ marginRight: theme.spacing.sm }} />
                        <Text style={{
                          fontSize: theme.typography.body.fontSize,
                          fontWeight: '600',
                          color: 'white',
                        }}>
                          {t('bookSession')}
                        </Text>
                      </TouchableOpacity>
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

      {/* Session Booking Modal */}
      <Modal
        visible={sessionBookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleSessionBookingCancel}
      >
        <View style={{
          flex: 1,
          backgroundColor: theme.colors.background.DEFAULT,
          paddingTop: insets.top,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('bookSession')}
            </Text>
            <TouchableOpacity onPress={handleSessionBookingCancel}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg }}>
            {selectedPurchasedService && (
              <>
                {/* Service Details */}
                <View style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {selectedPurchasedService.services?.name || 'Service'}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                  }}>
                    <Clock size={16} color={theme.colors.text.secondary} style={{ marginRight: theme.spacing.xs }} />
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.secondary,
                    }}>
                      {selectedPurchasedService.services?.duration_minutes} {t('minutes')}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.text.secondary,
                  }}>
                    {t('sessionsRemaining')}: {selectedPurchasedService.sessions_remaining} / {selectedPurchasedService.sessions_total}
                  </Text>
                </View>

                {/* Date Input */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {t('selectDate')}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.colors.background.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: 'rgba(30, 155, 113, 0.2)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                    }}>
                      {bookingDate.toLocaleDateString()}
                    </Text>
                    <Calendar size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Time Input */}
                <View style={{ marginBottom: theme.spacing.lg }}>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {t('selectTime')}
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.colors.background.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: 'rgba(30, 155, 113, 0.2)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                    }}>
                      {bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Clock size={20} color={theme.colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Notes Input */}
                <View style={{ marginBottom: theme.spacing.xl }}>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {t('notes')} ({t('optional')})
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.background.surface,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: 'rgba(30, 155, 113, 0.2)',
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                    placeholder={t('addNotesPlaceholder')}
                    placeholderTextColor={theme.colors.text.secondary}
                    value={sessionNotes}
                    onChangeText={setSessionNotes}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: insets.bottom,
                  }}
                  onPress={handleSessionBookingSubmit}
                >
                  <Check size={20} color="white" style={{ marginRight: theme.spacing.sm }} />
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: 'white',
                  }}>
                    {t('submitBooking')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Date Picker */}
          {showDatePicker && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-end',
                zIndex: 1000,
              }}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.background.surface,
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderTopRightRadius: theme.borderRadius.lg,
                  paddingTop: theme.spacing.md,
                  paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
                }}
                activeOpacity={1}
                onPress={() => {}} // Prevent backdrop touch propagation
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingBottom: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                  }}>
                    {t('selectDate')}
                  </Text>
                  <TouchableOpacity onPress={handleDateDone}>
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.primary.DEFAULT,
                      fontWeight: '600',
                    }}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={bookingDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                  }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                top: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-end',
                zIndex: 1000,
              }}
              activeOpacity={1}
              onPress={() => setShowTimePicker(false)}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.background.surface,
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderTopRightRadius: theme.borderRadius.lg,
                  paddingTop: theme.spacing.md,
                  paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
                }}
                activeOpacity={1}
                onPress={() => {}} // Prevent backdrop touch propagation
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: theme.spacing.lg,
                  paddingBottom: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                  }}>
                    {t('selectTime')}
                  </Text>
                  <TouchableOpacity onPress={handleTimeDone}>
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.primary.DEFAULT,
                      fontWeight: '600',
                    }}>
                      {t('done')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={bookingTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'compact' : 'default'}
                  onChange={onTimeChange}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                  }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
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
          paddingTop: insets.top,
        }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <History size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
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
                {/* Service Details */}
                <View style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {selectedServiceForHistory.services?.name || 'Service'}
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.secondary,
                  }}>
                    {t('sessionsRemaining')}: {selectedServiceForHistory.sessions_remaining} / {selectedServiceForHistory.sessions_total}
                  </Text>
                </View>

                {/* Sessions List */}
                {getSessionsForService(selectedServiceForHistory.id).length === 0 ? (
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
                ) : (
                  <View style={{ gap: theme.spacing.md }}>
                    {getSessionsForService(selectedServiceForHistory.id).map((session) => (
                      <View
                        key={session.id}
                        style={{
                          backgroundColor: theme.colors.background.surface,
                          borderRadius: theme.borderRadius.lg,
                          padding: theme.spacing.md,
                          borderWidth: 1,
                          borderColor: session.status === 'pending'
                            ? theme.colors.status.warning
                            : 'rgba(30, 155, 113, 0.2)',
                        }}
                      >
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: theme.spacing.sm,
                        }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: theme.typography.body.fontSize,
                              fontWeight: '600',
                              color: theme.colors.text.primary,
                              marginBottom: theme.spacing.xs,
                    }}>
                      {new Date(session.booking_date).toLocaleDateString()} {new Date(session.booking_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    {/* Status Badge */}
                            <View style={{
                              alignSelf: 'flex-start',
                              backgroundColor: session.status === 'pending'
                                ? theme.colors.status.warning
                                : session.status === 'confirmed'
                                ? theme.colors.status.success
                                : session.status === 'completed'
                                ? theme.colors.primary.DEFAULT
                                : theme.colors.status.error,
                              borderRadius: theme.borderRadius.xs,
                              paddingHorizontal: theme.spacing.sm,
                              paddingVertical: 2,
                              marginBottom: theme.spacing.xs,
                            }}>
                              <Text style={{
                                fontSize: theme.typography.caption.fontSize,
                                fontWeight: '600',
                                color: session.status === 'pending' ? '#000' : 'white',
                              }}>
                                {t(session.status)}
                              </Text>
                            </View>

                            {session.notes && (
                              <Text style={{
                                fontSize: theme.typography.caption.fontSize,
                                color: theme.colors.text.tertiary,
                                fontStyle: 'italic',
                              }}>
                                {session.notes}
                              </Text>
                            )}
                          </View>

                          {/* Cancel Button for Pending Sessions */}
                          {session.status === 'pending' && (
                            <TouchableOpacity
                              onPress={() => handleCancelSession(session.id)}
                              style={{
                                backgroundColor: theme.colors.status.error,
                                borderRadius: theme.borderRadius.sm,
                                padding: theme.spacing.sm,
                                marginLeft: theme.spacing.sm,
                              }}
                            >
                              <Trash2 size={16} color="white" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}


import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  QrCode,
  Calendar,
  Clock,
  ChevronRight,
  Users,
  Bell,
  X,
  CheckCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatRelativeDateI18n, formatPrice } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { PillButton } from '../../components/PillButton';
import { useLanguage } from '../../lib/LanguageContext';
import { getDayTranslationKey } from '../../lib/translationHelpers';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = React.useState(false);
  const [announcementsModalVisible, setAnnouncementsModalVisible] = React.useState(false);
  const [gymScheduleModalVisible, setGymScheduleModalVisible] = React.useState(false);

  const {
    member,
    services,
    servicesLoading,
    fetchServices,
    checkins,
    fetchCheckins,
    announcements,
    announcementsLoading,
    fetchAnnouncements,
    gymSchedule,
    gymScheduleLoading,
    isGymOpen,
    getTodayHours,
    fetchGymSchedule,
    getValidatedPeopleInGym,
    runCleanupInvalidCheckins,
    sessionBookings,
    fetchSessionBookings,
  } = useAppStore();

  // Load data on component mount
  React.useEffect(() => {
    fetchServices();
    fetchCheckins();
    fetchAnnouncements();
    fetchGymSchedule();
    fetchSessionBookings();
  }, [fetchServices, fetchCheckins, fetchAnnouncements, fetchGymSchedule, fetchSessionBookings]);

  // Get available services (limit to 2 for preview)
  const availableServices = services.slice(0, 2);

  // Get upcoming sessions separated by status
  const getUpcomingSessions = () => {
    const now = new Date();
    const futureBookings = sessionBookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return bookingDate >= now && (booking.status === 'confirmed' || booking.status === 'pending');
    }).sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());

    return {
      confirmed: futureBookings.filter(booking => booking.status === 'confirmed').slice(0, 3),
      pending: futureBookings.filter(booking => booking.status === 'pending').slice(0, 3),
    };
  };

  const upcomingSessions = getUpcomingSessions();

  // Calculate last visit from checkins
  const getLastVisit = () => {
    if (checkins.length === 0) {return null;}

    // Get the most recent completed checkin (has check_out_time)
    const completedCheckins = checkins.filter(c => c.check_out_time);
    if (completedCheckins.length === 0) {return null;}

    // Sort by check_in_time and get the most recent
    const lastVisit = completedCheckins.sort((a, b) =>
      new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime(),
    )[0];

    return lastVisit?.check_in_time;
  };

  // Calculate current month checkins count
  const getCurrentMonthCheckinsCount = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return checkins.filter(checkin => {
      const checkinDate = new Date(checkin.check_in_time);
      return checkinDate.getMonth() === currentMonth &&
             checkinDate.getFullYear() === currentYear;
    }).length;
  };

  // State for validated people in gym count
  const [peopleInGym, setPeopleInGym] = React.useState(0);

  // Calculate people currently in the gym with validation
  const updatePeopleInGym = React.useCallback(async () => {
    try {
      const validatedCount = await getValidatedPeopleInGym();
      setPeopleInGym(validatedCount);
    } catch (error) {
      console.error('Error updating people in gym:', error);
      // Fallback to simple count
      setPeopleInGym(checkins.filter(checkin => !checkin.check_out_time).length);
    }
  }, [getValidatedPeopleInGym, checkins]);

  // Update people count when checkins change
  React.useEffect(() => {
    updatePeopleInGym();
  }, [checkins, updatePeopleInGym]);

  // Run cleanup on component mount and periodically
  React.useEffect(() => {
    const runPeriodicCleanup = async () => {
      try {
        const cleanedCount = await runCleanupInvalidCheckins();
        if (cleanedCount > 0) {
          console.log(`Cleaned up ${cleanedCount} invalid checkins`);
          await updatePeopleInGym();
        }
      } catch (error) {
        console.error('Error in periodic cleanup:', error);
      }
    };

    // Run cleanup on mount
    runPeriodicCleanup();

    // Set up periodic cleanup every 5 minutes
    const interval = setInterval(runPeriodicCleanup, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [runCleanupInvalidCheckins, updatePeopleInGym]);

  const lastVisit = getLastVisit();
  const currentMonthCheckins = getCurrentMonthCheckinsCount();
  const todayHours = getTodayHours(t);
  const gymIsOpen = isGymOpen();

  // Get priority announcement to display
  const priorityAnnouncement = announcements.find(a => a.priority === 3) || announcements[0];

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchServices(),
      fetchCheckins(),
      fetchAnnouncements(),
      fetchGymSchedule(),
    ]);
    // Update people count after refresh
    await updatePeopleInGym();
    setRefreshing(false);
  };

  const handleQRPress = () => {
    router.push('/(tabs)/qr');
  };


  const handleViewAllServices = () => {
    router.push('/(tabs)/services');
  };

  const handleMembershipPress = () => {
    router.push('/(tabs)/membership');
  };


  if (!member) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          color: theme.colors.text.primary,
          fontSize: 24,
          fontWeight: 'bold',
        }}>
          MITUGYM
        </Text>
        <Text style={{
          color: theme.colors.text.secondary,
          fontSize: 16,
          marginTop: 8,
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={`${t('hello')}, ${member.name.split(' ')[0]}! 👋`}
        subtitle={t('readyForWorkout')}
        showNotifications
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar and floating button
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary.DEFAULT}
            colors={[theme.colors.primary.DEFAULT]}
          />
        }
      >
         {/* Compact Premium News Container */}
         <TouchableOpacity
           onPress={() => setAnnouncementsModalVisible(true)}
           style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}
           activeOpacity={0.7}
         >
           <View style={{
             backgroundColor: theme.colors.background.surface,
             borderRadius: theme.borderRadius.md,
             borderWidth: 1.2,
             borderColor: 'rgba(255, 193, 7, 0.3)',
             ...theme.shadows.soft,
             height: 60,
             paddingHorizontal: theme.spacing.sm,
             justifyContent: 'center',
           }}>
             <View style={{
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
             }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                 <View style={{
                   backgroundColor: 'rgba(255, 193, 7, 0.15)',
                   borderRadius: theme.borderRadius.sm,
                   padding: 6,
                   marginRight: theme.spacing.sm,
                   alignItems: 'center',
                   justifyContent: 'center',
                 }}>
                   <Bell
                     size={16}
                     color="#F59E0B"
                     strokeWidth={2}
                   />
                 </View>
                 <View style={{ flex: 1, justifyContent: 'center' }}>
                   <Text style={{
                     fontSize: theme.typography.small.fontSize,
                     fontWeight: '700',
                     color: theme.colors.text.primary,
                     letterSpacing: 0.2,
                     marginBottom: 1,
                   }}>
                     {t('news')}
                   </Text>
                   <Text
                     style={{
                       fontSize: theme.typography.caption.fontSize,
                       color: theme.colors.text.secondary,
                       fontWeight: '500',
                       lineHeight: 16,
                     }}
                     numberOfLines={1}
                   >
                     {announcementsLoading ? t('loading') :
                      priorityAnnouncement ? priorityAnnouncement.title :
                      t('noAnnouncements')}
                   </Text>
                 </View>
               </View>
               <View style={{
                 backgroundColor: 'rgba(107, 114, 128, 0.1)',
                 borderRadius: theme.borderRadius.sm,
                 padding: 4,
                 alignItems: 'center',
                 justifyContent: 'center',
               }}>
                 <ChevronRight size={14} color={theme.colors.text.secondary} strokeWidth={2} />
               </View>
             </View>
           </View>
         </TouchableOpacity>

         {/* Compact Premium Gym Hours Container */}
         <TouchableOpacity
           onPress={() => setGymScheduleModalVisible(true)}
           style={{ marginBottom: theme.spacing.md }}
           activeOpacity={0.7}
         >
           <View style={{
             backgroundColor: theme.colors.background.surface,
             borderRadius: theme.borderRadius.md,
             borderWidth: 1.2,
             borderColor: gymIsOpen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
             ...theme.shadows.soft,
             height: 60,
             paddingHorizontal: theme.spacing.sm,
             justifyContent: 'center',
           }}>
             <View style={{
               flexDirection: 'row',
               alignItems: 'center',
               justifyContent: 'space-between',
             }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                 <View style={{
                   backgroundColor: gymIsOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                   borderRadius: theme.borderRadius.sm,
                   padding: 6,
                   marginRight: theme.spacing.sm,
                   alignItems: 'center',
                   justifyContent: 'center',
                 }}>
                   <Clock
                     size={16}
                     color={gymIsOpen ? '#22C55E' : '#EF4444'}
                     strokeWidth={2}
                   />
                 </View>
                 <View style={{ flex: 1, justifyContent: 'center' }}>
                   <Text style={{
                     fontSize: theme.typography.small.fontSize,
                     fontWeight: '700',
                     color: theme.colors.text.primary,
                     letterSpacing: 0.2,
                     marginBottom: 1,
                   }}>
                     {gymIsOpen ? t('openNow') : t('closed')}
                   </Text>
                   <Text
                     style={{
                       fontSize: theme.typography.caption.fontSize,
                       color: theme.colors.text.secondary,
                       fontWeight: '500',
                       lineHeight: 16,
                     }}
                     numberOfLines={1}
                   >
                     {gymScheduleLoading ? t('loading') :
                      todayHours || t('notAvailable')}
                   </Text>
                 </View>
               </View>
               <View style={{
                 backgroundColor: 'rgba(107, 114, 128, 0.1)',
                 borderRadius: theme.borderRadius.sm,
                 padding: 4,
                 alignItems: 'center',
                 justifyContent: 'center',
               }}>
                 <ChevronRight size={14} color={theme.colors.text.secondary} strokeWidth={2} />
               </View>
             </View>
           </View>
         </TouchableOpacity>

        {/* Membership Status Card */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <StatusCard
            status={member.membershipStatus}
            membershipPlan={member.membershipPlan}
            daysLeft={member.daysLeft}
            expiryDate={member.expiryDate}
            planStartDate={member.planStartDate}
            onPress={handleMembershipPress}
          />
        </View>

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.xl,
          gap: theme.spacing.md,
        }}>
          {/* QR Code Action */}
          <TouchableOpacity
            onPress={handleQRPress}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(30, 155, 113, 0.2)',
                'rgba(17, 22, 24, 0.8)',
              ]}
              style={{
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(30, 155, 113, 0.3)',
                ...theme.shadows.soft,
              }}
            >
              <QrCode
                size={32}
                color={theme.colors.primary.DEFAULT}
                style={{ marginBottom: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}>
                {t('openQR')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {t('scanForEntry')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Last Check-in Info */}
          <TouchableOpacity
            onPress={() => console.log('Check-in history')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(49, 215, 166, 0.1)',
                'rgba(17, 22, 24, 0.8)',
              ]}
              style={{
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(49, 215, 166, 0.3)',
                ...theme.shadows.soft,
              }}
            >
              <Clock
                size={32}
                color={theme.colors.secondary.DEFAULT}
                style={{ marginBottom: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}>
                {t('lastVisit')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {lastVisit ? formatRelativeDateI18n(lastVisit, t) : t('never')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Cards Row */}
        <View style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}>
          {/* Current Month Stats */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/membership')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(30, 155, 113, 0.1)',
                'rgba(17, 22, 24, 0.8)',
              ]}
              style={{
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(30, 155, 113, 0.3)',
                ...theme.shadows.soft,
              }}
            >
              <Calendar
                size={32}
                color={theme.colors.primary.DEFAULT}
                style={{ marginBottom: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}>
                {t('thisMonth')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {currentMonthCheckins} {t('visits')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* People in Gym */}
          <TouchableOpacity
            onPress={() => console.log('People in gym')}
            style={{ flex: 1 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[
                'rgba(255, 193, 7, 0.1)',
                'rgba(17, 22, 24, 0.8)',
              ]}
              style={{
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 193, 7, 0.3)',
                ...theme.shadows.soft,
              }}
            >
              <Users
                size={32}
                color={theme.colors.secondary.DEFAULT}
                style={{ marginBottom: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                textAlign: 'center',
              }}>
                {t('inGymNow')}
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {peopleInGym} {t('people')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Upcoming Sessions Section */}
        <View style={{ marginBottom: theme.spacing.xl }}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/membership')}
              activeOpacity={0.8}
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
                  borderColor: 'rgba(30, 155, 113, 0.3)',
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
                  <Clock
                    size={24}
                    color={theme.colors.primary.DEFAULT}
                    style={{ marginRight: theme.spacing.sm }}
                  />
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                  }}>
                    {t('upcomingSessions')}
                  </Text>
                </View>

                {/* Confirmed Sessions */}
                {upcomingSessions.confirmed.length > 0 && (
                  <View style={{ marginBottom: upcomingSessions.pending.length > 0 ? theme.spacing.md : 0 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: theme.spacing.sm,
                    }}>
                      <CheckCircle
                        size={16}
                        color={theme.colors.status.success}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {t('confirmedSessions')}
                      </Text>
                    </View>

                    <View style={{ gap: theme.spacing.xs }}>
                      {upcomingSessions.confirmed.slice(0, 3).map((session) => {
                        const sessionDate = new Date(session.booking_date);
                        const isToday = sessionDate.toDateString() === new Date().toDateString();

                        return (
                          <View
                            key={session.id}
                            style={{
                              backgroundColor: 'rgba(46, 204, 113, 0.08)',
                              borderRadius: theme.borderRadius.md,
                              padding: theme.spacing.sm,
                              borderLeftWidth: 3,
                              borderLeftColor: theme.colors.status.success,
                            }}
                          >
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  fontSize: theme.typography.caption.fontSize,
                                  fontWeight: '600',
                                  color: theme.colors.text.primary,
                                  marginBottom: 2,
                                }}>
                                  {session.purchased_services?.services?.name || 'Session'}
                                </Text>
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.text.secondary,
                                    marginRight: theme.spacing.xs,
                                  }}>
                                    {isToday ? t('todayLower') : sessionDate.toLocaleDateString()}
                                  </Text>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.text.tertiary,
                                    marginRight: theme.spacing.xs,
                                  }}>
                                    •
                                  </Text>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.primary.DEFAULT,
                                    fontWeight: '600',
                                  }}>
                                    {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                </View>
                              </View>

                              {isToday && (
                                <View style={{
                                  backgroundColor: theme.colors.primary.DEFAULT,
                                  paddingHorizontal: theme.spacing.xs,
                                  paddingVertical: 2,
                                  borderRadius: theme.borderRadius.xs,
                                }}>
                                  <Text style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: 'white',
                                    textTransform: 'uppercase',
                                  }}>
                                    {t('todayLower')}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Pending Sessions */}
                {upcomingSessions.pending.length > 0 && (
                  <View>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: theme.spacing.sm,
                    }}>
                      <Calendar
                        size={16}
                        color={theme.colors.status.warning}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <Text style={{
                        fontSize: theme.typography.caption.fontSize,
                        fontWeight: '600',
                        color: theme.colors.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {t('pendingSessions')}
                      </Text>
                    </View>

                    <View style={{ gap: theme.spacing.xs }}>
                      {upcomingSessions.pending.slice(0, 3).map((session) => {
                        const sessionDate = new Date(session.booking_date);

                        return (
                          <View
                            key={session.id}
                            style={{
                              backgroundColor: 'rgba(255, 193, 7, 0.08)',
                              borderRadius: theme.borderRadius.md,
                              padding: theme.spacing.sm,
                              borderLeftWidth: 3,
                              borderLeftColor: theme.colors.status.warning,
                            }}
                          >
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  fontSize: theme.typography.caption.fontSize,
                                  fontWeight: '600',
                                  color: theme.colors.text.primary,
                                  marginBottom: 2,
                                }}>
                                  {session.purchased_services?.services?.name || 'Session'}
                                </Text>
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.text.secondary,
                                    marginRight: theme.spacing.xs,
                                  }}>
                                    {sessionDate.toLocaleDateString()}
                                  </Text>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.text.tertiary,
                                    marginRight: theme.spacing.xs,
                                  }}>
                                    •
                                  </Text>
                                  <Text style={{
                                    fontSize: theme.typography.caption.fontSize,
                                    color: theme.colors.primary.DEFAULT,
                                    fontWeight: '600',
                                  }}>
                                    {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Text>
                                </View>
                              </View>

                              <View style={{
                                backgroundColor: theme.colors.status.warning,
                                paddingHorizontal: theme.spacing.xs,
                                paddingVertical: 2,
                                borderRadius: theme.borderRadius.xs,
                              }}>
                                <Text style={{
                                  fontSize: 10,
                                  fontWeight: '600',
                                  color: '#000',
                                  textTransform: 'uppercase',
                                }}>
                                  {t('pending')}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* No Sessions Placeholder */}
                {(upcomingSessions.confirmed.length === 0 && upcomingSessions.pending.length === 0) && (
                  <View style={{
                    alignItems: 'center',
                    paddingVertical: theme.spacing.lg,
                  }}>
                    <Calendar
                      size={32}
                      color={theme.colors.text.tertiary}
                      style={{ marginBottom: theme.spacing.sm }}
                    />
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.secondary,
                      textAlign: 'center',
                    }}>
                      {t('noUpcomingSessions')}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        {/* Available Services Section */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Calendar
                size={24}
                color={theme.colors.primary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('availableServices')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleViewAllServices}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.primary.DEFAULT,
                marginRight: theme.spacing.xs,
              }}>
                View All
              </Text>
              <ChevronRight
                size={16}
                color={theme.colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          </View>

          {servicesLoading ? (
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.2)',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
              }}>
                Loading services...
              </Text>
            </View>
          ) : availableServices.length > 0 ? (
            availableServices.map(service => (
              <View
                key={service.id}
                style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}
              >
                <Text style={{
                  fontSize: theme.typography.h3.fontSize,
                  fontWeight: theme.typography.h3.fontWeight,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {service.name}
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                }}>
                  {service.description}
                </Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h2.fontSize,
                    fontWeight: '700',
                    color: theme.colors.primary.DEFAULT,
                  }}>
                    {formatPrice(service.price, t)}
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.text.secondary,
                  }}>
                    {service.duration_minutes} minutes
                    {service.requires_advance_booking && ' • Advance booking required'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.2)',
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
                No services available
              </Text>
            </View>
          )}
        </View>

        {/* All Services Button */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <PillButton
            title={t('exploreAllServices')}
            onPress={handleViewAllServices}
            variant="outline"
            fullWidth
            icon={Calendar}
          />
        </View>
      </ScrollView>

      {/* Announcements Modal */}
      <Modal
        visible={announcementsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAnnouncementsModalVisible(false)}
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
              <Bell size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('announcements')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setAnnouncementsModalVisible(false)}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <View
                  key={announcement.id}
                  style={{
                    backgroundColor: theme.colors.background.surface,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.md,
                    borderWidth: 1,
                    borderColor: announcement.priority === 3 ?
                      'rgba(255, 193, 7, 0.3)' :
                      'rgba(255, 255, 255, 0.1)',
                    ...theme.shadows.soft,
                  }}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: theme.spacing.sm,
                  }}>
                    <Bell
                      size={18}
                      color={announcement.priority === 3 ?
                        theme.colors.secondary.DEFAULT :
                        theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.body.fontSize,
                      fontWeight: '600',
                      color: theme.colors.text.primary,
                      flex: 1,
                    }}>
                      {announcement.title}
                    </Text>
                    {announcement.priority === 3 && (
                      <View style={{
                        backgroundColor: theme.colors.secondary.DEFAULT,
                        paddingHorizontal: theme.spacing.xs,
                        paddingVertical: 2,
                        borderRadius: theme.borderRadius.sm,
                      }}>
                        <Text style={{
                          fontSize: theme.typography.caption.fontSize,
                          color: theme.colors.text.primary,
                          fontWeight: '600',
                        }}>
                          URGENT
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.secondary,
                    lineHeight: 22,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {announcement.content}
                  </Text>

                  <Text style={{
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.text.secondary,
                  }}>
                    {new Date(announcement.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <View style={{
                backgroundColor: theme.colors.background.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}>
                <Bell
                  size={48}
                  color={theme.colors.text.secondary}
                  style={{ marginBottom: theme.spacing.md }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}>
                  {t('noAnnouncements')}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Gym Schedule Modal */}
      <Modal
        visible={gymScheduleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setGymScheduleModalVisible(false)}
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
              <Clock size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('gymSchedule')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setGymScheduleModalVisible(false)}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: theme.spacing.md,
              paddingBottom: insets.bottom + theme.spacing.lg,
            }}
          >
            {gymSchedule.length > 0 ? (
              <>
                {gymSchedule.map((schedule) => {

                  // Get current time in Romania timezone
                  const utcNow = new Date();
                  const romaniaTimeParts = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Europe/Bucharest',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }).formatToParts(utcNow);


                  const romaniaDate = new Date(
                    parseInt(romaniaTimeParts.find(p => p.type === 'year')?.value || '0', 10),
                    parseInt(romaniaTimeParts.find(p => p.type === 'month')?.value || '1', 10) - 1,
                    parseInt(romaniaTimeParts.find(p => p.type === 'day')?.value || '1', 10),
                  );

                  const jsDay = romaniaDate.getDay();
                  const ourDayIndex = jsDay === 0 ? 6 : jsDay - 1;
                  const isToday = ourDayIndex === schedule.day_of_week;

                  // Keep 24h format for display
                  const formatTime = (time: string) => {
                    const [hours, minutes] = time.split(':');
                    return `${hours || '00'}:${minutes || '00'}`;
                  };


                  return (
                    <View
                      key={schedule.id}
                      style={{
                        backgroundColor: !schedule.is_active ?
                          'rgba(239, 68, 68, 0.05)' :
                          (isToday ?
                            'rgba(30, 155, 113, 0.08)' :
                            'rgba(255, 255, 255, 0.03)'),
                        borderRadius: theme.borderRadius.lg,
                        padding: theme.spacing.md,
                        marginBottom: theme.spacing.sm,
                        borderWidth: 1,
                        borderColor: !schedule.is_active ?
                          'rgba(239, 68, 68, 0.2)' :
                          (isToday ?
                            'rgba(30, 155, 113, 0.2)' :
                            'rgba(255, 255, 255, 0.08)'),
                        ...theme.shadows.soft,
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                        }}>
                          <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: !schedule.is_active ?
                              'rgba(239, 68, 68, 0.15)' :
                              (isToday ?
                                'rgba(30, 155, 113, 0.15)' :
                                'rgba(255, 255, 255, 0.1)'),
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: theme.spacing.sm,
                          }}>
                            <Clock
                              size={16}
                              color={!schedule.is_active ?
                                theme.colors.status.error :
                                (isToday ?
                                  theme.colors.primary.DEFAULT :
                                  theme.colors.text.secondary)}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: theme.typography.body.fontSize,
                              fontWeight: '700',
                              color: theme.colors.text.primary,
                              marginBottom: 1,
                            }}>
                              {t(getDayTranslationKey(schedule.day_of_week))}
                            </Text>
                            <Text style={{
                              fontSize: theme.typography.caption.fontSize,
                              color: schedule.is_active ? theme.colors.text.secondary : theme.colors.status.error,
                              fontWeight: '500',
                            }}>
                              {schedule.is_active
                                ? `${formatTime(schedule.open_time)} - ${formatTime(schedule.close_time)}`
                                : t('closed')
                              }
                            </Text>
                          </View>
                        </View>
                        {isToday && (
                          <View style={{
                            backgroundColor: 'rgba(30, 155, 113, 0.15)',
                            paddingHorizontal: theme.spacing.xs,
                            paddingVertical: 2,
                            borderRadius: theme.borderRadius.sm,
                          }}>
                            <Text style={{
                              fontSize: theme.typography.small.fontSize,
                              color: theme.colors.primary.DEFAULT,
                              fontWeight: '700',
                              letterSpacing: 0.3,
                            }}>
                              {t('today')}
                            </Text>
                          </View>
                        )}
                      </View>

                      {schedule.special_note && (
                        <View style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: theme.borderRadius.sm,
                          padding: theme.spacing.xs,
                          marginTop: theme.spacing.xs,
                          borderLeftWidth: 2,
                          borderLeftColor: theme.colors.primary.DEFAULT,
                        }}>
                          <Text style={{
                            fontSize: theme.typography.small.fontSize,
                            color: theme.colors.text.secondary,
                            fontStyle: 'italic',
                            lineHeight: 14,
                          }}>
                            {schedule.special_note}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            ) : (
              <View style={{
                backgroundColor: theme.colors.background.surface,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}>
                <Clock
                  size={48}
                  color={theme.colors.text.secondary}
                  style={{ marginBottom: theme.spacing.md }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}>
                  Schedule not available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

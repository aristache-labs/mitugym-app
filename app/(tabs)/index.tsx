
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
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatRelativeDate } from '../../lib/utils';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { PillButton } from '../../components/PillButton';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const [announcementsModalVisible, setAnnouncementsModalVisible] = React.useState(false);
  const [gymScheduleModalVisible, setGymScheduleModalVisible] = React.useState(false);

  const {
    member,
    services,
    servicesLoading,
    fetchServices,
    renewMembership,
    checkins,
    fetchCheckins,
    announcements,
    announcementsLoading,
    fetchAnnouncements,
    gymSchedule,
    gymScheduleLoading,
    getTodayHours,
    fetchGymSchedule,
  } = useAppStore();

  // Load data on component mount
  React.useEffect(() => {
    fetchServices();
    fetchCheckins();
    fetchAnnouncements();
    fetchGymSchedule();
  }, [fetchServices, fetchCheckins, fetchAnnouncements, fetchGymSchedule]);

  // Get available services (limit to 2 for preview)
  const availableServices = services.slice(0, 2);

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

  // Calculate people currently in the gym (checked in but not out)
  const getPeopleInGym = () => {
    return checkins.filter(checkin => !checkin.check_out_time).length;
  };

  const lastVisit = getLastVisit();
  const currentMonthCheckins = getCurrentMonthCheckinsCount();
  const peopleInGym = getPeopleInGym();
  const todayHours = getTodayHours();

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

  const handleRenewMembership = () => {
    renewMembership('2'); // Mock premium plan
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
        title={`Hello, ${member.name.split(' ')[0]}! 👋`}
        subtitle="Ready for your workout?"
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
                     News
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
                     {announcementsLoading ? 'Loading...' :
                      priorityAnnouncement ? priorityAnnouncement.title :
                      'No announcements'}
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
             borderColor: todayHours?.includes('Opens') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
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
                   backgroundColor: todayHours?.includes('Opens') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                   borderRadius: theme.borderRadius.sm,
                   padding: 6,
                   marginRight: theme.spacing.sm,
                   alignItems: 'center',
                   justifyContent: 'center',
                 }}>
                   <Clock
                     size={16}
                     color={todayHours?.includes('Opens') ? '#EF4444' : '#22C55E'}
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
                     {todayHours?.includes('Opens') ? 'Closed' : 'Open Now'}
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
                     {gymScheduleLoading ? 'Loading...' :
                      todayHours || 'Not available'}
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
            onPress={handleMembershipPress}
            onRenew={member.membershipStatus === 'expired' ? handleRenewMembership : undefined}
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
                Open QR
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                Quick entry
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
                Last Visit
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {lastVisit ? formatRelativeDate(lastVisit) : 'Never'}
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
                This Month
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {currentMonthCheckins} visits
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
                In Gym Now
              </Text>
              <Text style={{
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: 4,
              }}>
                {peopleInGym} {peopleInGym === 1 ? 'person' : 'people'}
              </Text>
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
                Available Services
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
                    ${service.price}
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
            title="Explore All Services"
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
        <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: '700',
              color: theme.colors.text.primary,
            }}>
              Announcements
            </Text>
            <TouchableOpacity
              onPress={() => setAnnouncementsModalVisible(false)}
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <X size={20} color={theme.colors.text.primary} />
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
                  No announcements at this time
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
        <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Text style={{
              fontSize: theme.typography.h2.fontSize,
              fontWeight: '700',
              color: theme.colors.text.primary,
            }}>
              Gym Schedule
            </Text>
            <TouchableOpacity
              onPress={() => setGymScheduleModalVisible(false)}
              style={{
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <X size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: insets.bottom + theme.spacing.xl,
            }}
          >
            {gymSchedule.length > 0 ? (
              <>
                {gymSchedule.map((schedule) => {
                  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                  // Convert JavaScript day (0=Sunday, 1=Monday, ..., 6=Saturday) to our array index (0=Monday, ..., 6=Sunday)
                  const jsDay = new Date().getDay();
                  const ourDayIndex = jsDay === 0 ? 6 : jsDay - 1; // Sunday (0) becomes 6, others shift down by 1
                  const isToday = ourDayIndex === schedule.day_of_week;

                  // Format time from 24h to 12h
                  const formatTime = (time: string) => {
                    const [hours, minutes] = time.split(':');
                    const hour = parseInt(hours || '0', 10);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    return `${displayHour}:${minutes || '00'} ${ampm}`;
                  };

                  return (
                    <View
                      key={schedule.id}
                      style={{
                        backgroundColor: isToday ?
                          'rgba(30, 155, 113, 0.1)' :
                          theme.colors.background.surface,
                        borderRadius: theme.borderRadius.lg,
                        padding: theme.spacing.lg,
                        marginBottom: theme.spacing.md,
                        borderWidth: 1,
                        borderColor: isToday ?
                          'rgba(30, 155, 113, 0.3)' :
                          'rgba(255, 255, 255, 0.1)',
                        ...theme.shadows.soft,
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Clock
                            size={18}
                            color={isToday ?
                              theme.colors.primary.DEFAULT :
                              theme.colors.text.secondary}
                            style={{ marginRight: theme.spacing.xs }}
                          />
                          <Text style={{
                            fontSize: theme.typography.body.fontSize,
                            fontWeight: '600',
                            color: theme.colors.text.primary,
                            marginRight: theme.spacing.md,
                          }}>
                            {dayNames[schedule.day_of_week]}
                          </Text>
                          <Text style={{
                            fontSize: theme.typography.body.fontSize,
                            color: theme.colors.text.primary,
                            fontWeight: '600',
                          }}>
                            {formatTime(schedule.open_time)} - {formatTime(schedule.close_time)}
                          </Text>
                        </View>
                        {isToday && (
                          <View style={{
                            backgroundColor: theme.colors.primary.DEFAULT,
                            paddingHorizontal: theme.spacing.xs,
                            paddingVertical: 2,
                            borderRadius: theme.borderRadius.sm,
                          }}>
                            <Text style={{
                              fontSize: theme.typography.caption.fontSize,
                              color: theme.colors.text.primary,
                              fontWeight: '600',
                            }}>
                              TODAY
                            </Text>
                          </View>
                        )}
                      </View>

                        {schedule.special_note && (
                          <Text style={{
                            fontSize: theme.typography.caption.fontSize,
                            color: theme.colors.text.secondary,
                            fontStyle: 'italic',
                            marginTop: theme.spacing.xs,
                          }}>
                            {schedule.special_note}
                          </Text>
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

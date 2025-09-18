
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  QrCode,
  Calendar,
  Clock,
  ChevronRight,
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

  const {
    member,
    services,
    servicesLoading,
    fetchServices,
    renewMembership,
    checkins,
    fetchCheckins,
  } = useAppStore();

  // Load services and checkins on component mount
  React.useEffect(() => {
    fetchServices();
    fetchCheckins();
  }, [fetchServices, fetchCheckins]);

  // Get available services (limit to 2 for preview)
  const availableServices = services.slice(0, 2);

  // Calculate last visit from checkins
  const getLastVisit = () => {
    if (checkins.length === 0) return null;
    
    // Get the most recent completed checkin (has check_out_time)
    const completedCheckins = checkins.filter(c => c.check_out_time);
    if (completedCheckins.length === 0) return null;
    
    // Sort by check_in_time and get the most recent
    const lastVisit = completedCheckins.sort((a, b) => 
      new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
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

  const lastVisit = getLastVisit();
  const currentMonthCheckins = getCurrentMonthCheckinsCount();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchServices(), fetchCheckins()]);
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
        {/* Membership Status Card */}
        <View style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
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

        {/* Current Month Stats */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.soft,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                marginBottom: 4,
              }}>
                This Month
              </Text>
              <Text style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: '700',
                color: theme.colors.primary.DEFAULT,
              }}>
                {currentMonthCheckins} visits
              </Text>
            </View>
            <Calendar
              size={32}
              color={theme.colors.primary.DEFAULT}
            />
          </View>
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
    </View>
  );
}

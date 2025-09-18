
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  QrCode,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { formatRelativeDate } from '../../lib/utils';
import { getClassesForToday, mockClasses } from '../../lib/mock';
import { AppHeader } from '../../components/AppHeader';
import { StatusCard } from '../../components/StatusCard';
import { ClassCard } from '../../components/ClassCard';
import { PillButton } from '../../components/PillButton';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    member,
    isClassReserved,
    reserveClass,
    cancelReservation,
    renewMembership,
  } = useAppStore();

  // Get today's classes (limit to 2 for preview)
  const todayClasses = getClassesForToday().slice(0, 2);
  const upcomingClasses = mockClasses.slice(0, 2);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQRPress = () => {
    router.push('/(tabs)/qr');
  };

  const handleClassPress = (classId: string) => {
    router.push(`/class/${classId}`);
  };

  const handleClassReserve = (classId: string) => {
    if (isClassReserved(classId)) {
      cancelReservation(classId);
    } else {
      reserveClass(classId);
    }
  };

  const handleViewAllClasses = () => {
    router.push('/(tabs)/classes');
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
                {member.lastCheckIn ? formatRelativeDate(member.lastCheckIn) : 'Never'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Today's Classes Section */}
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
                Today at the Gym
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleViewAllClasses}
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

          {todayClasses.length > 0 ? (
            todayClasses.map(gymClass => (
              <ClassCard
                key={gymClass.id}
                gymClass={gymClass}
                isReserved={isClassReserved(gymClass.id)}
                onPress={() => handleClassPress(gymClass.id)}
                onReserve={() => handleClassReserve(gymClass.id)}
                compact
              />
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
                No classes scheduled for today
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Classes Preview */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp
                size={24}
                color={theme.colors.secondary.DEFAULT}
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                Popular Classes
              </Text>
            </View>
          </View>

          {upcomingClasses.map(gymClass => (
            <ClassCard
              key={gymClass.id}
              gymClass={gymClass}
              isReserved={isClassReserved(gymClass.id)}
              onPress={() => handleClassPress(gymClass.id)}
              onReserve={() => handleClassReserve(gymClass.id)}
              showDate
              compact
            />
          ))}

          <PillButton
            title="Explore All Classes"
            onPress={handleViewAllClasses}
            variant="outline"
            fullWidth
            icon={Calendar}
          />
        </View>
      </ScrollView>
    </View>
  );
}

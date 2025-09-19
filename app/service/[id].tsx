import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  Banknote,
  Calendar,
  AlertCircle,
} from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { getServiceById } from '../../lib/mock';
import { AppHeader } from '../../components/AppHeader';
import { PillButton } from '../../components/PillButton';
import { useLanguage } from '../../lib/LanguageContext';
import { formatPrice } from '../../lib/utils';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [isBooking, setIsBooking] = useState(false);

  const {
    services,
    fetchServices,
    bookService,
    session,
  } = useAppStore();

  useEffect(() => {
    if (services.length === 0) {
      fetchServices();
    }
  }, [fetchServices, services.length]);

  const service = getServiceById(id || '', services);

  const handleBookService = async () => {
    if (!session?.user?.id) {
      Alert.alert('Please log in', 'You need to be logged in to book services.');
      return;
    }

    if (!service) {
      Alert.alert('Error', 'Service not found.');
      return;
    }

    setIsBooking(true);
    try {
      // For now, book for tomorrow at 10 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      await bookService(service.id, tomorrow.toISOString());
      Alert.alert('Success', `${service.name} has been booked!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error booking service:', error);
      Alert.alert('Error', 'Failed to book service. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (!service) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.background.DEFAULT,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      }}>
        <AlertCircle
          size={48}
          color={theme.colors.status.error}
          style={{ marginBottom: theme.spacing.lg }}
        />
        <Text style={{
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: theme.colors.text.primary,
          textAlign: 'center',
          marginBottom: theme.spacing.md,
        }}>
          Service Not Found
        </Text>
        <Text style={{
          fontSize: theme.typography.body.fontSize,
          color: theme.colors.text.secondary,
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
        }}>
          The requested service could not be found.
        </Text>
        <PillButton
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={service.name}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Details Card */}
        <View style={{
          backgroundColor: theme.colors.background.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          borderWidth: 1,
          borderColor: 'rgba(30, 155, 113, 0.2)',
          ...theme.shadows.soft,
        }}>
          {/* Price */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <Banknote
              size={24}
              color={theme.colors.primary.DEFAULT}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.h1.fontSize,
              fontWeight: '700',
              color: theme.colors.primary.DEFAULT,
            }}>
              {formatPrice(service.price, t)}
            </Text>
          </View>

          {/* Duration */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
          }}>
            <Clock
              size={20}
              color={theme.colors.text.secondary}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {service.duration_minutes} minutes
            </Text>
          </View>

          {/* Description */}
          <Text style={{
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.primary,
            lineHeight: 22,
            marginBottom: theme.spacing.lg,
          }}>
            {service.description}
          </Text>

          {/* Advance Booking Warning */}
          {service.requires_advance_booking && (
            <View style={{
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(255, 193, 7, 0.3)',
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Calendar
                  size={20}
                  color={theme.colors.secondary.DEFAULT}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.secondary.DEFAULT,
                  fontWeight: '600',
                  flex: 1,
                }}>
                  Advance booking required ({service.advance_booking_hours} hours)
                </Text>
              </View>
            </View>
          )}

          {/* Session Info */}
          {service.max_sessions && service.max_sessions > 1 && (
            <View style={{
              backgroundColor: 'rgba(30, 155, 113, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(30, 155, 113, 0.3)',
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.primary.DEFAULT,
                fontWeight: '600',
              }}>
                Package includes {service.max_sessions} sessions
              </Text>
            </View>
          )}
        </View>

        {/* Book Service Button */}
        <PillButton
          title={isBooking ? 'Booking...' : 'Book Service'}
          onPress={handleBookService}
          disabled={isBooking}
          fullWidth
          size="large"
        />
      </ScrollView>
    </View>
  );
}

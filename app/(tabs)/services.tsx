import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Banknote } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { useLanguage } from '../../lib/LanguageContext';
import { formatPrice } from '../../lib/utils';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  const {
    services,
    servicesLoading,
    fetchServices,
  } = useAppStore();

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  const handleServicePress = (serviceId: string) => {
    // TODO: Enable when service detail routes are properly configured
    console.log('Service pressed:', serviceId);
    // router.push(`/service/${serviceId}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={t('services')}
        subtitle={`${services.length} ${t('availableCount')}`}
        showNotifications
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Services List */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: insets.bottom + 100, // Account for tab bar
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
        {servicesLoading ? (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: theme.spacing.xxl,
          }}>
            <Text style={{
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.text.secondary,
            }}>
              {t('loadingServices')}
            </Text>
          </View>
        ) : services.length > 0 ? (
          <View style={{ paddingTop: theme.spacing.md }}>
            {services.map(service => (
              <TouchableOpacity
                key={service.id}
                onPress={() => handleServicePress(service.id)}
                style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                  ...theme.shadows.soft,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: theme.spacing.sm,
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                    flex: 1,
                    marginRight: theme.spacing.md,
                  }}>
                    {service.name}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Banknote
                      size={20}
                      color={theme.colors.primary.DEFAULT}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{
                      fontSize: theme.typography.h2.fontSize,
                      fontWeight: '700',
                      color: theme.colors.primary.DEFAULT,
                    }}>
                      {formatPrice(service.price, t)}
                    </Text>
                  </View>
                </View>

                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.sm,
                  lineHeight: 20,
                }}>
                  {service.description}
                </Text>

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Clock
                      size={16}
                      color={theme.colors.text.secondary}
                      style={{ marginRight: theme.spacing.xs }}
                    />
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                    }}>
                      {service.duration_minutes} {t('minutes')}
                    </Text>
                  </View>

                  {service.requires_advance_booking && (
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.secondary.DEFAULT,
                      fontWeight: '600',
                    }}>
                      {t('advanceBookingRequired')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon={Calendar}
            title={t('noServicesFound')}
            description={t('noServicesDescription')}
          />
        )}
      </ScrollView>
    </View>
  );
}

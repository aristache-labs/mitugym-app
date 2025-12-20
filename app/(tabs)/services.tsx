import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Banknote, X, ShoppingCart } from 'lucide-react-native';
import { useAppStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { StyledInput } from '../../components/StyledInput';
import { StyledButton } from '../../components/StyledButton';
import { NotificationModal } from '../../components/NotificationModal';
import { useLanguage } from '../../lib/LanguageContext';
import { formatPrice } from '../../lib/utils';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const {
    services,
    servicesLoading,
    fetchServices,
    purchaseService,
    member,
  } = useAppStore();

  const canPurchaseServices = member?.membershipStatus === 'active';

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
    if (!canPurchaseServices) {
      Alert.alert(
        t('membershipRequired' as any),
        t('activeMembershipNeeded' as any),
        [{ text: t('ok'), style: 'default' }],
      );
      return;
    }

    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setPurchaseModalVisible(true);
      setNotes('');
    }
  };

  const handlePurchaseSubmit = async () => {
    if (!selectedService) {
      Alert.alert(t('error'), t('pleaseFillAllFields'));
      return;
    }

    try {
      await purchaseService(selectedService.id, notes);
      setPurchaseModalVisible(false);
      setSelectedService(null);
      setNotes('');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handlePurchaseCancel = () => {
    setPurchaseModalVisible(false);
    setSelectedService(null);
    setNotes('');
  };


  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background.DEFAULT }}>
      <AppHeader
        title={t('services')}
        subtitle={`${services.length} ${t('availableCount')}`}
        showNotifications
        onNotificationPress={() => setNotificationsModalVisible(true)}
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

      {/* Purchase Modal */}
      <Modal
        visible={purchaseModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handlePurchaseCancel}
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
              <ShoppingCart size={24} color={theme.colors.secondary.DEFAULT} style={{ marginRight: theme.spacing.sm }} />
              <Text style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}>
                {t('purchaseService')}
              </Text>
            </View>
            <TouchableOpacity onPress={handlePurchaseCancel}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg }}>
            {selectedService && (
              <>
                {/* Service Info */}
                <View style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                  marginBottom: theme.spacing.lg,
                  borderWidth: 1,
                  borderColor: 'rgba(30, 155, 113, 0.2)',
                }}>
                  <Text style={{
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {selectedService.name}
                  </Text>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.sm,
                  }}>
                    {selectedService.description}
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
                      {formatPrice(selectedService.price, t)}
                    </Text>
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                    }}>
                      {selectedService.duration_minutes} {t('minutes')}
                    </Text>
                  </View>
                </View>


                {/* Notes Input */}
                <StyledInput
                  label={`${t('notes').toUpperCase()} (${t('optional').toUpperCase()})`}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t('addNotesPlaceholder')}
                    multiline
                  numberOfLines={4}
                  style={{
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  />

                {/* Submit Button */}
                <View style={{ marginTop: theme.spacing.xl, marginBottom: insets.bottom }}>
                  <StyledButton
                    title={t('purchaseService')}
                  onPress={handlePurchaseSubmit}
                    fullWidth
                    icon="check"
                  />
                </View>
              </>
            )}
          </ScrollView>

        </View>
      </Modal>

      {/* Notifications Modal */}
      <NotificationModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />
    </View>
  );
}

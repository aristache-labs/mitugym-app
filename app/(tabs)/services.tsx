import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Text, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, Banknote, X, Check } from 'lucide-react-native';
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
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [notes, setNotes] = useState('');

  const {
    services,
    servicesLoading,
    fetchServices,
    purchaseService,
    purchasedServices,
    fetchPurchasedServices,
  } = useAppStore();

  // Load services and purchased services on component mount
  useEffect(() => {
    fetchServices();
    fetchPurchasedServices();
  }, [fetchServices, fetchPurchasedServices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    await fetchPurchasedServices();
    setRefreshing(false);
  };

  const handleServicePress = (serviceId: string) => {
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
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* My Purchased Services Section */}
      {purchasedServices.length > 0 && (
        <View style={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.sm,
        }}>
          <Text style={{
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.sm,
          }}>
            {t('myPurchasedServices')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: theme.spacing.lg }}
          >
            {purchasedServices.slice(0, 3).map(purchasedService => (
              <View
                key={purchasedService.id}
                style={{
                  backgroundColor: theme.colors.background.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  marginRight: theme.spacing.md,
                  width: 250,
                  borderWidth: 1,
                  borderColor: purchasedService.status === 'pending'
                    ? 'rgba(243, 156, 18, 0.3)'
                    : purchasedService.status === 'approved'
                    ? 'rgba(30, 155, 113, 0.3)'
                    : 'rgba(167, 195, 186, 0.3)',
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.xs,
                }}>
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    flex: 1,
                  }} numberOfLines={1}>
                    {purchasedService.services?.name || 'Service'}
                  </Text>
                  <View style={{
                    backgroundColor: purchasedService.status === 'pending'
                      ? 'rgba(243, 156, 18, 0.2)'
                      : purchasedService.status === 'approved'
                      ? 'rgba(30, 155, 113, 0.2)'
                      : 'rgba(167, 195, 186, 0.2)',
                    paddingHorizontal: theme.spacing.xs,
                    paddingVertical: 2,
                    borderRadius: theme.borderRadius.sm,
                  }}>
                    <Text style={{
                      fontSize: theme.typography.caption.fontSize,
                      color: purchasedService.status === 'pending'
                        ? '#f39c12'
                        : purchasedService.status === 'approved'
                        ? theme.colors.primary.DEFAULT
                        : theme.colors.text.secondary,
                      fontWeight: '600',
                    }}>
                      {purchasedService.status === 'pending' ? t('pending') :
                       purchasedService.status === 'approved' ? t('approved') :
                       purchasedService.status}
                    </Text>
                  </View>
                </View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                }}>
                  {purchasedService.sessions_remaining} of {purchasedService.sessions_total} sessions remaining
                </Text>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs,
                }}>
                  Purchased: {new Date(purchasedService.purchase_date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

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
          paddingTop: insets.top,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(30, 155, 113, 0.2)',
          }}>
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('purchaseService')}
            </Text>
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
                      fontSize: theme.typography.body.fontSize,
                      color: theme.colors.text.primary,
                      borderWidth: 1,
                      borderColor: 'rgba(30, 155, 113, 0.2)',
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t('addNotesPlaceholder')}
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: insets.bottom,
                  }}
                  onPress={handlePurchaseSubmit}
                >
                  <Check size={20} color="white" style={{ marginRight: theme.spacing.sm }} />
                  <Text style={{
                    fontSize: theme.typography.body.fontSize,
                    fontWeight: '600',
                    color: 'white',
                  }}>
                    {t('purchaseService')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

        </View>
      </Modal>
    </View>
  );
}

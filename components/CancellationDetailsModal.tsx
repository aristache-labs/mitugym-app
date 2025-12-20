import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { XCircle, X } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useLanguage } from '../lib/LanguageContext';
import { StyledButton } from './StyledButton';

interface CancellationDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  service: any;
}

export const CancellationDetailsModal: React.FC<CancellationDetailsModalProps> = ({
  visible,
  onClose,
  service,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  if (!service) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
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
          borderBottomColor: 'rgba(239, 68, 68, 0.2)',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <XCircle size={24} color={theme.colors.status.error} style={{ marginRight: theme.spacing.sm }} />
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}>
              {t('serviceCancelled' as any)}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg }}>
          {/* Service Info */}
          <View style={{
            backgroundColor: theme.colors.background.surface,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}>
            <Text style={{
              fontSize: theme.typography.h3.fontSize,
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.sm,
            }}>
              {service.services?.name || 'Service'}
            </Text>

            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              alignSelf: 'flex-start',
              marginBottom: theme.spacing.md,
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

            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: theme.spacing.sm,
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}>
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.xs,
                }}>
                  {t('purchasedOn')}
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {new Date(service.purchase_date).toLocaleDateString()}
                </Text>
              </View>
              <View>
                <Text style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.xs,
                }}>
                  {t('sessionsTotal' as any)}
                </Text>
                <Text style={{
                  fontSize: theme.typography.body.fontSize,
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                }}>
                  {service.sessions_total}
                </Text>
              </View>
            </View>
          </View>

          {/* Cancellation Reason (from Notes) */}
          {service.notes && (
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: '600',
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
              }}>
                {t('cancellationReason' as any)}
              </Text>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                lineHeight: 22,
              }}>
                {service.notes}
              </Text>
            </View>
          )}

          {/* No Reason Message */}
          {!service.notes && (
            <View style={{
              backgroundColor: theme.colors.background.surface,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}>
              <Text style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                {t('noReason' as any)}
              </Text>
            </View>
          )}

          {/* Close Button */}
          <View style={{ marginBottom: insets.bottom }}>
            <StyledButton
              title={t('close')}
              onPress={onClose}
              fullWidth
              icon="x"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { X, Bell, CheckCheck, Clock } from 'lucide-react-native';
import { theme } from '../lib/theme';
import { useAppStore, type Notification } from '../lib/store';
import { StyledButton } from './StyledButton';
import { useLanguage } from '../lib/LanguageContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = 450; // Minimum modal height (increased for empty state)
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85; // Maximum 85% of screen
const NOTIFICATION_ITEM_HEIGHT = 120; // Approximate height per notification
const HEADER_HEIGHT = 100; // Header height
const ACTION_BAR_HEIGHT = 50; // Action bar height (when visible)
const FOOTER_HEIGHT = 90; // Footer with close button
const EMPTY_STATE_HEIGHT = 200; // Empty state content height

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useLanguage();
  const {
    notifications,
    notificationsLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useAppStore();

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {return t('justNow');}
    if (diffMins < 60) {return `${diffMins}${t('minutesAgo')}`;}
    if (diffHours < 24) {return `${diffHours}${t('hoursAgo')}`;}
    if (diffDays < 7) {return `${diffDays}${t('daysAgo')}`;}
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes('service')) {return '🛍️';}
    if (type.includes('session')) {return '📅';}
    if (type.includes('announcement')) {return '📢';}
    if (type.includes('gym_schedule')) {return '🏋️';}
    if (type.includes('membership_plans')) {return '💳';}
    if (type.includes('profile_update')) {return '👤';}
    return '🔔';
  };

  const [slideAnim] = React.useState(new Animated.Value(-500));
  const [overlayOpacity] = React.useState(new Animated.Value(0));
  const [isClosing, setIsClosing] = React.useState(false);
  const closingHeightRef = React.useRef<number>(0);

  // Calculate dynamic height based on number of notifications
  const calculateModalHeight = () => {
    if (notifications.length === 0) {
      // Empty state: header + empty state content + footer
      return HEADER_HEIGHT + EMPTY_STATE_HEIGHT + FOOTER_HEIGHT;
    }

    // With notifications: header + action bar + notifications + footer
    const actionBarHeight = notifications.length > 0 ? ACTION_BAR_HEIGHT : 0;
    const contentHeight = HEADER_HEIGHT + actionBarHeight + FOOTER_HEIGHT + (notifications.length * NOTIFICATION_ITEM_HEIGHT);

    return Math.min(Math.max(contentHeight, MIN_HEIGHT), MAX_HEIGHT);
  };

  const modalHeight = isClosing ? closingHeightRef.current : calculateModalHeight();

  // Handle close with animation
  const handleClose = () => {
    // Capture current height before closing
    closingHeightRef.current = calculateModalHeight();
    setIsClosing(true);

    // Run both animations in parallel
    Animated.parallel([
      // Slide up animation - slide completely off screen
      Animated.timing(slideAnim, {
        toValue: -(closingHeightRef.current + 100),
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      // Fade out overlay
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsClosing(false);
      onClose();
    });
  };

  // Fetch notifications when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log('NotificationModal: Fetching notifications...');
      console.log('Current notifications in state:', notifications);
      console.log('Notifications length:', notifications.length);
      console.log('Loading state:', notificationsLoading);
      fetchNotifications();
      // Reset closing state when opening
      setIsClosing(false);

      // Run both animations in parallel
      Animated.parallel([
        // Slide down animation
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // Fade in overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!isClosing) {
      // Only reset position if not currently closing
      slideAnim.setValue(-500);
      overlayOpacity.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible || isClosing}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              height: modalHeight,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Bell size={24} color={theme.colors.primary.DEFAULT} />
              <Text style={styles.headerTitle}>{t('notifications')}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {notifications.length > 0 && (
            <View style={styles.actionBar}>
              {notifications.some(n => !n.is_read) && (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  style={styles.markAllButton}
                >
                  <CheckCheck size={18} color={theme.colors.primary.DEFAULT} />
                  <Text style={styles.markAllText}>{t('markAllAsRead')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={clearAllNotifications}
                style={styles.clearAllButton}
              >
                <X size={18} color={theme.colors.status.error} />
                <Text style={styles.clearAllText}>{t('clearAll')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={notifications.length > 0}
            refreshControl={
              <RefreshControl
                refreshing={notificationsLoading}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary.DEFAULT}
              />
            }
          >
            {notifications.length === 0 && notificationsLoading ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={theme.colors.primary.DEFAULT} />
                <Text style={styles.emptyTitle}>{t('loadingNotifications')}</Text>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={theme.colors.text.secondary} />
                <Text style={styles.emptyTitle}>{t('noNotifications')}</Text>
                <Text style={styles.emptySubtitle}>
                  {t('noNotificationsDesc')}
                </Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.is_read && styles.unreadNotification,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  {/* Icon & Unread Indicator */}
                  <View style={styles.notificationLeft}>
                    <Text style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </Text>
                    {!notification.is_read && <View style={styles.unreadDot} />}
                  </View>

                  {/* Content */}
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.is_read && styles.unreadTitle,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <View style={styles.notificationFooter}>
                      <Clock size={12} color={theme.colors.text.secondary} />
                      <Text style={styles.notificationTime}>
                        {formatDate(notification.created_at)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <StyledButton title={t('close')} onPress={handleClose} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.DEFAULT,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: theme.colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 212, 212, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77, 212, 212, 0.1)',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary.DEFAULT,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.status.error,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing.xl * 1,
    paddingBottom: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(40, 40, 40, 0.6)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(77, 212, 212, 0.1)',
  },
  unreadNotification: {
    backgroundColor: 'rgba(77, 212, 212, 0.08)',
    borderColor: 'rgba(77, 212, 212, 0.3)',
  },
  notificationLeft: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  notificationIcon: {
    fontSize: 32,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary.DEFAULT,
    borderWidth: 2,
    borderColor: theme.colors.background.DEFAULT,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  unreadTitle: {
    color: theme.colors.primary.DEFAULT,
  },
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 212, 212, 0.1)',
  },
});

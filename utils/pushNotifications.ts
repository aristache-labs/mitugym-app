import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  deviceName: string;
}

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers for push notifications and returns the Expo push token
 * Handles platform-specific permission requests
 */
export async function registerForPushNotificationsAsync(): Promise<PushNotificationToken | null> {
  try {
    // Check if running on a physical device
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Get existing notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Check if permissions were denied
    if (finalStatus !== 'granted') {
      console.log('Push notification permissions were denied');
      return null;
    }

    // Get the Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

    if (!projectId) {
      console.error('Project ID not found. Make sure to configure EAS in app.config.ts');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Get device information
    const deviceName = Device.deviceName || `${Device.brand} ${Device.modelName}`;
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4DD4D4',
      });
    }

    return {
      token: tokenData.data,
      platform,
      deviceName,
    };
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Saves the push token to Supabase database
 */
export async function savePushTokenToDatabase(
  tokenData: PushNotificationToken,
  userId: string,
): Promise<boolean> {
  try {
    console.log('Upserting push token:', tokenData.token, 'for user:', userId);

    // Use a database function that runs with SECURITY DEFINER to bypass RLS
    // This allows account switching on the same device
    const { data, error } = await supabase
      .rpc('upsert_push_token', {
        p_user_id: userId,
        p_push_token: tokenData.token,
        p_device_platform: tokenData.platform,
        p_device_name: tokenData.deviceName,
      });

    if (error) {
      console.error('Error upserting push token:', error);
      return false;
    }

    console.log('Push token saved/updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in savePushTokenToDatabase:', error);
    return false;
  }
}

/**
 * Marks push token as inactive in the database
 */
export async function deactivatePushToken(token: string): Promise<boolean> {
  try {
    // Use database function with SECURITY DEFINER to bypass RLS
    const { data, error } = await supabase
      .rpc('deactivate_push_token', {
        p_push_token: token,
      });

    if (error) {
      console.error('Error deactivating push token:', error);
      return false;
    }

    console.log('Push token deactivated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in deactivatePushToken:', error);
    return false;
  }
}

/**
 * Removes all push tokens for a specific user
 */
export async function removeAllUserPushTokens(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing push tokens:', error);
      return false;
    }

    console.log('All user push tokens removed successfully');
    return true;
  } catch (error) {
    console.error('Error in removeAllUserPushTokens:', error);
    return false;
  }
}

/**
 * Sets up notification event listeners
 * Returns cleanup function to remove listeners
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void,
): () => void {
  // Listen for notifications received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Listen for user tapping on notifications
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Gets the last notification response (when app was opened via notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    return await Notifications.getLastNotificationResponseAsync();
  } catch (error) {
    console.error('Error getting last notification response:', error);
    return null;
  }
}

/**
 * Clears all notifications from the notification tray
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

/**
 * Sets the app badge count (iOS only)
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Gets current badge count (iOS only)
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

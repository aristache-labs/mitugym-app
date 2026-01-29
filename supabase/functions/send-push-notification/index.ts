// Supabase Edge Function for sending push notifications via Expo Push API
// This function is triggered when a notification is inserted into the notifications table
// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Notification {
  id: string;
  member_id: string | null;
  type: string;
  title: string;
  message: string;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  is_global: boolean;
  is_admin_only?: boolean;
  created_at: string;
}

interface PushToken {
  id: string;
  user_id: string;
  push_token: string;
  device_platform: string;
  device_name: string;
  is_active: boolean;
}

interface ExpoPushMessage {
  to: string | string[];
  sound?: 'default';
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

interface ExpoPushReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: any;
}

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

// @ts-ignore - Deno global is available in Deno runtime
Deno.serve(async (req: Request) => {
  try {
    // Parse the webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Extract notification data
    const notification: Notification = payload.record || payload;

    // Skip if admin-only notification
    if (notification.is_admin_only === true) {
      console.log('Skipping admin-only notification:', notification.id);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin-only notification skipped',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Get Supabase credentials from environment
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine which users to send notifications to
    let pushTokens: PushToken[] = [];

    if (notification.is_global) {
      // Global notification - get all active push tokens
      console.log('Fetching all active push tokens for global notification');
      const { data, error } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching push tokens:', error);
        throw error;
      }

      pushTokens = data || [];
    } else if (notification.member_id) {
      // Personal notification - get tokens for specific user
      console.log('Fetching push tokens for user:', notification.member_id);
      const { data, error } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', notification.member_id)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching push tokens:', error);
        throw error;
      }

      pushTokens = data || [];
    } else {
      console.log('Notification has no member_id and is not global, skipping');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No recipients for notification',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    if (pushTokens.length === 0) {
      console.log('No active push tokens found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active push tokens to send to',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    console.log(`Sending push notification to ${pushTokens.length} device(s)`);

    // Prepare Expo push messages
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token.push_token,
      sound: 'default',
      title: notification.title,
      body: notification.message,
      data: {
        notificationId: notification.id,
        type: notification.type,
        referenceId: notification.reference_id,
        referenceType: notification.reference_type,
      },
      priority: 'high',
      channelId: 'default',
    }));

    // Send push notifications to Expo API
    const response = await fetch(EXPO_PUSH_API_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Expo push API error:', errorText);
      throw new Error(`Expo push API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Expo push API response:', JSON.stringify(result, null, 2));

    // Check for individual push receipt errors
    const receipts: ExpoPushReceipt[] = result.data || [];
    const invalidTokens: string[] = [];

    receipts.forEach((receipt, index) => {
      if (receipt.status === 'error') {
        const token = pushTokens[index];
        if (token) {
          console.error(`Push receipt error for token ${token.push_token}:`, receipt);

          // Mark invalid tokens as inactive
          if (receipt.details?.error === 'DeviceNotRegistered' ||
              receipt.message?.includes('not registered')) {
            invalidTokens.push(token.push_token);
          }
        }
      }
    });

    // Deactivate invalid tokens
    if (invalidTokens.length > 0) {
      console.log(`Deactivating ${invalidTokens.length} invalid token(s)`);
      const { error: updateError } = await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .in('push_token', invalidTokens);

      if (updateError) {
        console.error('Error deactivating invalid tokens:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Push notifications sent to ${pushTokens.length} device(s)`,
        invalidTokens: invalidTokens.length,
        receipts: result.data,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});

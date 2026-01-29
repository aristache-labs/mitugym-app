# Push Notifications Deployment Guide

This guide walks you through deploying and configuring push notifications for the MITUGYM mobile app.

## Overview

The push notification system consists of:
1. **Client-side**: React Native app with Expo push notifications
2. **Database**: Push tokens table and notification triggers
3. **Edge Function**: Supabase function that sends notifications via Expo API
4. **Webhook**: Database trigger that calls the edge function

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase account with project access
- Expo account (push notifications use Expo's service)

## Step 1: Configure Expo Project ID

1. Run `npx expo login` to login to your Expo account
2. Run `npx expo whoami` to verify you're logged in
3. Get your Expo project ID:
   - Go to https://expo.dev/accounts/[your-account]/projects
   - Select your project or create a new one
   - Copy the Project ID

4. Add the Project ID to `app.config.ts`:
```typescript
export default {
  // ... other config
  extra: {
    eas: {
      projectId: "your-expo-project-id-here"
    }
  }
}
```

Alternatively, create/update `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id-here"
      }
    }
  }
}
```

## Step 2: Database Setup (Already Complete)

The following database objects have been created:
- ✅ `push_tokens` table with RLS policies
- ✅ `trigger_push_notification()` function
- ✅ `on_notification_created` trigger on notifications table

## Step 3: Deploy Edge Function

1. Login to Supabase CLI:
```bash
supabase login
```

2. Link to your project:
```bash
supabase link --project-ref amgzzlnvrrqtleicgenq
```

3. Deploy the edge function:
```bash
cd c:\Personal\mitugym-app
supabase functions deploy send-push-notification
```

4. Note the deployed function URL (format):
```
https://amgzzlnvrrqtleicgenq.supabase.co/functions/v1/send-push-notification
```

## Step 4: Configure Database Webhook

### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/amgzzlnvrrqtleicgenq
2. Navigate to **Database** > **Webhooks**
3. Click **Enable Webhooks** (if not already enabled)
4. Click **Create a new hook**
5. Configure:
   - **Name**: `send-push-notification`
   - **Table**: `notifications`
   - **Events**: Check `Insert`
   - **Type**: `HTTP Request`
   - **Method**: `POST`
   - **URL**: `https://amgzzlnvrrqtleicgenq.supabase.co/functions/v1/send-push-notification`
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_SERVICE_ROLE_KEY
     ```
   - **Conditions**: None (or optionally: `is_admin_only = false`)

6. Click **Create Webhook**

### Option B: Using SQL (Alternative)

If you prefer SQL configuration, you can use the `pg_net` extension:

```sql
-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update the trigger function to use pg_net
CREATE OR REPLACE FUNCTION trigger_push_notification()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  payload JSONB;
  request_id BIGINT;
BEGIN
  -- Skip admin-only notifications
  IF NEW.is_admin_only = true THEN
    RETURN NEW;
  END IF;

  -- Build webhook URL
  webhook_url := 'https://amgzzlnvrrqtleicgenq.supabase.co/functions/v1/send-push-notification';
  
  -- Build payload
  payload := jsonb_build_object(
    'record', to_jsonb(NEW)
  );

  -- Make async HTTP request using pg_net
  SELECT net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  ) INTO request_id;

  RAISE NOTICE 'Push notification webhook called with request_id: %', request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Step 5: Test the Integration

### Test 1: Token Registration

1. Build and run the app on a physical device (push notifications don't work on simulators)
2. Login to the app
3. Go to Profile > App Settings
4. Enable "Push Notifications" toggle
5. Grant permission when prompted (iOS only)
6. Check Supabase database to verify token is stored:

```sql
SELECT * FROM push_tokens WHERE is_active = true;
```

### Test 2: Send Test Notification

1. Insert a test notification in the database:

```sql
-- Replace YOUR_USER_ID with actual user ID
INSERT INTO notifications (
  member_id, 
  type, 
  title, 
  message, 
  is_global, 
  is_admin_only
)
VALUES (
  'YOUR_USER_ID',
  'test_notification',
  'Test Push Notification',
  'This is a test message from the push notification system',
  false,
  false
);
```

2. You should receive a push notification on your device
3. Check edge function logs:

```bash
supabase functions logs send-push-notification
```

### Test 3: Global Notification

```sql
-- Send to all users
INSERT INTO notifications (
  member_id, 
  type, 
  title, 
  message, 
  is_global, 
  is_admin_only
)
VALUES (
  NULL,
  'announcement',
  'Important Announcement',
  'Check out the new gym schedule!',
  true,
  false
);
```

### Test 4: Admin-Only Notification (Should NOT send push)

```sql
-- This should NOT trigger push notification
INSERT INTO notifications (
  member_id, 
  type, 
  title, 
  message, 
  is_global, 
  is_admin_only
)
VALUES (
  NULL,
  'admin_notification',
  'Admin Only',
  'This should not send push',
  true,
  true
);
```

## Step 6: iOS-Specific Setup (Production)

For production iOS builds, you need to configure APNs:

1. **Development**: Expo handles APNs automatically for Expo Go
2. **Production** (standalone app):
   - Create an Apple Developer account
   - Generate APNs certificate or key
   - Configure in Expo: https://docs.expo.dev/push-notifications/push-notifications-setup/

## Step 7: Android-Specific Setup

Android push notifications work automatically with Expo. No additional configuration needed.

## Monitoring

### Check Edge Function Logs

```bash
# View recent logs
supabase functions logs send-push-notification

# Tail logs in real-time
supabase functions logs send-push-notification --tail
```

### Check Webhook Status

In Supabase Dashboard:
1. Go to **Database** > **Webhooks**
2. Click on `send-push-notification` webhook
3. View **Recent Invocations**

### Check Push Token Health

```sql
-- Count active tokens per platform
SELECT 
  device_platform,
  COUNT(*) as active_tokens
FROM push_tokens
WHERE is_active = true
GROUP BY device_platform;

-- Find tokens that haven't been used recently
SELECT 
  user_id,
  device_platform,
  device_name,
  last_used_at,
  AGE(NOW(), last_used_at) as time_since_last_use
FROM push_tokens
WHERE is_active = true
ORDER BY last_used_at ASC;
```

## Troubleshooting

### Issue: Notifications not received

**Check:**
1. User has enabled push notifications in profile settings
2. Device has granted notification permissions
3. Push token exists in database: `SELECT * FROM push_tokens WHERE user_id = 'USER_ID'`
4. Edge function logs show successful send
5. Expo push receipt doesn't show errors

**Solutions:**
- Have user disable and re-enable push notifications
- Check device notification settings
- Verify edge function is deployed correctly
- Check webhook is configured and firing

### Issue: "DeviceNotRegistered" errors

This means the push token is no longer valid (app was uninstalled, token expired, etc.)

**Solution:**
- Tokens are automatically marked as inactive by the edge function
- User needs to toggle push notifications off and on again

### Issue: Edge function not being called

**Check:**
1. Webhook is configured in Supabase Dashboard
2. Trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_notification_created'`
3. Edge function is deployed: `supabase functions list`

**Solutions:**
- Re-create webhook in dashboard
- Verify webhook URL is correct
- Check edge function logs for errors

### Issue: iOS permissions denied

**Solution:**
- User must enable notifications in iOS Settings > MITUGYM > Notifications
- Show instructions to user: "Go to Settings > MITUGYM > Notifications > Allow Notifications"

## Security Considerations

1. **RLS Policies**: Push tokens table has RLS enabled - users can only access their own tokens
2. **Admin Filter**: Edge function checks `is_admin_only` flag to prevent sending to members
3. **Token Validation**: Invalid tokens are automatically deactivated
4. **Service Role Key**: Edge function uses service role key (automatically provided by Supabase)

## Performance

- **Batch Processing**: Global notifications are sent in a single batch to Expo API
- **Async**: Database trigger uses async webhook - doesn't block notification insert
- **Throttling**: Expo rate limits: 600 requests/minute, 6 million requests/day

## Next Steps

1. Monitor push notification delivery rates
2. Track user opt-in rates
3. Add notification categories (can disable specific types)
4. Implement quiet hours (don't send between certain times)
5. Add notification analytics (open rates, tap rates)

## Support

- Expo Push Notifications: https://docs.expo.dev/push-notifications/overview/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Webhooks: https://supabase.com/docs/guides/database/webhooks

# Push Notifications Testing Checklist

Use this checklist to verify that push notifications are working correctly.

## Pre-Testing Setup

- [ ] Expo project ID is configured in `app.config.ts`
- [ ] Edge function is deployed to Supabase
- [ ] Database webhook/trigger is configured
- [ ] App is built and running on a **physical device** (push won't work on simulators)
- [ ] User is logged into the app

## Test 1: Enable Push Notifications

### Steps:
1. Open the app and navigate to Profile screen
2. Scroll to "App Settings" section
3. Find "Push Notifications" toggle
4. Toggle it ON

### Expected Results:
- [ ] iOS: System permission prompt appears
- [ ] Android: Permission granted automatically (no prompt)
- [ ] Toast message: "Push notifications enabled" appears
- [ ] Toggle remains in ON position

### Database Verification:
```sql
-- Check token was saved
SELECT * FROM push_tokens 
WHERE user_id = 'YOUR_USER_ID' 
AND is_active = true;
```

Expected: 1 row with your device's push token

## Test 2: Receive Personal Push Notification

### Steps:
1. Keep app closed or in background
2. Execute SQL to create a notification:

```sql
INSERT INTO notifications (
  member_id, 
  type, 
  title, 
  message, 
  is_global, 
  is_admin_only
)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID
  'test_notification',
  'Test Personal Push',
  'This is a test personal notification',
  false,
  false
);
```

### Expected Results:
- [ ] Push notification appears on device within 5-10 seconds
- [ ] Notification shows title: "Test Personal Push"
- [ ] Notification shows body: "This is a test personal notification"
- [ ] Device plays notification sound
- [ ] Badge count increases (iOS)

### Edge Function Logs Check:
```bash
supabase functions logs send-push-notification --tail
```

Expected output should show:
- Notification received
- Push token fetched
- Expo API called successfully
- Receipt status: "ok"

## Test 3: Tap Notification (Deep Linking)

### Steps:
1. Receive a notification (use Test 2)
2. Tap on the notification

### Expected Results:
- [ ] App opens
- [ ] Navigates to appropriate screen based on notification type
  - `service_*` → Services tab
  - `session_*` → Services tab
  - `membership_*` → Membership tab
  - `profile_*` → Profile tab
  - `announcement` → Home tab
- [ ] Badge count decreases (iOS)

## Test 4: Foreground Notification (In-App)

### Steps:
1. Open the app and stay on any screen
2. Insert a notification (use Test 2 SQL)

### Expected Results:
- [ ] In-app toast notification appears
- [ ] No push notification appears (since app is in foreground)
- [ ] Notification bell icon updates with unread count
- [ ] Badge count increases (iOS)

## Test 5: Global Notification (All Users)

### Steps:
1. Keep app closed or in background
2. Execute SQL:

```sql
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
  'New gym schedule available!',
  true,
  false
);
```

### Expected Results:
- [ ] All users with active push tokens receive notification
- [ ] Notification appears on all devices
- [ ] Edge function logs show multiple push tokens targeted

### Database Verification:
```sql
-- Check how many tokens were targeted
SELECT COUNT(*) as total_active_tokens
FROM push_tokens
WHERE is_active = true;
```

## Test 6: Admin-Only Notification (Should NOT Send Push)

### Steps:
1. Execute SQL:

```sql
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
  'Admin Only Message',
  'This should not send push notifications',
  true,
  true  -- Admin only flag
);
```

### Expected Results:
- [ ] **NO** push notification received
- [ ] Edge function logs show: "Admin-only notification skipped"
- [ ] Notification still visible in admin panel (for admin users only)

## Test 7: Disable Push Notifications

### Steps:
1. Open app and go to Profile > App Settings
2. Toggle "Push Notifications" OFF

### Expected Results:
- [ ] Toast message: "Push notifications disabled" appears
- [ ] Toggle remains in OFF position

### Database Verification:
```sql
SELECT * FROM push_tokens 
WHERE user_id = 'YOUR_USER_ID';
```

Expected: Token exists but `is_active = false`

### Send Notification to Verify:
1. Insert notification (use Test 2 SQL)
2. **NO** push notification should be received

## Test 8: Re-enable After Disable

### Steps:
1. Toggle push notifications OFF (Test 7)
2. Toggle push notifications back ON

### Expected Results:
- [ ] Permission re-requested (iOS might skip if already granted)
- [ ] Toast: "Push notifications enabled"
- [ ] Token reactivated in database

### Database Verification:
```sql
SELECT * FROM push_tokens 
WHERE user_id = 'YOUR_USER_ID' 
AND is_active = true;
```

Expected: Token is active again (updated timestamp)

## Test 9: Multiple Devices

### Steps:
1. Login to same account on 2 different devices
2. Enable push notifications on both
3. Send a personal notification

### Expected Results:
- [ ] Both devices receive notification
- [ ] Database shows 2 active tokens for same user

### Database Verification:
```sql
SELECT device_name, device_platform, created_at
FROM push_tokens 
WHERE user_id = 'YOUR_USER_ID' 
AND is_active = true;
```

Expected: 2 rows with different devices

## Test 10: Invalid Token Handling

### Steps:
1. Manually mark a token as invalid in Expo (or uninstall app)
2. Send notification to that token
3. Check edge function response

### Expected Results:
- [ ] Edge function logs show "DeviceNotRegistered" error
- [ ] Token automatically marked as inactive in database

### Database Verification:
```sql
SELECT * FROM push_tokens 
WHERE push_token = 'THE_INVALID_TOKEN';
```

Expected: `is_active = false`

## Test 11: Logout Behavior

### Steps:
1. Enable push notifications
2. Logout from the app
3. Send notification

### Expected Results:
- [ ] **Scenario 1 (Current implementation)**: Token remains active, notification still received
- [ ] **Scenario 2 (Recommended)**: Token marked inactive on logout, no notification

**Note:** Currently, tokens are not deactivated on logout. Consider adding this:

```typescript
// In store.ts logout function
await unregisterPushNotifications();
```

## Test 12: Permission Denied (iOS)

### Steps:
1. Toggle push notifications ON
2. When iOS prompt appears, tap "Don't Allow"

### Expected Results:
- [ ] Toast message explaining how to enable in Settings
- [ ] Toggle remains OFF
- [ ] No token saved in database

### Instructions Shown:
"Go to Settings > MITUGYM > Notifications > Allow Notifications"

## Performance Tests

### Test 13: Batch Global Notification

Send global notification to multiple users and measure performance:

```sql
-- First, ensure you have multiple test users with push tokens
SELECT COUNT(*) FROM push_tokens WHERE is_active = true;

-- Send global notification
INSERT INTO notifications (
  member_id, type, title, message, is_global, is_admin_only
)
VALUES (
  NULL, 'announcement', 'Performance Test', 
  'Testing batch sending', true, false
);
```

### Expected Results:
- [ ] All users receive notification within 10 seconds
- [ ] Edge function completes in < 5 seconds
- [ ] No rate limit errors from Expo
- [ ] All receipts show status: "ok"

### Test 14: Rapid Notifications

Send multiple notifications in quick succession:

```bash
# Run this multiple times quickly
for i in {1..5}; do
  psql -c "INSERT INTO notifications (...) VALUES (...);"
done
```

### Expected Results:
- [ ] All notifications processed
- [ ] No duplicate pushes
- [ ] Edge function doesn't error out
- [ ] Expo rate limits not exceeded

## Edge Cases

### Test 15: Empty Notification Content

```sql
INSERT INTO notifications (
  member_id, type, title, message, is_global, is_admin_only
)
VALUES (
  'YOUR_USER_ID', 'test', '', '', false, false
);
```

### Expected:
- [ ] Push sent with empty title/body (Expo handles gracefully)
- Or implement validation to prevent empty notifications

### Test 16: Very Long Notification Text

```sql
INSERT INTO notifications (
  member_id, type, title, message, is_global, is_admin_only
)
VALUES (
  'YOUR_USER_ID', 
  'test',
  'This is an extremely long title that should be truncated by the system',
  'This is a very long message body that contains a lot of text and should be tested to see how the notification system handles it when displayed on different devices with different screen sizes and notification area constraints',
  false, 
  false
);
```

### Expected:
- [ ] iOS truncates to ~60 chars in notification tray
- [ ] Android truncates based on device
- [ ] Full message visible when notification expanded

## Monitoring

### Check Edge Function Health

```bash
# View recent invocations
supabase functions logs send-push-notification

# Monitor in real-time
supabase functions logs send-push-notification --tail
```

### Check Webhook Status

In Supabase Dashboard:
1. Database > Webhooks
2. Click on `send-push-notification`
3. View recent invocations and success rate

### Check Token Health

```sql
-- Active tokens by platform
SELECT 
  device_platform,
  COUNT(*) as count,
  MAX(last_used_at) as most_recent
FROM push_tokens
WHERE is_active = true
GROUP BY device_platform;

-- Inactive tokens (potential issues)
SELECT 
  user_id,
  device_platform,
  last_used_at,
  AGE(NOW(), updated_at) as inactive_duration
FROM push_tokens
WHERE is_active = false
ORDER BY updated_at DESC
LIMIT 10;
```

## Success Criteria

All tests should pass with:
- ✅ Notifications received within 10 seconds
- ✅ 100% delivery rate for valid tokens
- ✅ Proper navigation on tap
- ✅ Badge counts accurate
- ✅ No errors in edge function logs
- ✅ Invalid tokens automatically deactivated
- ✅ Admin-only notifications filtered correctly

## Common Issues and Solutions

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| No notification received | Permissions denied | Check device settings |
| Token not in database | Registration failed | Re-toggle push notifications |
| Edge function errors | Webhook not configured | Configure webhook in dashboard |
| "DeviceNotRegistered" | App uninstalled/token expired | User re-enables push notifications |
| Notifications delayed | Expo rate limiting | Wait and retry |
| Badge count wrong | Not updated on tap | Check notification handler code |

## Final Checklist

- [ ] All 16 tests completed successfully
- [ ] Edge function deployed and running
- [ ] Webhook configured and firing
- [ ] Multiple devices tested (iOS and Android)
- [ ] Performance acceptable (< 10 sec delivery)
- [ ] Error handling works correctly
- [ ] Documentation updated
- [ ] Team trained on troubleshooting

## Sign-Off

**Tester Name:** _________________  
**Date:** _________________  
**Environment:** Production / Staging  
**Devices Tested:** _________________  
**Overall Status:** PASS / FAIL  
**Notes:** _________________

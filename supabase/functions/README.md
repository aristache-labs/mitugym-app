# Supabase Edge Functions

This directory contains Supabase Edge Functions for the MITUGYM app.

## Functions

### `send-push-notification`

Sends push notifications via Expo Push API when notifications are created in the database.

**Triggers:** Database webhook on `notifications` table INSERT events

**Features:**
- Handles both personal and global notifications
- Filters out admin-only notifications
- Fetches active push tokens from database
- Sends notifications via Expo Push API
- Tracks invalid tokens and marks them as inactive
- Handles batch notifications for global messages

## Deployment

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref amgzzlnvrrqtleicgenq
```

### Deploy Functions

Deploy the send-push-notification function:

```bash
supabase functions deploy send-push-notification
```

### Set Environment Variables

The edge function needs access to Supabase credentials (automatically provided by Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

These are automatically injected by Supabase when the function runs.

## Testing

### Test Locally

You can test the function locally using the Supabase CLI:

```bash
supabase functions serve send-push-notification
```

Then send a test request:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-push-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "record": {
      "id": "test-id",
      "member_id": "user-id-here",
      "type": "test_notification",
      "title": "Test Notification",
      "message": "This is a test message",
      "is_read": false,
      "is_global": false,
      "is_admin_only": false,
      "created_at": "2026-01-29T00:00:00Z"
    }
  }'
```

### Test in Production

After deployment, test with a real notification insert:

```sql
-- Insert a test notification
INSERT INTO notifications (member_id, type, title, message, is_global, is_admin_only)
VALUES ('YOUR_USER_ID', 'test_notification', 'Test Push', 'Testing push notifications', false, false);
```

## Monitoring

View function logs in Supabase Dashboard:
1. Go to your project dashboard
2. Navigate to Edge Functions
3. Select `send-push-notification`
4. View logs and invocations

Or use CLI:

```bash
supabase functions logs send-push-notification
```

## Troubleshooting

### Common Issues

1. **Function not triggering:**
   - Check database webhook configuration
   - Verify webhook URL matches deployed function URL
   - Check function logs for errors

2. **Notifications not sending:**
   - Verify Expo push tokens are valid
   - Check Expo push receipts for errors
   - Ensure users have granted notification permissions

3. **Invalid tokens:**
   - Tokens are automatically marked as inactive when Expo reports "DeviceNotRegistered"
   - Users need to toggle push notifications off and on again to register new token

### Debug Mode

To enable detailed logging, modify the function to log more information:

```typescript
console.log('Debug info:', JSON.stringify(data, null, 2));
```

Then check the logs:

```bash
supabase functions logs send-push-notification --tail
```

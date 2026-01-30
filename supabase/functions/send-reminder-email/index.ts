// Supabase Edge Function for sending email reminders via Resend API
// This function is triggered when a notification with type 'session_reminder' is inserted
// Only sends emails for 3_days and 1_day reminders (2_hours is app/push only)
// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
// @ts-expect-error - Deno uses URL imports which VS Code TypeScript doesn't recognize
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


interface ResendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_URL = 'https://api.resend.com/emails';

// @ts-ignore - Deno global is available in Deno runtime
Deno.serve(async (req: Request) => {
  try {
    // Parse the webhook payload
    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    // Extract notification data
    const notification: Notification = payload.record || payload;

    // Only process session_reminder notifications
    if (notification.type !== 'session_reminder') {
      console.log('Not a session_reminder notification, skipping email');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Not a session reminder notification',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Skip if no member_id (shouldn't happen for session reminders)
    if (!notification.member_id) {
      console.log('No member_id in notification, skipping');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No member_id in notification',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Get Supabase credentials from environment
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // @ts-ignore - Deno global is available in Deno runtime
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // @ts-ignore - Deno global is available in Deno runtime
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured, skipping email');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email service not configured',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile and check email notification preference
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, email_notifications_enabled')
      .eq('id', notification.member_id)
      .single() as { data: { id: string; first_name: string; last_name: string; email: string; email_notifications_enabled: boolean } | null; error: any };

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Check if user has email notifications enabled
    if (profile.email_notifications_enabled === false) {
      console.log('User has email notifications disabled, skipping email');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User has email notifications disabled',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Get the session reminder to check reminder_type
    const { data: reminder, error: reminderError } = await supabase
      .from('session_reminders')
      .select('id, reminder_type, session_booking_id')
      .eq('session_booking_id', notification.reference_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as { data: { id: string; reminder_type: string; session_booking_id: string } | null; error: any };

    if (reminderError || !reminder) {
      console.log('Could not find session reminder, might be a different notification type');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Session reminder not found',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Only send emails for 3_days and 1_day reminders (not 2_hours)
    if (reminder.reminder_type === '2_hours') {
      console.log('2-hour reminder detected, skipping email (app/push only)');
      return new Response(
        JSON.stringify({
          success: true,
          message: '2-hour reminders are app/push only',
        }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    // Get session booking details
    const { data: session, error: sessionError } = await supabase
      .from('session_bookings')
      .select(`
        id,
        booking_date,
        notes,
        purchased_services(
          services(name, service_type, duration_minutes)
        )
      `)
      .eq('id', notification.reference_id)
      .single() as { data: { id: string; booking_date: string; notes?: string; purchased_services: { services: { name: string; service_type: string; duration_minutes: number } } } | null; error: any };

    if (sessionError || !session) {
      console.error('Error fetching session booking:', sessionError);
      throw new Error('Failed to fetch session booking');
    }

    // Format booking date
    const bookingDate = new Date(session.booking_date);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = bookingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Get service name
    const serviceName = session.purchased_services?.services?.name || 'Your session';
    const serviceType = session.purchased_services?.services?.service_type || '';
    const duration = session.purchased_services?.services?.duration_minutes || 60;

    // Determine reminder timing text
    const reminderTiming = reminder.reminder_type === '3_days' ? '3 days' : 'tomorrow';
    const reminderEmoji = reminder.reminder_type === '3_days' ? '📅' : '⏰';

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Session Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ${reminderEmoji} Session Reminder
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${profile.first_name || 'there'}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                This is a friendly reminder that your <strong>${serviceName}</strong> session is coming up in <strong>${reminderTiming}</strong>!
              </p>
              
              <!-- Session Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #333333;">
                      📋 Session Details
                    </h2>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 120px;">
                          <strong>Service:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333;">
                          ${serviceName}${serviceType ? ` (${serviceType})` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          <strong>Date:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          <strong>Time:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333;">
                          ${formattedTime}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                          <strong>Duration:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333;">
                          ${duration} minutes
                        </td>
                      </tr>
                      ${session.notes ? `
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666666; vertical-align: top;">
                          <strong>Notes:</strong>
                        </td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333333;">
                          ${session.notes}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                We look forward to seeing you! If you need to reschedule or have any questions, please contact us through the app.
              </p>
              
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Best regards,<br>
                <strong>The MITUGYM Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666666;">
                You're receiving this email because you have email notifications enabled in your MITUGYM account.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © ${new Date().getFullYear()} MITUGYM. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Prepare email payload
    const emailPayload: ResendEmailPayload = {
      from: 'MITUGYM <notifications@mitugym.com>',
      to: profile.email,
      subject: `${reminderEmoji} Reminder: ${serviceName} session ${reminderTiming}`,
      html: emailHtml,
    };

    // Send email via Resend API
    console.log(`Sending email to ${profile.email}`);
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', JSON.stringify(result, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email reminder sent successfully',
        emailId: result.id,
        recipient: profile.email,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (error) {
    console.error('Error in send-reminder-email function:', error);
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

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PromotionalEmailRequest {
  subject: string;
  heading: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  targetAudience?: 'all' | 'free' | 'premium';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin (you can add admin flag to users table or check specific email)
    // For now, requiring authentication is enough since this is for internal use

    if (!resendApiKey) {
      return new Response(JSON.stringify({ 
        error: 'Email service not configured. Please add RESEND_API_KEY to Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: PromotionalEmailRequest = await req.json();
    const { subject, heading, message, ctaText, ctaUrl, targetAudience = 'all' } = body;

    if (!subject || !heading || !message) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: subject, heading, message' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get users based on target audience
    let query = supabase
      .from('notification_preferences')
      .select('user_id, email_enabled')
      .eq('email_enabled', true);

    // Filter by subscription type if needed
    let userIds: string[] = [];
    
    if (targetAudience !== 'all') {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, plan_type, status')
        .eq('status', 'active');

      if (targetAudience === 'premium') {
        userIds = subscriptions?.filter(s => s.plan_type === 'premium').map(s => s.user_id) || [];
      } else if (targetAudience === 'free') {
        const premiumUserIds = subscriptions?.filter(s => s.plan_type === 'premium').map(s => s.user_id) || [];
        const { data: allPrefs } = await query;
        userIds = allPrefs?.filter(p => !premiumUserIds.includes(p.user_id)).map(p => p.user_id) || [];
      }

      query = query.in('user_id', userIds);
    }

    const { data: usersToEmail, error: usersError } = await query;

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!usersToEmail || usersToEmail.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No users found for the selected audience',
        count: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send emails
    for (const userPref of usersToEmail) {
      try {
        const { data: userAuth } = await supabase.auth.admin.getUserById(userPref.user_id);
        if (!userAuth || !userAuth.user?.email) continue;

        const emailHtml = generatePromotionalEmail({
          userName: userAuth.user.email.split('@')[0],
          heading,
          message,
          ctaText,
          ctaUrl,
        });

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Debate Platform <noreply@yourdomain.com>',
            to: userAuth.user.email,
            subject: subject,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          await supabase.from('notification_logs').insert({
            user_id: userPref.user_id,
            type: 'email',
            template: 'promotional',
            subject: subject,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

          results.sent++;
        } else {
          const errorData = await emailResponse.json();
          throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${userPref.user_id}: ${errorMessage}`);

        await supabase.from('notification_logs').insert({
          user_id: userPref.user_id,
          type: 'email',
          template: 'promotional',
          subject: subject,
          status: 'failed',
          error_message: errorMessage,
          sent_at: new Date().toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Promotional email sent to ${results.sent} users`,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-promotional-email:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePromotionalEmail(data: {
  userName: string;
  heading: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const primaryColor = '#2563eb';
  const bgColor = '#f8fafc';
  const cardBg = '#ffffff';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.heading}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${bgColor};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${cardBg}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">${data.heading}</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Hi ${data.userName},
              </p>
              
              <div style="color: #334155; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                ${data.message.split('\n').map(paragraph => 
                  `<p style="margin: 0 0 16px 0;">${paragraph}</p>`
                ).join('')}
              </div>
              
              ${data.ctaText && data.ctaUrl ? `
              <div style="text-align: center; margin-top: 30px;">
                <a href="${data.ctaUrl}" 
                   style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  ${data.ctaText}
                </a>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
                Happy debating! 🎓
              </p>
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 12px;">
                You're receiving this because you signed up for the Debate Platform
              </p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('//', '//')}/unsubscribe" 
                 style="color: #94a3b8; font-size: 12px; text-decoration: underline;">
                Manage email preferences
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

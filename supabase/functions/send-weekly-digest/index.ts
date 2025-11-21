import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UserStats {
  email: string;
  userName: string;
  totalDebates: number;
  lastWeekDebates: number;
  averageScore: number;
  topStrengths: string[];
  improvementAreas: string[];
  isPremium: boolean;
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

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Email service not configured. Please add RESEND_API_KEY to Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all users who should receive emails
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: usersToEmail, error: usersError } = await supabase
      .from('notification_preferences')
      .select('user_id, email_enabled, email_frequency, last_email_sent')
      .eq('email_enabled', true)
      .or(`last_email_sent.is.null,last_email_sent.lt.${oneWeekAgo.toISOString()}`);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!usersToEmail || usersToEmail.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No users to email at this time',
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

    // Process each user
    for (const userPref of usersToEmail) {
      try {
        // Get user details
        const { data: user } = await supabase.auth.admin.getUserById(userPref.user_id);
        if (!user || !user.user?.email) continue;

        // Get user stats from last 7 days
        const { data: recentSessions } = await supabase
          .from('debate_sessions')
          .select('id, created_at')
          .eq('user_id', userPref.user_id)
          .gte('created_at', oneWeekAgo.toISOString());

        const { data: allSessions } = await supabase
          .from('debate_sessions')
          .select('id')
          .eq('user_id', userPref.user_id);

        // Get recent analysis
        const { data: recentAnalysis } = await supabase
          .from('debate_analysis')
          .select('overall_score, strengths, weaknesses')
          .eq('user_id', userPref.user_id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate stats
        const totalDebates = allSessions?.length || 0;
        const lastWeekDebates = recentSessions?.length || 0;
        const averageScore = recentAnalysis && recentAnalysis.length > 0
          ? Math.round(recentAnalysis.reduce((sum, a) => sum + (a.overall_score || 0), 0) / recentAnalysis.length)
          : 0;

        // Get top strengths and weaknesses
        const allStrengths = recentAnalysis?.flatMap(a => a.strengths || []) || [];
        const allWeaknesses = recentAnalysis?.flatMap(a => a.weaknesses || []) || [];
        const topStrengths = [...new Set(allStrengths)].slice(0, 3);
        const improvementAreas = [...new Set(allWeaknesses)].slice(0, 3);

        // Check subscription status
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan_type, status')
          .eq('user_id', userPref.user_id)
          .eq('status', 'active')
          .maybeSingle();

        const isPremium = subscription?.plan_type === 'premium';

        const userStats: UserStats = {
          email: user.user.email,
          userName: user.user.email.split('@')[0],
          totalDebates,
          lastWeekDebates,
          averageScore,
          topStrengths,
          improvementAreas,
          isPremium,
        };

        // Generate email HTML
        const emailHtml = generateWeeklyDigestEmail(userStats);

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Debate Platform <noreply@yourdomain.com>',
            to: userStats.email,
            subject: `Your Weekly Debate Summary - ${lastWeekDebates} debates this week! 🎯`,
            html: emailHtml,
          }),
        });

        if (emailResponse.ok) {
          // Log success
          await supabase.from('notification_logs').insert({
            user_id: userPref.user_id,
            type: 'email',
            template: 'weekly_digest',
            subject: `Your Weekly Debate Summary - ${lastWeekDebates} debates this week!`,
            status: 'sent',
            sent_at: new Date().toISOString(),
          });

          // Update last_email_sent
          await supabase
            .from('notification_preferences')
            .update({ last_email_sent: new Date().toISOString() })
            .eq('user_id', userPref.user_id);

          results.sent++;
        } else {
          const errorData = await emailResponse.json();
          throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`User ${userPref.user_id}: ${errorMessage}`);

        // Log failure
        await supabase.from('notification_logs').insert({
          user_id: userPref.user_id,
          type: 'email',
          template: 'weekly_digest',
          subject: 'Weekly Digest',
          status: 'failed',
          error_message: errorMessage,
          sent_at: new Date().toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Weekly digest sent to ${results.sent} users`,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-weekly-digest:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWeeklyDigestEmail(stats: UserStats): string {
  const primaryColor = '#2563eb';
  const bgColor = '#f8fafc';
  const cardBg = '#ffffff';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Debate Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${bgColor};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${cardBg}; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, #1e40af 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">Your Weekly Debate Summary</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Hello, ${stats.userName}!</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 30px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                Here's how you performed this week on the Debate Platform. Keep up the great work! 🎉
              </p>
              
              <!-- Stats Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td width="48%" style="background-color: #eff6ff; border-radius: 8px; padding: 20px; vertical-align: top;">
                    <h3 style="margin: 0 0 8px 0; color: ${primaryColor}; font-size: 32px; font-weight: 700;">${stats.lastWeekDebates}</h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Debates This Week</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; vertical-align: top;">
                    <h3 style="margin: 0 0 8px 0; color: #16a34a; font-size: 32px; font-weight: 700;">${stats.totalDebates}</h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Total Debates</p>
                  </td>
                </tr>
              </table>
              
              ${stats.averageScore > 0 ? `
              <!-- Average Score -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: #d97706; font-size: 32px; font-weight: 700;">${stats.averageScore}/100</h3>
                <p style="margin: 0; color: #92400e; font-size: 14px;">Average Score This Week</p>
              </div>
              ` : ''}
              
              ${stats.topStrengths.length > 0 ? `
              <!-- Strengths -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">💪 Your Top Strengths</h2>
                ${stats.topStrengths.map(strength => `
                  <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 8px; border-radius: 4px;">
                    <p style="margin: 0; color: #334155; font-size: 14px;">${strength}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${stats.improvementAreas.length > 0 ? `
              <!-- Areas to Improve -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 20px; font-weight: 600;">🎯 Areas to Improve</h2>
                ${stats.improvementAreas.map(area => `
                  <div style="background-color: #fef2f2; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-bottom: 8px; border-radius: 4px;">
                    <p style="margin: 0; color: #334155; font-size: 14px;">${area}</p>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${!stats.isPremium ? `
              <!-- Premium CTA -->
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 8px; padding: 30px; text-align: center; margin-top: 30px;">
                <h2 style="margin: 0 0 12px 0; color: white; font-size: 22px; font-weight: 700;">🚀 Unlock Premium Features</h2>
                <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.9); font-size: 15px; line-height: 1.6;">
                  Get unlimited debates, detailed AI analysis, and exclusive resources
                </p>
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('//', '//')}/upgrade" 
                   style="display: inline-block; background-color: white; color: #7c3aed; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Upgrade to Premium
                </a>
              </div>
              ` : `
              <!-- Premium Thank You -->
              <div style="background-color: #faf5ff; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: #7c3aed; font-size: 15px; font-weight: 600;">✨ Thank you for being a Premium member!</p>
              </div>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
                Keep debating, keep improving! 🎓
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

# Email Notification System Setup Guide

This guide will help you set up the weekly email digest and promotional email system using Resend.

## Features

### Weekly Digest Email (Automated)
- Sent every Monday at 10:00 AM UTC
- Personalized stats for each user:
  - Debates this week vs total debates
  - Average performance score
  - Top strengths identified by AI
  - Areas for improvement
  - Premium upgrade CTA (for free users)
- Beautiful HTML email template
- Automatic tracking in database

### Promotional Emails (On-Demand)
- Send custom marketing campaigns
- Target specific audiences: all users, free users, or premium users
- Custom subject, heading, message, and CTA
- Tracking and analytics

## Setup Instructions

### Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Resend API Key

1. Log in to [Resend Dashboard](https://resend.com/dashboard)
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name like "Debate Platform Production"
5. Copy the API key (starts with `re_`)

### Step 3: Configure Domain (Important!)

**For Production:**
1. Go to **Domains** in Resend Dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)
6. Update the edge functions to use: `from: 'Debate Platform <noreply@yourdomain.com>'`

**For Testing:**
1. Resend provides a test domain for development
2. You can send to your own email addresses
3. Limited to 100 emails/day on free tier

### Step 4: Add API Key to Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions**
4. Scroll to **Secrets** section
5. Click **Add Secret**
6. Add:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key (e.g., `re_123abc...`)
7. Click **Save**

### Step 5: Setup Weekly Cron Job

1. In Supabase Dashboard, go to **Database** → **Cron Jobs**
2. Click **Create a new cron job**
3. Configure:
   - **Name**: `send-weekly-digest-emails`
   - **Schedule**: `0 10 * * 1` (Every Monday at 10:00 AM UTC)
   - **SQL Command**:
   ```sql
   SELECT net.http_post(
     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-weekly-digest',
     headers := '{"Content-Type": "application/json"}'::jsonb
   );
   ```
4. Replace `YOUR_PROJECT_REF` with your actual Supabase project reference
5. Click **Create**

### Step 6: Test the System

#### Test Weekly Digest Manually:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-weekly-digest \
  -H "Content-Type: application/json"
```

#### Test Promotional Email:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-promotional-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -d '{
    "subject": "Special Offer: 30% Off Premium!",
    "heading": "Limited Time Offer",
    "message": "Upgrade to Premium today and get 30% off your first month!\n\nUnlock unlimited debates, AI-powered feedback, and exclusive resources.",
    "ctaText": "Claim Your Discount",
    "ctaUrl": "https://yourdomain.com/upgrade",
    "targetAudience": "free"
  }'
```

## Database Schema

### `notification_preferences`
Stores user email preferences:
- `user_id` - References auth.users
- `email_enabled` - Whether user wants emails (default: true)
- `email_frequency` - 'weekly', 'biweekly', 'monthly', or 'never'
- `last_email_sent` - Timestamp of last email sent

### `notification_logs`
Tracks all sent emails:
- `user_id` - Who received the email
- `type` - 'email' or 'whatsapp'
- `template` - 'weekly_digest', 'promotional', etc.
- `subject` - Email subject line
- `status` - 'sent', 'failed', 'bounced', 'pending'
- `error_message` - Error details if failed
- `sent_at` - When email was sent

## User Preferences Management

Users are automatically opted-in to weekly emails when they sign up. They can manage preferences by updating the `notification_preferences` table.

### Example: Opt Out of Emails

```sql
UPDATE notification_preferences
SET email_enabled = false
WHERE user_id = auth.uid();
```

### Example: Change Frequency

```sql
UPDATE notification_preferences
SET email_frequency = 'monthly'
WHERE user_id = auth.uid();
```

## Email Content Customization

### Weekly Digest
Edit the `generateWeeklyDigestEmail()` function in:
`supabase/functions/send-weekly-digest/index.ts`

### Promotional Emails
Edit the `generatePromotionalEmail()` function in:
`supabase/functions/send-promotional-email/index.ts`

## Monitoring & Analytics

### View Email Logs

```sql
SELECT
  nl.created_at,
  nl.type,
  nl.template,
  nl.subject,
  nl.status,
  u.email
FROM notification_logs nl
JOIN auth.users u ON u.id = nl.user_id
ORDER BY nl.created_at DESC
LIMIT 100;
```

### Check Email Success Rate

```sql
SELECT
  template,
  status,
  COUNT(*) as count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY template) as percentage
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY template, status
ORDER BY template, status;
```

### Users Who Haven't Received Recent Emails

```sql
SELECT
  u.email,
  np.last_email_sent
FROM auth.users u
JOIN notification_preferences np ON np.user_id = u.id
WHERE np.email_enabled = true
  AND (np.last_email_sent IS NULL OR np.last_email_sent < NOW() - INTERVAL '7 days')
ORDER BY np.last_email_sent ASC NULLS FIRST;
```

## Resend Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- Perfect for testing and small user bases

**Paid Plans:**
- $20/month: 50,000 emails
- $80/month: 1,000,000 emails
- No daily limits on paid plans

## Best Practices

1. **Always test with your own email first** before sending to all users
2. **Monitor bounce rates** - High bounce rates can affect deliverability
3. **Respect user preferences** - Always honor opt-outs
4. **Keep emails concise** - Users are more likely to engage with short, valuable content
5. **A/B test subject lines** - Track open rates to optimize
6. **Include unsubscribe link** - Required by law and improves trust
7. **Use personalization** - Emails with user's name/stats get higher engagement

## Troubleshooting

### Emails Not Sending

1. **Check RESEND_API_KEY is set correctly** in Supabase secrets
2. **Verify domain** is configured and verified in Resend
3. **Check notification_logs** for error messages
4. **Ensure users have email_enabled = true**

### Emails Going to Spam

1. **Configure SPF, DKIM, DMARC** records for your domain
2. **Use a verified domain** (not test domain)
3. **Avoid spammy words** in subject lines
4. **Include physical address** in email footer
5. **Maintain clean list** - Remove bounced emails

### Cron Job Not Running

1. **Check cron job is enabled** in Supabase Dashboard
2. **Verify schedule syntax** is correct
3. **Check database logs** for execution errors
4. **Test edge function manually** first

## Support

**Resend Support:**
- Documentation: https://resend.com/docs
- Support: support@resend.com

**Email Deliverability Issues:**
- Check Resend Dashboard for delivery analytics
- Review notification_logs for error patterns
- Consult Resend's deliverability guide

## Next Steps

- [ ] Sign up for Resend account
- [ ] Get API key and add to Supabase secrets
- [ ] Configure and verify your domain
- [ ] Set up weekly cron job
- [ ] Send test emails
- [ ] Monitor logs and analytics
- [ ] Customize email templates to match your brand

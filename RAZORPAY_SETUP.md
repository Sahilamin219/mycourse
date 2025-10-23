# Razorpay Payment Integration Setup

This guide will help you set up Razorpay for payment processing in the debate platform.

## Features

- **Multiple Payment Methods Supported:**
  - UPI (PhonePe, Google Pay, Paytm, etc.)
  - Credit/Debit Cards
  - Net Banking
  - Wallets

- **Premium Subscription Benefits:**
  - Unlimited debates per day (free users: 2/day)
  - Detailed performance feedback after each debate
  - AI-powered insights
  - Exclusive learning resources
  - Priority matching
  - HD video quality

## Setup Instructions

### 1. Create a Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" and create an account
3. Complete the KYC verification process
4. Once verified, you'll get access to the Dashboard

### 2. Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Click on "Generate Test Key" (for testing) or "Generate Live Key" (for production)
4. You'll get two keys:
   - **Key ID**: Starts with `rzp_test_` or `rzp_live_`
   - **Key Secret**: Keep this private and secure

### 3. Configure the Application

#### Update Frontend (PricingModal.tsx)

Replace the placeholder in `src/components/PricingModal.tsx`:

```typescript
const options = {
  key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your actual Key ID
  // ... rest of the options
};
```

#### Update Edge Function (Optional)

The edge function `supabase/functions/razorpay-payment/index.ts` can be enhanced with signature verification for production:

```typescript
// Add Razorpay verification
import crypto from 'crypto';

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
  const message = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(message)
    .digest('hex');
  return expectedSignature === signature;
}
```

## Testing

### Test Cards (Razorpay Test Mode)

Use these test cards for testing payments:

**Success:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits

**UPI:**
- UPI ID: `success@razorpay`
- Success response will be received

**Net Banking:**
- Select any bank
- Use "Success" option for successful payment

### Test Mode vs Live Mode

**Test Mode:**
- Use test API keys (starting with `rzp_test_`)
- No real money is processed
- Perfect for development and testing

**Live Mode:**
- Use live API keys (starting with `rzp_live_`)
- Real payments are processed
- Requires complete KYC verification

## Pricing

Current pricing for Premium subscription:
- **₹499/month**
- Billed monthly
- Cancel anytime

## Database Schema

The following tables handle subscriptions and payments:

### `subscriptions`
- Tracks user subscription status
- `plan_type`: 'free' or 'premium'
- `status`: 'active', 'cancelled', or 'expired'
- `end_date`: Subscription expiry date

### `payments`
- Records all payment transactions
- `razorpay_order_id`: Razorpay order identifier
- `razorpay_payment_id`: Razorpay payment identifier
- `status`: 'pending', 'completed', 'failed', or 'refunded'

### `debate_sessions_tracking`
- Tracks debate sessions for usage limits
- Free users: Limited to 2 debates per day
- Premium users: Unlimited debates

## API Endpoints

### Create Order
- **Endpoint**: `/functions/v1/razorpay-payment/create-order`
- **Method**: POST
- **Body**: `{ planType: 'premium', amount: 49900 }`
- **Returns**: Order ID and amount

### Verify Payment
- **Endpoint**: `/functions/v1/razorpay-payment/verify-payment`
- **Method**: POST
- **Body**: Razorpay payment response
- **Returns**: Subscription details

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data
3. **Enable webhook signature verification** in production
4. **Implement rate limiting** on payment endpoints
5. **Log all payment transactions** for auditing
6. **Use HTTPS** for all payment communications

## Support

For Razorpay support:
- Email: support@razorpay.com
- Documentation: https://razorpay.com/docs/

For platform issues:
- Check browser console for errors
- Verify Supabase connection
- Ensure Razorpay SDK is loaded

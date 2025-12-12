# Stripe Webhook Setup for Spin Credits

This guide explains how to set up the Stripe webhook to automatically credit spin credits to users when they make a purchase.

## Why Webhooks?

Webhooks are more reliable than relying on the success page redirect because:
- They work even if the user closes the browser before the redirect completes
- They're server-side and don't depend on client-side execution
- They're Stripe's recommended way to handle payment confirmations

## Setup Instructions

### 1. Get Your Webhook Secret

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL:
   - **Production**: `https://hagiaesthetics.store/api/webhooks/stripe`
   - **Development**: `https://your-domain.com/api/webhooks/stripe` (or use Stripe CLI for local testing)
5. Select the event: `checkout.session.completed`
6. Click **Add endpoint**
7. After creating, click on the endpoint to reveal the **Signing secret** (starts with `whsec_`)
8. Copy this secret

### 2. Add Webhook Secret to Environment Variables

Add the webhook secret to your `.env` file (or your hosting platform's environment variables):

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Important**: 
- For production, use the webhook secret from your live Stripe account
- For development, you can use Stripe CLI to test locally (see below)

### 3. Test the Webhook (Optional - Local Development)

If you want to test locally using Stripe CLI:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. This will give you a webhook secret starting with `whsec_` - use this in your local `.env`

### 4. Verify It's Working

After setup:
1. Make a test spin credit purchase
2. Check your server logs for: `"Processing spin credit purchase: User [userId], Amount: [amount] cents"`
3. Check your server logs for: `"Successfully updated spin credits for user [userId]"`
4. Verify the user's credits were updated in Supabase

## How It Works

1. User purchases spin credits via Stripe checkout
2. Stripe sends a `checkout.session.completed` event to your webhook endpoint
3. The webhook verifies the event signature
4. If it's a spin credit purchase (`metadata.source === 'spinwheel_topup'`), it:
   - Fetches the user's current credits
   - Adds the purchased amount
   - Updates the user's metadata in Supabase
   - Marks the session as processed to prevent double-crediting

## Double-Credit Prevention

The system prevents double-crediting by:
- Storing processed session IDs in user metadata
- Checking if a session was already processed before adding credits
- Both the webhook and success page use this check

## Troubleshooting

**Webhook not receiving events:**
- Verify the webhook URL is correct and accessible
- Check that the event type `checkout.session.completed` is selected
- Ensure your server is running and the endpoint is accessible

**Credits not being added:**
- Check server logs for error messages
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that the user ID is present in the session metadata

**Double-crediting:**
- The system should prevent this automatically
- If it happens, check that `processed_spin_sessions` is being stored correctly in user metadata


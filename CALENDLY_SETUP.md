# Calendly Booking System Setup Guide

## Overview
This booking system integrates Calendly with your Hagi Aesthetics website. When customers book appointments through Calendly, you'll receive email notifications at `hagiaesthetics@gmail.com` with all booking details.

## Prerequisites

1. **Calendly Account**: You need a Calendly account (free or paid)
2. **Calendly Event Type**: Create at least one event type in your Calendly account
3. **Resend API Key** (optional but recommended): For email delivery in production

## Step 1: Get Your Calendly URL

1. Log in to your Calendly account
2. Go to **Event Types** in the left sidebar
3. Click on the event type you want to use (or create a new one)
4. Click **Share** or **Embed**
5. Copy the **Event Link** (it will look like: `https://calendly.com/your-username/your-event-type`)

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Calendly Configuration
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/your-event-type

# Optional: For webhook signature verification (recommended for production)
CALENDLY_WEBHOOK_SECRET=your_webhook_secret_here

# Email Configuration (if using Resend)
RESEND_API_KEY=your_resend_api_key_here
```

**Important:**
- Replace `your-username` and `your-event-type` with your actual Calendly details
- The `NEXT_PUBLIC_CALENDLY_URL` is required for the booking page to work
- `CALENDLY_WEBHOOK_SECRET` is optional but recommended for security
- `RESEND_API_KEY` is optional (emails will log to console if not set)

## Step 3: Set Up Calendly Webhook

To receive email notifications when bookings are made:

1. **Log in to Calendly**
2. Go to **Integrations** → **Webhooks**
3. Click **+ New Webhook**
4. Configure the webhook:
   - **Event**: Select `invitee.created` (this fires when someone books)
   - **URL**: `https://your-domain.com/api/webhooks/calendly`
     - For local testing: Use a service like ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/calendly`
   - **Signing Key**: Copy this and add it to `CALENDLY_WEBHOOK_SECRET` in your `.env.local`
5. Click **Add Webhook**

## Step 4: Test the Integration

### Test the Booking Page

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/book-us`
3. You should see the Calendly booking widget
4. Try booking a test appointment

### Test the Webhook

1. Make a test booking through the Calendly widget
2. Check your server logs - you should see:
   ```
   Calendly webhook received: { eventType: 'invitee.created', ... }
   Booking email sent successfully for: customer@email.com
   ```
3. Check `hagiaesthetics@gmail.com` for the booking notification email

## Step 5: Customize Your Calendly Event Type

In your Calendly account, you can customize:

1. **Event Name**: The name of your consultation/service
2. **Duration**: How long each booking lasts
3. **Questions**: Add custom questions (e.g., "What is the purpose of your consultation?")
4. **Availability**: Set your available times
5. **Timezone**: Set your timezone

All this information will be included in the email notifications.

## Email Notification Details

When a booking is made, you'll receive an email with:

- ✅ **Booking Details**: Event type, scheduled time, duration
- ✅ **Customer Information**: Name, email, phone number
- ✅ **Questions & Answers**: Any custom questions and their answers
- ✅ **Additional Notes**: Any notes from the customer
- ✅ **Booking Links**: Direct links to the booking

## Troubleshooting

### Calendly Widget Not Showing

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_CALENDLY_URL` is set correctly
2. **Check Browser Console**: Look for JavaScript errors
3. **Verify URL Format**: Should be `https://calendly.com/username/event-type`

### Webhook Not Receiving Events

1. **Check Webhook URL**: Ensure it's publicly accessible (use ngrok for local testing)
2. **Verify Webhook Status**: Check in Calendly dashboard if webhook is active
3. **Check Server Logs**: Look for webhook requests in your server logs
4. **Test Webhook**: Use Calendly's webhook test feature

### Emails Not Sending

1. **Check Resend API Key**: If using Resend, verify the API key is correct
2. **Check Console Logs**: Emails will log to console if Resend is not configured
3. **Verify Email Address**: Ensure `hagiaesthetics@gmail.com` is correct in the code

### Signature Verification Failing

1. **Check Secret**: Ensure `CALENDLY_WEBHOOK_SECRET` matches the signing key from Calendly
2. **Check Headers**: Verify Calendly is sending the signature header
3. **Development Mode**: Signature verification is skipped if secret is not set (for development)

## Production Deployment

Before deploying to production:

1. ✅ Set `NEXT_PUBLIC_CALENDLY_URL` in your hosting environment
2. ✅ Set `CALENDLY_WEBHOOK_SECRET` for security
3. ✅ Set `RESEND_API_KEY` for email delivery
4. ✅ Update webhook URL in Calendly to your production domain
5. ✅ Test the complete booking flow in production

## Security Notes

- **Webhook Signature**: Always verify webhook signatures in production
- **HTTPS**: Ensure your webhook endpoint uses HTTPS
- **Rate Limiting**: Consider adding rate limiting to the webhook endpoint
- **Error Handling**: Webhook errors are logged but don't fail the webhook (Calendly will retry)

## Support

If you encounter issues:

1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the webhook endpoint manually: `GET /api/webhooks/calendly` should return `{ status: 'ok' }`
4. Contact support if issues persist

---

**Last Updated**: Setup guide for Hagi Aesthetics booking system


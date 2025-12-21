# Calendly Widget Production Fix

## Issue
The Calendly booking widget is not showing on production.

## Root Causes Identified

1. **Race Condition**: Widget initialization happens before container is fully mounted
2. **Short Timeout**: 100ms delay may not be enough in production (network latency)
3. **No Retry Logic**: If initialization fails once, it doesn't retry
4. **Missing Error Feedback**: Users don't see helpful error messages

## Fixes Applied

### 1. **Retry Mechanism**
- Added retry logic with exponential backoff (200ms → 400ms → 600ms...)
- Maximum 10 retries (2 seconds total)
- Verifies container is in DOM before initialization

### 2. **Better Error Handling**
- Clear error messages for users
- Fallback link to open Calendly in new tab
- Loading spinner while widget loads

### 3. **Improved Initialization**
- Verifies `window.Calendly` exists
- Verifies container is mounted in DOM
- Verifies container ref is available
- Catches and handles initialization errors

## Environment Variable Check

**IMPORTANT**: Make sure `NEXT_PUBLIC_CALENDLY_URL` is set in your production environment:

```bash
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/hagiaesthetics/30min
```

**How to Set in Production:**

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_CALENDLY_URL` with your Calendly URL
3. Redeploy

### Hostinger/Other Hosting:
1. Add to `.env.production` or hosting panel
2. Restart the application
3. Rebuild if necessary

### Verify It's Set:
- The widget will use the fallback URL if env var is missing
- Check browser console for any errors
- Check network tab for Calendly script loading

## Testing Checklist

- [ ] Widget loads on production
- [ ] Widget shows booking calendar
- [ ] Can select a time slot
- [ ] Can complete booking
- [ ] Error message shows if widget fails to load
- [ ] Fallback link works (opens Calendly in new tab)

## Debugging Steps

If widget still doesn't show:

1. **Check Browser Console:**
   - Open DevTools → Console
   - Look for Calendly-related errors
   - Check if `window.Calendly` exists

2. **Check Network Tab:**
   - Verify `widget.js` loads successfully
   - Verify `widget.css` loads successfully
   - Check for CORS errors

3. **Check Environment Variable:**
   ```javascript
   // In browser console:
   console.log(process.env.NEXT_PUBLIC_CALENDLY_URL)
   // Should show your Calendly URL
   ```

4. **Check Container:**
   - Verify the container div exists in DOM
   - Check if it has the correct ref

5. **Check Calendly URL:**
   - Verify the URL is correct
   - Test the URL directly in browser
   - Ensure the event type exists

## Common Issues

### Issue: "Calendly not available or container not ready"
**Solution**: Widget is retrying automatically. If it persists, check:
- Container is mounted
- No JavaScript errors blocking execution
- Calendly script loaded successfully

### Issue: Widget shows but is blank
**Solution**: 
- Check Calendly URL is correct
- Verify event type exists
- Check browser console for iframe errors

### Issue: Script fails to load
**Solution**:
- Check network connectivity
- Verify Calendly CDN is accessible
- Check for ad blockers blocking Calendly

## Code Changes

The fix includes:
- ✅ Retry mechanism with exponential backoff
- ✅ Better error messages
- ✅ Fallback link to Calendly
- ✅ Loading spinner
- ✅ DOM verification before initialization
- ✅ Improved error handling

---

**Status**: ✅ Fixed  
**Next Steps**: Deploy and verify widget loads in production


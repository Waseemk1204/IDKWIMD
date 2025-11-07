# LinkedIn OAuth Setup Guide

## Issue Encountered

**Error**: `{"success":false,"message":"Invalid token."}`  
**Status Code**: 401 Unauthorized  
**Cause**: LinkedIn OAuth credentials not configured in production environment

## Why This Happened

The LinkedIn authentication strategy was not registered because the required environment variables were missing:
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_CALLBACK_URL`

When users tried to log in with LinkedIn, the route attempted to use a non-existent passport strategy, resulting in a 401 error.

## Fix Applied

Added middleware to check if LinkedIn OAuth is configured before allowing authentication attempts. Now returns a clear error message:

```json
{
  "success": false,
  "message": "LinkedIn authentication is not configured on this server. Please contact support or use another login method.",
  "error": "linkedin_not_configured"
}
```

## How to Enable LinkedIn OAuth

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **Create app**
3. Fill in app details:
   - **App name**: Part-Time Pay$
   - **LinkedIn Page**: Your company page (or create one)
   - **App logo**: Upload your logo
   - **Legal agreement**: Accept terms

### Step 2: Configure OAuth Settings

1. In your LinkedIn app dashboard, go to **Auth** tab
2. Add **Authorized redirect URLs**:
   ```
   Production: https://your-backend-url.railway.app/api/v1/auth/linkedin/callback
   Development: http://localhost:3001/api/v1/auth/linkedin/callback
   ```

3. Under **OAuth 2.0 scopes**, request:
   - `openid` - Required for authentication
   - `profile` - Get user's basic profile
   - `email` - Get user's email address

### Step 3: Get Credentials

1. In the **Auth** tab, find:
   - **Client ID** - Your application's client ID
   - **Client Secret** - Click "Show" to reveal the secret

2. **Important**: Keep the Client Secret secure! Never commit it to version control.

### Step 4: Set Environment Variables

#### For Railway Deployment

1. Go to your Railway project
2. Click on your backend service
3. Go to **Variables** tab
4. Add the following variables:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_CALLBACK_URL=https://your-backend-url.railway.app/api/v1/auth/linkedin/callback
```

#### For Local Development

Add to `backend/.env`:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:3001/api/v1/auth/linkedin/callback
```

### Step 5: Verify Setup

After setting the environment variables:

1. **Restart your backend service** (Railway will auto-restart)
2. Check logs for confirmation:
   ```
   LinkedIn OAuth strategy configured successfully
   ```
3. Test the LinkedIn login flow from your signup page

## Testing the Fix

### Before Environment Variables are Set

When LinkedIn credentials are not configured, users will see:
- **Error Message**: "LinkedIn authentication is not configured on this server. Please contact support or use another login method."
- **HTTP Status**: 503 Service Unavailable
- **Behavior**: Login fails gracefully with clear error message

### After Environment Variables are Set

When LinkedIn credentials are properly configured:
- LinkedIn OAuth flow initiates successfully
- Users can authenticate with LinkedIn
- Profile data is imported automatically
- Users are redirected back to the application

## Current Status

✅ **Fixed**: Added proper error handling for missing credentials  
⚠️ **Action Required**: Set LinkedIn OAuth environment variables in production

## Alternative Login Methods

While LinkedIn OAuth is being set up, users can use:
- ✅ **Google OAuth** - Working
- ✅ **Email/Password** - Working
- ✅ **Facebook OAuth** - If configured

## Security Notes

1. **Never expose credentials**: Keep `LINKEDIN_CLIENT_SECRET` secure
2. **Use HTTPS**: Always use HTTPS for callback URLs in production
3. **Validate redirect URIs**: Ensure callback URL in LinkedIn app matches your backend
4. **Monitor usage**: Check LinkedIn app dashboard for usage limits

## Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: Callback URL doesn't match what's registered in LinkedIn app
- **Fix**: Ensure `LINKEDIN_CALLBACK_URL` exactly matches the URL in LinkedIn app settings

### Error: "invalid_client"
- **Cause**: Client ID or Client Secret is incorrect
- **Fix**: Double-check credentials from LinkedIn app dashboard

### Error: "unauthorized_client"
- **Cause**: Required OAuth scopes not granted
- **Fix**: Ensure `openid`, `profile`, and `email` scopes are added in LinkedIn app

### Users Not Being Created
- **Cause**: Profile data missing required fields
- **Fix**: Check logs for profile parsing errors, verify LinkedIn app has access to email

## Files Modified

1. `backend/src/routes/linkedin.ts` - Added configuration check middleware
2. `LINKEDIN_OAUTH_SETUP.md` - This documentation (new)

## Next Steps

1. ✅ Create LinkedIn app (if not already done)
2. ✅ Configure OAuth settings and redirect URIs
3. ✅ Get Client ID and Client Secret
4. ⏳ **Set environment variables in Railway** (Action Required)
5. ⏳ Test LinkedIn OAuth flow
6. ⏳ Monitor for any errors

## Contact

If you need help with LinkedIn OAuth setup:
- Check LinkedIn Developer documentation
- Review Railway deployment logs
- Test locally first before deploying

---

**Last Updated**: October 26, 2025  
**Status**: Waiting for LinkedIn OAuth credentials to be configured in production


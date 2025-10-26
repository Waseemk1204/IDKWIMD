# LinkedIn OAuth Setup Verification

## Quick Verification Checklist

### ✅ Environment Variables in Railway

Verify these are set in your Railway backend service:

1. Go to Railway → Your Backend Service → **Variables** tab
2. Confirm these variables exist:

```env
LINKEDIN_CLIENT_ID=78xxxxxxxxxx (should be ~15 characters)
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxx (should be ~16-20 characters)
LINKEDIN_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/linkedin/callback
```

**Important**: After adding/changing environment variables, Railway automatically redeploys.

### ✅ LinkedIn App Settings

Verify in [LinkedIn Developers Console](https://www.linkedin.com/developers/):

1. **Auth** tab → **OAuth 2.0 settings**
2. **Authorized redirect URLs** should include:
   ```
   https://your-backend-url.railway.app/api/v1/auth/linkedin/callback
   ```
3. **OAuth 2.0 scopes** should include:
   - ✅ `openid`
   - ✅ `profile`
   - ✅ `email`

### ✅ Deployment Status

Check if the latest deployment is live:

1. Go to Railway → Your Backend Service → **Deployments**
2. Look for the latest deployment (commit `314b874`)
3. Status should be: **✅ Success** or **🟢 Active**
4. Check logs for:
   ```
   🚀 Server running on 0.0.0.0:3001
   ```

## Testing the Fix

### Test 1: Check if LinkedIn Strategy is Loaded

Look for this in your Railway logs (after restart):
```
LinkedIn OAuth strategy configured successfully
```

**OR**

If credentials are missing, you should see:
```
LinkedIn OAuth credentials not configured. LinkedIn authentication will not be available.
```

### Test 2: Try LinkedIn Login

1. Go to your signup page: https://parttimepays.in/signup
2. Click **"Continue with LinkedIn"**
3. **Expected Behaviors**:

   **If properly configured** ✅:
   - Redirects to LinkedIn authorization page
   - User can authorize the app
   - Redirects back to your app with token
   - User is logged in successfully

   **If still not configured** ⚠️:
   - Shows error message immediately
   - Error: "LinkedIn authentication is not configured..."
   - HTTP Status: 503

   **If misconfigured** ❌:
   - May show LinkedIn error
   - Check error message for clues

### Test 3: Check Network Tab

If testing, open browser DevTools → Network tab:

1. Click "Continue with LinkedIn"
2. Check the request to `/api/v1/auth/linkedin?role=employee`
3. **Expected responses**:
   - ✅ **302 Redirect** to LinkedIn (if configured)
   - ⚠️ **503 with JSON error** (if credentials missing)
   - ❌ **401 "Invalid token"** (old error - shouldn't happen with fix)

## Common Issues & Solutions

### Issue 1: Still Getting 401 Error

**Cause**: Old deployment still running (before fix)  
**Solution**: 
- Check Railway deployment status
- Ensure commit `314b874` is deployed
- Force redeploy if needed: Railway → Service → ⚙️ → Redeploy

### Issue 2: Getting 503 Error

**Cause**: Environment variables not set  
**Solution**:
1. Verify variables in Railway dashboard
2. Check variable names are exactly:
   - `LINKEDIN_CLIENT_ID` (not `LINKEDIN_ID`)
   - `LINKEDIN_CLIENT_SECRET` (not `LINKEDIN_SECRET`)
3. Restart service after adding variables

### Issue 3: LinkedIn Says "redirect_uri_mismatch"

**Cause**: Callback URL mismatch  
**Solution**:
1. Get exact callback URL from Railway logs or variable
2. Add it to LinkedIn app's **Authorized redirect URLs**
3. Must match exactly (including https://)

### Issue 4: LinkedIn Asks for App Review

**Cause**: Some LinkedIn apps require review for production  
**Solution**:
1. Use app in development mode for testing
2. Submit for LinkedIn review when ready
3. Or use Google/Email login instead

## Expected Timeline

After setting environment variables:
- ⏱️ **1-2 minutes**: Railway redeploys automatically
- ⏱️ **~30 seconds**: New deployment starts receiving traffic
- ✅ **Immediately**: LinkedIn login should work

## Verify Fix is Live

Run this command to check if the fix is deployed:

```bash
curl -i https://your-backend-url.railway.app/api/v1/auth/linkedin?role=employee
```

**Expected response if configured**:
```
HTTP/1.1 302 Found
Location: https://www.linkedin.com/oauth/v2/authorization?...
```

**Expected response if not configured** (with fix):
```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{
  "success": false,
  "message": "LinkedIn authentication is not configured...",
  "error": "linkedin_not_configured"
}
```

**Old error** (before fix - shouldn't see this):
```
HTTP/1.1 401 Unauthorized
{"success":false,"message":"Invalid token."}
```

## Checklist Summary

Mark these as you verify:

- [ ] LinkedIn app created and configured
- [ ] OAuth redirect URL added to LinkedIn app
- [ ] `LINKEDIN_CLIENT_ID` set in Railway
- [ ] `LINKEDIN_CLIENT_SECRET` set in Railway
- [ ] `LINKEDIN_CALLBACK_URL` set in Railway
- [ ] Railway deployment successful (commit 314b874)
- [ ] Backend logs show "Server running"
- [ ] Tested LinkedIn login from signup page
- [ ] Users can successfully authenticate

## Need Help?

If LinkedIn still isn't working after verification:

1. **Share Railway logs** - Last 50 lines when clicking "Continue with LinkedIn"
2. **Share browser console errors** - F12 → Console tab
3. **Share Network request details** - Status code and response
4. **Verify environment variables** - Screenshot (hide the secrets!)

---

**Status**: Fix deployed (commit 314b874)  
**Next**: Verify environment variables and test


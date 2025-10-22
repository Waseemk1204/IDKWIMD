# 🔧 Fix LinkedIn OAuth on Deployed Site

## ❌ Current Issue

LinkedIn OAuth shows error:
```
The passed in client_id is invalid "your-linkedin-client-id"
```

## 🎯 Root Cause

The deployed frontend is using placeholder environment variables instead of real OAuth credentials.

---

## ✅ Solution: Add Environment Variables to Hosting

### **For Vercel Deployment:**

#### Step 1: Add Environment Variables

1. Go to https://vercel.com/dashboard
2. Click on your project: `parttimepays`
3. Navigate to: **Settings** → **Environment Variables**

#### Step 2: Add These Variables

**LinkedIn OAuth:**
```bash
Name: VITE_LINKEDIN_CLIENT_ID
Value: YOUR_LINKEDIN_CLIENT_ID (from LinkedIn Developer Console)
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```bash
Name: VITE_LINKEDIN_CLIENT_SECRET
Value: YOUR_LINKEDIN_CLIENT_SECRET (from LinkedIn Developer Console)
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```bash
Name: VITE_LINKEDIN_REDIRECT_URI
Value: https://parttimepays.in/auth/linkedin/callback
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**Google OAuth:**
```bash
Name: VITE_GOOGLE_CLIENT_ID
Value: YOUR_GOOGLE_CLIENT_ID (from Google Cloud Console)
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

```bash
Name: VITE_GOOGLE_CLIENT_SECRET
Value: YOUR_GOOGLE_CLIENT_SECRET (from Google Cloud Console)
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

**API Configuration:**
```bash
Name: VITE_API_URL
Value: https://parttimepays.in/api
Environments: ☑️ Production ☑️ Preview ☑️ Development
```

#### Step 3: Redeploy

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. **IMPORTANT:** Uncheck "Use existing Build Cache"
6. Click **Redeploy** button

⏱️ Wait 2-5 minutes for deployment to complete

#### Step 4: Verify

1. Visit https://parttimepays.in/login
2. Click "Continue with LinkedIn"
3. Should redirect to LinkedIn (not show error)

---

### **For Netlify Deployment:**

#### Step 1: Add Environment Variables

1. Go to https://app.netlify.com
2. Select your site
3. Navigate to: **Site settings** → **Environment variables**

#### Step 2: Add Variables

Click **Add a variable** for each:

| Key | Value |
|-----|-------|
| `VITE_LINKEDIN_CLIENT_ID` | `YOUR_LINKEDIN_CLIENT_ID` |
| `VITE_LINKEDIN_CLIENT_SECRET` | `YOUR_LINKEDIN_CLIENT_SECRET` |
| `VITE_LINKEDIN_REDIRECT_URI` | `https://parttimepays.in/auth/linkedin/callback` |
| `VITE_GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID` |
| `VITE_GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET` |
| `VITE_API_URL` | `https://parttimepays.in/api` |

**Environment:** Select "All" or "Production"

#### Step 3: Trigger Rebuild

1. Go to **Deploys** tab
2. Click **Trigger deploy** button
3. Select **Clear cache and deploy site**
4. Click **Deploy site**

⏱️ Wait 2-5 minutes for deployment

#### Step 4: Verify

1. Visit https://parttimepays.in/login
2. Click "Continue with LinkedIn"
3. Should redirect to LinkedIn

---

## 🔐 LinkedIn App Configuration

Also verify your LinkedIn app settings:

1. Go to https://www.linkedin.com/developers/apps
2. Select your app
3. Go to **Auth** tab
4. **Redirect URLs** should include:
   ```
   https://parttimepays.in/auth/linkedin/callback
   ```

5. If not present, add it and click **Update**

---

## 📋 Environment Variables Reference

**Complete `.env` file structure for local development:**

```bash
# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# API
VITE_API_URL=http://localhost:3001/api
```

**For production deployment, change:**
- Redirect URIs to `https://parttimepays.in/auth/...`
- API URL to `https://parttimepays.in/api`

---

## 🐛 Additional Issues from Console

### 1. Onboarding Save Endpoint (404)

**Issue:** `/api/v1/onboarding/save` returns 404

**Cause:** Backend route not created yet

**Impact:** Medium (localStorage fallback working)

**Fix:** Create the onboarding route in backend (already in code, needs deployment)

### 2. LinkedIn Extension Errors

**Issue:** Browser console showing LinkedIn extension errors

```
Cannot Find Company Name
bd4wlgg9kzz4u85nas4duu0py:192 Uncaught [object XMLHttpRequest]
```

**Cause:** LinkedIn browser extension trying to parse page

**Impact:** None (cosmetic, doesn't affect functionality)

**Fix:** Not needed (user's browser extension, not site issue)

---

## ✅ Testing Checklist

After redeployment, test:

- [ ] LinkedIn OAuth redirects to LinkedIn
- [ ] Google OAuth redirects to Google  
- [ ] Account creation works
- [ ] Onboarding saves to localStorage
- [ ] Dashboard loads after login
- [ ] No "invalid client_id" errors

---

## 🚀 Quick Fix Commands

If you need to verify environment variables locally:

```bash
# Check if .env file exists
cat .env

# Check environment variables in build
npm run build
# Look for VITE_* variables being replaced
```

---

## 📞 Need Help?

If LinkedIn OAuth still doesn't work after adding env vars and redeploying:

1. **Check Build Logs:**
   - Vercel: Deployments → Click deployment → View Function Logs
   - Netlify: Deploys → Click deploy → Deploy log

2. **Check if variables are loaded:**
   - Look for "Loaded env variables" in build log
   - Vite should show: "VITE_LINKEDIN_CLIENT_ID" being used

3. **Verify LinkedIn App Settings:**
   - Correct redirect URL
   - App is in "Production" mode (not "Development")

---

**After fixing:** LinkedIn OAuth will work perfectly! ✅


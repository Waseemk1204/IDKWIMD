# 🔥 Railway Deployment - Troubleshooting

## Primary Issue: Application Failed to Respond

Your Railway backend is **NOT starting**. Here's how to fix it:

---

## ✅ Step 1: Check Deployment Logs

1. Go to Railway dashboard
2. Click your service
3. Click **"Deployments"** tab
4. Click the latest deployment
5. Scroll to **"Deploy Logs"** (AFTER build logs)
6. Look for **errors after** `npm start`

**What to look for:**
- "Error: listen EADDRINUSE" → Port conflict
- "MongoServerSelectionError" → Database connection failed
- "Missing required environment variables" → Add missing vars
- Server crashes without error → Check HOST binding

---

## ✅ Step 2: Add Required Railway Variables

Railway uses different environment than local. Add these:

### Go to: Railway → Your Service → Variables

**Add/Update these variables:**

```
# Railway needs 0.0.0.0, not localhost
HOST
0.0.0.0

# Railway provides this automatically, but verify
PORT
3001

# Your existing variables (verify they're set):
NODE_ENV=production
MONGODB_URI=(your MongoDB connection string)
JWT_SECRET=part-time-pays-jwt-secret-2024
SESSION_SECRET=part-time-pays-session-secret-2024
FRONTEND_URL=https://parttimepays.in
```

**OAuth Variables (add AFTER you get Railway URL):**
```
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=https://YOUR-RAILWAY-URL/api/v1/auth/linkedin/callback

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://YOUR-RAILWAY-URL/api/v1/auth/google/callback
```

---

## ✅ Step 3: Verify Build Settings

**Go to: Settings → Build & Deploy**

Ensure these are set:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Watch Paths | Leave empty or `backend/**` |

---

## ✅ Step 4: Check MongoDB Connection

**Common issues:**

### Issue: MongoDB Atlas not allowing Railway IP

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Click "ADD IP ADDRESS"
3. Select **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
4. Save

### Issue: Wrong MongoDB URI

**Verify:**
- URI starts with `mongodb+srv://`
- Includes correct password (URL-encoded)
- Database name is correct
- Has `retryWrites=true&w=majority`

---

## ✅ Step 5: Redeploy

After adding variables:

1. Railway usually auto-redeploys
2. **OR** manually trigger:
   - Click **"Deployments"**
   - Click **"Deploy"** → "Redeploy"
3. Watch deployment logs

**Success looks like:**
```
✅ Server running on 0.0.0.0:3001
✅ MongoDB Connected successfully
✅ Database name: parttimepay
```

---

## ✅ Step 6: Get Railway URL

Once deployed successfully:

1. Go to **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `idkwimd-production.up.railway.app`)
4. Test health: `https://YOUR-RAILWAY-URL/health`

---

## ✅ Step 7: Update Vercel Frontend

1. Go to Vercel dashboard → Your project
2. **Settings** → **Environment Variables**
3. **Add or Update:**
   ```
   VITE_API_URL
   https://YOUR-RAILWAY-URL/api/v1
   ```
4. Go to **Deployments**
5. Click latest → **"Redeploy"**
6. Wait 1-2 minutes

---

## ✅ Step 8: Update OAuth Callback URLs

### LinkedIn:
1. https://www.linkedin.com/developers/apps
2. Your app → **Auth** tab
3. **Redirect URLs** → Add:
   - `https://YOUR-RAILWAY-URL/api/v1/auth/linkedin/callback`
   - `https://parttimepays.in/auth/linkedin/callback`
4. Save

### Google:
1. https://console.cloud.google.com/apis/credentials
2. Your OAuth client → **Authorized redirect URIs**
3. Add:
   - `https://YOUR-RAILWAY-URL/api/v1/auth/google/callback`
   - `https://parttimepays.in/auth/google/callback`
4. Save

---

## 🔍 Common Errors & Fixes

### Error: "Application failed to respond"

**Causes:**
1. ❌ Server not binding to `0.0.0.0`
   - **Fix:** Add `HOST=0.0.0.0` in Railway variables

2. ❌ MongoDB connection timeout
   - **Fix:** Allow Railway IPs in MongoDB Atlas

3. ❌ Server crashes on startup
   - **Fix:** Check deployment logs for errors

### Error: "404 on /api/v1/*"

**Causes:**
1. ❌ Backend not running
   - **Fix:** Fix Railway deployment first

2. ❌ Wrong API URL in Vercel
   - **Fix:** Update `VITE_API_URL` in Vercel

### Error: "LinkedIn OAuth fails"

**Causes:**
1. ❌ Callback URL mismatch
   - **Fix:** Update LinkedIn redirect URLs to include Railway URL

2. ❌ Backend not responding
   - **Fix:** Fix Railway deployment first

### Error: "Resume upload fails with 404"

**Causes:**
1. ❌ Backend routes not loaded
   - **Fix:** Ensure Railway is running, check deploy logs

2. ❌ Frontend pointing to wrong URL
   - **Fix:** Verify `VITE_API_URL` in Vercel

---

## 📊 Verification Checklist

After all fixes, test these:

- [ ] Railway health check: `https://YOUR-RAILWAY-URL/health` → Returns `{"success": true}`
- [ ] Vercel frontend: `https://parttimepays.in` → Loads without errors
- [ ] Google OAuth: Click "Continue with Google" → Works
- [ ] LinkedIn OAuth: Click "Continue with LinkedIn" → Works
- [ ] Resume upload: Upload a resume → Processes successfully
- [ ] Onboarding: Complete all steps → Saves to backend

---

## 🆘 Still Not Working?

**Share these with me:**

1. **Railway Deploy Logs** (the RUNTIME logs, not build logs)
2. **Railway Environment Variables** (screenshot, hide secrets)
3. **Vercel Environment Variables** (screenshot of VITE_API_URL)
4. **Browser Console Errors** (F12 → Console tab)
5. **Railway URL** (the generated domain)

---

## 🎯 Quick Fix Summary

**Most likely fix (90% of cases):**

```bash
# In Railway Variables, add:
HOST=0.0.0.0

# Then redeploy
# Watch logs for "Server running on 0.0.0.0:3001"
```

**If that doesn't work:**
- Check MongoDB Atlas allows 0.0.0.0/0
- Verify all environment variables are set
- Check deploy logs for specific errors

---

**Next:** Add `HOST=0.0.0.0` to Railway and redeploy. Let me know what the deploy logs show!


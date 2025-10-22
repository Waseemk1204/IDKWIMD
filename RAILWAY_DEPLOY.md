# 🚀 Railway Deployment - Best FREE Option

## Why Railway?
- ✅ **$5/month FREE credit** (your app will likely cost $0-2/month)
- ✅ **ZERO code changes** - deploy immediately
- ✅ **All features work** - Python, Socket.IO, file uploads, OAuth
- ✅ **No cold starts** - always fast
- ✅ **Auto-deploy** on git push

## Quick Deploy (30 minutes)

### 1. Sign Up (2 min)
1. Go to https://railway.app/
2. Click "Login" → "Sign in with GitHub"
3. Authorize Railway

### 2. Create Project (3 min)
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `Waseemk1204/IDKWIMD`

### 3. Configure (5 min)
Click "Settings" and set:
- **Root Directory:** `backend`
- **Start Command:** `npm start`
- **Build Command:** `npm install && npm run build`

### 4. Add Environment Variables (10 min)
Click "Variables" and add:

```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://Waseemk1204:oAAaViSkIxLhWWSx@parttimepay-cluster.xlfscbf.mongodb.net/parttimepay?retryWrites=true&w=majority&appName=parttimepay-cluster
JWT_SECRET=part-time-pays-jwt-secret-2024
SESSION_SECRET=part-time-pays-session-secret-2024
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://parttimepays.in
```

### 5. Deploy & Get URL (3 min)
1. Railway auto-deploys
2. Go to "Settings" → "Domains" → "Generate Domain"
3. Copy your Railway URL (e.g., `idkwimd-production.up.railway.app`)

### 6. Update Callback URLs (2 min)
Add to Railway Variables:
```
LINKEDIN_CALLBACK_URL=https://YOUR-RAILWAY-URL/api/v1/auth/linkedin/callback
GOOGLE_CALLBACK_URL=https://YOUR-RAILWAY-URL/api/v1/auth/google/callback
```

### 7. Update OAuth Apps (3 min)

**LinkedIn:** https://www.linkedin.com/developers/apps
- Auth → Redirect URLs → Add both:
  - `https://YOUR-RAILWAY-URL/api/v1/auth/linkedin/callback`
  - `https://parttimepays.in/auth/linkedin/callback`

**Google:** https://console.cloud.google.com/apis/credentials
- OAuth client → Authorized redirect URIs → Add both:
  - `https://YOUR-RAILWAY-URL/api/v1/auth/google/callback`
  - `https://parttimepays.in/auth/google/callback`

### 8. Update Vercel (2 min)
1. Go to https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://YOUR-RAILWAY-URL/api/v1`
4. Deployments → Redeploy latest

### 9. Test (5 min)
1. Visit `https://YOUR-RAILWAY-URL/health` (should see success)
2. Visit `https://parttimepays.in` (hard refresh: Ctrl+Shift+R)
3. Test resume upload ✅
4. Test OAuth login ✅

## What You Get
| Feature | Status |
|---------|--------|
| Resume parsing (Python) | ✅ Works |
| Real-time chat (Socket.IO) | ✅ Works |
| File uploads | ✅ Works |
| OAuth (LinkedIn + Google) | ✅ Works |
| Onboarding | ✅ Works |
| All endpoints | ✅ Works |

## Cost
- **Free tier:** $5/month credit
- **Your usage:** ~$1-3/month
- **Net cost:** $0/month (within free tier) 🎉

## Auto-Deploy
After setup, every `git push` to `main` auto-deploys to Railway in ~2 minutes!

## Troubleshooting

**Build fails?**
- Check Root Directory = `backend`
- Check environment variables are set

**Can't connect?**
- Verify `VITE_API_URL` in Vercel
- Hard refresh browser

**OAuth fails?**
- Check redirect URIs match exactly
- No typos, no trailing slashes

## Monitor
- **Logs:** Railway → Your service → "Logs" tab
- **Metrics:** "Metrics" tab shows CPU/memory
- **Health:** `https://YOUR-RAILWAY-URL/health`

## Support
- Railway Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

---

**Ready? Start with Step 1: https://railway.app/**


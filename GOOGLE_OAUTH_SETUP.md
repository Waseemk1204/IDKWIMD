# Google OAuth Configuration Guide

## 🔐 Security Notice

This guide will help you properly configure Google OAuth for your application while maintaining security best practices.

---

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to [Google Cloud Console](https://console.cloud.google.com/)

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a Project** → **New Project**
3. Enter project name: `PartTimePay` (or your preferred name)
4. Click **Create**

---

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for **Google+ API**
3. Click **Enable**

---

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required information:
   - **App name**: PartTimePay
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Add: `email`
   - Add: `profile`
   - Add: `openid`
7. Click **Save and Continue**
8. **Test users** (optional for development)
9. Click **Save and Continue**

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name: `PartTimePay Web Client`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://parttimepays.in
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:5173/login
   http://localhost:5173/signup/employee
   http://localhost:5173/signup/employer
   https://parttimepays.in/login
   https://parttimepays.in/signup/employee
   https://parttimepays.in/signup/employer
   ```
7. Click **Create**
8. **Copy your Client ID** (it will look like: `XXXXXXXX.apps.googleusercontent.com`)

---

## Step 5: Configure Environment Variables

### Frontend Configuration

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Add your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

### Backend Configuration

1. In `backend/.env`, add:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

---

## Step 6: Security Best Practices

### ✅ DO:
- **Keep your `.env` files in `.gitignore`** (already configured)
- **Use environment variables** for all sensitive data
- **Restrict authorized domains** to only your actual domains
- **Enable domain verification** in Google Cloud Console
- **Regularly rotate credentials** (every 90 days recommended)
- **Monitor OAuth logs** in Google Cloud Console
- **Use HTTPS in production** (already configured)

### ❌ DON'T:
- **Never commit `.env` files** to Git
- **Never hardcode credentials** in source code
- **Never allow wildcard origins** (`*`)
- **Never disable CORS** in production
- **Never share Client Secrets** publicly

---

## Step 7: Test OAuth Flow

### Local Testing:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Click "Continue with Google"
5. Verify redirect and authentication works

### Production Testing:
1. Deploy to Railway (backend auto-deploys on push)
2. Deploy to Netlify/Vercel (frontend)
3. Navigate to `https://parttimepays.in/login`
4. Click "Continue with Google"
5. Verify redirect and authentication works

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Ensure the redirect URI in your Google Cloud Console **exactly matches** the URL your app is using.

### Error: "invalid_client"
**Solution**: Check that your `VITE_GOOGLE_CLIENT_ID` is correct and matches your Google Cloud Project.

### Error: "access_denied"
**Solution**: User canceled the OAuth flow or your OAuth consent screen needs approval.

### Error: "CORS blocked"
**Solution**: 
1. Check `backend/src/middlewares/security.ts` has your frontend URL in `allowedOrigins`
2. Ensure Google JavaScript origins include your frontend URL

---

## Security Monitoring

### Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Click your OAuth client
3. Monitor **Usage** and **Quota**

### Backend Logs:
```bash
# On Railway, check deployment logs
railway logs
```

### Frontend Logs:
- Check browser console for Google OAuth errors
- Look for `GoogleAuthService` log messages

---

## Production Deployment Checklist

- [ ] Google Client ID configured in production environment variables
- [ ] Authorized JavaScript origins include production domain
- [ ] Authorized redirect URIs include production URLs
- [ ] HTTPS enabled on production domain
- [ ] CORS configured with production domain
- [ ] OAuth consent screen published (if needed)
- [ ] Domain verification completed in Google Cloud Console
- [ ] Test OAuth flow on production
- [ ] Monitor OAuth logs for errors

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [OAuth Security Best Practices](https://datatracker.ietf.org/doc/html/rfc8252)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend and frontend logs
3. Verify all configuration steps
4. Check Google Cloud Console for quota limits
5. Ensure all environment variables are set correctly

---

**Last Updated**: October 2025  
**Version**: 1.0.0


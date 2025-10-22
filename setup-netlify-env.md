# 🔧 Netlify Environment Variables Setup

## Current Issue
Your Netlify deployment is trying to connect to `http://localhost:3001/api/v1` instead of your deployed backend.

## Solution

### 1. Deploy Backend First
- Go to [Railway.app](https://railway.app)
- Deploy your backend
- Get your Railway URL (e.g., `https://your-app.railway.app`)

### 2. Set Netlify Environment Variables
In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Click **Add variable**
3. Add this variable:

```
Variable name: VITE_API_URL
Value: https://your-railway-backend-url.railway.app/api/v1
```

### 3. Redeploy
After adding the environment variable:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

### 4. Verify
Check your browser console on the Netlify site. You should see:
```
API_BASE_URL: https://your-railway-backend-url.railway.app/api/v1
VITE_API_URL env var: https://your-railway-backend-url.railway.app/api/v1
```

## Alternative: Quick Test
If you want to test with a temporary backend URL, you can:

1. Go to Netlify dashboard
2. Add environment variable: `VITE_API_URL=https://your-temp-backend-url.com/api/v1`
3. Redeploy

## Common Issues
- **CORS errors**: Make sure your backend CORS allows your Netlify domain
- **404 errors**: Make sure the backend URL includes `/api/v1`
- **Environment variable not working**: Make sure to redeploy after adding the variable

## Need Help?
1. Check browser console for errors
2. Verify the API URL is correct
3. Make sure backend is running and accessible
4. Check CORS configuration in backend

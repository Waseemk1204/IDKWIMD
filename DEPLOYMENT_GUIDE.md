# 🚀 Complete Deployment Guide

## Overview
This guide will help you deploy your full-stack application with all functionalities working.

## Architecture
- **Frontend**: Netlify (Static hosting)
- **Backend**: Railway (Server hosting)
- **Database**: MongoDB Atlas (Already configured)

## Step 1: Deploy Backend to Railway

### 1.1 Prepare Backend
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `backend` folder as the root directory

### 1.2 Set Environment Variables in Railway
In Railway dashboard, go to your project → Variables tab and add:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=30d
SESSION_SECRET=your-session-secret-here
FRONTEND_URL=https://your-netlify-site.netlify.app
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 1.3 Deploy
Railway will automatically:
- Install dependencies
- Build the TypeScript code
- Start the server
- Provide you with a URL like: `https://your-app.railway.app`

## Step 2: Deploy Frontend to Netlify

### 2.1 Prepare Frontend
1. Go to [Netlify.com](https://netlify.com)
2. Sign up/Login
3. Click "New site from Git"
4. Connect your GitHub repository

### 2.2 Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: Leave empty (root)

### 2.3 Set Environment Variables in Netlify
In Netlify dashboard, go to Site settings → Environment variables and add:

```env
VITE_API_URL=https://your-railway-backend-url.railway.app/api/v1
VITE_NODE_ENV=production
```

### 2.4 Deploy
Netlify will automatically build and deploy your frontend.

## Step 3: Update CORS Settings

### 3.1 Update Backend CORS
In your Railway backend, make sure the CORS configuration allows your Netlify domain:

```typescript
// In backend/src/middlewares/security.ts
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://your-netlify-site.netlify.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};
```

## Step 4: Test Your Deployment

### 4.1 Test Backend
Visit: `https://your-railway-backend-url.railway.app/health`
Should return: `{"success":true,"message":"Server is running"}`

### 4.2 Test Frontend
Visit: `https://your-netlify-site.netlify.app`
Should load your application

### 4.3 Test Full Functionality
1. Try creating an account
2. Try logging in
3. Test all features (jobs, connections, etc.)

## Step 5: Custom Domain (Optional)

### 5.1 Backend Custom Domain
In Railway:
1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

### 5.2 Frontend Custom Domain
In Netlify:
1. Go to Site settings → Domain management
2. Add your custom domain (e.g., `yourdomain.com`)
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure your Netlify URL is in the CORS origins list
   - Check that `credentials: true` is set

2. **Environment Variables**
   - Double-check all environment variables are set correctly
   - Make sure there are no typos in variable names

3. **Database Connection**
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted in MongoDB Atlas

4. **Build Failures**
   - Check the build logs in Railway/Netlify
   - Make sure all dependencies are in package.json

### Debug Commands

```bash
# Check backend health
curl https://your-railway-backend-url.railway.app/health

# Check if environment variables are set
# In Railway dashboard → Variables tab

# Check build logs
# In Railway/Netlify dashboard → Deployments tab
```

## Cost Estimation

- **Railway**: Free tier available, paid plans start at $5/month
- **Netlify**: Free tier available, paid plans start at $19/month
- **MongoDB Atlas**: Free tier available, paid plans start at $9/month

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS (automatic with Railway/Netlify)
- [ ] Set up proper CORS origins
- [ ] Use environment variables for sensitive data
- [ ] Enable MongoDB Atlas IP whitelisting
- [ ] Set up proper error handling

## Monitoring

- **Railway**: Built-in metrics and logs
- **Netlify**: Built-in analytics
- **MongoDB Atlas**: Built-in monitoring

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration
5. Verify database connection

Your application should now be fully functional with all features working!

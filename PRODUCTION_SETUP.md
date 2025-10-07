# Production Environment Configuration for Part-Time Pay$

## Backend Setup

### 1. Database Configuration
- **MongoDB Atlas**: Use MongoDB Atlas for production database
- **Connection String**: `mongodb+srv://username:password@cluster.mongodb.net/parttimepay?retryWrites=true&w=majority`

### 2. Environment Variables
Create a `.env` file in the backend directory with:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parttimepay?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-this-very-long-and-random-for-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here-make-this-very-long-and-random-for-production
JWT_REFRESH_EXPIRE=30d

# OAuth Configuration
GOOGLE_CLIENT_ID=916734429640-e7c73gltbkl4eijae1qso7sbp6kkaauh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console

# Session Configuration
SESSION_SECRET=your-session-secret-here-make-this-very-long-and-random-for-production

# Frontend URL
FRONTEND_URL=https://parttimepays.in

# Security
BCRYPT_ROUNDS=12
XSS_PROTECTION=true
```

### 3. Backend Deployment
The backend should be deployed to a cloud service like:
- **Railway**: Already configured with `railway.json`
- **Heroku**: Use the provided `Dockerfile`
- **Vercel**: Use serverless functions
- **DigitalOcean**: Use App Platform

### 4. API Endpoints Status
All major endpoints are implemented:
- ✅ Authentication (`/api/v1/auth/*`)
- ✅ Users (`/api/v1/users/*`)
- ✅ Jobs (`/api/v1/jobs/*`)
- ✅ Applications (`/api/v1/applications/*`)
- ✅ Blogs (`/api/v1/blogs/*`)
- ✅ Messages (`/api/v1/messages/*`)
- ✅ Notifications (`/api/v1/notifications/*`)
- ✅ Community (`/api/v1/community/*`)
- ✅ Connections (`/api/v1/connections/*`)
- ✅ Search (`/api/v1/search/*`)
- ✅ Wallet (`/api/v1/wallet/*`)
- ✅ Admin (`/api/v1/admin/*`)
- ✅ Verification (`/api/v1/verification/*`)

## Frontend Configuration

### 1. API Base URL
The frontend is configured to use:
- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://your-backend-domain.com/api/v1`

### 2. Google OAuth Configuration
- **Client ID**: `916734429640-e7c73gltbkl4eijae1qso7sbp6kkaauh.apps.googleusercontent.com`
- **Redirect URI**: `https://parttimepays.in/login`
- **Authorized Origins**: `https://parttimepays.in`

## Deployment Steps

### 1. Backend Deployment
1. Set up MongoDB Atlas database
2. Configure environment variables
3. Deploy to Railway/Heroku/Vercel
4. Test all API endpoints

### 2. Frontend Deployment
1. Build frontend: `npm run build`
2. Deploy to Netlify/Vercel
3. Configure environment variables
4. Test Google OAuth flow

### 3. Database Setup
1. Create MongoDB Atlas cluster
2. Set up database collections
3. Run database migrations
4. Seed initial data

## Current Status

### ✅ Completed
- Google OAuth backend implementation
- Frontend-backend integration
- API endpoint structure
- Authentication flow
- User management
- Job management
- Community features
- Messaging system
- Notification system

### 🔄 In Progress
- MongoDB Atlas setup
- Backend TypeScript error fixes
- Production environment configuration

### ⏳ Pending
- Complete backend deployment
- Database connection testing
- End-to-end testing
- Production deployment verification

## Next Steps

1. **Set up MongoDB Atlas** - Create a free cluster
2. **Fix backend TypeScript errors** - Resolve compilation issues
3. **Deploy backend** - Use Railway or similar service
4. **Test complete flow** - Verify Google OAuth works end-to-end
5. **Deploy frontend** - Update with production backend URL
6. **Verify production** - Test all features in production

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured
- [ ] Backend deployed and running
- [ ] Frontend deployed with production API URL
- [ ] Google OAuth working in production
- [ ] All API endpoints tested
- [ ] Database connections verified
- [ ] Security headers configured
- [ ] SSL certificates installed
- [ ] Performance monitoring set up

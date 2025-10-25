# Part-Time Pay$ Deployment Guide

This guide covers deploying the Part-Time Pay$ application to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [Scaling Considerations](#scaling-considerations)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or MongoDB instance
- Domain name and SSL certificate
- Cloud hosting provider (AWS, DigitalOcean, Heroku, etc.)
- Razorpay account for payments
- Cloudinary account for file storage

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd IDKWIMD-main
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../src
npm install
```

### 3. Environment Variables

Create `.env` files for both backend and frontend:

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/parttimepay?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=Part-Time Pay$
VITE_APP_VERSION=1.0.0
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

## Database Setup

### MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your server IP addresses
5. Get the connection string and update `MONGODB_URI`

### Local MongoDB (Alternative)

```bash
# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Backend Deployment

### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
cd backend
npm run build

# Start with PM2
pm2 start dist/server.js --name "parttimepay-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

```bash
# Build and run
docker build -t parttimepay-api .
docker run -p 5000:5000 --env-file .env parttimepay-api
```

### Option 3: Heroku

```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
cd src
npm run build
vercel --prod
```

### Option 2: Netlify

```bash
# Build the application
npm run build

# Deploy to Netlify
# Upload dist folder to Netlify dashboard
# Or use Netlify CLI
netlify deploy --prod --dir=dist
```

### Option 3: Nginx

```bash
# Build the application
npm run build

# Copy to nginx directory
sudo cp -r dist/* /var/www/html/

# Configure nginx
sudo nano /etc/nginx/sites-available/parttimepay
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Production Configuration

### 1. Security Headers

Ensure all security headers are properly configured in your server setup.

### 2. Rate Limiting

Configure appropriate rate limits for your expected traffic:

```javascript
// Example rate limiting configuration
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 3. CORS Configuration

```javascript
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 4. Database Indexing

Ensure proper database indexes are created:

```javascript
// Run this script in production
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.jobs.createIndex({ status: 1, createdAt: -1 });
db.applications.createIndex({ job: 1, applicant: 1 });
```

## Monitoring & Logging

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g pm2-logrotate

# Configure PM2 monitoring
pm2 install pm2-server-monit
```

### 2. Log Management

```bash
# Configure log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3. Health Checks

The application includes health check endpoints:

- `GET /health` - Basic health check
- `GET /api/v1/health` - Detailed health check

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Using Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure security settings

## Scaling Considerations

### 1. Horizontal Scaling

- Use load balancers (Nginx, HAProxy)
- Implement session management (Redis)
- Database sharding for large datasets

### 2. Caching

```javascript
// Redis caching example
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/api/v1/jobs', async (req, res) => {
  const cacheKey = 'jobs:active';
  const cached = await client.get(cacheKey);
  
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const jobs = await Job.find({ status: 'active' });
  await client.setex(cacheKey, 300, JSON.stringify(jobs)); // 5 min cache
  
  res.json(jobs);
});
```

### 3. CDN Setup

- Use Cloudflare or AWS CloudFront
- Serve static assets through CDN
- Implement proper cache headers

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check MongoDB connection
   mongo "mongodb+srv://cluster.mongodb.net/parttimepay" --username your-username
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :5000
   # Kill process
   kill -9 <PID>
   ```

3. **Memory Issues**
   ```bash
   # Monitor memory usage
   pm2 monit
   # Restart if needed
   pm2 restart parttimepay-api
   ```

4. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Logs

```bash
# View PM2 logs
pm2 logs parttimepay-api

# View specific log file
tail -f /var/log/nginx/error.log
```

### Performance Monitoring

```bash
# Monitor system resources
htop
iostat -x 1
netstat -tulpn
```

## Backup Strategy

### Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/parttimepay" --out=backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backup_$DATE"
```

### File Backups

```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Authentication tokens secured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Monitoring and alerting setup

## Support

For deployment issues or questions:

1. Check the logs first
2. Review this documentation
3. Check GitHub issues
4. Contact the development team

---

**Note**: This deployment guide should be customized based on your specific hosting environment and requirements.

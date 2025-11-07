#!/bin/bash

# Deployment Script for Part-Time Pay$ Application
# This script helps you deploy both frontend and backend

echo "🚀 Part-Time Pay$ Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Deployment Checklist:"
echo "1. ✅ Backend deployed to Railway"
echo "2. ✅ Frontend deployed to Netlify"
echo "3. ✅ Environment variables configured"
echo "4. ✅ CORS settings updated"
echo "5. ✅ Database connection verified"
echo ""

echo "🔧 Quick Setup Commands:"
echo ""

echo "📦 Backend Deployment (Railway):"
echo "1. Go to https://railway.app"
echo "2. Connect your GitHub repository"
echo "3. Select 'backend' folder as root"
echo "4. Set environment variables (see DEPLOYMENT_GUIDE.md)"
echo "5. Deploy!"
echo ""

echo "🌐 Frontend Deployment (Netlify):"
echo "1. Go to https://netlify.com"
echo "2. Connect your GitHub repository"
echo "3. Set build command: npm run build"
echo "4. Set publish directory: dist"
echo "5. Set environment variables:"
echo "   - VITE_API_URL=https://your-railway-backend.railway.app/api/v1"
echo "6. Deploy!"
echo ""

echo "🔑 Required Environment Variables:"
echo ""
echo "Backend (Railway):"
echo "- NODE_ENV=production"
echo "- PORT=3001"
echo "- MONGODB_URI=your-mongodb-atlas-connection-string"
echo "- JWT_SECRET=your-super-secret-jwt-key"
echo "- JWT_REFRESH_SECRET=your-refresh-secret-key"
echo "- SESSION_SECRET=your-session-secret"
echo "- FRONTEND_URL=https://your-netlify-site.netlify.app"
echo ""

echo "Frontend (Netlify):"
echo "- VITE_API_URL=https://your-railway-backend.railway.app/api/v1"
echo "- VITE_NODE_ENV=production"
echo ""

echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""

# Check if backend is running locally
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running locally on http://localhost:3001"
else
    echo "⚠️  Backend is not running locally"
fi

# Check if frontend is running locally
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running locally on http://localhost:5173"
else
    echo "⚠️  Frontend is not running locally"
fi

echo ""
echo "🎉 Happy Deploying!"

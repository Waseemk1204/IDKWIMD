#!/bin/bash

# Environment Setup Script
# This script helps you generate secure environment variables

echo "🔐 Environment Variables Setup"
echo "=============================="

# Generate random secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

echo "Generated secure secrets:"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

echo "📋 Copy these to your deployment platform:"
echo ""
echo "Backend Environment Variables (Railway):"
echo "========================================"
echo "NODE_ENV=production"
echo "PORT=3001"
echo "MONGODB_URI=your-mongodb-atlas-connection-string"
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "FRONTEND_URL=https://your-netlify-site.netlify.app"
echo ""

echo "Frontend Environment Variables (Netlify):"
echo "========================================="
echo "VITE_API_URL=https://your-railway-backend.railway.app/api/v1"
echo "VITE_NODE_ENV=production"
echo ""

echo "💡 Tips:"
echo "- Replace 'your-mongodb-atlas-connection-string' with your actual MongoDB Atlas URI"
echo "- Replace 'your-netlify-site.netlify.app' with your actual Netlify URL"
echo "- Replace 'your-railway-backend.railway.app' with your actual Railway URL"
echo ""

echo "🔒 Security Note:"
echo "These secrets are generated locally and are safe to use."
echo "Never share these secrets or commit them to version control."

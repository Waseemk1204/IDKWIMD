# Community Hub Setup Guide

## Quick Start

This guide will help you set up and run the Community Hub locally for development.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IDKWIMD
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../src
   npm install
   ```

## Environment Setup

1. **Backend Environment**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/parttimepays
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=7d
   ```

2. **Frontend Environment**
   ```bash
   cd src
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_APP_NAME=Part-Time Pays
   ```

## Database Setup

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Seed the database** (optional)
   ```bash
   cd backend
   npm run seed:categories
   npm run seed:badges
   ```

## Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd src
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## Testing

1. **Run backend tests**
   ```bash
   cd backend
   npm test
   ```

2. **Run frontend tests**
   ```bash
   cd src
   npm test
   ```

3. **Run all tests**
   ```bash
   npm run test:all
   ```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/community-hub-enhancement
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Write tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new community feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/community-hub-enhancement
   ```

## API Testing

Use the provided Postman collection or test endpoints directly:

```bash
# Get community posts
curl http://localhost:5000/api/v1/community-enhanced/posts

# Create a new post
curl -X POST http://localhost:5000/api/v1/community-enhanced/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Test Post",
    "content": "This is a test post",
    "category": "category-id",
    "type": "discussion",
    "tags": ["test", "example"]
  }'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database permissions

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill`

3. **Authentication Issues**
   - Check JWT secret in `.env`
   - Verify token expiration
   - Ensure user is authenticated

4. **CORS Errors**
   - Check CORS configuration in backend
   - Verify frontend URL in CORS settings

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=app:* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## Production Deployment

1. **Build the application**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Frontend
   cd src
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://production-server:27017/parttimepays
   JWT_SECRET=production-jwt-secret
   ```

3. **Deploy to your hosting platform**
   - Follow platform-specific deployment guides
   - Ensure environment variables are set
   - Configure database connections

## Contributing

1. **Read the documentation**
   - Check `COMMUNITY_HUB_DOCUMENTATION.md`
   - Review existing code patterns

2. **Follow coding standards**
   - Use TypeScript strict mode
   - Write comprehensive tests
   - Document new features

3. **Submit changes**
   - Create feature branches
   - Write descriptive commit messages
   - Include tests and documentation

## Support

- **Documentation**: Check `COMMUNITY_HUB_DOCUMENTATION.md`
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Team**: Contact the development team

---

*Happy coding! 🚀*


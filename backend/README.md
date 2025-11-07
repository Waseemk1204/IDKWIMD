# Part-Time Pay$ - Backend API

A comprehensive backend API for the Part-Time Pay$ job marketplace platform, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Complete user profiles with skills, experience, and verification
- **Job Management**: Full CRUD operations for job postings with advanced filtering
- **Application System**: Job application tracking and management
- **Blog System**: Content management with comments and categories
- **Real-time Messaging**: Socket.io powered chat system
- **Notification System**: Real-time notifications for various events
- **File Upload**: Cloudinary integration for image and document uploads
- **Security**: Rate limiting, XSS protection, MongoDB injection prevention
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io
- **File Upload**: Cloudinary
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Testing**: Jest + Supertest

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Users
- `GET /api/v1/users` - Get all users (admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)

### Jobs
- `GET /api/v1/jobs` - Get all jobs (public)
- `GET /api/v1/jobs/:id` - Get job by ID (public)
- `POST /api/v1/jobs` - Create job (employer/admin)
- `PUT /api/v1/jobs/:id` - Update job
- `DELETE /api/v1/jobs/:id` - Delete job

### Applications
- `GET /api/v1/applications` - Get user's applications
- `POST /api/v1/applications` - Submit application
- `GET /api/v1/applications/:id` - Get application details
- `PUT /api/v1/applications/:id` - Update application
- `DELETE /api/v1/applications/:id` - Withdraw application

### Blogs
- `GET /api/v1/blogs` - Get all blogs (public)
- `GET /api/v1/blogs/:id` - Get blog by ID (public)
- `POST /api/v1/blogs` - Create blog
- `PUT /api/v1/blogs/:id` - Update blog
- `DELETE /api/v1/blogs/:id` - Delete blog
- `POST /api/v1/blogs/:id/comments` - Add comment

### Messages
- `GET /api/v1/messages/conversations` - Get user's conversations
- `POST /api/v1/messages/conversations` - Create conversation
- `GET /api/v1/messages/conversations/:id/messages` - Get messages
- `POST /api/v1/messages/conversations/:id/messages` - Send message

### Notifications
- `GET /api/v1/notifications` - Get user's notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or install MongoDB locally
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm run build
   npm start
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/parttimepay

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Database Models

### User
- Personal information (name, email, phone, location)
- Role-based access (employee, employer, admin)
- Skills, experience, education
- Profile image and verification status

### Job
- Job details (title, description, company, location)
- Requirements and responsibilities
- Salary and duration information
- Status and urgency levels

### Application
- Job application with cover letter
- Resume and portfolio links
- Application status tracking
- Interview scheduling

### Blog
- Blog posts with content and metadata
- Categories and tags
- Comments and engagement metrics
- SEO optimization

### Message & Conversation
- Real-time messaging system
- Direct and group conversations
- Message types (text, image, file)
- Read receipts and typing indicators

### Notification
- System and user notifications
- Real-time delivery via Socket.io
- Read status tracking
- Notification types and categories

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **XSS Protection**: Cross-site scripting prevention
- **MongoDB Injection**: NoSQL injection prevention
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: Security headers configuration

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## Deployment

### Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual container
docker build -t parttimepay-backend .
docker run -p 5000:5000 parttimepay-backend
```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the application**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is private and proprietary.

## Support

For support and questions, please contact the development team.

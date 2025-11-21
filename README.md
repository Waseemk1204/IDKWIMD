# Part-Time Pay$ - Professional Network Platform

A comprehensive professional network platform that combines the best features of LinkedIn with unique job marketplace functionality, real-time messaging, wallet system, and verification features.

## 🚀 Features

### Core Features
- **User Authentication & Profiles**: Complete user management with role-based access (Employee, Employer, Admin)
- **Job Marketplace**: Post, search, and apply for jobs with advanced filtering
- **Real-time Messaging**: Socket.IO powered messaging system with typing indicators
- **Professional Connections**: LinkedIn-style "Gang Members" system for networking
- **Community Hub**: Blog posts, discussions, and content sharing
- **Wallet System**: Integrated payment system with Razorpay
- **User Verification**: Document-based verification system
- **Real-time Notifications**: Comprehensive notification system
- **Global Search**: Advanced search across all content types
- **Admin Panel**: Complete moderation and analytics dashboard

### Technical Features
- **Full-stack TypeScript**: Type-safe development across frontend and backend
- **Real-time Updates**: Socket.IO for live messaging and notifications
- **Responsive Design**: Mobile-first design with dark/light mode support
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Production Ready**: Docker support, deployment guides, and monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **Socket.IO** for real-time features
- **JWT** for authentication
- **Razorpay** for payments
- **Cloudinary** for file storage
- **Jest** for testing
- **Swagger** for API documentation

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **Lucide React** for icons
- **Sonner** for notifications
- **Date-fns** for date handling

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Razorpay account (for payments)
- Cloudinary account (for file storage)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IDKWIMD-main

# One-command setup (installs dependencies for both frontend and backend)
npm run setup
```

### 2. Backend Setup (Manual)

```bash
cd backend

# Install dependencies (if not using npm run setup)
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# - MongoDB connection string
# - JWT secrets
# - Razorpay credentials
# - Cloudinary credentials

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd src

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API URL
# VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

### 4. Database Setup

```bash
# Populate initial data (optional)
cd backend
npm run populate:blogs
npm run populate:community
```

## 📁 Project Structure

```
IDKWIMD-main/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   ├── scripts/         # Database scripts
│   │   └── __tests__/       # Test files
│   ├── package.json
│   └── tsconfig.json
├── src/                     # Frontend React app
│   ├── components/          # Reusable components
│   ├── pages/              # Page components
│   ├── context/            # React context
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parttimepay
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Part-Time Pay$
VITE_RAZORPAY_KEY_ID=your-razorpay-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd src

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Options

#### Heroku
```bash
# Backend
cd backend
heroku create your-app-name
git push heroku main

# Frontend
cd src
vercel --prod
```

#### Docker
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS** protection
- **Helmet.js** security headers
- **XSS Protection**
- **SQL Injection Prevention**
- **Password Hashing** with bcrypt

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the API docs at `/api-docs`
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@parttimepay.com

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core authentication and user management
- [x] Job marketplace functionality
- [x] Real-time messaging
- [x] Professional connections
- [x] Community features
- [x] Wallet and payment system
- [x] User verification
- [x] Admin panel

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] AI-powered job matching
- [ ] Video interviews
- [ ] Advanced search filters
- [ ] Company pages
- [ ] Event management

### Phase 3 (Future)
- [ ] Blockchain integration
- [ ] NFT certificates
- [ ] Advanced AI features
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API marketplace

## 🙏 Acknowledgments

- **React** team for the amazing framework
- **Express.js** team for the robust backend framework
- **MongoDB** for the flexible database
- **Socket.IO** for real-time capabilities
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the fast build tool

---

**Built with ❤️ by the Part-Time Pay$ Team**

For more information, visit our [website](https://parttimepay.com) or contact us at [hello@parttimepay.com](mailto:hello@parttimepay.com).
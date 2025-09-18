# Part-Time Pay$ - Full Stack Application

A comprehensive full-stack job marketplace platform connecting students and professionals with part-time work opportunities. Built with React frontend and Node.js backend.

## Features

- **Modern UI/UX**: Clean, responsive design with dark/light mode support
- **Authentication**: Secure login/signup with social authentication options
- **Job Management**: Browse, apply, and manage part-time job opportunities
- **Blog System**: Read and share insights about part-time work
- **Community Hub**: Connect with other users and share experiences
- **Messaging**: Real-time communication between users
- **Dashboard**: Personalized dashboards for employees, employers, and admins

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Date-fns** for date formatting
- **Sonner** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Cloudinary** for file uploads
- **Express Validator** for input validation

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 5.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd part-time-pay
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Project Structure

```
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── controllers/# Route controllers
│   │   ├── middlewares/# Custom middlewares
│   │   ├── models/     # Database models
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Utility functions
│   ├── Dockerfile      # Docker configuration
│   └── docker-compose.yml
├── src/                # React frontend
│   ├── components/     # Reusable UI components
│   │   ├── auth/       # Authentication components
│   │   ├── jobs/       # Job-related components
│   │   ├── layout/     # Layout components
│   │   ├── messaging/  # Messaging components
│   │   └── ui/         # Basic UI components
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication pages
│   │   ├── employee/   # Employee-specific pages
│   │   ├── employer/   # Employer-specific pages
│   │   ├── admin/      # Admin pages
│   │   ├── shared/     # Shared pages
│   │   └── community/  # Community features
│   ├── data/           # Mock data and utilities
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context providers
│   └── layouts/        # Layout components
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.
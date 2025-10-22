# 🚀 ParttimePays - Modern Part-Time Job Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)

> A comprehensive platform connecting students and professionals with flexible part-time job opportunities, featuring advanced OAuth integration, AI-powered resume parsing, and intelligent onboarding.

---

## ✨ Features

### 🔐 **Advanced Authentication**
- **LinkedIn OAuth 2.0** - Seamless sign-in with professional profiles
- **Google OAuth 2.0** - Quick authentication with Google accounts
- **JWT-based sessions** - Secure, scalable authentication
- **Role-based access** - Separate flows for employees and employers

### 🧙 **Smart Onboarding**
- **5-Step Employee Wizard** - Guided profile completion
- **4-Step Employer Wizard** - Quick company setup
- **Auto-save functionality** - Never lose progress
- **Profile completion tracking** - Visual progress indicators

### 📄 **AI-Powered Resume Parsing**
- **Python-based extraction** - Using pyresparser and spaCy
- **Automatic profile filling** - Extract name, skills, experience, education
- **Multiple format support** - PDF, DOC, DOCX
- **Drag-and-drop upload** - Modern, intuitive interface

### 🎨 **Modern UI/UX**
- **Naukri.com-inspired design** - Professional, clean aesthetics
- **Advanced job filters** - Salary range, location, job type, experience
- **Beautiful job cards** - Gradient backgrounds, smooth animations
- **Dark mode support** - Easy on the eyes
- **Mobile-first responsive** - Works perfectly on all devices
- **Micro-interactions** - Delightful user experience

### 🔍 **Advanced Job Search**
- **Real-time filtering** - Instant results
- **Salary range slider** - Visual salary selection
- **Location search** - Find jobs near you
- **Smart sorting** - Relevance, date, salary
- **Quick filters** - One-click job type selection

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Sonner** - Beautiful toast notifications

### **Backend**
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens

### **Python Services**
- **pyresparser** - Resume parsing
- **spaCy** - NLP processing
- **NLTK** - Natural language toolkit

### **DevOps**
- **Git** - Version control
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **MongoDB Atlas** - Database hosting

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.7+ ([Download](https://www.python.org/))
- Git ([Download](https://git-scm.com/))
- MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/parttimepays-platform.git
cd parttimepays-platform
```

### **2. Install Frontend Dependencies**
```bash
npm install
```

### **3. Install Backend Dependencies**
```bash
cd backend
npm install
```

### **4. Setup Python Environment**
```bash
cd backend/python-services
# Windows
.\setup.bat
# Linux/Mac
./setup.sh
```

### **5. Configure Environment Variables**

**Frontend (`.env.local`):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_BACKEND_URL=http://localhost:3001
VITE_LINKEDIN_CLIENT_ID=your-linkedin-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_SECRET=your-session-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FRONTEND_URL=http://localhost:5173
```

### **6. Run Development Servers**

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Access at: `http://localhost:3001`

---

## 📚 Documentation

- **[Setup Guide](FINAL_CONFIGURATION_SUMMARY.md)** - Complete setup instructions
- **[Test Report](FINAL_TEST_REPORT.md)** - Comprehensive testing results
- **[Implementation Details](UI_UX_IMPROVEMENTS_SUMMARY.md)** - Feature documentation
- **[Git Guide](GIT_DEPLOYMENT_GUIDE.md)** - Version control guide

---

## 🎯 Project Structure

```
parttimepays-platform/
├── src/                          # Frontend source
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── onboarding/         # Onboarding wizards
│   │   ├── profile/            # Profile components
│   │   └── ui/                 # Reusable UI components
│   ├── context/                # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Page components
│   ├── services/               # API services
│   └── utils/                  # Utility functions
├── backend/                     # Backend source
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── middlewares/        # Custom middleware
│   ├── python-services/        # Python resume parser
│   │   ├── resume_parser.py   # Parser script
│   │   ├── requirements.txt   # Python dependencies
│   │   └── setup.bat/sh       # Setup scripts
│   └── uploads/                # File uploads (gitignored)
├── public/                      # Static assets
├── docs/                        # Documentation
└── README.md                    # This file
```

---

## 🔐 OAuth Setup

### **LinkedIn OAuth**
1. Create app at [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Add redirect URIs:
   - `http://localhost:5173/auth/linkedin/callback`
   - `http://localhost:3001/api/auth/linkedin/callback`
3. Copy Client ID and Secret to `.env` files

### **Google OAuth**
1. Create project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins:
   - `http://localhost:5173`
   - `http://localhost:3001`
5. Add redirect URIs:
   - `http://localhost:5173/login`
   - `http://localhost:5173/signup`
   - `http://localhost:5173/auth/google/callback`
6. Copy Client ID and Secret to `.env` files

---

## 🧪 Testing

### **Run Frontend Tests**
```bash
npm test
```

### **Run Backend Tests**
```bash
cd backend
npm test
```

### **End-to-End Testing**
1. Start both frontend and backend servers
2. Navigate to `http://localhost:5173`
3. Test OAuth flows (LinkedIn, Google)
4. Complete onboarding wizard
5. Upload resume and verify parsing
6. Test job search and filters

---

## 🚢 Deployment

### **Frontend (Vercel)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

### **Backend (Railway)**
1. Connect GitHub repository
2. Select `backend` folder
3. Add environment variables
4. Deploy automatically

### **Database**
- Already using MongoDB Atlas ✅
- Production-ready connection string configured

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Lead Developer** - Shubham Gohil
- **Backend Developer** - Mohammad Waseem Khan
- **Frontend Developer** - Samruddha Bhalerao
- **UI/UX Designer** - Anmol Reddy

---

## 🙏 Acknowledgments

- **Naukri.com** - UI/UX inspiration
- **LinkedIn** - OAuth integration
- **Google** - OAuth integration
- **pyresparser** - Resume parsing library
- **MongoDB Atlas** - Database hosting
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting

---

## 📧 Contact

For questions or support, please contact:
- **Email**: support@parttimepays.com
- **Website**: https://parttimepays.com

---

## 🎉 Status

**Current Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 22, 2025

---

**Built with ❤️ by the ParttimePays Team**


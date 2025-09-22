const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'employer', 'admin'], default: 'employee' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  profilePhoto: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  headline: { type: String, default: '' },
  about: { type: String, default: '' },
  skills: [{ type: String }],
  companyInfo: {
    companyName: { type: String },
    companySize: { type: String },
    industry: { type: String },
    website: { type: String },
    description: { type: String }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  minHourlyRate: { type: Number, required: true },
  maxHourlyRate: { type: Number, required: true },
  hoursPerWeek: { type: String, required: true },
  duration: { type: String, required: true },
  skills: [{ type: String }],
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  featuredImage: { type: String },
  isPublished: { type: Boolean, default: true },
  publishedDate: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: { type: Number, default: 0 },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Auth routes
app.post('/auth/register', [
  body('fullName').trim().isLength({ min: 2, max: 50 }),
  body('username').trim().isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'User already exists with this email' : 'Username is already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
      role: role || 'employee'
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Jobs routes
app.get('/jobs', async (req, res) => {
  try {
    const { limit = 20, page = 1, search, location, skills } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skills) {
      query.skills = { $in: skills.split(',') };
    }

    const jobs = await Job.find(query)
      .populate('employer', 'fullName companyInfo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/jobs/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const jobs = await Job.find({ isActive: true, isFeatured: true })
      .populate('employer', 'fullName companyInfo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { jobs } });
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Blogs routes
app.get('/blogs', async (req, res) => {
  try {
    const { limit = 20, page = 1, category, sortBy = 'publishedDate', sortOrder = 'desc' } = req.query;
    const query = { isPublished: true };

    if (category) {
      query.category = category;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'fullName profilePhoto')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/blogs/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'fullName profilePhoto')
      .sort({ views: -1, publishedDate: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: { blogs } });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/blogs/categories', async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Connect to database and start server
connectDB();

module.exports = app;

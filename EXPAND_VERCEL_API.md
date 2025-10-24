# Quick Fix: Expand Existing Vercel API

## Add Missing Features to `api/index.js` (Vercel Serverless)

Instead of deploying to Railway, we can add the missing endpoints to your existing `api/index.js` on Vercel.

---

## What to Add:

### 1. Onboarding Endpoints (Easy - 30 min)

Add to `api/index.js`:

```javascript
// Onboarding Schema
const onboardingDraftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['employee', 'employer'], required: true },
  currentStep: { type: Number, default: 0 },
  data: { type: mongoose.Schema.Types.Mixed },
  completionPercentage: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  lastSavedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const OnboardingDraft = mongoose.model('OnboardingDraft', onboardingDraftSchema);

// Save onboarding progress
app.post('/onboarding/save', authenticate, async (req, res) => {
  try {
    const { currentStep, data } = req.body;
    
    const draft = await OnboardingDraft.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        role: req.user.role,
        currentStep,
        data,
        lastSavedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({
      success: true,
      message: 'Onboarding progress saved',
      data: { draft }
    });
  } catch (error) {
    console.error('Save onboarding error:', error);
    res.status(500).json({ success: false, message: 'Failed to save progress' });
  }
});

// Load onboarding progress
app.get('/onboarding/load/:role', authenticate, async (req, res) => {
  try {
    const draft = await OnboardingDraft.findOne({ userId: req.user._id });
    
    res.json({
      success: true,
      data: { draft: draft || null }
    });
  } catch (error) {
    console.error('Load onboarding error:', error);
    res.status(500).json({ success: false, message: 'Failed to load progress' });
  }
});

// Complete onboarding
app.post('/onboarding/complete', authenticate, async (req, res) => {
  try {
    const draft = await OnboardingDraft.findOneAndUpdate(
      { userId: req.user._id },
      { isCompleted: true },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Onboarding completed',
      data: { draft }
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete onboarding' });
  }
});
```

---

### 2. Resume Upload WITHOUT Python (Easy - 45 min)

**Option A: Store file, skip parsing (simplest):**

```javascript
// Add this at the top
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX allowed.'));
    }
  }
});

// Resume upload endpoint
app.post('/users/resume/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'raw',
          folder: 'resumes',
          public_id: `resume_${req.user._id}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save resume URL to user profile
    await User.findByIdAndUpdate(req.user._id, {
      resumeUrl: uploadResult.secure_url,
      resumeUploadedAt: new Date()
    });

    // Return success with manual entry suggestion
    res.json({
      success: true,
      message: 'Resume uploaded successfully. Please fill in your details manually.',
      data: {
        resumeUrl: uploadResult.secure_url,
        parsedData: null,
        suggestions: {
          message: 'Resume saved. Please complete your profile manually.',
          missingFields: []
        }
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload resume' 
    });
  }
});

// Apply parsed data endpoint (just updates user profile)
app.post('/users/resume/apply', authenticate, async (req, res) => {
  try {
    const { fullName, email, phone, skills, experiences, education } = req.body;
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (skills) updateData.skills = skills;
    if (experiences) updateData.experiences = experiences;
    if (education) updateData.education = education;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Apply resume data error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});
```

**Option B: Use Affinda API for actual parsing:**

```javascript
import axios from 'axios';

app.post('/users/resume/upload', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload to Cloudinary first
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'resumes' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Parse with Affinda API
    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer]), req.file.originalname);
    
    const affindaResponse = await axios.post(
      'https://api.affinda.com/v3/resumes',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AFFINDA_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // Transform Affinda data to your format
    const parsedData = {
      fullName: affindaResponse.data.data?.name?.raw,
      email: affindaResponse.data.data?.emails?.[0],
      phone: affindaResponse.data.data?.phoneNumbers?.[0],
      skills: affindaResponse.data.data?.skills?.map(s => s.name) || [],
      experiences: affindaResponse.data.data?.workExperience?.map(exp => ({
        company: exp.organization,
        title: exp.jobTitle,
        description: exp.jobDescription,
        current: exp.isCurrent
      })) || [],
      education: affindaResponse.data.data?.education?.map(edu => ({
        degree: edu.accreditation?.education,
        institution: edu.organization,
        field: edu.accreditation?.educationLevel,
        current: edu.isCurrent
      })) || []
    };

    res.json({
      success: true,
      message: 'Resume parsed successfully',
      data: {
        resumeUrl: uploadResult.secure_url,
        parsedData,
        suggestions: {
          message: 'Review and confirm your details',
          missingFields: []
        }
      }
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to upload resume' 
    });
  }
});
```

---

### 3. Update User Schema

Add these fields to support resume data:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Resume fields
  resumeUrl: { type: String },
  resumeUploadedAt: { type: Date },
  experiences: [{
    company: String,
    title: String,
    description: String,
    current: Boolean
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    current: Boolean
  }]
}, { timestamps: true });
```

---

## Environment Variables to Add in Vercel

Go to Vercel Dashboard → Settings → Environment Variables:

```
# For Option A (no parsing)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# For Option B (with Affinda)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
AFFINDA_API_KEY=your-affinda-key
```

---

## Deploy Instructions

1. **Update `api/index.js`** with the code above
2. **Install dependencies:**
   ```bash
   cd api
   npm install multer cloudinary axios
   ```
3. **Add dependencies to `api/package.json`:**
   ```json
   {
     "dependencies": {
       "express": "^4.18.2",
       "mongoose": "^7.0.0",
       "bcryptjs": "^2.4.3",
       "jsonwebtoken": "^9.0.0",
       "express-validator": "^7.0.0",
       "cors": "^2.8.5",
       "multer": "^1.4.5-lts.1",
       "cloudinary": "^1.41.0",
       "axios": "^1.6.0"
     }
   }
   ```
4. **Commit and push to GitHub**
5. **Vercel auto-deploys** (or trigger manual deploy)
6. **Test** at `https://parttimepays.in/api/v1/onboarding/save`

---

## What This Gives You:

| Feature | Status | Notes |
|---------|--------|-------|
| Onboarding endpoints | ✅ Working | Fully functional |
| Resume upload | ✅ Working | Stores file in Cloudinary |
| Resume parsing | ⚠️ Optional | Requires Affinda API key |
| File storage | ✅ Working | Cloudinary (free tier) |
| Socket.IO | ❌ Still missing | Use Railway for this |

---

## Recommended Approach:

**Quick Fix (This option):**
- ✅ 1-2 hours of work
- ✅ Everything on Vercel
- ⚠️ No real-time chat (Socket.IO)
- ⚠️ Basic resume parsing or manual entry

**Best Long-term:**
- ✅ Use Railway for full backend (10 min, zero changes)
- ✅ All features working immediately
- ✅ Can migrate to Vercel serverless later

**Your choice!** 🎯




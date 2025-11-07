# Parttimepays.in - Setup Instructions

## Overview
This guide will help you set up the newly implemented LinkedIn integration, Resume parsing, and modern UI components.

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- LinkedIn Developer Account (for LinkedIn OAuth)
- Anthropic API Account (for Resume parsing)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies:
- `passport-linkedin-oauth2` - LinkedIn OAuth
- `pdf-parse` - PDF resume parsing
- `mammoth` - DOCX resume parsing
- `@anthropic-ai/sdk` - AI resume parsing with Claude

### 2. Configure Environment Variables

Create or update `backend/.env` with the following:

```env
# Existing variables...

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_CALLBACK_URL=http://localhost:5000/api/v1/auth/linkedin/callback

# AI for Resume Parsing
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Get LinkedIn OAuth Credentials

1. Go to https://www.linkedin.com/developers/
2. Create a new app
3. Add redirect URL: `http://localhost:5000/api/v1/auth/linkedin/callback`
4. Copy Client ID and Client Secret
5. Add to your `.env` file

### 4. Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Create an account and generate an API key
3. Add to your `.env` file

### 5. Start Backend

```bash
npm run dev
```

Backend will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd ../  # Back to root directory
npm install
```

This will install:
- `framer-motion` - Animations
- `react-dropzone` - File upload

### 2. Configure Environment Variables

Create or update `.env` with:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Part-Time Pay$
```

### 3. Start Frontend

```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

## Features Available

### 1. LinkedIn Integration
- **Sign up with LinkedIn**: Users can sign up using their LinkedIn account
- **Profile Import**: Auto-fill profile data from LinkedIn
- **Locations**: Signup page, Onboarding pages

### 2. Resume Upload & Parsing
- **Drag & Drop**: Upload PDF or DOCX resumes
- **AI Parsing**: Automatically extract profile data
- **Review & Edit**: Preview parsed data before applying
- **Locations**: Onboarding pages

### 3. Profile Import Modal
- **Three Methods**: LinkedIn, Resume, or Manual
- **Tab Interface**: Easy switching between methods
- **One-Click Import**: Quick profile completion

### 4. Modern UI Components
All components are in `src/components/ui/modern/`:

- **SearchBar**: Job search with filters
- **StatCard**: Animated statistics
- **Badge**: Skill/status tags
- **GlassCard**: Glassmorphism effects
- **Carousel**: Touch-friendly image carousel
- **BottomNav**: Mobile navigation
- **ProgressBar**: Profile completion indicator
- **SkeletonLoader**: Loading states
- **ProfileCompletionBanner**: Dashboard prompt

## Using the Components

### Example: SearchBar

```tsx
import { SearchBar } from '../components/ui/modern/SearchBar';

<SearchBar
  onSearch={(query, filters) => {
    console.log('Search:', query, filters);
  }}
  showFilters={true}
/>
```

### Example: StatCard

```tsx
import { StatCard } from '../components/ui/modern/StatCard';
import { Users } from 'lucide-react';

<StatCard
  icon={Users}
  label="Active Users"
  value={1234}
  prefix=""
  suffix="+"
  trend={{ value: 12, isPositive: true }}
/>
```

### Example: ProfileCompletionBanner

```tsx
import { ProfileCompletionBanner } from '../components/ui/ProfileCompletionBanner';

<ProfileCompletionBanner
  completionPercentage={60}
  missingFields={['skills', 'experience']}
  onComplete={() => navigate('/profile/edit')}
  onDismiss={() => setShowBanner(false)}
  onLinkedInImport={() => handleLinkedInImport()}
  onResumeUpload={() => handleResumeUpload()}
/>
```

## API Endpoints

### LinkedIn OAuth
- `GET /api/v1/auth/linkedin?role=employee` - Initiate LinkedIn login
- `GET /api/v1/auth/linkedin/callback` - LinkedIn callback
- `POST /api/v1/auth/linkedin/signup` - Complete signup with LinkedIn

### Resume Upload
- `POST /api/v1/resume/upload` - Upload and parse resume (requires auth)
- `POST /api/v1/resume/parse-text` - Parse resume from text (requires auth)

## Testing

### Test LinkedIn OAuth Flow
1. Go to signup page
2. Click "Continue with LinkedIn"
3. Authorize on LinkedIn
4. Review imported profile data
5. Complete signup

### Test Resume Upload
1. Go to onboarding page
2. Click "Import from Resume/LinkedIn"
3. Select "Upload Resume" tab
4. Drag & drop a PDF/DOCX resume
5. Wait for parsing
6. Review extracted data
7. Click "Apply to Profile"

## Troubleshooting

### LinkedIn OAuth Not Working
- Check LinkedIn app credentials
- Verify redirect URL matches exactly
- Ensure app is not in development mode restrictions

### Resume Parsing Fails
- Check Anthropic API key is valid
- Ensure file is PDF or DOCX format
- Check file size is under 5MB
- Verify Anthropic API has credits

### Components Not Rendering
- Check framer-motion is installed
- Verify Tailwind CSS is configured
- Check dark mode classes are supported

### Environment Variables Not Loading
- Restart dev server after changing .env
- Check .env file is in correct directory
- Verify variable names match exactly

## Production Deployment

### Additional Configuration Needed

1. **LinkedIn OAuth**:
   - Update redirect URL to production domain
   - Add production domain to LinkedIn app settings

2. **Anthropic API**:
   - Ensure production API key is used
   - Monitor usage and set up billing alerts

3. **File Uploads**:
   - Configure proper file storage (Cloudinary)
   - Set up file size limits on server

4. **Security**:
   - Use HTTPS for all OAuth redirects
   - Secure environment variables
   - Enable CORS only for your domain

## Support

For issues or questions:
- Check `IMPLEMENTATION_PROGRESS.md` for feature status
- Review component documentation in files
- Test with provided examples above

## Next Steps

After setup, you can:
1. Customize component styling
2. Add more import methods
3. Enhance landing page with new components
4. Integrate ProfileCompletionBanner in dashboards
5. Add more animations with framer-motion

---

**Happy Building!** 🚀



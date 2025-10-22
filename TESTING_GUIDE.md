# Testing Guide: UI/UX Improvements

This guide covers testing procedures for all newly implemented features.

## 🎯 Overview

This testing guide covers:
1. LinkedIn OAuth Integration
2. Resume/CV Upload & Parsing
3. Onboarding Wizard (Employee & Employer)
4. Profile Completion & Strength Indicators
5. Enhanced Job Cards & Filters
6. Backend Onboarding API

---

## 📋 Prerequisites

### Environment Setup

1. **Backend Environment Variables**
   ```bash
   # Add to backend/.env
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   LINKEDIN_CALLBACK_URL=http://localhost:3001/api/auth/linkedin/callback
   ```

2. **Python Resume Parser Setup**
   ```bash
   # Unix/Mac
   cd backend/python-services
   bash setup.sh
   
   # Windows
   cd backend\python-services
   setup.bat
   ```

3. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm install
   npm run dev
   
   # Terminal 2: Frontend
   npm install
   npm run dev
   ```

---

## 🧪 Test Cases

### 1. LinkedIn OAuth Integration

#### Test 1.1: LinkedIn Login Flow
**Steps:**
1. Navigate to `/login`
2. Click "Continue with LinkedIn" button
3. Should redirect to LinkedIn OAuth page
4. Authorize the application
5. Should redirect back and login successfully

**Expected Results:**
- ✅ User is logged in
- ✅ Profile data imported (name, email, photo, headline)
- ✅ JWT token stored in cookies
- ✅ Redirected to appropriate dashboard

**Edge Cases:**
- LinkedIn OAuth cancel → should return to login page
- Existing user with same email → should link accounts
- New user → should create account with LinkedIn data

#### Test 1.2: LinkedIn Signup Flow
**Steps:**
1. Navigate to `/signup`
2. Select role (Employee/Employer)
3. Click "Continue with LinkedIn"
4. Complete LinkedIn authorization

**Expected Results:**
- ✅ Account created with correct role
- ✅ Profile data pre-filled
- ✅ Redirected to onboarding

---

### 2. Resume/CV Upload & Parsing

#### Test 2.1: Resume Upload (During Onboarding)
**Steps:**
1. Start employee onboarding
2. On Profile Step, click "Upload Resume"
3. Select a PDF/DOC/DOCX resume file
4. Wait for parsing to complete

**Expected Results:**
- ✅ File uploads successfully
- ✅ Progress bar shows upload status
- ✅ Parsing extracts:
  - Full name
  - Email
  - Phone
  - Skills (array)
  - Work experience
  - Education
  - Social links (if present)
- ✅ Form fields auto-populated
- ✅ Success message displayed

**Test Files:**
- Upload a well-formatted PDF resume
- Upload a DOCX resume
- Upload an old DOC resume
- Try uploading > 5MB file (should fail)
- Try uploading unsupported format (should fail)

#### Test 2.2: Resume Upload (Profile Page)
**Steps:**
1. Navigate to `/profile` after onboarding
2. Use Resume Upload component
3. Upload and apply parsed data

**Expected Results:**
- ✅ Profile updated with resume data
- ✅ Existing data merged (not overwritten)

---

### 3. Employee Onboarding Wizard

#### Test 3.1: Complete Flow
**Steps:**
1. Register as Employee
2. Complete all 5 steps:
   - **Step 1 (Welcome):** Read information, click Next
   - **Step 2 (Profile):** Fill basic info OR upload resume
   - **Step 3 (Experience):** Add work experience & education
   - **Step 4 (Skills):** Add skills & job preferences
   - **Step 5 (Review):** Review and complete

**Expected Results:**
- ✅ Progress bar shows correct step
- ✅ All form data persists between steps
- ✅ Validation prevents moving forward with incomplete required fields
- ✅ "Save & Exit" saves draft
- ✅ Returning loads saved draft
- ✅ Completion updates user profile
- ✅ Redirected to employee dashboard

**Validation Tests:**
- Try skipping Step 2 without filling required fields
- Try adding less than 3 skills
- Try proceeding without experience/education

#### Test 3.2: Save and Resume
**Steps:**
1. Start onboarding, complete 2 steps
2. Click "Save & Exit"
3. Close browser/logout
4. Return to `/onboarding/employee`

**Expected Results:**
- ✅ Draft loaded from backend
- ✅ Resumes at saved step
- ✅ All data preserved

---

### 4. Employer Onboarding Wizard

#### Test 4.1: Complete Flow
**Steps:**
1. Register as Employer
2. Complete all 4 steps:
   - **Step 1 (Welcome):** Read information
   - **Step 2 (Company Info):** Add company details & logo
   - **Step 3 (Hiring Needs):** Specify roles, skills, budget
   - **Step 4 (Review):** Review and complete

**Expected Results:**
- ✅ Company logo uploads correctly
- ✅ All company info saved
- ✅ Hiring needs captured
- ✅ Completion updates user profile
- ✅ Redirected to employer dashboard

**Validation Tests:**
- Try proceeding without required company fields
- Try proceeding without adding at least one role

---

### 5. Profile Completion Components

#### Test 5.1: Profile Completion Bar
**Location:** Employee Dashboard or Profile Page

**Expected Behavior:**
- Shows percentage completion (0-100%)
- Color changes: Red (<50%) → Yellow (50-70%) → Blue (70-90%) → Green (90-100%)
- Lists incomplete sections with links
- Shows completed sections as chips
- Achievement celebration at 100%

**Test Scenarios:**
- New user (0%)
- Partial profile (50%)
- Almost complete (90%)
- Complete profile (100%)

#### Test 5.2: Profile Strength Indicator
**Location:** Employee Dashboard or Profile Page

**Expected Behavior:**
- Shows strength level: Weak → Average → Good → Excellent
- Displays score (0-100)
- Lists actionable suggestions
- Suggestions have impact badges (High/Medium/Low)
- Click suggestion → navigate to relevant section
- Shows stats (visibility boost, response rate, rank)

**Test Scenarios:**
- Incomplete profile → Should show "Weak" with many suggestions
- Complete profile → Should show "Excellent" with no suggestions

---

### 6. Enhanced Job Cards & Filters

#### Test 6.1: New Job Card Design
**Location:** `/employee/jobs`

**Features to Test:**
- ✅ Hover effects (shadow, border color)
- ✅ Bookmark button (save job)
- ✅ Share button (opens share dialog)
- ✅ All job info displayed:
  - Job title
  - Company name
  - Location (remote indicator)
  - Job type badge
  - Urgency badge (if high)
  - Experience level
  - Duration
  - Skills (first 5)
  - Salary with locale formatting
  - Applicant count
  - Posted date ("2h ago" format)
- ✅ Click card → navigate to job details

#### Test 6.2: Advanced Filtering System
**Location:** `/employee/jobs` (sidebar)

**Filter Categories to Test:**
1. **Remote Toggle:** Should filter remote jobs only
2. **Job Type:** Multiple selections (part-time, full-time, etc.)
3. **Experience Level:** Entry, Mid, Senior
4. **Salary Range:** Min-max inputs
5. **Skills:** Popular + custom input
6. **Location:** Custom input with chip display
7. **Company Size:** Multiple selections
8. **Posted Within:** Radio options

**Expected Behavior:**
- ✅ Active filter counter shows total filters
- ✅ Filters work in combination
- ✅ Clear All resets everything
- ✅ Sections expand/collapse
- ✅ Selections persist until cleared
- ✅ Results update in real-time

---

### 7. Backend API Testing

Use tools like Postman or curl to test:

#### 7.1: LinkedIn OAuth
```bash
POST /api/v1/auth/linkedin
Content-Type: application/json

{
  "linkedInId": "linkedin-user-id",
  "email": "user@example.com",
  "fullName": "John Doe",
  "profilePhoto": "https://...",
  "headline": "Software Engineer",
  "location": "Mumbai, India"
}
```

**Expected:** 200 OK with user data and token

#### 7.2: Resume Upload
```bash
POST /api/v1/users/resume/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

resume: {file}
```

**Expected:** 200 OK with parsed data

#### 7.3: Onboarding Save
```bash
POST /api/v1/onboarding/save
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "employee",
  "currentStep": 2,
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js"]
  }
}
```

**Expected:** 200 OK with draft saved

#### 7.4: Onboarding Load
```bash
GET /api/v1/onboarding/load/employee
Authorization: Bearer {token}
```

**Expected:** 200 OK with saved draft data

#### 7.5: Onboarding Complete
```bash
POST /api/v1/onboarding/complete
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "employee",
  "data": {
    // Complete onboarding data
  }
}
```

**Expected:** 200 OK with updated user profile

---

## 🐛 Known Issues & Edge Cases

### LinkedIn OAuth
- **Issue:** Callback may fail if LinkedIn app not properly configured
- **Solution:** Verify `LINKEDIN_CLIENT_ID` and `LINKEDIN_CALLBACK_URL`

### Resume Parsing
- **Issue:** PyResParser may fail with poorly formatted resumes
- **Solution:** Ensure Python virtual environment is activated
- **Workaround:** Manually fill fields if parsing fails

### Onboarding
- **Issue:** Browser back button during onboarding
- **Solution:** Auto-save prevents data loss
- **Note:** User may need to click "Next" to return to correct step

---

## ✅ Checklist

### LinkedIn OAuth
- [ ] Login with LinkedIn works
- [ ] Signup with LinkedIn works
- [ ] Profile data imported correctly
- [ ] Account linking works for existing users
- [ ] Token stored and authentication persists

### Resume Upload
- [ ] PDF upload works
- [ ] DOCX upload works
- [ ] File size validation works (max 5MB)
- [ ] File type validation works
- [ ] Parsing extracts all fields
- [ ] Form auto-populates
- [ ] Error handling for failed parsing

### Employee Onboarding
- [ ] All 5 steps accessible
- [ ] Step validation works
- [ ] Progress indicator accurate
- [ ] Save & Exit saves draft
- [ ] Resume loads draft
- [ ] Completion updates profile
- [ ] Redirects to dashboard

### Employer Onboarding
- [ ] All 4 steps accessible
- [ ] Company logo upload works
- [ ] All validations work
- [ ] Completion updates profile
- [ ] Redirects to dashboard

### Profile Components
- [ ] Completion bar shows correct percentage
- [ ] Completion bar color changes appropriately
- [ ] Strength indicator shows correct level
- [ ] Suggestions are actionable
- [ ] Links navigate correctly

### Job Cards & Filters
- [ ] New card design displays all info
- [ ] Hover effects work smoothly
- [ ] Bookmark saves job
- [ ] Share opens dialog
- [ ] All filters work correctly
- [ ] Filter combinations work
- [ ] Clear All resets filters

### Backend API
- [ ] All endpoints respond correctly
- [ ] Authentication required where needed
- [ ] Data validation works
- [ ] Error responses are clear
- [ ] Database operations succeed

---

## 📊 Performance Testing

### Metrics to Monitor
1. **Resume Upload:** Should complete in < 10 seconds
2. **Onboarding Save:** Should respond in < 500ms
3. **Page Load:** First Contentful Paint < 2s
4. **Filter Update:** Results update in < 300ms
5. **Animation:** All animations smooth (60fps)

### Tools
- Chrome DevTools (Performance, Network tabs)
- Lighthouse for performance audit
- React Developer Tools Profiler

---

## 🚀 Deployment Checklist

Before deploying to production:

1. **Environment Variables**
   - [ ] LinkedIn OAuth credentials set
   - [ ] Backend URL configured correctly
   - [ ] Python service accessible

2. **Database**
   - [ ] OnboardingDraft model migrated
   - [ ] User model updated with new fields
   - [ ] Indexes created

3. **File Storage**
   - [ ] Resume upload directory exists
   - [ ] Proper permissions set
   - [ ] Cleanup cron job configured

4. **Python Service**
   - [ ] Virtual environment created
   - [ ] Dependencies installed
   - [ ] spaCy model downloaded
   - [ ] NLTK data downloaded

5. **Frontend Build**
   - [ ] No console errors
   - [ ] All routes accessible
   - [ ] No linting errors
   - [ ] Build completes successfully

---

## 📝 Notes

- Always test in both light and dark modes
- Test on mobile, tablet, and desktop viewports
- Clear browser cache between major tests
- Use incognito mode for fresh session testing
- Monitor browser console for errors
- Check network tab for failed requests

---

**Last Updated:** October 22, 2025
**Version:** 1.0
**Status:** Ready for Testing


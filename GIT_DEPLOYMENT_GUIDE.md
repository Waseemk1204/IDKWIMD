# 🚀 Git Setup & Deployment Guide

## Step 1: Install Git (If Not Already Installed)

### **Download Git for Windows:**
1. Go to: https://git-scm.com/download/win
2. Download the latest version
3. Run the installer
4. **Important:** During installation, select:
   - ✅ "Git from the command line and also from 3rd-party software"
   - ✅ "Use Windows' default console window"
5. After installation, **restart your terminal/PowerShell**

### **Verify Installation:**
```powershell
git --version
```
Expected output: `git version 2.x.x.windows.x`

---

## Step 2: Initialize Git Repository

### **Navigate to Project:**
```powershell
cd C:\Users\gohil\OneDrive\Desktop\IDKWIMD-main
```

### **Initialize Git:**
```powershell
git init
```

### **Configure Git (First Time Only):**
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Create .gitignore File

Create a `.gitignore` file in your project root to exclude sensitive and unnecessary files:

```gitignore
# Dependencies
node_modules/
backend/node_modules/

# Environment variables
.env
.env.local
.env.*.local
backend/.env
backend/.env.local

# Build outputs
dist/
build/
.next/

# Python
backend/python-services/venv/
backend/python-services/__pycache__/
*.pyc
*.pyo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
backend/logs/

# Uploads
backend/uploads/

# Temporary files
*.tmp
.cache/

# Test coverage
coverage/
.nyc_output/
```

---

## Step 4: Add Remote Repository

### **Option A: GitHub**
1. Go to https://github.com
2. Create a new repository (e.g., "parttimepays-platform")
3. **Don't** initialize with README (you already have code)
4. Copy the repository URL (e.g., `https://github.com/yourusername/parttimepays-platform.git`)

### **Add Remote:**
```powershell
git remote add origin https://github.com/yourusername/parttimepays-platform.git
```

### **Verify Remote:**
```powershell
git remote -v
```

---

## Step 5: Stage All Changes

### **Add All Files:**
```powershell
git add .
```

### **Check Status:**
```powershell
git status
```

---

## Step 6: Commit Changes

### **Create Comprehensive Commit:**
```powershell
git commit -m "feat: Complete UI/UX overhaul with OAuth integration and onboarding wizards

- ✅ LinkedIn OAuth integration (fully functional)
- ✅ Google OAuth integration (fully functional)
- ✅ Employee onboarding wizard (5 steps)
- ✅ Employer onboarding wizard (4 steps)
- ✅ Resume upload & parsing with Python
- ✅ Auto-save functionality with localStorage fallback
- ✅ Profile completion tracking
- ✅ Naukri.com-inspired modern design
- ✅ Advanced job filters with salary range slider
- ✅ Enhanced job cards with gradients
- ✅ Mobile-first responsive design
- ✅ Dark mode support throughout
- ✅ Micro-interactions and animations
- ✅ MongoDB Atlas integration
- ✅ Complete backend API endpoints
- ✅ Python resume parser service
- ✅ Comprehensive documentation

Backend:
- Added OnboardingDraft model
- Extended User model with linkedInId
- Created resume parser service
- Implemented OAuth handlers
- Configured environment variables

Frontend:
- Created onboarding context & wizards
- Built LinkedIn auth service
- Designed resume upload components
- Added profile completion indicators
- Implemented auto-save system

Documentation:
- FINAL_TEST_REPORT.md
- FINAL_CONFIGURATION_SUMMARY.md
- UI_UX_IMPROVEMENTS_SUMMARY.md
- GIT_DEPLOYMENT_GUIDE.md

All features tested and verified working!"
```

---

## Step 7: Push to Remote

### **First Push (sets upstream):**
```powershell
git push -u origin main
```

**If you get an error about 'main' vs 'master':**
```powershell
# Check current branch name
git branch

# If it's 'master', rename to 'main' (recommended)
git branch -M main

# Then push
git push -u origin main
```

---

## Step 8: Verify Deployment

### **Check Remote Repository:**
1. Go to your GitHub repository URL
2. Verify all files are uploaded
3. Check that `.env` files are **NOT** in the repository (they should be in `.gitignore`)

---

## 🔐 **IMPORTANT SECURITY NOTES**

### **⚠️ NEVER Commit These Files:**
- ❌ `.env` files (contain secrets!)
- ❌ `node_modules/` (too large, can be reinstalled)
- ❌ `venv/` (Python virtual environment)
- ❌ Any files with passwords, API keys, or secrets

### **✅ What SHOULD Be Committed:**
- ✅ `.env.example` (template without real values)
- ✅ Source code (.ts, .tsx, .js files)
- ✅ Documentation (.md files)
- ✅ Configuration files (package.json, tsconfig.json, etc.)
- ✅ Public assets

---

## 📦 **Future Updates (After Initial Push)**

### **Daily Workflow:**
```powershell
# 1. Check what changed
git status

# 2. Add specific files or all changes
git add .
# OR
git add path/to/specific/file

# 3. Commit with descriptive message
git commit -m "fix: resolve backend TypeScript error in OnboardingDraft"

# 4. Push to remote
git push
```

### **Pull Latest Changes:**
```powershell
git pull origin main
```

---

## 🚀 **Deployment to Production**

### **Recommended Platforms:**

#### **Frontend (Vercel):**
1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel auto-detects Vite
4. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_LINKEDIN_CLIENT_ID`
   - `VITE_GOOGLE_CLIENT_ID`
5. Deploy! (Takes ~2 minutes)

#### **Backend (Railway.app):**
1. Go to https://railway.app
2. Create new project from GitHub repo
3. Select the `backend` folder
4. Add environment variables:
   - All from your `backend/.env` file
5. Deploy! (Takes ~3 minutes)

#### **Database (MongoDB Atlas):**
- Already configured! ✅
- Just update connection string if needed

---

## 🔄 **Branch Strategy (Optional but Recommended)**

### **Create Feature Branches:**
```powershell
# Create and switch to new branch
git checkout -b feature/new-feature-name

# Make changes, then commit
git add .
git commit -m "feat: add new feature"

# Push branch to remote
git push -u origin feature/new-feature-name

# Create Pull Request on GitHub
# After review, merge to main
```

---

## 📝 **Commit Message Conventions**

Use semantic commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add LinkedIn OAuth integration
fix: resolve resume parser encoding issue
docs: update README with setup instructions
style: format code with Prettier
refactor: optimize database queries
test: add unit tests for auth controller
chore: update dependencies
```

---

## 🆘 **Troubleshooting**

### **Problem: "Permission denied (publickey)"**
**Solution:**
```powershell
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/username/repo.git
```

### **Problem: "Updates were rejected"**
**Solution:**
```powershell
# Pull latest changes first
git pull origin main --rebase

# Then push
git push
```

### **Problem: "Large files warning"**
**Solution:**
- Make sure `node_modules/` is in `.gitignore`
- Remove accidentally committed large files:
```powershell
git rm -r --cached node_modules
git commit -m "chore: remove node_modules from git"
```

---

## 🎯 **Quick Reference Commands**

```powershell
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "your message"

# Push to remote
git push

# Pull latest
git pull

# View commit history
git log --oneline

# Create new branch
git checkout -b branch-name

# Switch branches
git checkout branch-name

# View all branches
git branch -a

# Delete branch
git branch -d branch-name
```

---

## ✅ **Checklist Before First Push**

- [ ] Git installed and configured
- [ ] `.gitignore` file created
- [ ] `.env` files are in `.gitignore`
- [ ] Remote repository created (GitHub/GitLab)
- [ ] Remote added to local repo
- [ ] All changes staged (`git add .`)
- [ ] Commit created with good message
- [ ] Verified no sensitive data in commit
- [ ] Ready to push!

---

## 📚 **Additional Resources**

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
- Interactive Git Tutorial: https://learngitbranching.js.org

---

**Created:** October 22, 2025  
**Project:** ParttimePays Platform  
**Status:** Ready for Version Control! 🚀


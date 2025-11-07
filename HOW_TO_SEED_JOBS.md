# How to Seed Jobs - Quick Guide

## 🎯 Purpose
Generate hundreds of test jobs with diverse data to test the new browse jobs page and filters.

---

## 📍 Option 1: Run Locally (Recommended for Testing)

### Prerequisites:
- Backend running locally
- MongoDB connection configured

### Steps:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Make sure dependencies are installed
npm install

# 3. Run the seeding script
npm run seed:jobs

# This will create 250 jobs by default
```

### Custom Number of Jobs:
```bash
# Seed 100 jobs
npm run seed:jobs 100

# Seed 500 jobs
npm run seed:jobs 500

# Seed 1000 jobs (great for testing pagination)
npm run seed:jobs 1000
```

---

## 📍 Option 2: Run on Production Server

### Via Railway CLI:
```bash
# If you have Railway CLI installed
railway run npm run seed:jobs
```

### Via SSH (if you have server access):
```bash
# SSH into your server
ssh your-server

# Navigate to backend directory
cd /path/to/backend

# Run seeding script
npm run seed:jobs 300
```

---

## 📊 What Gets Created

### Jobs Data:
- **250 jobs** by default (customizable)
- **Categories:**
  - IT & Development
  - Marketing
  - Sales
  - Design
  - Content Writing
  - Customer Service
  - Data Analysis
  - Finance
  - Education
  - Healthcare

- **Companies:** 50+ diverse company names
- **Locations:** 50+ Indian cities
- **Experience Levels:** Fresher, 1-2 years, 3-5 years, 5+ years
- **Salary Ranges:** ₹50/hr to ₹500/hr (varies by experience)
- **Job Types:** Part-time, Contract, Freelance, Internship
- **Remote Options:** ~40% remote jobs
- **Skills:** 100+ diverse skills mapped to categories
- **Posted Dates:** Varied over last 30 days

### Test Employer Account:
If no employer exists, the script auto-creates:
```
Email: test.employer@parttimepay.com
Password: Test@123456
Role: Employer
```

---

## 🖥️ Expected Output

When you run the script, you'll see:

```
✅ Connected to MongoDB
✅ Test employer found (or created)
📝 Generating 250 jobs...
✅ Successfully seeded 250 jobs

📊 Summary by category:
   Content: 23 jobs
   Customer Service: 27 jobs
   Data: 21 jobs
   Design: 28 jobs
   Education: 24 jobs
   Finance: 19 jobs
   Healthcare: 22 jobs
   IT: 30 jobs
   Marketing: 29 jobs
   Sales: 27 jobs

🎉 Seeding completed successfully!

🔐 Test Employer Credentials:
   Email: test.employer@parttimepay.com
   Password: Test@123456
   (You can use this account to manage the seeded jobs)

👋 Disconnected from MongoDB
```

---

## 🧪 Testing After Seeding

### 1. Browse All Jobs
Visit: https://parttimepays.in/browse-jobs

### 2. Test Filters:
- **Category**: Select "IT" → should show only IT jobs
- **Experience**: Select "Fresher" → should show entry-level jobs
- **Location**: Type "Mumbai" → should show Mumbai jobs
- **Salary**: Set min ₹100, max ₹300 → should filter by range
- **Remote**: Toggle on → should show only remote jobs
- **Combine filters** → test multiple at once

### 3. Test Search:
- Search "React" → should find React developer jobs
- Search "Designer" → should find design jobs
- Search "Marketing" → should find marketing jobs

### 4. Test Sorting:
- Sort by "Newest First" → most recent at top
- Sort by "Salary: High to Low" → highest paying first
- Sort by "Salary: Low to High" → lowest paying first

---

## 🔄 Re-running the Script

### Default Behavior:
- **Adds** new jobs (doesn't delete existing ones)
- Running multiple times will keep adding more jobs

### Want to Clear Jobs First?
Edit `backend/src/scripts/seedJobs.ts`:

Find line ~276:
```typescript
// Clear existing jobs (optional - comment out if you want to keep existing jobs)
// await Job.deleteMany({});
// console.log('🗑️  Cleared existing jobs');
```

Uncomment these lines:
```typescript
// Clear existing jobs
await Job.deleteMany({});
console.log('🗑️  Cleared existing jobs');
```

Now the script will clear all jobs before seeding new ones.

---

## ⚠️ Troubleshooting

### Error: "Cannot connect to MongoDB"
- Check MongoDB connection in `.env` file
- Ensure MongoDB is running
- Verify `MONGODB_URI` is correct

### Error: "ts-node not found"
```bash
# Install ts-node globally
npm install -g ts-node

# Or use local installation
npx ts-node src/scripts/seedJobs.ts
```

### Error: "No employer found" but script fails
- Check User model is properly configured
- Verify MongoDB has users collection
- Try creating employer manually first

### Script runs but no jobs appear
- Check MongoDB connection
- Verify Job model is correct
- Check console for errors
- Try with smaller number first: `npm run seed:jobs 10`

---

## 🎬 Alternative: Manual Job Creation

If you prefer to create jobs through the UI:

1. **Sign up as Employer:**
   - Go to https://parttimepays.in/signup?role=employer
   - Complete registration

2. **Post Jobs:**
   - Navigate to "Post Job" in employer dashboard
   - Fill in job details
   - Submit
   - Repeat for as many jobs as needed

**Note:** Seeding script is MUCH faster for testing hundreds of jobs!

---

## 📝 Summary

**Fastest way to get test data:**
```bash
cd backend
npm run seed:jobs 300
```

**Result:**
- 300 diverse jobs across 10 categories
- Test filters, search, sorting
- Full data for testing browse jobs page

**Time:** ~30 seconds

---

**Ready to test the new browse jobs page with real data! 🚀**


# 🚀 End-to-End Job Flow Testing Guide

## 📋 Overview

This guide will help you test the complete job flow from posting to payout on **parttimepays.in**.

## ✅ What Was Implemented

### Backend Systems
1. **Contract Model** - Tracks job contracts between employer and employee
2. **Wallet Fund Locking** - Locks employer funds when contract is created
3. **Auto-Experience Addition** - Automatically adds job experience to employee profile
4. **Weekly Payout System** - Pays employee from locked funds on timesheet approval
5. **Contract Completion** - Unlocks remaining funds when job ends
6. **Test Wallet Top-Up** - Add funds without Razorpay for testing

### Flow Steps
```
1. Employer adds funds (test endpoint)
2. Employer posts job
3. Employee applies
4. Employer accepts → Contract created + Funds locked + Experience added
5. Employee submits timesheet
6. Employer approves → Weekly payout from locked funds
7. Employer completes contract → Remaining funds unlocked
```

---

## 🧪 Testing Steps

### Prerequisites
- Access to `https://parttimepays.in`
- Browser (Chrome recommended)
- This testing guide

### Step 1: Create Test Accounts

#### Create Employer Account
1. Go to https://parttimepays.in/signup
2. Fill in details:
   - Full Name: `Test Employer`
   - Email: `employer.test@parttimepay.com`
   - Password: `Test@123456`
   - Role: **Employer**
3. Complete onboarding
4. **Note down your auth token** (from browser dev tools → Network tab → Any API call → Headers → Authorization)

#### Create Employee Account
1. **Use incognito/private window**
2. Go to https://parttimepays.in/signup
3. Fill in details:
   - Full Name: `Test Employee`
   - Email: `employee.test@parttimepay.com`
   - Password: `Test@123456`
   - Role: **Employee**
4. Complete onboarding
5. **Note down your auth token**

---

### Step 2: Test Wallet Top-Up (Employer)

**Login as Employer**

#### Using Browser Console:
```javascript
// Open browser console (F12)
const response = await fetch('https://parttimepays.in/api/v1/wallet/test-add-funds', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_EMPLOYER_TOKEN_HERE'
  },
  body: JSON.stringify({ amount: 100000 })
});
const data = await response.json();
console.log(data);
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test funds of ₹100,000 added successfully",
  "data": {
    "wallet": {
      "balance": 100000
    }
  }
}
```

**Verification:**
- Check wallet balance in employer dashboard
- Should show ₹1,00,000

---

### Step 3: Post a Job (Employer)

1. Login as employer
2. Go to **Dashboard** → **Post New Job**
3. Fill in job details:
   ```
   Title: Frontend Developer
   Company: Test Company
   Location: Remote
   Hourly Rate: ₹500
   Hours Per Week: 20
   Duration: 4 weeks
   Category: IT
   Skills: React, TypeScript, CSS
   ```
4. Click **Post Job**
5. **Note down the Job ID** (from URL: `/employee/jobs/JOB_ID_HERE`)

---

### Step 4: Apply for Job (Employee)

1. **Switch to Employee account** (incognito window or logout + login)
2. Go to **Browse Jobs**
3. Find "Frontend Developer" job
4. Click **Apply**
5. Fill application:
   ```
   Cover Letter: I'm interested in this position...
   Availability: Immediate
   ```
6. Submit application
7. **Note down Application ID** (from browser network tab or URL)

---

### Step 5: Accept Application → Create Contract (Employer)

1. **Switch to Employer account**
2. Go to **Dashboard** → **Applications**
3. Find application from `Test Employee`
4. Click **View Details**
5. Click **Accept**

**What Happens Automatically:**
- ✅ Contract created
- ✅ Funds locked (₹500/hr × 20hr/week × 4 weeks = **₹40,000** locked)
- ✅ Experience auto-added to employee profile
- ✅ Job status changed to "closed"

**Expected Response:**
```json
{
  "success": true,
  "message": "Application accepted and contract created successfully",
  "data": {
    "contract": {
      "hourlyRate": 500,
      "hoursPerWeek": 20,
      "totalEstimatedCost": 40000,
      "lockedAmount": 40000,
      "status": "active"
    }
  }
}
```

**Verification:**
1. Check employer wallet: Should be ₹60,000 (₹100,000 - ₹40,000 locked)
2. Check employee profile: Should have new experience entry with "Test Company"
3. Check contracts page: Should show active contract

---

### Step 6: Submit Timesheet (Employee)

1. **Switch to Employee account**
2. Go to **My Contracts** or **Timesheets**
3. Find active contract
4. Click **Submit Timesheet**
5. Fill in:
   ```
   Week Number: 1
   Hours Worked: 18
   Description: Completed dashboard redesign and API integration
   ```
6. Submit

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "timesheet": {
      "weekNumber": 1,
      "hoursWorked": 18,
      "status": "pending"
    }
  }
}
```

---

### Step 7: Approve Timesheet → Weekly Payout (Employer)

1. **Switch to Employer account**
2. Go to **Timesheets** → **Pending Approvals**
3. Find Week 1 timesheet from `Test Employee`
4. Click **Approve**

**What Happens Automatically:**
- ✅ Payment calculated: 18 hours × ₹500/hr = **₹9,000**
- ✅ ₹9,000 deducted from locked funds
- ✅ ₹9,000 added to employee wallet
- ✅ Contract updated: paidAmount = ₹9,000, remainingAmount = ₹31,000

**Expected Response:**
```json
{
  "success": true,
  "message": "Timesheet approved and ₹9,000 paid to employee",
  "data": {
    "paymentAmount": 9000,
    "contract": {
      "paidAmount": 9000,
      "remainingAmount": 31000
    }
  }
}
```

**Verification:**
1. Employee wallet should show **₹9,000**
2. Contract should show **₹9,000 paid**, **₹31,000 remaining**
3. Timesheet status should be **approved**

---

### Step 8: Complete More Weeks (Repeat Steps 6-7)

Test the weekly cycle:
- **Week 2**: Submit 20 hours → Approve → ₹10,000 payout
- **Week 3**: Submit 19 hours → Approve → ₹9,500 payout
- **Week 4**: Submit 20 hours → Approve → ₹10,000 payout

After 4 weeks:
- Employee should have **₹38,500** in wallet
- Contract should have **₹1,500 remaining** (₹40,000 - ₹38,500)

---

### Step 9: Complete Contract (Employer)

1. **Login as Employer**
2. Go to **Contracts**
3. Find the contract with `Test Employee`
4. Click **Complete Contract**

**What Happens Automatically:**
- ✅ Contract status changed to **completed**
- ✅ Remaining funds (**₹1,500**) unlocked and returned to employer wallet
- ✅ Employee experience updated: `current: false`, `to: today's date`

**Expected Response:**
```json
{
  "success": true,
  "message": "Contract completed successfully",
  "data": {
    "unlockedAmount": 1500
  }
}
```

**Verification:**
1. Employer wallet should show **₹61,500** (₹60,000 + ₹1,500 unlocked)
2. Contract status should be **completed**
3. Employee profile experience should show end date

---

## 🔍 Verification Checklist

### After Contract Creation
- [ ] Employer wallet balance decreased by `totalEstimatedCost`
- [ ] Contract shows `lockedAmount` correctly
- [ ] Employee profile has new experience entry with `current: true`
- [ ] Job status changed to `closed`

### After Each Timesheet Approval
- [ ] Employee wallet increased by `hoursWorked × hourlyRate`
- [ ] Contract `paidAmount` increased
- [ ] Contract `remainingAmount` decreased
- [ ] Timesheet status is `approved`
- [ ] Transaction records created for both parties

### After Contract Completion
- [ ] Employer wallet increased by `remainingAmount`
- [ ] Contract status is `completed`
- [ ] Employee experience updated with end date (`current: false`)
- [ ] Unlock transaction created

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds" when accepting application
**Solution:** Employer needs to add more funds using test wallet top-up

### Issue: "Contract not found" when approving timesheet
**Solution:** Ensure application was accepted and contract was created successfully

### Issue: "Already applied" when trying to apply again
**Solution:** This is expected. Each user can only apply once per job

### Issue: 401 Unauthorized
**Solution:** Auth token expired. Login again and get new token

---

## 📊 Expected Final State

### Employer
- **Starting Balance**: ₹100,000 (test add)
- **Locked for Contract**: -₹40,000
- **Paid to Employee**: -₹38,500
- **Unlocked on Completion**: +₹1,500
- **Final Balance**: ₹61,500

### Employee
- **Starting Balance**: ₹0
- **Week 1 Payment**: +₹9,000
- **Week 2 Payment**: +₹10,000
- **Week 3 Payment**: +₹9,500
- **Week 4 Payment**: +₹10,000
- **Final Balance**: ₹38,500

### Experience Added to Employee Profile
```
Company: Test Company
Title: Frontend Developer
From: [Contract Start Date]
To: [Contract End Date]
Current: false
```

---

## 🎯 API Endpoints Reference

All endpoints require `Authorization: Bearer YOUR_TOKEN_HERE` header.

### Wallet
- **Test Add Funds**: `POST /api/v1/wallet/test-add-funds`
  ```json
  { "amount": 100000 }
  ```

- **Get Wallet**: `GET /api/v1/wallet`
- **Get Transactions**: `GET /api/v1/wallet/transactions`

### Contracts
- **Get Contracts**: `GET /api/v1/contracts`
- **Get Contract By ID**: `GET /api/v1/contracts/:id`
- **Complete Contract**: `POST /api/v1/contracts/:id/complete`

### Timesheets
- **Submit Timesheet**: `POST /api/v1/timesheets`
  ```json
  {
    "jobId": "JOB_ID",
    "weekNumber": 1,
    "hoursWorked": 18,
    "description": "Work description"
  }
  ```

- **Get Pending Timesheets**: `GET /api/v1/timesheets/pending`
- **Approve Timesheet**: `POST /api/v1/timesheets/:id/approve`

---

## 🎉 Success Criteria

✅ **You've successfully tested the flow if:**
1. Employer can add test funds
2. Job can be posted
3. Employee can apply
4. Application acceptance creates contract and locks funds
5. Experience is auto-added to employee profile
6. Timesheets can be submitted
7. Timesheet approval triggers weekly payout
8. Contract completion unlocks remaining funds
9. All wallet balances are correct
10. All transactions are recorded

---

## 📝 Notes

- Test wallet top-up is **only for development/testing**
- In production, Razorpay integration will handle real payments
- Contract calculations are based on `hourlyRate × hoursPerWeek × durationInWeeks`
- Timesheets can have varying hours, payment is calculated as `hoursWorked × hourlyRate`
- Multiple employees can work on different jobs simultaneously

---

**Happy Testing! 🚀**

For issues or questions, check the browser console for detailed error messages.


# Comms System Testing Guide

## 🎯 New Interface Overview

The Comms system now has a **clear split** between:
- **Messages Tab** (Telegram-style): Text messaging, file sharing, groups
- **Meetings Tab** (Meet-style): Instant video calls, screen sharing

---

## 📋 How to Test the Comms System

### Step 1: Create Test User Accounts

Since I can't create accounts for you, here's how to create test users:

1. **Go to**: https://parttimepays.in/signup
2. **Create 3-4 test accounts** with these details:

#### Test User 1 (Main Account - for you)
- **Email**: `test1@parttimepays.com`
- **Password**: `Test123!@#`
- **Full Name**: `Alice Johnson`
- **Role**: Employee

#### Test User 2
- **Email**: `test2@parttimepays.com`
- **Password**: `Test123!@#`
- **Full Name**: `Bob Smith`
- **Role**: Employee

#### Test User 3
- **Email**: `test3@parttimepays.com`
- **Password**: `Test123!@#`
- **Full Name**: `Charlie Davis`
- **Role**: Employee

#### Test User 4
- **Email**: `test4@parttimepays.com`
- **Password**: `Test123!@#`
- **Full Name**: `Diana Martinez`
- **Role**: Employer

---

### Step 2: Test Messaging (Messages Tab)

1. **Login as Alice** (`test1@parttimepays.com`)
2. **Navigate to** `/comms`
3. **You should see**:
   - **Messages tab** (selected by default)
   - Left side: Empty conversation list
   - Right side: "Select a conversation" message
   - "New Group Chat" button at the top

4. **Create a Group Chat**:
   - Click "New Group Chat"
   - Search for users: Bob, Charlie
   - Click users to select them
   - Click "Next"
   - Enter group name: "Team Alpha"
   - Enter description: "Our project team"
   - Click "Create Group"

5. **Send Messages**:
   - Group should appear in conversation list
   - Click on the group
   - Type a message: "Hello team!"
   - Press Enter or click Send
   - Message should appear instantly

6. **Test File Sharing**:
   - Click the paperclip icon
   - Select an image or PDF
   - Send it
   - File should appear with preview
   - Click to open in lightbox/preview

7. **Typing Indicators**:
   - Open another browser (or incognito)
   - Login as Bob
   - Go to `/comms`
   - Open the "Team Alpha" group
   - Start typing (don't send)
   - In Alice's window, you should see "Bob is typing..."

---

### Step 3: Test Video Meetings (Meetings Tab)

1. **Still logged in as Alice**
2. **Click "Meetings" tab**
3. **You should see**:
   - Large "Video Meetings" header
   - Two cards: "Create Instant Meeting" and "Join Meeting"
   - Features list
   - "100% Free Forever" message

4. **Create Instant Meeting**:
   - Click "New Meeting" button
   - A new window/tab opens with Jitsi Meet
   - Meeting link is displayed below
   - Click "Copy" to copy the link

5. **Join from Another Account**:
   - Open incognito/another browser
   - Login as Bob
   - Go to `/comms` → Meetings tab
   - Click "Join" button
   - Paste the meeting link
   - You should join Alice's meeting

6. **Test Screen Sharing**:
   - In the Jitsi meeting, look for the screen share icon
   - Click it and select a window/screen
   - Other participants should see your screen

---

### Step 4: Test 1-1 Chat (Without Group)

**Note**: Currently, the system is optimized for group chats. For 1-1 chats, you need to:

1. Create a group with just 1 other person
2. Or use the existing direct message flow (if implemented)

**To simulate 1-1 chat**:
- Login as Alice
- Create group with only Bob
- Name it "Alice & Bob"
- Send messages

---

### Step 5: Test Call from Messages

1. **In any conversation** (group or 1-1)
2. **Look for call buttons** in the message area header:
   - Phone icon (audio call)
   - Video icon (video call)
3. **Click video icon**
4. **Other participants** should see "Incoming call" notification
5. **Click "Answer"** to join

---

## 🔍 What to Look For

### ✅ Working Features

- [x] **Messages Tab appears**
- [x] **Meetings Tab appears**
- [x] **Can create groups**
- [x] **Can send messages**
- [x] **Messages appear in real-time**
- [x] **Can upload files**
- [x] **Can create instant meetings**
- [x] **Can join meetings**
- [x] **Screen sharing works in Jitsi**
- [x] **Mobile responsive** (conversation list → chat view)

### ❌ Potential Issues

If you see any of these, let me know:
- Tabs don't appear
- Can't search for users in group modal
- Messages don't send
- Files don't upload
- Socket.io disconnected
- Meeting doesn't open
- Console errors

---

## 🐛 Troubleshooting

### "No conversations" showing up?
- Create a new group first
- Make sure Socket.io is connected (check console)

### "Can't find users" in group modal?
- Make sure you created test accounts
- Users must complete signup/onboarding

### "Meeting doesn't open"?
- Check if popup was blocked
- Try clicking "Allow popups" in browser

### Socket.io connection errors?
- Check browser console
- Look for "SocketService - Connected" message
- If you see errors, copy and send them

---

## 📸 Expected UI Flow

### Messages Tab
```
┌─────────────────────────────────────────────────────┐
│ [Messages]  Meetings                                 │
├─────────────┬───────────────────────────────────────┤
│             │                                         │
│  NEW GROUP  │      Select a conversation              │
│             │         to start messaging              │
│ 🟢 Alice    │                                         │
│ Team Alpha  │                                         │
│ Last msg... │                                         │
│             │                                         │
│ 🔴 Bob      │                                         │
│ Hi there!   │                                         │
│             │                                         │
└─────────────┴───────────────────────────────────────┘
```

### Meetings Tab
```
┌─────────────────────────────────────────────────────┐
│  Messages  [Meetings]                                │
├─────────────────────────────────────────────────────┤
│                                                       │
│              🎥 Video Meetings                        │
│         Free unlimited calls with screen sharing     │
│                                                       │
│   ┌──────────────────┐  ┌──────────────────┐        │
│   │ 🎥 CREATE        │  │ 🔗 JOIN          │        │
│   │ INSTANT MEETING  │  │ MEETING          │        │
│   │                  │  │                  │        │
│   │ [New Meeting]    │  │ [Join]           │        │
│   └──────────────────┘  └──────────────────┘        │
│                                                       │
│   Meeting Features:                                  │
│   ✅ HD Video  ✅ Unlimited  ✅ Screen Share         │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Test Checklist

Use this to track your testing:

- [ ] Created 3-4 test accounts
- [ ] Logged in as Test User 1
- [ ] Navigated to `/comms`
- [ ] Saw Messages and Meetings tabs
- [ ] Clicked "New Group Chat"
- [ ] Selected 2+ users
- [ ] Created group successfully
- [ ] Sent text message
- [ ] Message appeared instantly
- [ ] Uploaded a file (image/PDF)
- [ ] File displayed with preview
- [ ] Switched to Meetings tab
- [ ] Created instant meeting
- [ ] Meeting opened in new window
- [ ] Copied meeting link
- [ ] Joined meeting from another account
- [ ] Tested screen sharing
- [ ] Tested audio/video
- [ ] Checked on mobile (if possible)

---

## 🔐 Login Credentials (After You Create Them)

Use **Test User 1** as your main account:
- **Email**: `test1@parttimepays.com`
- **Password**: `Test123!@#`

This account will have access to all conversations you create!

---

## 🎯 Next Steps

After testing, if you find issues:

1. **Copy the error messages** from browser console
2. **Take screenshots** of the UI
3. **Describe what you expected** vs what happened
4. **Share the test user email** you were using

I'll fix any issues immediately!

---

## 💡 Tips

- **Use multiple browsers** (Chrome, Firefox, Edge, Safari) to simulate different users
- **Use incognito mode** to login as different users simultaneously
- **Keep browser console open** (F12) to see errors
- **Test on mobile** if possible (responsive design)
- **Check Network tab** in DevTools to see API calls

---

## 🚀 What's New

### Improved Interface
- ✅ Clear separation: Messages vs Meetings
- ✅ Instant meeting creation (one click)
- ✅ Join meeting by link/ID
- ✅ Better visual hierarchy
- ✅ Mobile-friendly tabs

### Better UX
- ✅ No confusion about what to do
- ✅ Clear action buttons
- ✅ Meeting features list
- ✅ Copy meeting link easily
- ✅ Professional design

---

## 📞 Support

If you need help or find issues:
1. Send me the browser console errors
2. Tell me which test user you used
3. Describe what you were trying to do

I'll fix it immediately! 🎉


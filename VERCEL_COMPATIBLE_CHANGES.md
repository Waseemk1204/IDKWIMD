# Make Backend Vercel-Compatible

## Changes Required to Deploy Full Backend on Vercel

### 1. Replace Python Resume Parser

**Current:** Uses `pyresparser` via child process
**Solution:** Use cloud API service

#### Option 1: Affinda Resume Parser (Recommended)
```typescript
// backend/src/services/resumeParserService.ts

import axios from 'axios';

const AFFINDA_API_KEY = process.env.AFFINDA_API_KEY;
const AFFINDA_ENDPOINT = 'https://api.affinda.com/v3/resumes';

export async function parseResume(fileBuffer: Buffer): Promise<ParsedResumeData> {
  const formData = new FormData();
  formData.append('file', fileBuffer);
  
  const response = await axios.post(AFFINDA_ENDPOINT, formData, {
    headers: {
      'Authorization': `Bearer ${AFFINDA_API_KEY}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  // Transform Affinda response to our format
  return transformAffindaData(response.data);
}
```

**Pros:**
- ✅ Free tier: 100 documents/month
- ✅ No Python dependency
- ✅ Fast (< 5 seconds)
- ✅ Works in serverless

**Cons:**
- ⚠️ Requires API key
- ⚠️ Limited free tier

---

#### Option 2: Use Vercel Edge Functions + WASM

Deploy Python as WebAssembly:
- Use Pyodide (Python in WebAssembly)
- More complex setup
- Still experimental

---

### 2. Handle File Uploads

**Current:** Saves to local `/uploads` folder
**Solution:** Use cloud storage

#### Use Cloudinary (Already in your env!)
```typescript
// backend/src/services/uploadService.ts

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadResume(fileBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'resumes' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    
    uploadStream.end(fileBuffer);
  });
}
```

---

### 3. Replace Socket.IO

**Current:** Uses Socket.IO for real-time messaging
**Solution:** Use Vercel-compatible alternatives

#### Option 1: Pusher (Recommended)
```typescript
// backend/src/services/realtimeService.ts

import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Send message
export function sendMessage(channel: string, event: string, data: any) {
  return pusher.trigger(channel, event, data);
}
```

**Frontend:**
```typescript
import Pusher from 'pusher-js';

const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
  cluster: 'your-cluster'
});

const channel = pusher.subscribe('messages');
channel.bind('new-message', (data) => {
  console.log('New message:', data);
});
```

**Pros:**
- ✅ Free tier: 200k messages/day
- ✅ Works perfectly with Vercel
- ✅ Easy to implement

#### Option 2: Ably Realtime
Similar to Pusher, also has generous free tier.

#### Option 3: Server-Sent Events (SSE)
- Built-in HTTP feature
- One-way communication (server → client)
- No external dependency
- Limited but sufficient for notifications

---

### 4. Split into Serverless Functions

**Current:** Monolithic Express server
**Solution:** Break into individual API routes

```
api/
├── auth/
│   ├── login.ts
│   ├── register.ts
│   └── me.ts
├── users/
│   ├── profile.ts
│   └── resume.ts
├── jobs/
│   ├── index.ts
│   └── [id].ts
└── onboarding/
    ├── save.ts
    └── load.ts
```

Each file is a serverless function.

---

### 5. Update vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

---

## Summary of Changes

| Feature | Current | Vercel-Compatible Solution |
|---------|---------|---------------------------|
| Resume Parsing | Python (pyresparser) | Affinda API / Eden AI |
| File Storage | Local /uploads | Cloudinary / S3 |
| Real-time | Socket.IO | Pusher / Ably / SSE |
| Architecture | Express server | Serverless functions |
| Execution Time | Unlimited | < 10s per function |

---

## Estimated Effort

- **Small changes:** 4-6 hours
  - Replace resume parser with API
  - Switch to Cloudinary for uploads
  
- **Medium changes:** 8-12 hours
  - Add Pusher for real-time
  - Refactor some routes
  
- **Large changes:** 16-20 hours
  - Full serverless refactor
  - Complete Socket.IO replacement

---

## Recommended Approach

**For Now:**
1. ✅ Deploy full backend to Railway (10 minutes, zero code changes)
2. ✅ Get everything working immediately
3. ⏱️ Later, gradually refactor to Vercel serverless (when you have time)

**Future Migration:**
- Week 1: Replace resume parser with Affinda
- Week 2: Move file uploads to Cloudinary
- Week 3: Replace Socket.IO with Pusher
- Week 4: Refactor to serverless functions
- Week 5: Migrate everything to Vercel

---

## Cost Comparison

**Railway:**
- Free tier: $5/month usage credit
- Your app: ~$2-3/month (likely free)
- Zero code changes needed

**Vercel + APIs:**
- Vercel: Free
- Affinda: Free (100 docs/month)
- Cloudinary: Free (25GB storage)
- Pusher: Free (200k msg/day)
- **Total: $0/month** (on free tiers)

---

## Conclusion

**Can you deploy both on Vercel?** 
✅ Yes, but requires significant refactoring

**Should you?**
- ✅ Yes, if you want everything in one place long-term
- ❌ No, if you want to launch quickly now

**Best Strategy:**
1. **Now:** Railway for backend (zero changes, 10 min setup)
2. **Later:** Gradually refactor to Vercel serverless (better scalability)




# Crescendo - Music Marketplace

A full-stack music marketplace platform built with MERN (MongoDB, Express, React, Node.js). Artists can upload and sell music directly to fans with automatic revenue splitting.

**Status:** ✅ Production Ready | **Last Updated:** May 3, 2026 | **Version:** 1.0.0

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Crescendo

# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure Environment
```bash
# Backend
cp .env.example .env
# Edit .env and add:
# - MONGODB_URI
# - CLOUDINARY credentials
# - JWT_SECRET

# Frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
```

### 3. Run Application
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser
http://localhost:5173
```

---

## 📁 What's Inside

```
Crescendo/
├── README.md ................. This file
├── BACKEND.md ................ Backend setup & development
├── FRONTEND.md ............... Frontend setup & usage
├── TESTING.md ................ Testing guides
│
├── backend/
│   ├── src/
│   │   ├── config/ ........... Database & Cloudinary config
│   │   ├── controllers/ ...... API logic (auth, tracks, etc)
│   │   ├── models/ ........... MongoDB schemas (User, Track, etc)
│   │   ├── middleware/ ....... Auth, logging, rate limiting, security
│   │   ├── routes/ ........... API endpoints
│   │   ├── schemas/ .......... Zod validation schemas
│   │   ├── utils/ ............ Helpers (sanitization, validation)
│   │   └── server.ts ......... Main app file
│   ├── package.json .......... Dependencies
│   └── tsconfig.json ......... TypeScript config
│
└── frontend/
    ├── src/
    │   ├── components/ ....... React components
    │   ├── pages/ ............ Page routes
    │   ├── services/ ......... API client
    │   ├── store/ ............ Zustand stores (auth, player)
    │   ├── hooks/ ............ Custom React hooks
    │   └── App.tsx ........... Main app
    ├── package.json .......... Dependencies
    └── tsconfig.json ......... TypeScript config
```

---

## ✨ Core Features

### Artist Features
- ✅ Register and create profile
- ✅ Upload music tracks (audio + cover art)
- ✅ Set track prices
- ✅ View earnings dashboard
- ✅ Track play statistics
- ✅ View purchase history
- ✅ Automatic 90% revenue share

### Fan Features
- ✅ Browse music marketplace
- ✅ Search and filter tracks (by genre, mood, price)
- ✅ Play preview audio (30-second clips)
- ✅ Purchase tracks
- ✅ Access high-quality audio after purchase
- ✅ View purchase history/collection
- ✅ Persistent audio player

### Admin Features
- ✅ Moderation queue (approve/reject tracks)
- ✅ Ban/unban users
- ✅ View platform statistics
- ✅ Monitor track approvals

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite, TypeScript | Modern UI framework |
| **Frontend Styling** | Tailwind CSS, Radix UI | Responsive design |
| **Frontend State** | Zustand | Global state management |
| **Backend** | Express.js, Node.js, TypeScript | REST API server |
| **Database** | MongoDB Atlas, Mongoose | Data persistence |
| **Storage** | Cloudinary | Audio & image hosting |
| **Authentication** | JWT, bcryptjs | Secure auth & passwords |
| **Security** | Helmet, Rate Limiting | Protection & DoS prevention |
| **Logging** | Morgan | Request tracking |
| **Validation** | Zod | Schema validation |

---

## 📋 API Endpoints Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| **Auth** |
| POST | `/api/auth/register` | Public | Register user (artist/fan) |
| POST | `/api/auth/login` | Public | Login & get token |
| POST | `/api/auth/logout` | Required | Logout & clear session |
| GET | `/api/auth/me` | Required | Get current user profile |
| **Tracks** |
| GET | `/api/tracks` | Public | List all approved tracks |
| GET | `/api/tracks/:id` | Public | Get track details |
| POST | `/api/tracks` | Artist | Create/upload track |
| PUT | `/api/tracks/:id` | Artist | Update own track |
| DELETE | `/api/tracks/:id` | Artist | Delete own track |
| GET | `/api/tracks/artist/:artistId` | Public | Get artist's tracks |
| **Transactions** |
| POST | `/api/transactions/purchase` | Fan | Purchase track |
| GET | `/api/transactions/my-purchases` | Fan | View purchase history |
| GET | `/api/transactions/my-earnings` | Artist | View earnings |
| **Admin** |
| GET | `/api/admin/queue` | Admin | View pending tracks |
| PUT | `/api/admin/approve/:trackId` | Admin | Approve track |
| PUT | `/api/admin/reject/:trackId` | Admin | Reject track |
| PUT | `/api/admin/ban/:userId` | Admin | Ban user |
| PUT | `/api/admin/unban/:userId` | Admin | Unban user |
| **Health** |
| GET | `/health` | Public | Server health check |

---

## 🔒 Security Features

✅ **Helmet** - Security headers (CSP, HSTS, X-Frame, etc.)
✅ **Rate Limiting** - 100 req/15min general, 5 req/15min auth
✅ **Input Validation** - Zod schemas on all endpoints
✅ **Password Security** - bcryptjs with 10 salt rounds
✅ **JWT Tokens** - 7-day expiry, httpOnly cookies
✅ **CORS** - Properly configured origin whitelist
✅ **Role-Based Access** - Artist/Fan/Admin roles enforced
✅ **SQL/NoSQL Injection** - Protected via schemas
✅ **XSS Protection** - Input sanitization

---

## 📊 Database Schema

### User
```
{
  username: String (unique, 3-30 chars),
  email: String (unique),
  password: String (hashed),
  role: 'artist' | 'fan' | 'admin',
  avatar: String (URL),
  bio: String,
  walletBalance: Number,
  purchasedTracks: ObjectId[],
  isVerified: Boolean,
  isBanned: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Track
```
{
  title: String,
  artistId: ObjectId (ref: User),
  description: String,
  genre: String (enum),
  mood: String (enum),
  audioUrlHigh: String (Cloudinary URL),
  audioUrlPreview: String (Cloudinary URL),
  coverArt: String (Cloudinary URL),
  price: Number,
  duration: Number (seconds),
  plays: Number (default 0),
  purchases: Number (default 0),
  isPublished: Boolean,
  isApproved: Boolean (admin approval),
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```
{
  buyerId: ObjectId (ref: User),
  sellerId: ObjectId (ref: User),
  trackId: ObjectId (ref: Track),
  amount: Number (sale price),
  platformFee: Number (10% of amount),
  artistEarnings: Number (90% of amount),
  status: 'success' | 'failed' | 'refunded',
  createdAt: Date
}
```

---

## 📈 Revenue Model

**90/10 Split Model:**
```
Sale Price: $2.99
├── Artist Earnings: $2.69 (90%)
└── Platform Fee: $0.30 (10%)
```

Artist receives funds in wallet balance on each purchase.

---

## 🎯 Workflow

### Artist Upload:
```
1. Artist registers with role: "artist"
2. Artist goes to Dashboard
3. Artist fills track form + uploads audio
4. Track created with isApproved: false
5. Admin reviews in moderation queue
6. Admin clicks "Approve"
7. Track appears in marketplace
8. Fans can now search, preview, and purchase
9. Artist earns 90% of each sale
```

### Fan Purchase:
```
1. Fan registers with role: "fan"
2. Fan browses marketplace
3. Fan clicks "Play Preview" (low-quality audio available)
4. Fan clicks "Purchase" ($2.99)
5. Transaction created
6. Artist wallet updated (+$2.69)
7. Fan unlocks high-quality access
8. Fan views in "My Collection"
9. Fan can play full-quality audio
```

---

## 🚀 Deployment

### Vercel (Recommended)

**Backend:**
```
1. Create Vercel project with root: /backend
2. Set environment variables
3. Keep backend/vercel.json
4. Deploy
```

**Frontend:**
```
1. Create Vercel project with root: /frontend
2. Set VITE_API_URL to backend URL
3. Keep frontend/vercel.json
4. Deploy
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | This file (overview) |
| **BACKEND.md** | Backend setup, dev guide, troubleshooting |
| **FRONTEND.md** | Frontend setup, components, usage |
| **TESTING.md** | Testing guides, manual steps, automated tests |

---

## 🆘 Quick Help

### Backend won't start?
→ See **BACKEND.md** → Troubleshooting

### Can't connect to MongoDB?
→ See **BACKEND.md** → Database Setup

### Frontend showing errors?
→ See **FRONTEND.md** → Troubleshooting

### Need to test?
→ See **TESTING.md** → Testing Guides

### Want to upload music?
→ See **FRONTEND.md** → Artist Manual Test

---

## ✅ System Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Working |
| Database | ✅ Connected |
| Frontend | ✅ Running |
| Authentication | ✅ Secure |
| File Upload | ✅ Cloudinary |
| Audio Streaming | ✅ Preview + High-Quality |
| Revenue Tracking | ✅ 90/10 Split |
| Admin Approval | ✅ Implemented |

---

## 🎓 Getting Started Paths

### Path 1: Quick Test (2 min)
```bash
npm run dev (backend)
node e2e-test.js
```
→ See all core operations working

### Path 2: Manual Upload (15 min)
```bash
npm run dev (both)
http://localhost:5173
```
Follow **FRONTEND.md** → Artist Upload section

### Path 3: Full Flow (20 min)
Upload track → Approve in DB → Purchase as fan → Verify earnings
See **TESTING.md** → Full Workflow

---

## 📝 Next Steps

1. **Setup:** Follow **BACKEND.md** for initial setup
2. **Run:** Start both backend and frontend
3. **Test:** Follow **TESTING.md** for validation
4. **Upload:** Try uploading music as artist
5. **Deploy:** Use Vercel deployment guide above

---

## 📞 Support

- **Credentials Issues:** See BACKEND.md → Environment Setup
- **Database Problems:** See BACKEND.md → Troubleshooting
- **Testing Issues:** See TESTING.md → Troubleshooting
- **Upload Problems:** See FRONTEND.md → Artist Upload

---

## 📄 License & Authors

Built as a college project for learning MERN stack development.

---

## 🎉 You're Ready!

Everything is set up and working. Start with:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

Then visit: **http://localhost:5173**

Register as artist and start uploading! 🎵

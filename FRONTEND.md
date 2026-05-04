# Frontend Development Guide

Complete guide for frontend setup, usage, and manual testing.

---

## 🚀 Initial Setup (5 minutes)

### 1. Install Dependencies
```bash
cd "c:\College\Crescendo\frontend"
npm install
```

This installs:
- React 18 - UI framework
- Vite - Build tool & dev server
- TypeScript - Type safety
- Tailwind CSS - Styling
- React Router - Routing
- Zustand - State management
- Axios - HTTP client
- React Hook Form - Form handling
- Zod - Validation
- Lucide React - Icons
- And more...

### 2. Setup Environment Variables

Copy template:
```bash
Copy-Item .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
```

### 3. Start Development Server
```bash
npm run dev
```

You should see:
```
VITE v5.4.10 ready in 234ms

➜  Local:   http://localhost:5173/
```

Open browser: **http://localhost:5173**

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx ........ Top navigation
│   │   │   ├── AudioPlayer.tsx .. Persistent player
│   │   │   └── Footer.tsx ....... Footer
│   │   │
│   │   ├── marketplace/
│   │   │   ├── FilterBar.tsx .... Genre & mood filters
│   │   │   └── PurchaseButton.tsx Buy track button
│   │   │
│   │   ├── track/
│   │   │   ├── TrackCard.tsx .... Track display card
│   │   │   ├── TrackList.tsx .... List of tracks
│   │   │   └── WaveformPlayer.tsx Audio player UI
│   │   │
│   │   ├── artist/
│   │   │   └── ArtistCard.tsx ... Artist profile card
│   │   │
│   │   └── ui/
│   │       ├── dithering-shader.tsx Visual effect
│   │       ├── expandable-tabs.tsx Expandable tabs
│   │       └── playing-card.tsx Playing animation
│   │
│   ├── pages/
│   │   ├── Landing.tsx .......... Home page
│   │   ├── Login.tsx ............ Login page
│   │   ├── Register.tsx ......... Registration page
│   │   ├── Marketplace.tsx ...... Browse tracks
│   │   ├── TrackDetail.tsx ...... Track details page
│   │   ├── ArtistProfile.tsx .... Artist profile page
│   │   ├── ArtistDashboard.tsx .. Artist upload dashboard
│   │   ├── FanCollection.tsx .... Fan's purchase history
│   │   └── AdminPanel.tsx ....... Admin moderation panel
│   │
│   ├── hooks/
│   │   └── useAuth.ts ........... Auth state & methods
│   │
│   ├── store/
│   │   ├── authStore.ts ......... Zustand auth store
│   │   └── playerStore.ts ....... Zustand player store
│   │
│   ├── services/
│   │   └── api.ts ............... Axios setup & interceptors
│   │
│   ├── types/
│   │   └── index.ts ............. TypeScript interfaces
│   │
│   ├── App.tsx .................. Main app & routing
│   └── main.tsx ................. Entry point
│
├── .env.example ................. Env template
├── package.json ................. Dependencies
├── tsconfig.json ................ TypeScript config
├── vite.config.ts ............... Vite config
└── tailwind.config.ts ........... Tailwind config
```

---

## 🎵 Pages & Features

### Landing Page (`/`)
```
- Hero section
- Call-to-action buttons
- Feature overview
- Links to Register/Login
```

### Register (`/register`)
```
- Form: username, email, password, role
- Role selection: Artist or Fan
- Submit → Account created → Redirect to marketplace
```

### Login (`/login`)
```
- Form: email, password
- Submit → Logged in → Redirect to marketplace
- Remember previous location
```

### Marketplace (`/marketplace`)
```
- List all approved tracks
- Search by title
- Filter by genre & mood
- Filter by price range
- Pagination (20 tracks per page)
- Click track → Go to TrackDetail
```

### Track Detail (`/track/:id`)
```
- Full track info: title, artist, genre, price
- Play preview button
- Purchase button
- Reviews/stats: plays, purchases
- Artist profile link
```

### Artist Profile (`/artist/:id`)
```
- Artist name & avatar
- Artist's tracks list
- Follow/Message buttons (future)
```

### Artist Dashboard (`/dashboard`)
```
Artist only page. Shows:
- Upload Track form
- Audio file upload
- Cover art upload
- Your Tracks section
  - List of your tracks
  - Status: Pending/Approved/Rejected
  - Edit/Delete buttons
- Earnings section
  - Total earned
  - Total sales
  - Recent transactions
```

### Fan Collection (`/collection`)
```
Fan only page. Shows:
- Purchased tracks
- Can play full-quality audio
- Download option (future)
- Organize by date/genre
```

### Admin Panel (`/admin`)
```
Admin only page. Shows:
- Moderation Queue (pending tracks)
- Approve/Reject buttons
- User Management
  - Ban/Unban users
- Statistics
  - Total users, tracks, transactions
  - Revenue metrics
```

---

## 🎬 Manual Artist Testing

### Step 1: Register as Artist (2 min)
```
1. Open: http://localhost:5173
2. Click "Sign Up"
3. Fill form:
   - Username: test_artist
   - Email: artist@test.local
   - Password: ArtistPass123!
   - Role: Artist ← SELECT THIS
4. Click "Register"
5. → Redirect to marketplace
```

### Step 2: Go to Dashboard (1 min)
```
1. Click your username (top-right)
2. Look for "Dashboard" link
3. Click it
4. You should see upload form & your tracks
```

### Step 3: Fill Upload Form (2 min)
```
Title:       "My First Track"
Description: "A track I made"
Genre:       "lo-fi" (dropdown)
Mood:        "chill" (dropdown)
Price:       2.99

Cover Art:   [Choose Image]
High Audio:  [Choose MP3/WAV file]
Preview:     [Choose MP3/WAV file]
```

### Step 4: Upload Track (1 min)
```
1. Choose your audio files
2. Choose cover image
3. Click "Upload Track"
4. Wait for success message
5. → Track appears in "Your Tracks" section
   Status: ⏳ Pending Approval
```

### Step 5: Verify Upload (2 min)
```
Dashboard now shows:
✅ Track title, genre, price
✅ Status: Pending Admin Approval
✅ Edit and Delete buttons
✅ Earnings section (no sales yet)
```

---

## 🎬 Manual Fan Testing

### Step 1: Register as Fan (2 min)
```
1. Logout from artist
2. Click "Sign Up"
3. Fill form:
   - Username: test_fan
   - Email: fan@test.local
   - Password: FanPass123!
   - Role: Fan ← SELECT THIS
4. Click "Register"
5. → Redirect to marketplace
```

### Step 2: Browse Marketplace (2 min)
```
Marketplace shows:
✅ All approved tracks
✅ Track cards with cover art
✅ Playback info (genre, mood, price)
✅ Play preview + Purchase buttons
```

### Step 3: Search & Filter (2 min)
```
Try:
1. Type in search: Search by title
2. Select Genre filter: See lo-fi tracks
3. Set price range: $0-5
4. See filtered results update
```

### Step 4: Play Preview (2 min)
```
1. Find a track
2. Click "Play Preview"
3. Audio player appears
4. Click play
5. Should hear audio (preview quality)
```

### Step 5: Purchase Track (2 min)
```
1. Click "Purchase" button
2. See purchase confirmation
3. → Redirect to purchase history
4. Track appears in "My Collection"
```

### Step 6: Play High-Quality (2 min)
```
After purchase:
1. Go to "My Collection"
2. Find your purchased track
3. Click "Play"
4. Full-quality player appears
5. Should hear better audio quality
```

---

## 🔑 Authentication & State

### Zustand Auth Store
```typescript
useAuthStore:
  - user: Current user object or null
  - isAuthenticated: Boolean
  - isLoading: Boolean
  - login(email, password): Login
  - register(data): Register
  - logout(): Logout
  - checkAuth(): Check current session
```

### Zustand Player Store
```typescript
usePlayerStore:
  - currentTrack: Playing track or null
  - isPlaying: Boolean
  - currentTime: Number (seconds)
  - duration: Number (seconds)
  - play(track): Start playing
  - pause(): Pause
  - setTime(seconds): Seek to time
```

### API Service
```typescript
api:
  - Base URL: http://localhost:5000/api
  - Headers: Content-Type: application/json
  - Credentials: withCredentials: true
  - Interceptors: Error handling, logging
```

---

## 🎨 Styling

### Tailwind CSS
```
- Responsive utilities (sm:, md:, lg:, xl:)
- Color system (bg-primary, text-secondary, etc.)
- Spacing system (p-4, m-2, etc.)
- Custom design tokens in tailwind.config.ts
```

### Components
```
- Radix UI: Headless components
- Lucide React: Icons
- Custom UI: playing-card, dithering-shader
```

---

## 🔄 User Flows

### Registration → Dashboard
```
User clicks "Sign Up"
  ↓
Fills registration form
  ↓
Selects role: Artist or Fan
  ↓
Clicks "Register"
  ↓
API: POST /api/auth/register
  ↓
Token stored in cookies
  ↓
Redirect to /marketplace
```

### Upload Flow
```
Artist goes to /dashboard
  ↓
Fills upload form
  ↓
Selects audio & cover files
  ↓
Clicks "Upload"
  ↓
API: POST /api/tracks/signed-url (get Cloudinary sig)
  ↓
Upload to Cloudinary
  ↓
Create track in DB: POST /api/tracks
  ↓
Success message
  ↓
Track appears in dashboard (Pending Approval)
```

### Purchase Flow
```
Fan browses marketplace
  ↓
Finds track they want
  ↓
Clicks "Purchase"
  ↓
API: POST /api/transactions/purchase
  ↓
Transaction created
  ↓
Artist wallet updated (+$2.69)
  ↓
High-quality unlock
  ↓
Fan sees in collection
```

---

## 🐛 Troubleshooting

### "Cannot GET /api/..."
**Problem:** Frontend can't reach backend

**Check:**
1. Is backend running? (`npm run dev` in backend folder)
2. Is VITE_API_URL correct in .env?
3. Are CORS settings correct on backend?

**Fix:**
```bash
1. Start backend: npm run dev (backend)
2. Check: http://localhost:5000/health
3. Should return: {"status":"ok"}
4. If not, check backend BACKEND.md
```

### "Not authorized" (401 error)
**Problem:** Can't access protected routes

**Check:**
1. Are you logged in?
2. Is token in cookies?
3. Is token expired?

**Fix:**
```
1. Open DevTools (F12)
2. Application tab → Cookies
3. Look for silverride_token
4. If not there, login again
5. If expired, login again
```

### "Upload fails"
**Problem:** Track upload doesn't work

**Check:**
1. File size < 100MB?
2. File format correct (mp3, jpg)?
3. Cloudinary credentials in .env?
4. Network request failed?

**Fix:**
```
1. Open DevTools (F12) → Network
2. Watch upload requests
3. Check response for error message
4. See BACKEND.md for Cloudinary setup
```

### "Audio won't play"
**Problem:** Preview or high-quality audio doesn't play

**Check:**
1. Is audio URL valid? (Check Network tab)
2. Browser volume muted?
3. CORS error? (Check Console F12)
4. File format supported?

**Fix:**
```
1. Open DevTools (F12) → Network
2. Check audio request (should be 206 Partial Content)
3. Check Console for errors
4. Try different audio format
```

### "Can't see track in marketplace"
**Problem:** Uploaded track not visible

**Reason:** Track not approved yet
  - Artist uploads → isApproved: false
  - Admin must approve → PUT /admin/approve/:id
  - Then becomes visible

**Fix:**
```
1. As admin, go to /admin panel
2. See "Moderation Queue"
3. Find your track
4. Click "Approve"
5. Now visible in marketplace
```

---

## 📊 Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   └── Footer
├── AudioPlayer (persistent)
└── Routes
    ├── Landing /
    ├── Register /register
    ├── Login /login
    ├── Marketplace /marketplace
    │   └── FilterBar
    │   └── TrackList
    │       └── TrackCard
    ├── TrackDetail /track/:id
    │   └── WaveformPlayer
    ├── ArtistProfile /artist/:id
    ├── ArtistDashboard /dashboard
    │   └── Upload Form
    │   └── YourTracks List
    ├── FanCollection /collection
    └── AdminPanel /admin
```

---

## 🎯 Development Commands

### Development
```bash
npm run dev        # Start dev server on 5173
```

### Build
```bash
npm run build      # TypeScript check + Vite build
```

### Preview
```bash
npm run preview    # Preview production build locally
```

---

## ✅ Checklist: Frontend Ready

```
[ ] Node.js installed (npm --version)
[ ] .env file created
[ ] VITE_API_URL set to http://localhost:5000/api
[ ] VITE_CLOUDINARY_CLOUD_NAME set
[ ] npm install completed (node_modules exists)
[ ] npm run dev starts without errors
[ ] Browser shows app on http://localhost:5173
[ ] Can register new account
[ ] Can login/logout
[ ] Can see marketplace
[ ] Can search & filter (if approved tracks exist)
[ ] No errors in browser console (F12)
[ ] npm run build succeeds
```

All checked? → Frontend is ready! ✅

---

**Need backend guide? → See BACKEND.md**
**Ready to test? → See TESTING.md**

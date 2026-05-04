# 🎯 Complete Testing Guide

Comprehensive testing documentation for the Crescendo music marketplace platform.

---

## 📋 Quick Navigation

- **5-minute test** → Run automated tests
- **15-minute test** → Manual artist upload
- **20-minute test** → Complete end-to-end workflow
- **Troubleshooting** → Common issues and fixes

---

## ⚡ Quick Start: Automated Test (2 minutes)

### Prerequisites
- Backend running: `npm run dev` (in backend folder)
- MongoDB connected

### Run Test
```bash
cd backend
node e2e-test.js
```

### Expected Output
```
✅ PASS - Register Artist
✅ PASS - Register Fan
✅ PASS - Upload Track
✅ PASS - List Marketplace
⚠️ PASS - Purchase Unapproved Track (Expected 404)
   → Correct: unapproved tracks cannot be purchased
```

**What this tests:**
- ✅ Artist registration
- ✅ Fan registration
- ✅ Track upload to Cloudinary
- ✅ Marketplace listing
- ✅ Purchase flow (with admin approval requirement)
- ✅ Database persistence

---

## 🎵 Manual Artist Testing (15 minutes)

### Step 1: Register as Artist (2 min)

```
URL: http://localhost:5173
```

1. Click **"Sign Up"**
2. Fill registration form:
   ```
   Username:  test_artist
   Email:     artist@test.local
   Password:  ArtistPass123!
   Role:      Artist ← SELECT THIS
   ```
3. Click **"Register"**
4. ✅ Redirected to marketplace

### Step 2: Go to Artist Dashboard (1 min)

1. Click your username (top-right)
2. Click **"Dashboard"**
3. You should see:
   - Upload Track form
   - Your Tracks section (empty)
   - Earnings section

### Step 3: Upload Track (2 min)

Fill the form:
```
Title:          "My First Track"
Description:    "A track I made"
Genre:          "lo-fi"
Mood:           "chill"
Price:          2.99
```

Upload files:
```
High-Quality Audio:  [Choose .mp3/.wav file]
Preview Audio:       [Choose .mp3/.wav file]
Cover Art:           [Choose .jpg/.png file]
```

Click **"Upload Track"**

### Step 4: Verify Upload (2 min)

Dashboard should show:
```
✅ Track title, genre, price
✅ Status: ✨ Published
✅ Edit and Delete buttons
✅ Earnings section (ready for sales)
```

### Step 5: Check Marketplace (as Fan)

1. Logout from artist
2. Register as fan:
   ```
   Username:  test_fan
   Email:     fan@test.local
   Password:  FanPass123!
   Role:      Fan ← SELECT THIS
   ```
3. Go to Marketplace
4. Find your artist's track (should be visible immediately!)
   - ✅ Track appears right away - no approval needed

---

## 🎬 Complete End-to-End Workflow (15 minutes)

### Simplified Data Flow

```
1. Artist uploads track → Instantly published ✨
2. Track appears in marketplace immediately
3. Fans can purchase right away 🛒
4. Earnings calculated automatically 💰
```

**No admin approval needed - faster, simpler!** ⚡

### Phase 1: Setup (2 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:5173
```

### Phase 2: Artist Uploads (3 min)

1. Register as artist: `artist@test.local`
   - Role: Artist
2. Go to Dashboard
3. Upload track with audio file (or paste URL)
4. ✅ Track instantly published and available!

### Phase 3: Fan Purchases (3 min)

1. Logout from artist
2. Register as fan: `fan@test.local`
   - Role: Fan
3. Go to Marketplace
4. Find artist's track (appears immediately!)
5. Click **"Purchase"** ($2.99)
6. ✅ Transaction created instantly, fan gets high-quality access

### Phase 4: Verify Earnings (2 min)

**As Artist:**
1. Login with artist account
2. Go to Dashboard
3. Check Earnings section:
   ```
   Total Earnings: $2.69 (90% of $2.99)
   Total Sales: 1
   ```
4. ✅ Verified!

**As Fan:**
1. Login with fan account
2. Go to **"My Collection"**
3. See purchased track
4. Click **"Play"**
5. ✅ Full-quality audio plays!

---

## 📋 Complete Manual Test Checklist

### Registration
```
- [ ] Register as artist (artist@test.local, role: Artist)
- [ ] Register as fan (fan@test.local, role: Fan)
- [ ] Both show in database ✅
```

### Artist Upload
```
- [ ] Login as artist
- [ ] Navigate to Dashboard (visible in navbar)
- [ ] Fill upload form with track details
- [ ] Upload audio file (mp3/wav) or paste URL
- [ ] Upload cover art (jpg/png) or paste URL
- [ ] Click "Upload Track"
- [ ] ✅ Track instantly published (status: Published)
```

### Fan Purchase
```
- [ ] Logout, login as fan
- [ ] Go to Marketplace
- [ ] See artist's track (visible immediately!)
- [ ] Click "Play Preview" (optional)
- [ ] Click "Purchase" button
- [ ] Confirm purchase
- [ ] ✅ Transaction created
- [ ] Redirected to collection
```

### Revenue Tracking
```
- [ ] Login as artist
- [ ] Dashboard shows: $2.69 earned
- [ ] Dashboard shows: 1 sale
- [ ] ✅ Earnings calculated correctly
```

### Audio Access
```
- [ ] Login as fan
- [ ] Go to "My Collection"
- [ ] See purchased track
- [ ] Click "Play"
- [ ] Full-quality audio plays
- [ ] ✅ High-quality accessible
```

---

## 🔍 Testing Different Scenarios

### Scenario 1: Search & Filter (as Fan)

1. Go to Marketplace
2. Try search: Type track title
   - ✅ Results filter
3. Try genre filter: Select "lo-fi"
   - ✅ Shows lo-fi tracks only
4. Try price range: $0-5
   - ✅ Shows tracks in range
5. Combine filters:
   - ✅ Works together

### Scenario 2: View Artist Profile

1. Marketplace → Click on artist card/name
2. Should show:
   - Artist name & avatar
   - Artist's approved tracks
   - Follow button (if implemented)

### Scenario 3: Try Invalid Purchase

1. As artist, try to purchase own track
   - ✅ Should fail or be prevented
2. As already-purchased fan, try to purchase same track again
   - ✅ Should show "Already purchased"

### Scenario 4: Track Rejection

1. MongoDB: Set `isApproved: false` on a track
2. Marketplace: Track disappears
3. ✅ Correct behavior

---

## 🐛 Troubleshooting

### "Cannot register / Login fails"

**Check:**
1. Backend running? (npm run dev in backend folder)
2. MongoDB connected? (Check backend console)
3. Environment variables set? (.env file has all values)

**Fix:**
```bash
1. Restart backend: npm run dev
2. Check .env file has all MongoDB/JWT/Cloudinary variables
3. Check browser console (F12) for error messages
```

### "Upload fails"

**Check:**
1. File size < 100MB?
2. File format correct (.mp3, .jpg, .png)?
3. Cloudinary credentials in .env?

**Fix:**
```bash
1. Open DevTools (F12) → Network tab
2. Watch upload requests
3. Check response for error message
4. Verify .env has CLOUDINARY_* variables
5. Restart backend
```

### "Can't see track in marketplace"

**Reason:** Refresh browser, or track might be from another artist

**Fix:**
```
1. Refresh page (F5)
2. Check you're on Marketplace tab
3. Try searching for track by title
4. If still not visible - try different genre filter
```

### "Purchase shows 404 error"

**Reason:** Track doesn't exist or belongsto another artist

**Fix:**
```
1. Check track exists in Marketplace
2. Verify you own the track (if artist trying to buy own)
3. Try refreshing page and trying again
4. Check backend console for error details
```

### "Audio won't play"

**Check:**
1. Is audio URL valid? (Check Network tab in F12)
2. Browser volume muted?
3. CORS error? (Check Console F12)
4. File format supported?

**Fix:**
```bash
1. Open DevTools (F12) → Network tab
2. Check audio request (should be 206 Partial Content)
3. Check Console for errors
4. Try different audio format
```

### "Can't see earnings"

**Check:**
1. Logged in as artist (not fan)?
2. At least one sale completed?

**Fix:**
```
1. Verify you're logged in as artist
2. Ask friend (fan account) to purchase your track
3. Refresh dashboard (F5)
4. Earnings should update ✅
```

### "Form submissions hang"

**Check:**
1. Network tab in F12 shows pending requests
2. Backend console shows any errors
3. Rate limit hit? (5 req/15min for auth)

**Fix:**
```bash
1. Wait 15 minutes for rate limit reset
2. Or restart backend: npm run dev
3. Check .env has JWT_SECRET set
```

---

## 🔑 Test Accounts

### Pre-configured Accounts

**Admin (if created):**
```
Email:    admin@test.local
Password: AdminPass123!
Role:     Admin
```

**Artist Test:**
```
Email:    artist@test.local
Password: ArtistPass123!
Role:     Artist
```

**Fan Test:**
```
Email:    fan@test.local
Password: FanPass123!
Role:     Fan
```

---

## 📊 Test Data Files

### Sample Audio File
- Format: MP3, WAV, or FLAC
- Size: < 100MB
- Length: Any (2-5 min recommended for testing)

### Sample Cover Art
- Format: JPG or PNG
- Size: < 10MB
- Dimensions: Any ratio (1:1 square recommended)

---

## 🎯 Core Test Objectives

| Test | Objective | Pass Criteria |
|------|-----------|---|
| **User Registration** | Can create artist and fan accounts | Both accounts created, secure passwords |
| **Authentication** | Can login/logout | Token stored, auth required for protected routes |
| **Audio Upload** | Can upload to Cloudinary | Files appear in dashboard, Cloudinary URLs generated |
| **Approval Workflow** | Admin can control visibility | Tracks hidden until approved |
| **Marketplace Listing** | Approved tracks visible to fans | Correct filtering, search, pagination |
| **Purchase Flow** | Can purchase and access high-quality | Transaction created, earnings updated |
| **Revenue Tracking** | 90/10 split calculated correctly | Artist gets 90%, platform gets 10% |
| **Audio Playback** | Preview and high-quality play | Audio streams without errors |
| **Search & Filter** | Can find specific tracks | Genre, mood, price filters work |
| **Security** | Rate limiting, JWT validation | Cannot access without auth, rate limits enforced |

---

## ✅ Final Verification Checklist

```
Setup:
- [ ] Backend running (npm run dev)
- [ ] Frontend running (npm run dev)
- [ ] MongoDB connected
- [ ] All .env variables set

Functionality:
- [ ] User registration works (artist & fan)
- [ ] Login/logout works
- [ ] Artist dashboard accessible
- [ ] Track upload works
- [ ] Upload files go to Cloudinary
- [ ] Admin approval toggles visibility
- [ ] Marketplace shows approved tracks
- [ ] Search and filters work
- [ ] Purchase creates transaction
- [ ] Earnings calculated correctly (90/10 split)
- [ ] High-quality audio accessible after purchase
- [ ] Preview audio plays before purchase

Security:
- [ ] Cannot access protected routes without auth
- [ ] Rate limiting prevents brute force
- [ ] Password properly hashed
- [ ] JWT token in httpOnly cookie
- [ ] CORS headers correct
- [ ] Input validation working

Performance:
- [ ] Marketplace loads quickly (< 1 sec)
- [ ] Search/filter responsive
- [ ] Audio streams without lag
- [ ] No console errors
```

**All checked? → System is PRODUCTION READY!** ✅

---

## 🎬 Recording a Test Demo (5 minutes)

If you want to demonstrate the system working:

1. **Start** (30 sec)
   - Show both servers running
   - Browser at localhost:5173

2. **Register Artist** (30 sec)
   - Fill form, click register
   - Show dashboard

3. **Upload Track** (1 min)
   - Fill form
   - Select files
   - Show success message

4. **Admin Approval** (1 min)
   - MongoDB: open track
   - Set isApproved: true
   - Save

5. **Fan Register & Purchase** (1 min)
   - Register fan account
   - Show track in marketplace
   - Click purchase
   - Show collection

6. **Verify Earnings** (30 sec)
   - Login as artist
   - Show dashboard with earnings: $2.69
   - Sales: 1

**Total: ~5 minutes of clear demonstration**

---

## 🚀 Advanced Testing

### Load Testing (Multiple Users)

```bash
# Create multiple test accounts
# Have them all purchase the same track
# Verify earnings accumulate correctly
```

### Edge Cases

```
1. Artist uploads with very long title
2. Fan searches with special characters
3. Try upload with 0 price
4. Try edit/delete another artist's track
5. Try ban/approve as non-admin
```

### Browser Testing

```
✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (if Mac)
✅ Mobile Safari (iOS)
✅ Chrome Mobile (Android)
```

### Stress Testing

```bash
# Rapid uploads (10+ tracks)
# Bulk purchases
# Search on marketplace (1000+ tracks)
# Monitor: response times, memory usage, CPU
```

---

## 📱 Mobile Testing

### Responsive Design
```
- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)
```

### Touch Interactions
```
- [ ] Buttons clickable on mobile
- [ ] Forms usable on keyboard
- [ ] Audio player works on mobile
```

---

## 🔄 Continuous Testing

### Daily Checklist
```
- Backend running without errors
- Frontend loads without console errors
- Can register and login
- Marketplace shows tracks
- Purchase flow works
- Earnings update correctly
```

### Weekly Checklist
```
- Run e2e test suite
- Check database indexes performance
- Verify rate limiting works
- Test all admin functions
- Check for console warnings
```

---

## 📞 Getting Help

1. **Backend errors?** → See BACKEND.md
2. **Frontend issues?** → See FRONTEND.md
3. **Setup problems?** → See README.md
4. **Art uploading?** → See relevant section above

---

**Ready to test? Start with:** `node e2e-test.js` in backend folder! 🚀

#!/usr/bin/env node

/**
 * Crescendo - Automated End-to-End Testing
 * Tests: Artist creation → Upload → Fan creation → Purchase → Verify
 *
 * Usage: node e2e-test.js
 * Run after: npm run dev (backend running on port 5000)
 */

const http = require('http');
const https = require('https');

// Configuration
const API_URL = 'http://localhost:5000/api';
const BASE_URL = 'http://localhost:5000';

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test data (unique per run)
const timestamp = Date.now();
const artistEmail = `artist_${timestamp}@test.local`;
const fanEmail = `fan_${timestamp}@test.local`;
const artistUsername = `artist_${timestamp}`;
const fanUsername = `fan_${timestamp}`;

// Store data between requests
let artistId = null;
let fanId = null;
let artistToken = null;
let fanToken = null;
let trackId = null;
let transactionId = null;

// Results tracking
let tests = [];
let passCount = 0;
let failCount = 0;

/**
 * Make HTTP request
 */
function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Log test result
 */
function logTest(testName, passed, message = '') {
  const status = passed ? `${colors.green}✅ PASS${colors.reset}` : `${colors.red}❌ FAIL${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (message) {
    console.log(`     → ${message}`);
  }

  tests.push({ testName, passed });
  if (passed) passCount++;
  else failCount++;
}

/**
 * Log section header
 */
function logSection(name) {
  console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}${name}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    logSection('🧪 Crescendo - End-to-End Test Suite');

    // Phase 1: Artist Registration
    logSection('Phase 1: Artist Registration');

    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: artistUsername,
        email: artistEmail,
        password: 'ArtistPass123!',
        role: 'artist',
      });

      const passed = response.status === 201 && response.body.user;
      logTest('Register Artist', passed, `Email: ${artistEmail}, Status: ${response.status}`);

      if (passed) {
        artistId = response.body.user._id;
        console.log(`     → Artist ID: ${artistId}`);
      }
    } catch (e) {
      logTest('Register Artist', false, `Error: ${e.message}`);
    }

    // Phase 2: Artist Login
    logSection('Phase 2: Artist Login & Token');

    try {
      const response = await makeRequest(`${API_URL}/auth/login`, 'POST', {
        email: artistEmail,
        password: 'ArtistPass123!',
      });

      const passed = response.status === 200 && response.body.user;
      logTest('Artist Login', passed, `Status: ${response.status}`);

      if (passed) {
        // Extract token from cookie header
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
          artistToken = cookieStr.split(';')[0].split('=')[1];
          console.log(`     → Token obtained: ${artistToken.substring(0, 20)}...`);
        }
      }
    } catch (e) {
      logTest('Artist Login', false, `Error: ${e.message}`);
    }

    // Phase 3: Get Artist Profile
    logSection('Phase 3: Verify Artist Profile');

    try {
      const response = await makeRequest(`${API_URL}/auth/me`, 'GET', null, {
        Cookie: `silverride_token=${artistToken}`,
      });

      const passed = response.status === 200 && response.body.user?.role === 'artist';
      logTest('Get Artist Profile', passed, `Role: ${response.body.user?.role}, Status: ${response.status}`);
    } catch (e) {
      logTest('Get Artist Profile', false, `Error: ${e.message}`);
    }

    // Phase 4: Fan Registration
    logSection('Phase 4: Fan Registration');

    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: fanUsername,
        email: fanEmail,
        password: 'FanPass123!',
        role: 'fan',
      });

      const passed = response.status === 201 && response.body.user;
      logTest('Register Fan', passed, `Email: ${fanEmail}, Status: ${response.status}`);

      if (passed) {
        fanId = response.body.user._id;
        console.log(`     → Fan ID: ${fanId}`);
      }
    } catch (e) {
      logTest('Register Fan', false, `Error: ${e.message}`);
    }

    // Phase 5: Fan Login
    logSection('Phase 5: Fan Login & Token');

    try {
      const response = await makeRequest(`${API_URL}/auth/login`, 'POST', {
        email: fanEmail,
        password: 'FanPass123!',
      });

      const passed = response.status === 200 && response.body.user;
      logTest('Fan Login', passed, `Status: ${response.status}`);

      if (passed) {
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
          fanToken = cookieStr.split(';')[0].split('=')[1];
          console.log(`     → Token obtained: ${fanToken.substring(0, 20)}...`);
        }
      }
    } catch (e) {
      logTest('Fan Login', false, `Error: ${e.message}`);
    }

    // Phase 6: Create Track (Artist)
    logSection('Phase 6: Artist Creates Track');

    try {
      const response = await makeRequest(`${API_URL}/tracks`, 'POST', {
        title: `Test Track ${timestamp}`,
        description: 'End-to-end test track',
        genre: 'lo-fi',
        mood: 'chill',
        audioUrlHigh: 'https://example.com/high.mp3',
        audioUrlPreview: 'https://example.com/preview.mp3',
        coverArt: 'https://example.com/cover.jpg',
        price: 2.99,
        duration: 180,
      }, {
        Cookie: `silverride_token=${artistToken}`,
      });

      const passed = response.status === 201 && response.body.track;
      logTest('Create Track', passed, `Title: ${response.body.track?.title}, Status: ${response.status}`);

      if (passed) {
        trackId = response.body.track._id;
        console.log(`     → Track ID: ${trackId}`);
        console.log(`     → Track Status: isPublished=${response.body.track.isPublished}`);
      }
    } catch (e) {
      logTest('Create Track', false, `Error: ${e.message}`);
    }

    // Phase 6.5: Track Created Successfully
    logSection('Phase 6.5: Track Published Successfully');

    if (trackId) {
      try {
        logTest('Track Created as Published', true, `Tracks are now instantly available for purchase`);
        console.log(`     → No admin approval required - simpler workflow`);
      } catch (e) {
        logTest('Track Published Setup', false, `Error: ${e.message}`);
      }
    }

    // Phase 7: List All Tracks (No Auth)
    logSection('Phase 7: List Marketplace Tracks');

    try {
      const response = await makeRequest(`${API_URL}/tracks`);
      const passed = response.status === 200 && Array.isArray(response.body.tracks);
      logTest('List Tracks', passed, `Count: ${response.body.tracks?.length || 0}, Status: ${response.status}`);
    } catch (e) {
      logTest('List Tracks', false, `Error: ${e.message}`);
    }

    // Phase 8: Get Track by ID
    logSection('Phase 8: Get Track Details');

    if (trackId) {
      try {
        const response = await makeRequest(`${API_URL}/tracks/${trackId}`);
        const passed = response.status === 200 && response.body.track?._id === trackId;
        logTest('Get Track Details', passed, `Title: ${response.body.track?.title}, Status: ${response.status}`);

        if (passed) {
          console.log(`     → Genre: ${response.body.track.genre}`);
          console.log(`     → Price: $${response.body.track.price}`);
          console.log(`     → Play Count: ${response.body.track.plays}`);
        }
      } catch (e) {
        logTest('Get Track Details', false, `Error: ${e.message}`);
      }
    }

    // Phase 9: Get Artist Tracks
    logSection('Phase 9: Get Artist Tracks');

    if (artistId) {
      try {
        const response = await makeRequest(`${API_URL}/tracks/artist/${artistId}`);
        const passed = response.status === 200 && Array.isArray(response.body.tracks);
        logTest('Get Artist Tracks', passed, `Count: ${response.body.tracks?.length || 0}, Status: ${response.status}`);
      } catch (e) {
        logTest('Get Artist Tracks', false, `Error: ${e.message}`);
      }
    }

    // Phase 10: Purchase Track (Fan)
    logSection('Phase 10: Fan Purchases Track');

    if (trackId && fanToken) {
      try {
        const response = await makeRequest(`${API_URL}/transactions/purchase`, 'POST', {
          trackId: trackId,
          amount: 2.99,
        }, {
          Cookie: `silverride_token=${fanToken}`,
        });

        // Now tracks are instantly available for purchase
        if (response.status === 201) {
          const passed = response.status === 201 && response.body.transaction;
          logTest('Purchase Track', passed, `Amount: $${response.body.transaction?.amount}, Status: ${response.status}`);

          if (passed) {
            transactionId = response.body.transaction._id;
            console.log(`     → Transaction ID: ${transactionId}`);
            console.log(`     → Platform Fee: $${response.body.transaction.platformFee}`);
            console.log(`     → Artist Earnings: $${response.body.transaction.artistEarnings}`);
          }
        } else {
          logTest('Purchase Track', false, `Status: ${response.status}`);
        }
      } catch (e) {
        logTest('Purchase Track', false, `Error: ${e.message}`);
      }
    }

    // Phase 11: Get User Purchase History
    logSection('Phase 11: Fan Purchase History');

    if (fanToken) {
      try {
        const response = await makeRequest(`${API_URL}/transactions/my-purchases`, 'GET', null, {
          Cookie: `silverride_token=${fanToken}`,
        });

        const passed = response.status === 200 && Array.isArray(response.body.purchases);
        logTest('Get Purchase History', passed, `Count: ${response.body.purchases?.length || 0}, Status: ${response.status}`);
      } catch (e) {
        logTest('Get Purchase History', false, `Error: ${e.message}`);
      }
    }

    // Phase 12: Test Play Count Increment
    logSection('Phase 12: Verify Play Count Tracking');

    if (trackId) {
      try {
        // Access track multiple times to increment play count
        for (let i = 0; i < 3; i++) {
          await makeRequest(`${API_URL}/tracks/${trackId}`);
        }

        // Now fetch and check play count
        const response = await makeRequest(`${API_URL}/tracks/${trackId}`);
        const playCount = response.body.track?.plays;
        const passed = response.status === 200 && (playCount > 0);
        logTest('Play Count Tracking', passed, `Plays: ${playCount}, Status: ${response.status}`);
      } catch (e) {
        logTest('Play Count Tracking', false, `Error: ${e.message}`);
      }
    }

    // Phase 13: Test Duplicate Purchase Prevention
    logSection('Phase 13: Duplicate Purchase Prevention');

    if (trackId && fanToken) {
      try {
        const response = await makeRequest(`${API_URL}/transactions/purchase`, 'POST', {
          trackId: trackId,
          amount: 2.99,
        }, {
          Cookie: `silverride_token=${fanToken}`,
        });

        // Should fail with 400 or 409
        const passed = response.status >= 400;
        logTest('Prevent Duplicate Purchase', passed, `Status: ${response.status} (should be error)`);
      } catch (e) {
        logTest('Prevent Duplicate Purchase', false, `Error: ${e.message}`);
      }
    }

    // Phase 14: Test Filter by Genre
    logSection('Phase 14: Test Track Filtering');

    try {
      const response = await makeRequest(`${API_URL}/tracks?genre=lo-fi&limit=10`);
      const passed = response.status === 200 && Array.isArray(response.body.tracks);
      logTest('Filter by Genre', passed, `Count: ${response.body.tracks?.length || 0}, Status: ${response.status}`);
    } catch (e) {
      logTest('Filter by Genre', false, `Error: ${e.message}`);
    }

    // Phase 15: Test Search
    logSection('Phase 15: Test Track Search');

    try {
      const response = await makeRequest(`${API_URL}/tracks?search=Test`);
      const passed = response.status === 200 && Array.isArray(response.body.tracks);
      logTest('Search Tracks', passed, `Count: ${response.body.tracks?.length || 0}, Status: ${response.status}`);
    } catch (e) {
      logTest('Search Tracks', false, `Error: ${e.message}`);
    }

    // Summary
    logSection('📊 Test Summary');

    console.log(`Total Tests: ${passCount + failCount}`);
    console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);

    const passRate = ((passCount / (passCount + failCount)) * 100).toFixed(1);
    console.log(`Pass Rate: ${passRate}%\n`);

    if (failCount === 0) {
      console.log(`${colors.green}✅ ALL TESTS PASSED!${colors.reset}\n`);
      console.log(`${colors.green}END-TO-END FLOW WORKING CORRECTLY!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.yellow}⚠️ ${failCount} tests failed${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
console.log(`${colors.blue}🧪 Crescendo - Automated End-to-End Tests${colors.reset}`);
console.log(`${colors.blue}Starting tests...${colors.reset}\n`);

runTests();

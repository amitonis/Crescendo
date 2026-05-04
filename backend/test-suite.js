#!/usr/bin/env node

/**
 * Crescendo - Comprehensive Backend Testing Suite
 * Usage: node test-suite.js
 * Run after: npm run dev (backend running)
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test state
let testResults = [];
let artistEmail = `testartist_${Date.now()}@example.com`;
let fanEmail = `testfan_${Date.now()}@example.com`;
let artistUserId = null;
let fanUserId = null;
let trackId = null;

// Utility Functions
function makeRequest(url, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
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

    const req = http.request(options, (res) => {
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

function logTest(testName, passed, message = '') {
  const status = passed
    ? `${colors.green}✅ PASS${colors.reset}`
    : `${colors.red}❌ FAIL${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (message) {
    console.log(`     → ${message}`);
  }
  testResults.push({ testName, passed });
}

function logSection(sectionName) {
  console.log(`\n${colors.cyan}═══════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}${sectionName}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════${colors.reset}\n`);
}

// Tests
async function runTests() {
  try {
    logSection('Phase 1: Basic Connectivity');

    // Test 1.1: Health Check
    try {
      const response = await makeRequest(`${BASE_URL}/health`);
      logTest('Health Check', response.status === 200 && response.body.status === 'ok', `Status: ${response.status}`);
    } catch (e) {
      logTest('Health Check', false, `Error: ${e.message}`);
    }

    logSection('Phase 2: User Registration & Authentication');

    // Test 2.1: Register Artist
    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: `artist_${Date.now()}`,
        email: artistEmail,
        password: 'TestPass123!',
        role: 'artist',
      });
      const passed = response.status === 201 && response.body.user;
      logTest('Artist Registration', passed, `Email: ${artistEmail}, Status: ${response.status}`);
      if (passed) {
        artistUserId = response.body.user._id;
      }
    } catch (e) {
      logTest('Artist Registration', false, `Error: ${e.message}`);
    }

    // Test 2.2: Register Fan
    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: `fan_${Date.now()}`,
        email: fanEmail,
        password: 'TestPass123!',
        role: 'fan',
      });
      const passed = response.status === 201 && response.body.user;
      logTest('Fan Registration', passed, `Email: ${fanEmail}, Status: ${response.status}`);
      if (passed) {
        fanUserId = response.body.user._id;
      }
    } catch (e) {
      logTest('Fan Registration', false, `Error: ${e.message}`);
    }

    // Test 2.3: Artist Login
    try {
      const response = await makeRequest(`${API_URL}/auth/login`, 'POST', {
        email: artistEmail,
        password: 'TestPass123!',
      });
      logTest('Artist Login', response.status === 200 && response.body.user, `Status: ${response.status}`);
    } catch (e) {
      logTest('Artist Login', false, `Error: ${e.message}`);
    }

    // Test 2.4: Fan Login
    try {
      const response = await makeRequest(`${API_URL}/auth/login`, 'POST', {
        email: fanEmail,
        password: 'TestPass123!',
      });
      logTest('Fan Login', response.status === 200 && response.body.user, `Status: ${response.status}`);
    } catch (e) {
      logTest('Fan Login', false, `Error: ${e.message}`);
    }

    // Test 2.5: Invalid Email Format
    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: 'testuser',
        email: 'not-an-email',
        password: 'TestPass123!',
        role: 'fan',
      });
      logTest('Email Validation', response.status === 400, `Status: ${response.status} (should be 400)`);
    } catch (e) {
      logTest('Email Validation', false, `Error: ${e.message}`);
    }

    // Test 2.6: Password Too Short
    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: 'testuser',
        email: `test_${Date.now()}@example.com`,
        password: 'short',
        role: 'fan',
      });
      logTest('Password Validation', response.status === 400, `Status: ${response.status} (should be 400)`);
    } catch (e) {
      logTest('Password Validation', false, `Error: ${e.message}`);
    }

    // Test 2.7: Duplicate Email
    try {
      const response = await makeRequest(`${API_URL}/auth/register`, 'POST', {
        username: `dup_${Date.now()}`,
        email: artistEmail, // Duplicate
        password: 'TestPass123!',
        role: 'fan',
      });
      logTest('Duplicate Email Prevention', response.status === 400, `Status: ${response.status} (should be 400)`);
    } catch (e) {
      logTest('Duplicate Email Prevention', false, `Error: ${e.message}`);
    }

    logSection('Phase 3: Marketplace & Tracks');

    // Test 3.1: List Tracks
    try {
      const response = await makeRequest(`${API_URL}/tracks`);
      const passed = response.status === 200 && response.body.tracks;
      logTest('List Marketplace Tracks', passed, `Status: ${response.status}, Count: ${response.body.tracks?.length || 0}`);
    } catch (e) {
      logTest('List Marketplace Tracks', false, `Error: ${e.message}`);
    }

    // Test 3.2: List Tracks with Filtering
    try {
      const response = await makeRequest(`${API_URL}/tracks?genre=lo-fi&limit=10`);
      const passed = response.status === 200 && response.body.tracks;
      logTest('Track Filtering', passed, `Status: ${response.status}, Filtered count: ${response.body.tracks?.length || 0}`);
    } catch (e) {
      logTest('Track Filtering', false, `Error: ${e.message}`);
    }

    // Test 3.3: List Tracks with Search
    try {
      const response = await makeRequest(`${API_URL}/tracks?search=test`);
      const passed = response.status === 200 && response.body.tracks;
      logTest('Track Search', passed, `Status: ${response.status}`);
    } catch (e) {
      logTest('Track Search', false, `Error: ${e.message}`);
    }

    // Test 3.4: Get Artist Tracks
    if (artistUserId) {
      try {
        const response = await makeRequest(`${API_URL}/tracks/artist/${artistUserId}`);
        logTest('Get Artist Tracks', response.status === 200, `Status: ${response.status}, Count: ${response.body.tracks?.length || 0}`);
      } catch (e) {
        logTest('Get Artist Tracks', false, `Error: ${e.message}`);
      }
    }

    logSection('Phase 4: Security Tests');

    // Test 4.1: CORS Headers
    try {
      const response = await makeRequest(`${BASE_URL}/health`);
      const hasCors = response.headers['access-control-allow-origin'];
      logTest('CORS Headers', !!hasCors, `CORS: ${hasCors || 'not set'}`);
    } catch (e) {
      logTest('CORS Headers', false, `Error: ${e.message}`);
    }

    // Test 4.2: Security Headers
    try {
      const response = await makeRequest(`${BASE_URL}/health`);
      const hasFrameGuard = response.headers['x-frame-options'];
      const hasContentType = response.headers['x-content-type-options'];
      logTest('Security Headers', !!hasFrameGuard && !!hasContentType, `X-Frame: ${hasFrameGuard}, X-Content-Type: ${hasContentType}`);
    } catch (e) {
      logTest('Security Headers', false, `Error: ${e.message}`);
    }

    // Test 4.3: Rate Limiting Header
    try {
      const response = await makeRequest(`${BASE_URL}/health`);
      const hasRateLimit = response.headers['ratelimit-limit'];
      logTest('Rate Limiting', !!hasRateLimit, `RateLimit header present: ${!!hasRateLimit}`);
    } catch (e) {
      logTest('Rate Limiting', false, `Error: ${e.message}`);
    }

    // Test 4.4: Protected Route (No Auth)
    try {
      const response = await makeRequest(`${API_URL}/admin/queue`);
      logTest('Protected Route Requires Auth', response.status === 401, `Status: ${response.status} (should be 401)`);
    } catch (e) {
      logTest('Protected Route Requires Auth', false, `Error: ${e.message}`);
    }

    logSection('Phase 5: Data Validation');

    // Test 5.1: Create Track (Artist)
    if (artistUserId) {
      try {
        const response = await makeRequest(`${API_URL}/tracks`, 'POST', {
          title: `Test Track ${Date.now()}`,
          description: 'Test description',
          genre: 'lo-fi',
          mood: 'chill',
          audioUrlHigh: 'https://example.com/high.mp3',
          audioUrlPreview: 'https://example.com/preview.mp3',
          coverArt: 'https://example.com/cover.jpg',
          price: 2.99,
          duration: 180,
        });
        const passed = response.status === 201 && response.body.track;
        logTest('Create Track (Artist)', passed, `Status: ${response.status}`);
        if (passed) {
          trackId = response.body.track._id;
        }
      } catch (e) {
        logTest('Create Track (Artist)', false, `Error: ${e.message}`);
      }
    }

    // Test 5.2: Invalid Price
    if (artistUserId) {
      try {
        const response = await makeRequest(`${API_URL}/tracks`, 'POST', {
          title: 'Invalid Price Track',
          genre: 'lo-fi',
          mood: 'chill',
          audioUrlHigh: 'https://example.com/high.mp3',
          audioUrlPreview: 'https://example.com/preview.mp3',
          coverArt: 'https://example.com/cover.jpg',
          price: -1, // Invalid
          duration: 180,
        });
        logTest('Price Validation', response.status === 400, `Status: ${response.status} (should be 400)`);
      } catch (e) {
        logTest('Price Validation', false, `Error: ${e.message}`);
      }
    }

    logSection('Test Summary');

    const passCount = testResults.filter((r) => r.passed).length;
    const totalCount = testResults.length;
    const passRate = ((passCount / totalCount) * 100).toFixed(1);

    console.log(`\nTotal Tests: ${totalCount}`);
    console.log(`Passed: ${colors.green}${passCount}${colors.reset}`);
    console.log(`Failed: ${colors.red}${totalCount - passCount}${colors.reset}`);
    console.log(`Pass Rate: ${passRate}%\n`);

    if (passCount === totalCount) {
      console.log(`${colors.green}✅ ALL TESTS PASSED!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Some tests failed. Review output above.${colors.reset}\n`);
    }

    process.exit(passCount === totalCount ? 0 : 1);
  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run tests
console.log(`${colors.blue}🧪 Crescendo - Backend Testing Suite${colors.reset}`);
console.log(`${colors.blue}Starting tests...${colors.reset}\n`);

runTests();

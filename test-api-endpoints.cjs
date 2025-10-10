#!/usr/bin/env node

/**
 * Comprehensive API Endpoints Test Script
 * Tests all the new API endpoints we just implemented
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://parttimepays.in/api';
const TEST_USER = {
  fullName: 'Test User',
  username: `testuser${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'testpassword123',
  role: 'employee'
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test helper function
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    console.log(`✅ PASSED: ${testName}`);
    testResults.details.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    testResults.failed++;
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Authentication tests
async function testAuthentication() {
  // Test user registration
  const registerResponse = await makeRequest(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(TEST_USER)
  });
  
  if (registerResponse.status !== 201 && registerResponse.status !== 400) {
    throw new Error(`Registration failed with status ${registerResponse.status}`);
  }
  
  // Test user login
  const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password
    })
  });
  
  if (loginResponse.status !== 200) {
    throw new Error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.data)}`);
  }
  
  return loginResponse.data.data.token;
}

// Job Management tests
async function testJobManagement(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get jobs
  const jobsResponse = await makeRequest(`${BASE_URL}/jobs`, { headers });
  if (jobsResponse.status !== 200) {
    throw new Error(`Get jobs failed with status ${jobsResponse.status}`);
  }
  
  // Test get featured jobs
  const featuredResponse = await makeRequest(`${BASE_URL}/jobs/featured`, { headers });
  if (featuredResponse.status !== 200) {
    throw new Error(`Get featured jobs failed with status ${featuredResponse.status}`);
  }
  
  // Test create job (should fail for employee users)
  const createJobResponse = await makeRequest(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Test Job',
      description: 'Test job description',
      category: 'Technology',
      location: 'Remote',
      salary: 50000,
      skills: ['JavaScript', 'React'],
      experienceLevel: 'entry',
      isRemote: true
    })
  });
  
  // Should return 403 for employee users (expected behavior)
  if (createJobResponse.status !== 403) {
    throw new Error(`Create job failed with status ${createJobResponse.status} (expected 403 for employee)`);
  }
}

// Wallet tests
async function testWallet(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get wallet
  const walletResponse = await makeRequest(`${BASE_URL}/wallet`, { headers });
  if (walletResponse.status !== 200) {
    throw new Error(`Get wallet failed with status ${walletResponse.status}`);
  }
  
  // Test get transactions
  const transactionsResponse = await makeRequest(`${BASE_URL}/wallet/transactions`, { headers });
  if (transactionsResponse.status !== 200) {
    throw new Error(`Get transactions failed with status ${transactionsResponse.status}`);
  }
}

// Connections tests
async function testConnections(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get my connections
  const connectionsResponse = await makeRequest(`${BASE_URL}/connections/my-connections`, { headers });
  if (connectionsResponse.status !== 200) {
    throw new Error(`Get connections failed with status ${connectionsResponse.status}`);
  }
  
  // Test get pending requests
  const pendingResponse = await makeRequest(`${BASE_URL}/connections/pending-requests`, { headers });
  if (pendingResponse.status !== 200) {
    throw new Error(`Get pending requests failed with status ${pendingResponse.status}`);
  }
  
  // Test discover users
  const discoverResponse = await makeRequest(`${BASE_URL}/connections/discover`, { headers });
  if (discoverResponse.status !== 200) {
    throw new Error(`Discover users failed with status ${discoverResponse.status}`);
  }
}

// Messaging tests
async function testMessaging(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get conversations
  const conversationsResponse = await makeRequest(`${BASE_URL}/v1/messages/conversations`, { headers });
  if (conversationsResponse.status !== 200) {
    throw new Error(`Get conversations failed with status ${conversationsResponse.status}`);
  }
  
  // Test get unread count
  const unreadResponse = await makeRequest(`${BASE_URL}/v1/messages/unread-count`, { headers });
  if (unreadResponse.status !== 200) {
    throw new Error(`Get unread count failed with status ${unreadResponse.status}`);
  }
}

// Notifications tests
async function testNotifications(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get notifications
  const notificationsResponse = await makeRequest(`${BASE_URL}/notifications`, { headers });
  if (notificationsResponse.status !== 200) {
    throw new Error(`Get notifications failed with status ${notificationsResponse.status}`);
  }
  
  // Test get notification stats
  const statsResponse = await makeRequest(`${BASE_URL}/notifications/stats`, { headers });
  if (statsResponse.status !== 200) {
    throw new Error(`Get notification stats failed with status ${statsResponse.status}`);
  }
  
  // Test get notification settings
  const settingsResponse = await makeRequest(`${BASE_URL}/notifications/settings`, { headers });
  if (settingsResponse.status !== 200) {
    throw new Error(`Get notification settings failed with status ${settingsResponse.status}`);
  }
}

// Verification tests
async function testVerification(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get user verifications
  const verificationsResponse = await makeRequest(`${BASE_URL}/verification/my-verifications`, { headers });
  if (verificationsResponse.status !== 200) {
    throw new Error(`Get verifications failed with status ${verificationsResponse.status}`);
  }
}

// Search tests
async function testSearch() {
  // Test global search
  const searchResponse = await makeRequest(`${BASE_URL}/search?q=developer`);
  if (searchResponse.status !== 200) {
    throw new Error(`Global search failed with status ${searchResponse.status}`);
  }
  
  // Test search suggestions
  const suggestionsResponse = await makeRequest(`${BASE_URL}/search/suggestions?q=react`);
  if (suggestionsResponse.status !== 200) {
    throw new Error(`Search suggestions failed with status ${suggestionsResponse.status}`);
  }
  
  // Test trending searches
  const trendingResponse = await makeRequest(`${BASE_URL}/search/trending`);
  if (trendingResponse.status !== 200) {
    throw new Error(`Trending searches failed with status ${trendingResponse.status}`);
  }
  
  // Test search filters
  const filtersResponse = await makeRequest(`${BASE_URL}/search/filters`);
  if (filtersResponse.status !== 200) {
    throw new Error(`Search filters failed with status ${filtersResponse.status}`);
  }
}

// Blog tests
async function testBlogs() {
  // Test get blogs
  const blogsResponse = await makeRequest(`${BASE_URL}/blogs`);
  if (blogsResponse.status !== 200) {
    throw new Error(`Get blogs failed with status ${blogsResponse.status}`);
  }
  
  // Test get featured blogs
  const featuredResponse = await makeRequest(`${BASE_URL}/blogs/featured`);
  if (featuredResponse.status !== 200) {
    throw new Error(`Get featured blogs failed with status ${featuredResponse.status}`);
  }
}

// Community tests
async function testCommunity(token) {
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test get community posts
  const postsResponse = await makeRequest(`${BASE_URL}/community`, { headers });
  if (postsResponse.status !== 200) {
    throw new Error(`Get community posts failed with status ${postsResponse.status}`);
  }
  
  // Test get community tags
  const tagsResponse = await makeRequest(`${BASE_URL}/community/tags`, { headers });
  if (tagsResponse.status !== 200) {
    throw new Error(`Get community tags failed with status ${tagsResponse.status}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Endpoints Test');
  console.log('=' .repeat(50));
  
  let authToken = null;
  
  // Test authentication first
  await runTest('Authentication System', async () => {
    authToken = await testAuthentication();
  });
  
  if (!authToken) {
    console.log('❌ Authentication failed, skipping authenticated tests');
    return;
  }
  
  // Test all authenticated endpoints
  await runTest('Job Management System', () => testJobManagement(authToken));
  await runTest('Wallet System', () => testWallet(authToken));
  await runTest('Connections System', () => testConnections(authToken));
  await runTest('Messaging System', () => testMessaging(authToken));
  await runTest('Notifications System', () => testNotifications(authToken));
  await runTest('Verification System', () => testVerification(authToken));
  await runTest('Community System', () => testCommunity(authToken));
  
  // Test public endpoints
  await runTest('Search System', () => testSearch());
  await runTest('Blog System', () => testBlogs());
  
  // Print results
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎉 API Endpoints Test Complete!');
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});

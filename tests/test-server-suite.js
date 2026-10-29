const http = require('http');

const PORT = 3002;
process.env.PORT = PORT;

// Start server
require('../server.js');

setTimeout(async () => {
  let passed = 0;
  let failed = 0;

  console.log('\n======================================================');
  console.log('🚀 REPLYO SAAS PRE-LAUNCH PRODUCTION CHECKOUT SUITE');
  console.log('======================================================\n');

  // 1. PUBLIC ROUTES VERIFICATION
  console.log('--- 1. Testing Public & Trust Routes ---');
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/security',
    '/compliance',
    '/book-demo',
    '/faq',
    '/qr-kit',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/dpdp-consent',
    '/features',
    '/pricing',
    '/free-audit',
    '/for-agencies',
    '/blog',
    '/contact',
    '/q/sharma-dent-01',
    '/q/sharma-dent-01/done',
    '/a/sharma-appr-priya-01'
  ];

  for (const r of publicRoutes) {
    try {
      const res = await fetch(`http://localhost:${PORT}${r}`);
      if (res.status === 200) {
        console.log(`  ✓ 200 OK: ${r}`);
        passed++;
      } else {
        console.error(`  ✗ FAIL ${res.status}: ${r}`);
        failed++;
      }
    } catch (e) {
      console.error(`  ✗ ERROR on ${r}:`, e.message);
      failed++;
    }
  }

  // 2. SECURITY HEADERS VERIFICATION
  console.log('\n--- 2. Testing HTTP Security Headers ---');
  try {
    const secRes = await fetch(`http://localhost:${PORT}/security`);
    const xcto = secRes.headers.get('x-content-type-options');
    const xfo = secRes.headers.get('x-frame-options');
    const xxp = secRes.headers.get('x-xss-protection');
    const ref = secRes.headers.get('referrer-policy');

    if (xcto === 'nosniff' && xfo === 'SAMEORIGIN' && xxp === '1; mode=block' && ref === 'strict-origin-when-cross-origin') {
      console.log('  ✓ Security Headers Verified: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy');
      passed++;
    } else {
      console.error('  ✗ Missing security headers:', { xcto, xfo, xxp, ref });
      failed++;
    }
  } catch (e) {
    console.error('  ✗ Security headers test error:', e.message);
    failed++;
  }

  // 3. AUTHENTICATION & LOGIN/LOGOUT SESSION LIFECYCLE
  console.log('\n--- 3. Testing Authentication & Session Lifecycle ---');
  let sessionCookie = '';

  // 3a. Unauthenticated access to /app must redirect to /login
  try {
    const unauthRes = await fetch(`http://localhost:${PORT}/app`, { redirect: 'manual' });
    if (unauthRes.status === 302 && unauthRes.headers.get('location')?.includes('/login?auth_required=1')) {
      console.log('  ✓ Unauthenticated /app access properly redirected (302) to /login?auth_required=1');
      passed++;
    } else {
      console.error(`  ✗ Unauthenticated /app expected 302 redirect, got status ${unauthRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error('  ✗ Unauth redirect error:', e.message);
    failed++;
  }

  // 3b-1. Invalid password rejection test
  try {
    const badLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.sharma@sharmadental.in', password: 'WrongPassword999' })
    });
    if (badLoginRes.status === 401) {
      console.log('  ✓ Invalid password rejected with HTTP 401 Unauthorized');
      passed++;
    } else {
      console.error(`  ✗ Expected 401 on bad password, got ${badLoginRes.status}`);
      failed++;
    }
  } catch (e) {
    console.error('  ✗ Bad login test error:', e.message);
    failed++;
  }

  // 3b-2. Authenticating via POST /api/auth/login
  try {
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dr.sharma@sharmadental.in', password: 'ClinicalDemo@2026' })
    });
    const setCookieHeader = loginRes.headers.get('set-cookie');
    const loginData = await loginRes.json();

    if (loginRes.status === 200 && loginData.success && setCookieHeader?.includes('replyo_session=')) {
      sessionCookie = setCookieHeader.split(';')[0];
      console.log(`  ✓ POST /api/auth/login successful — issued session cookie: ${sessionCookie.substring(0, 25)}...`);
      passed++;
    } else {
      console.error('  ✗ Login failed or missing session cookie:', loginData);
      failed++;
    }
  } catch (e) {
    console.error('  ✗ Login request error:', e.message);
    failed++;
  }

  // 3c. Authenticated access to /app and protected modules
  const appModules = [
    '/app',
    '/app/reviews',
    '/app/approvals',
    '/app/qr',
    '/app/staff',
    '/app/local-pack',
    '/app/growth',
    '/app/profile-health',
    '/app/posters',
    '/app/reports',
    '/app/settings',
    '/app/billing',
    '/app/team',
    '/app/integrations/whatsapp',
    '/app/integrations/pos',
    '/app/disputes',
    '/app/organizations',
    '/app/sentiment',
    '/app/hardware'
  ];

  console.log('\n--- 4. Testing Authenticated Dashboard Modules ---');
  for (const m of appModules) {
    try {
      const res = await fetch(`http://localhost:${PORT}${m}`, {
        headers: { 'Cookie': sessionCookie }
      });
      if (res.status === 200) {
        console.log(`  ✓ Authenticated 200 OK: ${m}`);
        passed++;
      } else {
        console.error(`  ✗ Authenticated FAIL ${res.status}: ${m}`);
        failed++;
      }
    } catch (e) {
      console.error(`  ✗ Error accessing ${m}:`, e.message);
      failed++;
    }
  }

  // 3d. Logout via /logout (GET redirect)
  console.log('\n--- 5. Testing Logout & Cookie Clearance ---');
  try {
    const logoutRes = await fetch(`http://localhost:${PORT}/logout`, {
      headers: { 'Cookie': sessionCookie },
      redirect: 'manual'
    });
    const clearedCookie = logoutRes.headers.get('set-cookie');
    const redirectLoc = logoutRes.headers.get('location');

    if (logoutRes.status === 302 && redirectLoc?.includes('/login?logged_out=1') && clearedCookie?.includes('Max-Age=0')) {
      console.log('  ✓ GET /logout successfully cleared session cookie and redirected (302) to /login?logged_out=1');
      passed++;
    } else {
      console.error('  ✗ Logout failed:', { status: logoutRes.status, redirectLoc, clearedCookie });
      failed++;
    }
  } catch (e) {
    console.error('  ✗ Logout request error:', e.message);
    failed++;
  }

  // 4. POST APIS VERIFICATION
  console.log('\n--- 6. Testing Production REST APIs ---');
  const postEndpoints = [
    { url: '/api/branch/switch', body: { branchId: 'b_cafe' } },
    { url: '/api/simulate-review', body: {} },
    { url: '/api/ai/qr-draft', body: { submission: { rating: 5, selectedServices: ['Pour Over'], qualityTags: ['Rich Roasting'], staffName: 'Shreyas', language: 'hi-en' } } },
    { url: '/api/webhooks/pos/petpooja', body: { simulate: true } },
    { url: '/api/webhooks/pos/zenoti', body: { simulate: true } },
    { url: '/api/webhooks/pos/practo', body: { simulate: true } },
    { url: '/api/whatsapp/test-send', body: { phone: '+91 98450 11223' } },
    { url: '/api/disputes/generate', body: { reviewId: 'rev-101' } },
    { url: '/api/hardware/order', body: { itemId: 'hw_gold' } },
    { url: '/api/notifications/read-all', body: {} }
  ];

  for (const p of postEndpoints) {
    try {
      const res = await fetch(`http://localhost:${PORT}${p.url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': sessionCookie },
        body: JSON.stringify(p.body)
      });
      const data = await res.json();
      if (res.status === 200 && data.success) {
        console.log(`  ✓ POST 200 OK: ${p.url}`);
        passed++;
      } else {
        console.error(`  ✗ POST FAIL: ${p.url}`, data);
        failed++;
      }
    } catch (e) {
      console.error(`  ✗ POST ERROR on ${p.url}:`, e.message);
      failed++;
    }
  }

  // 7. Testing XSS Input Sanitization
  console.log('\n--- 7. Testing Stored XSS Protection ---');
  try {
    const xssPayload = { reviewerName: '<script>alert("hacked")</script>', text: '<img src=x onerror=alert(1)>', rating: 5 };
    const xssRes = await fetch(`http://localhost:${PORT}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xssPayload)
    });
    const xssData = await xssRes.json();
    if (xssData.review && !xssData.review.reviewerName.includes('<script>') && xssData.review.reviewerName.includes('&lt;script&gt;')) {
      console.log('  ✓ Stored XSS payload safely escaped to &lt;script&gt;');
      passed++;
    } else {
      console.error('  ✗ XSS payload was NOT escaped:', xssData.review);
      failed++;
    }
  } catch (e) {
    console.error('  ✗ XSS test error:', e.message);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`SUMMARY: ${passed} Tests Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed === 0) {
    console.log('🎉 100% PRE-LAUNCH CHECKOUT SUCCEEDED! SYSTEM READY FOR PRODUCTION LAUNCH!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}, 800);

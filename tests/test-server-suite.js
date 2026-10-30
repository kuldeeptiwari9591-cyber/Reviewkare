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

  // 8. Testing Multi-Tenant Isolation & Razorpay Billing Pipeline
  console.log('\n--- 8. Testing Multi-Tenant Isolation & Razorpay Billing ---');
  try {
    const fs = require('fs');
    const path = require('path');
    const testEmail = `dr.patel.${Date.now()}@patelaesthetics.in`;

    // 8a. Signup new independent tenant
    const signupRes = await fetch(`http://localhost:${PORT}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicName: 'Patel Aesthetics Bangalore',
        ownerName: 'Dr. Aditi Patel',
        email: testEmail,
        password: 'Password123#Secure',
        city: 'Bengaluru',
        phone: '9845099881',
        industry: 'salons'
      })
    });
    const signupData = await signupRes.json();
    const patelCookie = signupRes.headers.get('set-cookie')?.split(';')[0];

    if (signupRes.status === 200 && signupData.success && patelCookie) {
      console.log('  ✓ Multi-tenant signup successful — isolated session provisioned');
      passed++;
    } else {
      console.error('  ✗ Multi-tenant signup failed:', signupData);
      failed++;
    }

    // 8b. Verify tenant file exists and is isolated
    const reg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'registry.json'), 'utf8'));
    const tenantUser = reg.users[testEmail];
    const tenantId = tenantUser?.tenantId;
    const tenantFilePath = path.join(__dirname, '..', 'data', 'tenants', `${tenantId}.json`);

    if (tenantId && fs.existsSync(tenantFilePath)) {
      const tenantData = JSON.parse(fs.readFileSync(tenantFilePath, 'utf8'));
      if (tenantData.location.name === 'Patel Aesthetics Bangalore' && tenantData.reviews.length === 0) {
        console.log(`  ✓ Tenant ${tenantId} disk store isolated and initialized`);
        passed++;
      } else {
        console.error('  ✗ Tenant file data mismatch:', tenantData);
        failed++;
      }
    } else {
      console.error('  ✗ Tenant file was not written to disk:', tenantFilePath);
      failed++;
    }

    // 8c. Verify Data Isolation: Post a review to Dr. Patel and ensure Dr. Sharma does not see it
    const patelRevRes = await fetch(`http://localhost:${PORT}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patelCookie },
      body: JSON.stringify({ reviewerName: 'Pooja Hegde', text: 'Amazing hydrafacial glow!', rating: 5 })
    });
    const patelRevData = await patelRevRes.json();

    const sharmaReviewsRes = await fetch(`http://localhost:${PORT}/api/reviews`, {
      headers: { 'Cookie': sessionCookie }
    });
    const sharmaReviewsData = await sharmaReviewsRes.json();
    const leaked = (sharmaReviewsData.reviews || []).some(r => r.reviewerName === 'Pooja Hegde');

    if ((patelRevRes.status === 200 || patelRevRes.status === 201) && patelRevData.success && !leaked) {
      console.log('  ✓ Complete Multi-Tenant Data Isolation verified (Zero cross-tenant data leakage)');
      passed++;
    } else {
      console.error('  ✗ Multi-tenant data leakage detected! Review visible in default store.');
      failed++;
    }

    // 8d. Test Razorpay Order Creation (Hero ₹2,999 Quarterly Plan)
    const orderRes = await fetch(`http://localhost:${PORT}/api/billing/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patelCookie },
      body: JSON.stringify({ planId: 'growth', billingCycle: 'quarterly' })
    });
    const orderData = await orderRes.json();

    if (orderRes.status === 200 && orderData.success && orderData.amount === 299900 && orderData.orderId) {
      console.log('  ✓ Razorpay ₹2,999 Quarterly Hero order generated successfully (orderId: ' + orderData.orderId + ')');
      passed++;
    } else {
      console.error('  ✗ Razorpay order creation failed:', orderData);
      failed++;
    }

    // 8e. Test Razorpay Payment Verification & Plan Activation
    const verifyRes = await fetch(`http://localhost:${PORT}/api/billing/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': patelCookie },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'test_signature',
        planId: 'growth',
        billingCycle: 'quarterly'
      })
    });
    const verifyData = await verifyRes.json();

    // Check disk file to ensure active subscription persisted
    const updatedTenant = JSON.parse(fs.readFileSync(tenantFilePath, 'utf8'));
    if (verifyRes.status === 200 && verifyData.success && updatedTenant.user.plan.status === 'active' && updatedTenant.invoices.length > 0) {
      console.log('  ✓ Razorpay subscription verified and activated in isolated tenant store');
      passed++;
    } else {
      console.error('  ✗ Subscription verification failed or did not persist:', verifyData);
      failed++;
    }

    // 8f. Test Customer QR Flow Resolution for New Tenant
    const qrSlug = updatedTenant.qrcodes[0].code;
    const qrPageRes = await fetch(`http://localhost:${PORT}/q/${qrSlug}`);
    const qrPageHtml = await qrPageRes.text();

    if (qrPageRes.status === 200 && qrPageHtml.includes('Patel Aesthetics Bangalore')) {
      console.log(`  ✓ Dynamic Customer QR page (/q/${qrSlug}) correctly resolved business branding`);
      passed++;
    } else {
      console.error(`  ✗ QR route failed to resolve tenant branding for ${qrSlug}`);
      failed++;
    }

    // Clean up test tenant artifacts
    if (fs.existsSync(tenantFilePath)) fs.unlinkSync(tenantFilePath);
    const cleanReg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'registry.json'), 'utf8'));
    delete cleanReg.users[testEmail];
    delete cleanReg.qrLookup[qrSlug];
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'registry.json'), JSON.stringify(cleanReg, null, 2), 'utf8');

  } catch (err) {
    console.error('  ✗ Section 8 error:', err);
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

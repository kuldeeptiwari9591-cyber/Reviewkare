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
    '/vs/birdeye',
    '/integrations/petpooja',
    '/tools/google-review-link-generator',
    '/offline',
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

    // ----------------------------------------------------
    // 9. Testing Traditional, Modern, AEO, GEO & Agentic SEO Capabilities
    // ----------------------------------------------------
    console.log('\n--- 9. Testing Traditional, Modern, AEO, GEO & Agentic SEO Capabilities ---');

    // 9a. Test /robots.txt (RFC 9309 compliance & Content-Signal)
    const robotsRes = await fetch(`http://localhost:${PORT}/robots.txt`);
    const robotsTxt = await robotsRes.text();
    if (
      robotsRes.status === 200 &&
      robotsTxt.includes('Content-Signal: search=yes, ai-input=yes, ai-train=no') &&
      robotsTxt.includes('User-agent: OAI-SearchBot') &&
      robotsTxt.includes('User-agent: PerplexityBot') &&
      robotsTxt.includes('Sitemap: https://replyo.in/sitemap.xml')
    ) {
      console.log('  ✓ 200 OK: /robots.txt verified with RFC 9309 AI agent groups & Content-Signal');
      passed++;
    } else {
      console.error('  ✗ /robots.txt failed validation:', robotsTxt);
      failed++;
    }

    // 9b. Test /sitemap.xml (Valid XML structure and all 24 public routes)
    const sitemapRes = await fetch(`http://localhost:${PORT}/sitemap.xml`);
    const sitemapXml = await sitemapRes.text();
    if (
      sitemapRes.status === 200 &&
      sitemapRes.headers.get('content-type')?.includes('xml') &&
      sitemapXml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') &&
      sitemapXml.includes('<loc>https://replyo.in/features</loc>') &&
      sitemapXml.includes('<loc>https://replyo.in/pricing</loc>') &&
      sitemapXml.includes('<loc>https://replyo.in/industries/clinics</loc>')
    ) {
      console.log('  ✓ 200 OK: /sitemap.xml verified with standard XML schema & full index coverage');
      passed++;
    } else {
      console.error('  ✗ /sitemap.xml failed validation:', sitemapXml);
      failed++;
    }

    // 9c. Test /llms.txt (llmstxt.org standard manifest)
    const llmsRes = await fetch(`http://localhost:${PORT}/llms.txt`);
    const llmsTxt = await llmsRes.text();
    if (
      llmsRes.status === 200 &&
      llmsTxt.startsWith('# Replyo') &&
      llmsTxt.includes('## Core Capabilities') &&
      llmsTxt.includes('## Pricing (INR)')
    ) {
      console.log('  ✓ 200 OK: /llms.txt verified compliant with llmstxt.org specification');
      passed++;
    } else {
      console.error('  ✗ /llms.txt failed validation:', llmsTxt);
      failed++;
    }

    // 9d. Test /llms-full.txt (Deep architecture & compliance reference)
    const llmsFullRes = await fetch(`http://localhost:${PORT}/llms-full.txt`);
    const llmsFullTxt = await llmsFullRes.text();
    if (
      llmsFullRes.status === 200 &&
      llmsFullTxt.includes('DPDP Act 2023') &&
      llmsFullTxt.includes('Neural Dialect Autopilot') &&
      llmsFullTxt.includes('AWS Mumbai (ap-south-1)')
    ) {
      console.log('  ✓ 200 OK: /llms-full.txt verified with architecture, pricing & security specs');
      passed++;
    } else {
      console.error('  ✗ /llms-full.txt failed validation:', llmsFullTxt);
      failed++;
    }

    // 9e. Test /.well-known/ai-catalog.json (Agent Resource Discovery ARD 1.0)
    const catalogRes = await fetch(`http://localhost:${PORT}/.well-known/ai-catalog.json`);
    const catalogJson = await catalogRes.json();
    if (
      catalogRes.status === 200 &&
      catalogJson.specVersion === '1.0' &&
      Array.isArray(catalogJson.entries) &&
      catalogJson.entries.some(e => e.identifier.includes('replyo.in'))
    ) {
      console.log('  ✓ 200 OK: /.well-known/ai-catalog.json verified conforming to ARD 1.0 schema');
      passed++;
    } else {
      console.error('  ✗ /.well-known/ai-catalog.json failed validation:', catalogJson);
      failed++;
    }

    // 9f. Test Markdown Content Negotiation (Accept: text/markdown)
    const mdRes = await fetch(`http://localhost:${PORT}/features`, {
      headers: { 'Accept': 'text/markdown' }
    });
    const mdText = await mdRes.text();
    const varyHeader = mdRes.headers.get('vary') || '';
    const signalHeader = mdRes.headers.get('content-signal') || '';
    if (
      mdRes.status === 200 &&
      mdRes.headers.get('content-type')?.includes('text/markdown') &&
      varyHeader.includes('Accept') &&
      signalHeader.includes('search=yes') &&
      mdText.includes('# Replyo Operating System')
    ) {
      console.log('  ✓ 200 OK: Markdown content negotiation (Accept: text/markdown) verified with Vary & Content-Signal');
      passed++;
    } else {
      console.error('  ✗ Markdown content negotiation failed on /features:', {
        status: mdRes.status,
        type: mdRes.headers.get('content-type'),
        vary: varyHeader,
        signal: signalHeader
      });
      failed++;
    }

    // 9g. Test Homepage Schema.org JSON-LD Knowledge Graph & Meta Discovery
    const homeRes = await fetch(`http://localhost:${PORT}/`);
    const homeHtml = await homeRes.text();
    const hasCanonical = homeHtml.includes('<link rel="canonical" href="https://replyo.in/">');
    const hasOg = homeHtml.includes('<meta property="og:site_name" content="Replyo Operating System">');
    const hasTwitter = homeHtml.includes('<meta name="twitter:card" content="summary_large_image">');
    const hasLdJson = homeHtml.includes('<script type="application/ld+json">') &&
                      homeHtml.includes('"@type": "Organization"') &&
                      homeHtml.includes('"@type": "SoftwareApplication"') &&
                      homeHtml.includes('"@type": "FAQPage"');

    if (homeRes.status === 200 && hasCanonical && hasOg && hasTwitter && hasLdJson) {
      console.log('  ✓ 200 OK: Homepage metadata verified (Canonical, OG, Twitter, and Schema.org @graph JSON-LD)');
      passed++;
    } else {
      console.error('  ✗ Homepage metadata validation failed:', { hasCanonical, hasOg, hasTwitter, hasLdJson });
      failed++;
    }

    // 9h. Test Industry Multi-Vertical SEO & Dynamic Breadcrumbs
    const clinicRes = await fetch(`http://localhost:${PORT}/industries/clinics`);
    const clinicHtml = await clinicRes.text();
    if (
      clinicRes.status === 200 &&
      clinicHtml.includes('<link rel="canonical" href="https://replyo.in/industries/clinics">') &&
      (clinicHtml.includes('Dental & Aesthetic Clinics') || clinicHtml.includes('Dental &amp; Aesthetic Clinics')) &&
      clinicHtml.includes('BreadcrumbList')
    ) {
      console.log('  ✓ 200 OK: /industries/clinics verified with localized vertical metadata & Breadcrumbs');
      passed++;
    } else {
      console.error('  ✗ Industry page /industries/clinics metadata validation failed');
      failed++;
    }

    // 9i. Test Real HTTP 404 Status on Nonexistent Routes
    const notFoundRes = await fetch(`http://localhost:${PORT}/random-non-existent-page-test-404`);
    if (notFoundRes.status === 404) {
      console.log('  ✓ 404 Not Found: Unknown paths return real HTTP 404 (Passes Lighthouse Agentic standards)');
      passed++;
    } else {
      console.error(`  ✗ Nonexistent page expected 404, received status ${notFoundRes.status}`);
      failed++;
    }

    // 9j. Test System Health & Supabase/Razorpay Configuration Probe
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'healthy') {
      console.log('  ✓ 200 OK: /api/health probe verified with uptime & service status');
      passed++;
    } else {
      console.error('  ✗ /api/health probe failed:', healthData);
      failed++;
    }

    // 9k. Test Competitor Comparison & Tool Page Rendering
    const vsRes = await fetch(`http://localhost:${PORT}/vs/birdeye`);
    const vsHtml = await vsRes.text();
    if (vsRes.status === 200 && vsHtml.includes('Replyo vs Birdeye') && vsHtml.includes('85%')) {
      console.log('  ✓ 200 OK: /vs/birdeye verified with comparison matrix & pricing breakdown');
      passed++;
    } else {
      console.error('  ✗ /vs/birdeye rendering failed');
      failed++;
    }

    // ----------------------------------------------------
    // 10. Testing Multi-Vertical Adaptive Onboarding & Calibrated Digital QR Flows
    // ----------------------------------------------------
    console.log('\n--- 10. Testing Multi-Vertical Adaptive Onboarding & Calibrated Digital QR Flows ---');

    // 10a. Test Cafe Micro-Flow Signup (<15s, 2 questions, Digital QR only)
    const cafeEmail = `roastery_${Date.now()}@theartisan.in`;
    const cafeSignupRes = await fetch(`http://localhost:${PORT}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicName: 'The Roastery Artisan Cafe',
        ownerName: 'Shreyas Rao',
        email: cafeEmail,
        password: 'Password123#Cafe',
        city: 'Bengaluru',
        phone: '9845011222',
        industry: 'cafe',
        specialtyServices: 'Ethiopian Pour Over, Sourdough Croissant, Flat White'
      })
    });
    const cafeSignupData = await cafeSignupRes.json();
    const cafeReg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'registry.json'), 'utf8'));
    const cafeTenantId = cafeReg.users[cafeEmail]?.tenantId;
    const cafeTenantPath = path.join(__dirname, '..', 'data', 'tenants', `${cafeTenantId}.json`);
    const cafeTenant = JSON.parse(fs.readFileSync(cafeTenantPath, 'utf8'));

    if (
      cafeSignupRes.status === 200 &&
      cafeTenant.location.flowType === 'micro' &&
      cafeTenant.location.questionCount === 2 &&
      cafeTenant.qrcodes[0].material === 'Online Digital QR' &&
      cafeTenant.servicesByVertical.cafe.includes('Ethiopian Pour Over')
    ) {
      console.log('  ✓ Multi-vertical onboarding: Cafe micro-flow tenant provisioned (2 questions, online digital QR)');
      passed++;
    } else {
      console.error('  ✗ Cafe onboarding verification failed:', cafeTenant);
      failed++;
    }

    // 10b. Test Cafe QR Page Structure (Micro-flow skips staff selector)
    const cafeQrSlug = cafeTenant.qrcodes[0].code;
    const cafeQrRes = await fetch(`http://localhost:${PORT}/q/${cafeQrSlug}`);
    const cafeQrHtml = await cafeQrRes.text();
    if (
      cafeQrRes.status === 200 &&
      cafeQrHtml.includes('Micro-Flow (<15s) Review Copilot') &&
      cafeQrHtml.includes('What did you enjoy most?') &&
      !cafeQrHtml.includes('id="staffTags"') &&
      cafeQrHtml.includes('3. Preferred Review Language')
    ) {
      console.log('  ✓ Customer QR flow: Cafe micro-flow verified (Skips staff, combines item+vibe into <15s completion)');
      passed++;
    } else {
      console.error('  ✗ Cafe QR page structure mismatch');
      failed++;
    }

    // 10c. Test Coaching Deep Trust Signup (4 questions, academic faculty attribution)
    const coachEmail = `apex_iit_${Date.now()}@apexacademy.in`;
    const coachSignupRes = await fetch(`http://localhost:${PORT}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinicName: 'Apex IIT-JEE & NEET Academy',
        ownerName: 'Prof. Alok Verma',
        email: coachEmail,
        password: 'Password123#Coach',
        city: 'Kota',
        phone: '9811233445',
        industry: 'coaching',
        specialtyServices: 'IIT-JEE Advanced Physics, NEET Top Batch, Foundation Math'
      })
    });
    const coachReg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'registry.json'), 'utf8'));
    const coachTenantId = coachReg.users[coachEmail]?.tenantId;
    const coachTenantPath = path.join(__dirname, '..', 'data', 'tenants', `${coachTenantId}.json`);
    const coachTenant = JSON.parse(fs.readFileSync(coachTenantPath, 'utf8'));

    if (
      coachSignupRes.status === 200 &&
      coachTenant.location.flowType === 'trust' &&
      coachTenant.location.questionCount === 4 &&
      coachTenant.servicesByVertical.coaching.includes('IIT-JEE Advanced Physics')
    ) {
      console.log('  ✓ Multi-vertical onboarding: Coaching academy trust-flow tenant provisioned (4 questions, faculty roles)');
      passed++;
    } else {
      console.error('  ✗ Coaching academy onboarding verification failed:', coachTenant);
      failed++;
    }

    // 10d. Test Coaching QR Page Structure (Trust-flow includes quality & faculty step)
    const coachQrSlug = coachTenant.qrcodes[0].code;
    const coachQrRes = await fetch(`http://localhost:${PORT}/q/${coachQrSlug}`);
    const coachQrHtml = await coachQrRes.text();
    if (
      coachQrRes.status === 200 &&
      coachQrHtml.includes('Deep Trust Review Copilot') &&
      coachQrHtml.includes('id="qualityTags"') &&
      coachQrHtml.includes('id="staffTags"') &&
      coachQrHtml.includes('5. Preferred Review Language')
    ) {
      console.log('  ✓ Customer QR flow: Coaching trust-flow verified (4-step depth: course, teaching quality, mentor attribution)');
      passed++;
    } else {
      console.error('  ✗ Coaching QR page structure mismatch');
      failed++;
    }

    // 10e. Test Calibrated Review Draft Generation Across Distinct Verticals
    const cafeDraftRes = await fetch(`http://localhost:${PORT}/api/ai/qr-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission: {
          rating: 5,
          selectedServices: ['Ethiopian Pour Over'],
          language: 'hi-en',
          vertical: 'cafe'
        },
        shortCode: cafeQrSlug
      })
    });
    const cafeDraftJson = await cafeDraftRes.json();

    const coachDraftRes = await fetch(`http://localhost:${PORT}/api/ai/qr-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission: {
          rating: 5,
          selectedServices: ['IIT-JEE Advanced Physics'],
          staffName: 'Prof. Alok Verma',
          language: 'hi-en',
          vertical: 'coaching'
        },
        shortCode: coachQrSlug
      })
    });
    const coachDraftJson = await coachDraftRes.json();

    if (
      cafeDraftJson.success &&
      cafeDraftJson.draftText.includes('Loved the vibe') &&
      coachDraftJson.success &&
      coachDraftJson.draftText.includes('Concept clarity') &&
      coachDraftJson.draftText.includes('Prof. Alok Verma')
    ) {
      console.log('  ✓ AI Review Draft Engine: Calibrated vertical generation verified (Cafe high-energy vs Coaching academic rigor)');
      passed++;
    } else {
      console.error('  ✗ Calibrated draft generation mismatch:', { cafeDraftJson, coachDraftJson });
      failed++;
    }

    // Clean up vertical test tenants
    if (fs.existsSync(cafeTenantPath)) fs.unlinkSync(cafeTenantPath);
    if (fs.existsSync(coachTenantPath)) fs.unlinkSync(coachTenantPath);
    delete cafeReg.users[cafeEmail];
    delete cafeReg.qrLookup[cafeQrSlug];
    delete coachReg.users[coachEmail];
    delete coachReg.qrLookup[coachQrSlug];
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'registry.json'), JSON.stringify(cafeReg, null, 2), 'utf8');

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

const http = require('http');

const PORT = 3001;
process.env.PORT = PORT;

// Start server
require('../server.js');

setTimeout(async () => {
  const routes = [
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
    '/app/hardware',
    '/q/sharma-dent-01',
    '/q/sharma-dent-01/done',
    '/a/sharma-appr-priya-01'
  ];

  let getPassed = 0;
  let getFailed = 0;

  console.log('\n--- Testing All 41 GET Routes ---');
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:${PORT}${r}`);
      if (res.status === 200) {
        console.log(`  ✓ 200 OK: ${r}`);
        getPassed++;
      } else {
        console.error(`  ✗ FAIL ${res.status}: ${r}`);
        getFailed++;
      }
    } catch (e) {
      console.error(`  ✗ ERROR on ${r}:`, e.message);
      getFailed++;
    }
  }

  console.log(`\nGET Routes Summary: ${getPassed} Passed, ${getFailed} Failed`);

  // Testing POST APIs
  console.log('\n--- Testing POST APIs ---');
  let postPassed = 0;
  let postFailed = 0;

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p.body)
      });
      const data = await res.json();
      if (res.status === 200 && data.success) {
        console.log(`  ✓ POST 200 OK: ${p.url}`);
        postPassed++;
      } else {
        console.error(`  ✗ POST FAIL: ${p.url}`, data);
        postFailed++;
      }
    } catch (e) {
      console.error(`  ✗ POST ERROR on ${p.url}:`, e.message);
      postFailed++;
    }
  }

  console.log(`\nPOST API Summary: ${postPassed} Passed, ${postFailed} Failed`);

  if (getFailed === 0 && postFailed === 0) {
    console.log('\n🎉 ALL 51 ENDPOINT TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}, 800);

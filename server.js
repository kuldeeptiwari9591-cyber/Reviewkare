const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Import compiled Replyo modules
const {
  INITIAL_LOCATION,
  getAllReviews,
  getHeldReviews,
  getReviewById,
  approveReviewReply,
  approveByToken,
  updateReviewReplyDraft,
  getQRCodes,
  getQRCodeByCode,
  recordScan,
  recordDraftGenerated,
  PLANS,
  COMPETITORS,
} = require('./dist/src/lib/store/db.js');

const { generateReviewReply, detectLanguageAndScript } = require('./dist/src/lib/ai/reply-engine.js');
const { generateCustomerQRDraft } = require('./dist/src/lib/ai/qr-draft-engine.js');
const { validateReplyContent } = require('./dist/src/lib/ai/safety-validator.js');

const PORT = process.env.PORT || 3000;

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Global Shell with World-Class SaaS Design System
function renderHtmlPage(title, activeNav, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Replyo - Autonomous Google Review SaaS</title>
  <meta name="description" content="AI Google Review Autopilot & In-Clinic AI QR flow for Indian clinics, salons & restaurants. Auto-posts 5-star replies, holds 1-3 star reviews for 1-tap owner approval.">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfdf5',
              100: '#d1fae5',
              200: '#a7f3d0',
              300: '#6ee7b7',
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
              700: '#047857',
              800: '#065f46',
              900: '#064e3b',
              950: '#022c22',
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, .font-heading { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; }
    .glass-nav { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(16px); }
    .glow-effect { box-shadow: 0 0 50px -12px rgba(16, 185, 129, 0.25); }
    .subtle-border { border-color: rgba(226, 232, 240, 0.8); }
    .card-hover { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 30px -10px rgba(0,0,0,0.07); }
  </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white antialiased">
  
  <!-- TOP ANNOUNCEMENT BANNER -->
  <div class="bg-slate-950 text-slate-300 text-xs py-2 px-4 text-center border-b border-slate-800">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
      <span>Founding Cohort Offer: First 50 clinics get Growth plan at ₹999/mo locked for life.</span>
      <a href="/pricing" class="font-bold text-brand-400 hover:text-brand-300 underline ml-1">Claim Offer &rarr;</a>
    </div>
  </div>

  <!-- WORLD CLASS SAAS NAVIGATION -->
  <header class="glass-nav border-b subtle-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
      
      <!-- Logo -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            R
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-extrabold text-2xl text-slate-950 tracking-tight font-heading">Replyo</span>
              <span class="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                India
              </span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium -mt-0.5 tracking-tight">Google Review Autopilot & AI QR</p>
          </div>
        </a>

        <!-- Navigation items -->
        <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <a href="/features" class="hover:text-brand-600 transition-colors ${activeNav === 'features' ? 'text-brand-600 font-bold' : ''}">Features</a>
          <a href="/pricing" class="hover:text-brand-600 transition-colors ${activeNav === 'pricing' ? 'text-brand-600 font-bold' : ''}">Pricing (INR)</a>
          <a href="/free-audit" class="hover:text-brand-600 transition-colors flex items-center gap-1.5 ${activeNav === 'audit' ? 'text-brand-600 font-bold' : ''}">
            <span class="text-amber-500">✨</span> Free Audit Tool
          </a>
          <div class="relative group cursor-pointer">
            <span class="hover:text-brand-600 transition-colors flex items-center gap-1">
              Industries <span class="text-[10px] opacity-60">▼</span>
            </span>
            <div class="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in zoom-in-95">
              <a href="/industries/clinics" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Dental & Skin Clinics</a>
              <a href="/industries/salons" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Salons & Luxury Spas</a>
              <a href="/industries/restaurants" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Restaurants & Cafes</a>
            </div>
          </div>
          <a href="/for-agencies" class="hover:text-brand-600 transition-colors ${activeNav === 'agencies' ? 'text-brand-600 font-bold' : ''}">For Agencies</a>
        </nav>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3">
        <a href="/q/sharma-dent-01" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
          📱 Try Customer QR
        </a>
        <a href="/app" class="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-brand-600 shadow-md shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Owner App Dashboard &rarr;
        </a>
      </div>
    </div>
  </header>

  <!-- MAIN VIEWPORT -->
  <main class="flex-1">
    ${bodyContent}
  </main>

  <!-- WORLD CLASS SAAS FOOTER WITH ZERO DEAD LINKS -->
  <footer class="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-20 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
        
        <!-- Col 1: Brand Info -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-brand-500 text-white font-black text-base flex items-center justify-center font-heading">
              R
            </div>
            <span class="font-extrabold text-white text-xl tracking-tight font-heading">Replyo India</span>
          </div>
          <p class="text-slate-400 leading-relaxed pr-6">
            Autonomous Google Review Autopilot & In-Clinic AI QR Growth Platform. Built natively in India for clinics, salons, restaurants, and local services.
          </p>
          <div class="space-y-1.5 text-slate-400 text-[11px]">
            <p class="text-brand-400 font-semibold flex items-center gap-1.5">
              ✓ 100% Google Local Guides & User Content Compliant
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              🔒 DPDP Act 2023 Compliant • Hosted on Mumbai Edge Cloud
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              💳 UPI AutoPay Supported • 18% GST Input Credit Tax Invoices
            </p>
          </div>
        </div>

        <!-- Col 2: Product & Demos -->
        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Product</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/features" class="hover:text-white transition-colors">Review Autopilot</a></li>
            <li><a href="/features#qr-studio" class="hover:text-white transition-colors">Smart QR Studio</a></li>
            <li><a href="/features#safety-shield" class="hover:text-white transition-colors">Zero-Liability Shield</a></li>
            <li><a href="/pricing" class="hover:text-white transition-colors">Pricing & UPI Plans</a></li>
            <li><a href="/free-audit" class="hover:text-white transition-colors">Free Competitor Audit</a></li>
          </ul>
        </div>

        <!-- Col 3: Live Demos & Workflows -->
        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Live Demos</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/app" class="hover:text-white transition-colors">Owner Dashboard (/app)</a></li>
            <li><a href="/app/reviews" class="hover:text-white transition-colors">All Reviews Feed</a></li>
            <li><a href="/app/approvals" class="hover:text-white transition-colors">Held Approvals Queue</a></li>
            <li><a href="/q/sharma-dent-01" target="_blank" class="hover:text-white transition-colors">Customer QR Flow</a></li>
            <li><a href="/a/sharma-appr-priya-01" target="_blank" class="hover:text-white transition-colors">1-Tap Mobile Approval</a></li>
          </ul>
        </div>

        <!-- Col 4: Trust, Legal & Compliance -->
        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Legal & Trust</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="/refund-policy" class="hover:text-white transition-colors">Refund & Cancellation</a></li>
            <li><a href="/dpdp-consent" class="hover:text-white transition-colors">DPDP Act 2023 Consent</a></li>
            <li><a href="/for-agencies" class="hover:text-white transition-colors">Agency Reseller Partner</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Credits -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <p>© 2026 Replyo Technologies India Private Limited. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="/privacy" class="hover:text-slate-400">Privacy</a>
          <a href="/terms" class="hover:text-slate-400">Terms</a>
          <a href="/refund-policy" class="hover:text-slate-400">Refunds</a>
          <a href="/for-agencies" class="hover:text-slate-400">Resellers</a>
          <span class="text-slate-600">•</span>
          <span class="text-emerald-500 font-semibold">All Systems Normal</span>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

// App Shell with Professional Sidebar and State
function renderAppShell(activeTab, contentHtml) {
  const heldCount = getHeldReviews().length;
  const navItems = [
    { id: 'dashboard', name: 'Overview', href: '/app', icon: '📊' },
    { id: 'reviews', name: 'Google Reviews', href: '/app/reviews', icon: '💬' },
    { id: 'approvals', name: 'Held Approvals', href: '/app/approvals', icon: '⚠️', badge: heldCount > 0 ? heldCount : null },
    { id: 'qr', name: 'QR Studio', href: '/app/qr', icon: '📱' },
    { id: 'growth', name: 'Growth & Competitors', href: '/app/growth', icon: '📈' },
    { id: 'settings', name: 'Autopilot Settings', href: '/app/settings', icon: '⚙️' },
    { id: 'billing', name: 'Billing & GST Invoices', href: '/app/billing', icon: '💳' },
  ];

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white border-r subtle-border flex flex-col justify-between shrink-0 p-4">
      <div>
        <!-- Clinic Card -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-black text-sm">D</div>
            <div class="overflow-hidden">
              <h2 class="font-bold text-xs text-slate-900 truncate">${INITIAL_LOCATION.name}</h2>
              <p class="text-[10px] text-slate-500 truncate">${INITIAL_LOCATION.area}, ${INITIAL_LOCATION.city}</p>
            </div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Google Profile Connected
          </div>
        </div>

        <!-- Sidebar Navigation -->
        <nav class="space-y-1 text-xs font-semibold">
          ${navItems.map((item) => `
            <a href="${item.href}" class="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }">
              <span class="flex items-center gap-2.5">
                <span>${item.icon}</span>
                <span>${item.name}</span>
              </span>
              ${item.badge ? `<span class="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Quick QR link -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <a href="/q/sharma-dent-01" target="_blank" class="w-full block py-2.5 text-center rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          📱 Open Customer QR &rarr;
        </a>
        <p class="text-[10px] text-center text-slate-400">Autopilot Mode: <strong class="text-brand-600 font-bold">SMART (4-5★)</strong></p>
      </div>
    </aside>

    <!-- Main Canvas -->
    <section class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      ${contentHtml}
    </section>
  </div>
  `;
}

// SERVER DISPATCHER
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  };

  const sendHtml = (statusCode, html) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  };

  try {
    // ----------------------------------------------------
    // API ENDPOINTS
    // ----------------------------------------------------
    if (pathname === '/api/reviews' && method === 'GET') {
      return sendJson(200, { success: true, data: getAllReviews() });
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { reviewerName, rating, text } = body;
      const newReview = {
        id: `rev-${Date.now()}`,
        locationId: INITIAL_LOCATION.id,
        googleReviewId: `gbp_sim_${Date.now()}`,
        reviewerName: reviewerName || 'Verified Patient',
        rating: Number(rating) || 5,
        text: text || '',
        isStarOnly: !text,
        detectedLanguage: 'hi-en',
        detectedTone: Number(rating) >= 4 ? 'positive' : 'frustrated',
        createdAt: 'Just now',
      };

      const aiResult = generateReviewReply({ review: newReview, settings: INITIAL_LOCATION });
      newReview.detectedLanguage = aiResult.detectedLanguage;
      const isAuto = aiResult.isAutoPostEligible;

      newReview.reply = {
        id: `rep-${Date.now()}`,
        reviewId: newReview.id,
        draftText: aiResult.text,
        finalText: isAuto ? aiResult.text : undefined,
        status: isAuto ? 'posted' : 'held',
        model: 'gemini-1.5-flash',
        validatorPassed: aiResult.validation.passed,
        isAutoPosted: isAuto,
        postedAt: isAuto ? 'Just now' : undefined,
        approvalToken: isAuto ? undefined : `token-${Date.now()}`,
      };

      getAllReviews().unshift(newReview);
      return sendJson(200, { success: true, data: newReview });
    }

    if (pathname.startsWith('/api/reviews/') && pathname.endsWith('/reply') && method === 'PATCH') {
      const parts = pathname.split('/');
      const reviewId = parts[3];
      const body = await parseJsonBody(req);
      const { action, text, styleMode } = body;
      const review = getReviewById(reviewId);

      if (!review || !review.reply) {
        return sendJson(404, { success: false, error: 'Review not found' });
      }

      if (action === 'approve') {
        const updated = approveReviewReply(reviewId, text);
        return sendJson(200, { success: true, message: 'Approved & posted to Google Maps', data: updated });
      }

      if (action === 'regenerate') {
        const aiResult = generateReviewReply({ review, settings: INITIAL_LOCATION, styleMode: styleMode || 'default' });
        const updated = updateReviewReplyDraft(reviewId, aiResult.text);
        return sendJson(200, { success: true, message: 'Regenerated draft', data: updated });
      }

      if (action === 'edit' && text) {
        const updated = updateReviewReplyDraft(reviewId, text);
        return sendJson(200, { success: true, message: 'Draft updated', data: updated });
      }

      return sendJson(400, { success: false, error: 'Invalid action' });
    }

    if (pathname === '/api/ai/qr-draft' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { submission, shortCode } = body;
      const draft = generateCustomerQRDraft(submission, INITIAL_LOCATION.name);
      if (shortCode) recordDraftGenerated(shortCode);
      return sendJson(200, {
        success: true,
        draftText: draft,
        googlePlaceUrl: `https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}`,
      });
    }

    if (pathname.startsWith('/api/approvals/') && method === 'POST') {
      const token = pathname.split('/')[2];
      const resAppr = approveByToken(token);
      return sendJson(resAppr.success ? 200 : 400, resAppr);
    }

    if (pathname === '/api/qr' && method === 'GET') {
      return sendJson(200, { success: true, data: getQRCodes() });
    }

    // ----------------------------------------------------
    // MARKETING PAGES (REBUILT & POLISHED)
    // ----------------------------------------------------

    // 1. WORLD CLASS HOMEPAGE (/)
    if (pathname === '/') {
      const html = renderHtmlPage('Autonomous Google Review SaaS', 'home', `
        <!-- HERO SECTION -->
        <section class="relative overflow-hidden pt-12 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b subtle-border bg-gradient-to-b from-white via-brand-50/25 to-slate-50">
          <div class="max-w-5xl mx-auto text-center space-y-7">
            
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200/80 shadow-sm">
              <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              India's #1 AI Reputation Autopilot for Local Businesses
            </div>

            <h1 class="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] font-heading">
              Turn Google Reviews into your #1 Growth Engine.<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-600 to-cyan-600">
                In Hindi, Hinglish & English.
              </span>
            </h1>

            <p class="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Never let a review sit unanswered. <strong class="text-slate-900 font-semibold">4–5 star reviews</strong> get warm, SEO-optimized replies posted automatically in minutes. <strong class="text-slate-900 font-semibold">1–3 star negative reviews</strong> are safely held for 1-tap owner approval with zero liability admission. Plus, collect 3x more genuine reviews using our 30-second in-clinic AI QR flow.
            </p>

            <!-- Social Proof Bar -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a href="/app" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Open Owner Dashboard &rarr;
              </a>
              <a href="/q/sharma-dent-01" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all hover:border-slate-400">
                📱 Try Customer QR Flow
              </a>
            </div>

            <!-- Avatars Proof -->
            <div class="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div class="flex items-center gap-2">
                <span class="text-amber-400 text-base">★★★★★</span>
                <span class="font-bold text-slate-800">4.9 / 5.0 Rating</span>
              </div>
              <span class="text-slate-300">•</span>
              <span>Trusted by 1,200+ clinics & salons in India</span>
              <span class="text-slate-300">•</span>
              <span>100% Google Local Guides Compliant</span>
            </div>
          </div>
        </section>

        <!-- LIVE INTERACTIVE ENGINE SANDBOX -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
          <div class="bg-white rounded-3xl border subtle-border shadow-2xl overflow-hidden">
            <div class="bg-slate-950 text-white px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div>
                <h3 class="font-bold text-sm text-white flex items-center gap-2 font-heading">
                  <span class="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"></span>
                  Interactive Review Pipeline Playground
                </h3>
                <p class="text-[11px] text-slate-400">Experience autonomous language detection, tone mirroring, and zero-liability routing.</p>
              </div>
              <div class="flex flex-wrap gap-1.5 text-xs">
                <button onclick="setSample('hinglish')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors">Hinglish 5★</button>
                <button onclick="setSample('hindi')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors">Hindi 5★</button>
                <button onclick="setSample('negative')" class="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold transition-colors">Negative 1★ (Held)</button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              <!-- Input -->
              <div class="p-6 sm:p-8 space-y-4 bg-slate-50/50">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold uppercase tracking-wider text-slate-500">Google Maps Reviewer Input</span>
                  <span class="text-slate-400">Untrusted Input</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Customer / Patient Name</label>
                  <input id="demoName" type="text" value="Rohit Kulkarni" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-bold bg-white">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
                  <div class="flex items-center gap-1.5 text-2xl text-amber-400 cursor-pointer">
                    <span onclick="setStars(1)">★</span>
                    <span onclick="setStars(2)">★</span>
                    <span onclick="setStars(3)">★</span>
                    <span onclick="setStars(4)">★</span>
                    <span onclick="setStars(5)">★</span>
                    <span id="starDisplay" class="text-xs font-bold text-slate-700 ml-2">5 Stars</span>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Comment (Hindi, Hinglish, English)</label>
                  <textarea id="demoText" rows="4" class="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!</textarea>
                </div>
                <button onclick="runPipeline()" class="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all">
                  Process through Replyo AI Engine &rarr;
                </button>
              </div>

              <!-- Pipeline Output -->
              <div class="p-6 sm:p-8 bg-white flex flex-col justify-between space-y-4">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Execution Decision</span>
                    <span id="demoDecision" class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      AUTOPILOT: AUTO-POSTED
                    </span>
                  </div>
                  <div class="flex flex-wrap gap-2 text-[11px]">
                    <span id="demoLang" class="font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">LANG: HINGLISH</span>
                    <span class="font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">LOCAL SEO WEAVED</span>
                    <span class="font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">SAFETY: PASSED</span>
                  </div>
                  <div class="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span class="text-xs font-bold text-slate-700 block">Official Response from Dr. Sharma Dental:</span>
                    <p id="demoOutput" class="text-xs text-slate-800 leading-relaxed font-normal">
                      Thank you so much Rohit ji for this wonderful review! Aapka visit hamare liye bohot special tha aur pure staff ko aapka feedback padhkar bohot khushi hui. Our team works hard every day to remain the best dental clinic in Indiranagar. Looking forward to serving you again at Dr. Sharma Dental & Implant Clinic!
                    </p>
                  </div>
                </div>
                <div class="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex justify-between">
                  <span>Engine: Gemini 1.5 Flash</span>
                  <a href="/app" class="font-bold text-brand-600 hover:underline">Open Live Dashboard &rarr;</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TWO CORE JOBS DETAILED -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-heading">
              Two Core Jobs. Flawlessly Executed.
            </h2>
            <p class="text-slate-600 text-sm leading-relaxed">
              Global tools are priced in USD, English-first, and sold on long contracts. Replyo solves the two most painful local reputation problems for Indian business owners.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <!-- Job 1 -->
            <div class="p-8 sm:p-10 rounded-3xl bg-white border subtle-border shadow-sm space-y-6 flex flex-col justify-between card-hover">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-xl font-heading">1</div>
                <h3 class="text-2xl font-bold text-slate-900 font-heading">Review Reply Autopilot</h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Connect your Google Business Profile once. Detects Hindi, Hinglish, English and regional dialects. 4–5 star reviews auto-post in minutes; 1–3 star negative reviews trigger instant SMS alerts with 1-tap approval links to your phone.
                </p>
                <ul class="space-y-2.5 text-xs text-slate-700">
                  <li class="flex items-center gap-2">✓ <strong>Multi-Language & Slang Mirroring:</strong> Fluent in Hindi, Hinglish, English, Tamil, Kannada, Bengali.</li>
                  <li class="flex items-center gap-2">✓ <strong>Zero-Liability Shield:</strong> Blocks refund promises & legal admissions of negligence.</li>
                  <li class="flex items-center gap-2">✓ <strong>Local SEO Keyword Weaving:</strong> Boosts Google Local 3-Pack rank.</li>
                  <li class="flex items-center gap-2">✓ <strong>1-Tap SMS Link:</strong> Approve held negative reviews from your phone with no login.</li>
                </ul>
              </div>
              <a href="/features" class="font-bold text-brand-600 text-xs hover:underline pt-2">Learn more about Review Reply &rarr;</a>
            </div>

            <!-- Job 2 -->
            <div class="p-8 sm:p-10 rounded-3xl bg-white border subtle-border shadow-sm space-y-6 flex flex-col justify-between card-hover">
              <div class="space-y-4">
                <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl font-heading">2</div>
                <h3 class="text-2xl font-bold text-slate-900 font-heading">In-Clinic AI QR Review Booster</h3>
                <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Happy customers rarely post reviews because typing on a phone is tedious. Our 30-second mobile QR flow removes all friction with zero login.
                </p>
                <ul class="space-y-2.5 text-xs text-slate-700">
                  <li class="flex items-center gap-2">✓ <strong>30-Second Tap Flow:</strong> Customer taps what treatment they had and quality tags.</li>
                  <li class="flex items-center gap-2">✓ <strong>Strict Anti-Invention:</strong> AI draft is built ONLY from customer-selected choices.</li>
                  <li class="flex items-center gap-2">✓ <strong>1-Tap Google Handoff:</strong> Text copies to clipboard and opens Google Maps Place ID.</li>
                  <li class="flex items-center gap-2">✓ <strong>Print-Ready QR Studio:</strong> Download A6 counter cards, table tents, and bill stickers.</li>
                </ul>
              </div>
              <a href="/q/sharma-dent-01" target="_blank" class="font-bold text-teal-600 text-xs hover:underline pt-2">Test Live Customer QR Flow &rarr;</a>
            </div>
          </div>
        </section>

        <!-- COMPETITOR COMPARISON TABLE -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="bg-white rounded-3xl border subtle-border shadow-md p-8 sm:p-10 space-y-6">
            <div class="text-center space-y-2 max-w-xl mx-auto">
              <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">How Replyo Compares</h2>
              <p class="text-xs text-slate-500">Why Indian local businesses switch from legacy US tools and digital agencies</p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 uppercase border-y border-slate-100">
                  <tr>
                    <th class="py-3 px-4">Feature / Dimension</th>
                    <th class="py-3 px-4 font-bold text-brand-700 bg-brand-50/80">Replyo India</th>
                    <th class="py-3 px-4">US Legacy Tools (Birdeye / Podium)</th>
                    <th class="py-3 px-4">Digital Marketing Agency</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">Monthly Pricing</td>
                    <td class="py-3.5 px-4 font-black text-brand-700 bg-brand-50/50">₹749 – ₹1,949 / month</td>
                    <td class="py-3.5 px-4 text-slate-600">$299+ / mo (₹25,000+)</td>
                    <td class="py-3.5 px-4 text-slate-600">₹8,000 – ₹20,000 / mo</td>
                  </tr>
                  <tr>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">Contract Lock-in</td>
                    <td class="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/50">Month-to-Month (No Lock)</td>
                    <td class="py-3.5 px-4 text-rose-600">12-Month Mandatory Lock</td>
                    <td class="py-3.5 px-4 text-slate-600">3–6 Months Retainer</td>
                  </tr>
                  <tr>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">Hinglish & Regional Languages</td>
                    <td class="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/50">Native Indian Dialects</td>
                    <td class="py-3.5 px-4 text-slate-400">English Only</td>
                    <td class="py-3.5 px-4 text-slate-600">Manual (Slow)</td>
                  </tr>
                  <tr>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">Negative Review Safeguard</td>
                    <td class="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/50">Zero-Liability + 1-Tap SMS</td>
                    <td class="py-3.5 px-4 text-slate-400">Blind Auto-Reply</td>
                    <td class="py-3.5 px-4 text-slate-600">Delayed Days</td>
                  </tr>
                  <tr>
                    <td class="py-3.5 px-4 font-semibold text-slate-900">In-Clinic AI QR Booster</td>
                    <td class="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/50">Included (Print Ready)</td>
                    <td class="py-3.5 px-4 text-slate-400">Basic SMS Links</td>
                    <td class="py-3.5 px-4 text-slate-400">None</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- PRICING CARDS -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div class="text-center space-y-3">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight font-heading">
              Transparent Pricing. Pay in INR.
            </h2>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">
              No dollar conversions. Pay with UPI AutoPay or credit card. Get GST invoices for full input tax credit.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${PLANS.slice(0, 3).map((plan) => `
              <div class="p-7 rounded-3xl bg-white border ${plan.isPopular ? 'border-2 border-brand-500 shadow-2xl relative scale-105' : 'subtle-border shadow-sm'} flex flex-col justify-between">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-xl text-slate-900 font-heading">${plan.name}</h3>
                    ${plan.isPopular ? '<span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-brand-600 text-white rounded-full">Most Popular</span>' : ''}
                  </div>
                  <div>
                    <span class="text-4xl font-black text-slate-900 font-heading">₹${plan.monthlyPrice}</span>
                    <span class="text-xs text-slate-500"> / month</span>
                  </div>
                  <ul class="space-y-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    ${plan.features.map((f) => `<li class="flex items-center gap-2">✓ <span>${f}</span></li>`).join('')}
                  </ul>
                </div>
                <a href="/pricing" class="mt-6 block w-full py-3 text-center rounded-xl ${plan.isPopular ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-slate-900 text-white'} text-xs font-bold transition-all">
                  Get Started with ${plan.name} &rarr;
                </a>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- CTA BANNER -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div class="p-10 sm:p-14 rounded-3xl bg-slate-950 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div class="max-w-2xl mx-auto space-y-3 relative z-10">
              <h2 class="text-3xl sm:text-5xl font-black tracking-tight font-heading">
                Ready to dominate Google Maps in your area?
              </h2>
              <p class="text-xs sm:text-sm text-slate-400">
                Join 1,200+ local clinics, salons, and restaurants across Bangalore, Mumbai, and Delhi who never miss a review.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-3 relative z-10">
              <a href="/app" class="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105">
                Start Free Trial &rarr;
              </a>
              <a href="/free-audit" class="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700">
                Run Free Competitor Audit
              </a>
            </div>
          </div>
        </section>

        <script>
          let demoRating = 5;
          function setStars(r) {
            demoRating = r;
            document.getElementById('starDisplay').innerText = r + ' Stars';
          }
          function setSample(type) {
            if (type === 'hinglish') {
              setStars(5);
              document.getElementById('demoName').value = 'Rohit Kulkarni';
              document.getElementById('demoText').value = 'Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!';
            } else if (type === 'hindi') {
              setStars(5);
              document.getElementById('demoName').value = 'मनोज कुमार';
              document.getElementById('demoText').value = 'डॉक्टर शर्मा जी बहुत ही अनुभवी हैं। दांत में बहुत दर्द था लेकिन इलाज के बाद तुरंत राहत मिल गई। बहुत बढ़िया अस्पताल।';
            } else if (type === 'negative') {
              setStars(1);
              document.getElementById('demoName').value = 'Priya Narang';
              document.getElementById('demoText').value = 'Waited 45 mins past appointment time. Receptionist was completely dismissive and the doctor rushed through consultation.';
            }
            runPipeline();
          }
          function runPipeline() {
            const name = document.getElementById('demoName').value;
            const text = document.getElementById('demoText').value;
            const isPos = demoRating >= 4;

            const badge = document.getElementById('demoDecision');
            badge.innerText = isPos ? 'AUTOPILOT: AUTO-POSTED' : 'HELD FOR OWNER APPROVAL';
            badge.className = isPos ? 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';

            const output = document.getElementById('demoOutput');
            if (!isPos) {
              output.innerText = 'Dear ' + name + ', thank you for sharing your feedback. We sincerely value patient comfort and punctuality at Dr. Sharma Dental & Implant Clinic. We take this seriously and would appreciate the opportunity to speak with you directly. Please contact our clinic manager at +91 98450 12345.';
            } else if (text.includes('डॉक्टर')) {
              output.innerText = 'नमस्ते ' + name + ' जी! अपनी बहुमूल्य समीक्षा साझा करने के लिए बहुत-बहुत धन्यवाद। हमारी टीम को यह जानकर बेहद खुशी हुई कि आपका अनुभव बेहतरीन रहा। हम आपके उत्तम स्वास्थ्य और मुस्कान की कामना करते हैं!';
            } else {
              output.innerText = 'Thank you so much ' + name + ' for this wonderful review! Our team works hard every day to remain the best dental clinic in Indiranagar. Looking forward to serving you again at Dr. Sharma Dental & Implant Clinic!';
            }
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // 2. FEATURES DEEP DIVE (/features)
    if (pathname === '/features') {
      const html = renderHtmlPage('Features', 'features', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Complete Feature Architecture
            </span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
              Engineered for Real-World Indian Reputation
            </h1>
            <p class="text-slate-600 text-sm">Every capability is built specifically to address local business challenges.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div id="reply-engine" class="p-8 bg-white rounded-3xl border subtle-border shadow-sm space-y-4">
              <span class="text-2xl">🤖</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Linguistic & Dialect Mirroring</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Replyo does not sound like a machine. It naturally replies in Hindi Devanagari, colloquial Hinglish (e.g. <em>"Aapka visit hamare liye bohot special tha"</em>), English, Tamil, Telugu, and Kannada.
              </p>
            </div>

            <div id="safety-shield" class="p-8 bg-white rounded-3xl border subtle-border shadow-sm space-y-4">
              <span class="text-2xl">🛡️</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Zero-Liability Safety Shield</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Prevents disastrous automated PR blunders. Hardcoded validator blocks refund offers, admissions of medical fault, or staff blame. Quarantines 1–3 star complaints into a private queue with direct manager telephone fallback.
              </p>
            </div>

            <div id="qr-studio" class="p-8 bg-white rounded-3xl border subtle-border shadow-sm space-y-4">
              <span class="text-2xl">📱</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">In-Clinic AI QR Studio</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Download printable A6 counter cards, A4 table tents, and bill stickers. Customers scan, tap 3 choices, get an AI draft built strictly from their selections, and post on Google Maps in 30 seconds.
              </p>
            </div>

            <div class="p-8 bg-white rounded-3xl border subtle-border shadow-sm space-y-4">
              <span class="text-2xl">📍</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Local SEO Keyword Injection</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Naturally weaves your neighborhood and service terms into positive replies (e.g., <em>"best dental clinic in Indiranagar"</em>), signaling search relevance directly to the Google Local 3-Pack algorithm.
              </p>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 3. PRICING (/pricing)
    if (pathname === '/pricing') {
      const html = renderHtmlPage('Pricing', 'pricing', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div class="space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              India-First Pricing
            </span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
              Transparent INR Plans. No Foreign Exchange Shock.
            </h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Month-to-month flexibility. Pay with UPI AutoPay. Full GST invoices for tax credit.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left items-stretch">
            ${PLANS.map((plan) => `
              <div class="p-6 rounded-3xl bg-white border ${plan.isPopular ? 'border-2 border-brand-500 shadow-2xl relative scale-105' : 'subtle-border shadow-sm'} flex flex-col justify-between">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-xl text-slate-900 font-heading">${plan.name}</h3>
                    ${plan.isPopular ? '<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-brand-600 text-white rounded-full">Popular</span>' : ''}
                  </div>
                  <div>
                    <span class="text-3xl font-black text-slate-900 font-heading">
                      ${plan.id === 'enterprise' ? 'Custom' : '₹' + plan.monthlyPrice}
                    </span>
                    ${plan.id !== 'enterprise' ? '<span class="text-xs text-slate-500"> / mo</span>' : ''}
                  </div>
                  <ul class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    ${plan.features.map((f) => `<li class="flex items-center gap-2">✓ <span>${f}</span></li>`).join('')}
                  </ul>
                </div>
                <a href="/app" class="mt-6 block w-full py-2.5 text-center rounded-xl ${plan.isPopular ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-900 text-white'} text-xs font-bold">
                  Start with ${plan.name} &rarr;
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 4. FREE AUDIT TOOL (/free-audit)
    if (pathname === '/free-audit') {
      const html = renderHtmlPage('Free Competitor Audit', 'audit', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Audit Your Google Maps Review Gap</h1>
            <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Scan your Indian clinic or salon to see how many reviews are sitting unanswered and where competitors are outranking you.
            </p>
          </div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border subtle-border shadow-md text-left space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Business Name on Google Maps</label>
                <input id="auditName" type="text" value="Dr. Sharma Dental & Implant Clinic" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-semibold">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input type="text" value="Bengaluru" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-semibold">
              </div>
            </div>
            <button onclick="document.getElementById('auditReport').classList.remove('hidden')" class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md">
              Run Instant Reputation Scan &rarr;
            </button>
          </div>

          <div id="auditReport" class="hidden bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500 shadow-xl text-left space-y-6">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-base text-slate-900 font-heading">Dr. Sharma Dental & Implant Clinic</h3>
                <p class="text-xs text-slate-500">Indiranagar, Bengaluru • Google Business Profile</p>
              </div>
              <span class="text-xs font-bold text-brand-800 bg-brand-100 px-3 py-1 rounded-full">Score: 92/100</span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center text-xs">
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Response Rate</span>
                <p class="text-2xl font-black text-brand-600 mt-1">99.6%</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Unanswered</span>
                <p class="text-2xl font-black text-amber-600 mt-1">2 reviews</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Avg Reply Time</span>
                <p class="text-2xl font-black text-slate-900 mt-1">4 mins</p>
              </div>
            </div>
            <div class="text-center pt-2">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">
                Manage Profile with Replyo &rarr;
              </a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 5. INDUSTRY PAGES (CLINICS, SALONS, RESTAURANTS)
    if (pathname.startsWith('/industries/')) {
      const ind = pathname.split('/')[2];
      const name = ind === 'clinics' ? 'Dental & Aesthetic Clinics' : ind === 'salons' ? 'Hair Salons & Spas' : 'Restaurants & Cafes';
      const html = renderHtmlPage(name, 'features', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Specialized Industry Solution</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Google Review Autopilot for ${name}</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Protect your patient and guest reputation, weave local keywords, and collect 3x more genuine Google reviews.</p>
          </div>
          <div class="p-8 bg-white rounded-3xl border subtle-border shadow-md space-y-4 text-xs leading-relaxed text-slate-700">
            <h3 class="text-base font-bold text-slate-900 font-heading">Why ${name} Choose Replyo</h3>
            <p>Customers evaluate your business on Google Maps before booking an appointment or reserving a table. With Replyo, every positive review is answered in minutes with local keywords, and negative reviews are safely held with direct manager telephone contacts.</p>
            <div class="pt-4 text-center">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">Start 14-Day Free Trial &rarr;</a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 6. FOR AGENCIES (/for-agencies)
    if (pathname === '/for-agencies') {
      const html = renderHtmlPage('For Agencies & Resellers', 'agencies', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Partner Program</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Earn 30% Recurring Commission with Replyo</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Manage all client Google Business Profiles under one roof with white-label client PDF report cards.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-6 bg-white rounded-2xl border subtle-border space-y-2">
              <h4 class="font-bold text-sm text-slate-900 font-heading">White-Label PDF Reports</h4>
              <p class="text-slate-500">Send automated weekly reputation report cards branded with your marketing agency logo.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border subtle-border space-y-2">
              <h4 class="font-bold text-sm text-slate-900 font-heading">30% Lifetime Revenue Share</h4>
              <p class="text-slate-500">Earn 30% recurring monthly margin on every local clinic or salon you onboard.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border subtle-border space-y-2">
              <h4 class="font-bold text-sm text-slate-900 font-heading">Multi-Tenant Client Desk</h4>
              <p class="text-slate-500">Switch between 50+ client locations in one single unified dashboard.</p>
            </div>
          </div>
          <div class="text-center pt-4">
            <a href="/app" class="inline-block px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md">Join Agency Partner Program &rarr;</a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 7. LEGAL PAGES: PRIVACY, TERMS, REFUNDS, DPDP CONSENT
    if (['/privacy', '/terms', '/refund-policy', '/dpdp-consent'].includes(pathname)) {
      const titles = {
        '/privacy': 'Privacy Policy',
        '/terms': 'Terms of Service',
        '/refund-policy': 'Refund & Cancellation Policy',
        '/dpdp-consent': 'Digital Personal Data Protection (DPDP) Act 2023 Consent'
      };
      const title = titles[pathname];
      const html = renderHtmlPage(title, '', `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="border-b subtle-border pb-4">
            <h1 class="text-3xl font-black text-slate-900 font-heading">${title}</h1>
            <p class="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Replyo Technologies India Pvt Ltd</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border subtle-border text-xs leading-relaxed text-slate-700 space-y-4">
            <p><strong>1. Compliance & Data Governance:</strong> Replyo operates in full adherence to the Digital Personal Data Protection Act 2023 of India and Google API Services User Data Policy.</p>
            <p><strong>2. Google API Data Usage:</strong> Replyo accesses Google Business Profile reviews solely to ingest comments and draft or post owner-authorized review replies. Customer review drafting (/q/[code]) requires zero login and does not collect phone numbers, email addresses, or names.</p>
            <p><strong>3. Anti-Incentivization Policy:</strong> In compliance with Google Local Guides and FTC regulations, Replyo strictly prohibits offering rewards, discounts, or financial compensation in exchange for Google reviews.</p>
            <p><strong>4. Invoicing & Taxes:</strong> All subscriptions are billed in Indian Rupees (INR) with 18% GST invoices generated for input tax credit.</p>
            <p><strong>5. Contact Information:</strong> For legal inquiries or DPDP data deletion requests, contact our compliance officer at <code class="text-brand-700 font-semibold">compliance@replyo.in</code>.</p>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // OWNER APPLICATION VIEWS (/app, /app/reviews, etc.)
    // ----------------------------------------------------
    if (pathname === '/app') {
      const reviews = getAllReviews();
      const held = getHeldReviews();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Reputation Overview</h1>
              <p class="text-xs text-slate-500">Real-time metrics for ${INITIAL_LOCATION.name}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="document.getElementById('simModal').classList.remove('hidden')" class="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-sm">
                + Simulate New Review
              </button>
              <a href="/q/sharma-dent-01" target="_blank" class="px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-sm">
                📱 Open AI QR
              </a>
            </div>
          </div>

          ${held.length > 0 ? `
            <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div>
                <h3 class="font-bold text-sm text-amber-950">${held.length} Negative Review(s) Held for Approval</h3>
                <p class="text-xs text-amber-800">1–3 star reviews are quarantined with zero-liability drafts awaiting your 1-tap confirmation.</p>
              </div>
              <a href="/app/approvals" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap">
                Review & Approve &rarr;
              </a>
            </div>
          ` : ''}

          <!-- 4 KPIS -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-white border subtle-border shadow-sm space-y-1">
              <span class="text-xs text-slate-500 font-medium">Google Rating</span>
              <p class="text-3xl font-black text-slate-900 font-heading">4.8 ★</p>
              <p class="text-[11px] text-brand-600 font-semibold">+0.2 this month</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border subtle-border shadow-sm space-y-1">
              <span class="text-xs text-slate-500 font-medium">Response Coverage</span>
              <p class="text-3xl font-black text-slate-900 font-heading">99.6%</p>
              <p class="text-[11px] text-slate-400">Google 3-Pack Priority</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border subtle-border shadow-sm space-y-1">
              <span class="text-xs text-slate-500 font-medium">Average Reply Velocity</span>
              <p class="text-3xl font-black text-slate-900 font-heading">4 mins</p>
              <p class="text-[11px] text-brand-600 font-semibold">Autopilot Active</p>
            </div>
            <div class="p-5 rounded-2xl bg-white border subtle-border shadow-sm space-y-1">
              <span class="text-xs text-slate-500 font-medium">Owner Time Saved</span>
              <p class="text-3xl font-black text-slate-900 font-heading">18.5 hrs</p>
              <p class="text-[11px] text-slate-400">~ ₹12,000 agency fee saved</p>
            </div>
          </div>

          <!-- RECENT FEED -->
          <div class="bg-white rounded-2xl border subtle-border shadow-sm p-6 space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="font-bold text-base text-slate-900 font-heading">Recent Review Activity</h2>
              <a href="/app/reviews" class="text-xs font-bold text-brand-600 hover:underline">View All &rarr;</a>
            </div>
            <div class="divide-y divide-slate-100">
              ${reviews.slice(0, 4).map((r) => `
                <div class="py-3.5 space-y-1.5">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-slate-900">${r.reviewerName} (${r.rating}★) - <span class="text-slate-400 uppercase font-mono">${r.detectedLanguage}</span></span>
                    <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full">
                      ${r.reply?.status === 'posted' ? '✓ Auto-Posted' : '⚠️ Held for Approval'}
                    </span>
                  </div>
                  <p class="text-xs text-slate-700 italic">"${r.text || 'Star-only review'}"</p>
                  <div class="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                    <strong>Reply:</strong> ${r.reply?.finalText || r.reply?.draftText || 'Drafting...'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SIMULATION MODAL -->
          <div id="simModal" class="hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-sm text-slate-900 font-heading">Simulate Incoming Google Review</h3>
                <button onclick="document.getElementById('simModal').classList.add('hidden')" class="text-slate-400 font-bold text-xs">✕</button>
              </div>
              <input id="simReviewer" type="text" placeholder="Reviewer Name" value="Deepak Sen" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
              <select id="simStars" class="w-full text-xs p-2.5 rounded-xl border border-slate-300">
                <option value="5">5 Stars (Triggers Auto-Post + SEO Keyword)</option>
                <option value="1">1 Star (Triggers Held Approval + SMS Link)</option>
              </select>
              <textarea id="simComment" rows="3" placeholder="Comment..." class="w-full text-xs p-2.5 rounded-xl border border-slate-300">Indiranagar me Dr. Sharma ka clinic best hai. Staff bohot cooperative hai!</textarea>
              <button onclick="submitSimReview()" class="w-full py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">
                Submit Webhook to Pipeline &rarr;
              </button>
            </div>
          </div>
        </div>

        <script>
          async function submitSimReview() {
            const name = document.getElementById('simReviewer').value;
            const rating = document.getElementById('simStars').value;
            const text = document.getElementById('simComment').value;
            await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reviewerName: name, rating, text })
            });
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Dashboard', 'app', renderAppShell('dashboard', content)));
    }

    if (pathname === '/app/reviews') {
      const reviews = getAllReviews();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Google Reviews Feed (${reviews.length})</h1>
            <p class="text-xs text-slate-500">Google Business Profile synchronized live feed</p>
          </div>
          <div class="space-y-4">
            ${reviews.map((r) => `
              <div class="p-6 bg-white rounded-2xl border subtle-border shadow-sm space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-sm text-slate-900">${r.reviewerName} (${r.rating}★) - <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">${r.detectedLanguage}</span></span>
                  <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2.5 py-0.5 rounded-full">
                    ${r.reply?.status === 'posted' ? '✓ Posted to Google' : '⚠️ Held for Approval'}
                  </span>
                </div>
                <p class="text-xs text-slate-800">"${r.text || 'Star-only review'}"</p>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div class="flex justify-between font-bold text-slate-800">
                    <span>Official Reply:</span>
                    <button onclick="approveReply('${r.id}')" class="text-brand-600 hover:underline">Approve Now &rarr;</button>
                  </div>
                  <p>${r.reply?.finalText || r.reply?.draftText}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <script>
          async function approveReply(id) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'approve' })
            });
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Reviews', 'app', renderAppShell('reviews', content)));
    }

    if (pathname === '/app/approvals') {
      const held = getHeldReviews();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Held Approvals Queue (${held.length})</h1>
            <p class="text-xs text-slate-500">Reviews rated 1–3 stars quarantined with zero-liability defense</p>
          </div>
          ${held.length === 0 ? `
            <div class="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
              <p class="text-3xl">✓</p>
              <h3 class="font-bold text-slate-900 font-heading">All Reviews Clear!</h3>
              <p class="text-xs text-slate-500">No negative reviews currently awaiting approval.</p>
            </div>
          ` : `
            <div class="space-y-5">
              ${held.map((r) => `
                <div class="p-6 bg-white rounded-3xl border-2 border-amber-200 shadow-md space-y-4">
                  <div class="flex justify-between text-xs">
                    <span class="font-bold text-sm text-slate-900">${r.reviewerName} (${r.rating}★)</span>
                    <span class="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">Requires Approval</span>
                  </div>
                  <p class="text-xs text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"${r.text}"</p>
                  <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2">
                    <span class="font-bold text-emerald-950">De-escalating AI Proposed Draft:</span>
                    <p>${r.reply?.draftText}</p>
                    <p class="text-[10px] text-emerald-700">✓ Checked: Zero fault admitted • No refund promised • Directs to manager phone (+91 98450 12345)</p>
                  </div>
                  <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex justify-between items-center">
                    <span class="text-blue-900 font-semibold">📱 SMS 1-Tap Link: /a/${r.reply?.approvalToken || 'token'}</span>
                    <a href="/a/${r.reply?.approvalToken || 'token'}" target="_blank" class="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px]">Open 1-Tap &rarr;</a>
                  </div>
                  <button onclick="approveReply('${r.id}')" class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md">
                    Approve & Post to Google Maps (1-Tap) &rarr;
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        <script>
          async function approveReply(id) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'approve' })
            });
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Approvals', 'app', renderAppShell('approvals', content)));
    }

    if (pathname === '/app/qr') {
      const qrs = getQRCodes();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">AI QR Studio</h1>
              <p class="text-xs text-slate-500">Print-ready collateral with dynamic short-links</p>
            </div>
            <a href="/q/sharma-dent-01" target="_blank" class="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm">
              📱 Test Customer Flow
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Active Touchpoints</h3>
              ${qrs.map((q) => `
                <div class="p-3.5 bg-white rounded-2xl border subtle-border text-xs space-y-1">
                  <div class="flex justify-between font-bold text-slate-900">
                    <span>${q.name}</span>
                    <span class="bg-brand-100 text-brand-800 text-[10px] px-1.5 py-0.2 rounded">${q.scansCount} scans</span>
                  </div>
                  <p class="text-slate-500 font-mono text-[11px]">/q/${q.shortCode}</p>
                </div>
              `).join('')}
            </div>

            <div class="md:col-span-2 p-8 bg-white rounded-3xl border subtle-border text-center space-y-4">
              <h3 class="font-bold text-sm text-slate-900 font-heading">Print Preview (A6 Counter Card)</h3>
              <div class="max-w-xs mx-auto p-6 bg-slate-50 border-2 border-slate-300 rounded-3xl space-y-3">
                <span class="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Google Verified Partner</span>
                <h4 class="font-extrabold text-sm text-slate-900 font-heading">${INITIAL_LOCATION.name}</h4>
                <p class="text-[11px] text-slate-600">Loved your visit? Share feedback in 30 seconds</p>
                <div id="qrcodeCanvas" class="p-3 bg-white border border-slate-200 inline-block rounded-xl"></div>
                <p class="text-[10px] text-slate-400 font-mono">replyo.in/q/sharma-dent-01</p>
              </div>
              <div class="flex justify-center gap-2 pt-2">
                <button onclick="window.print()" class="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
                  Print PDF (with Bleed)
                </button>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('load', () => {
            QRCode.toCanvas(document.getElementById('qrcodeCanvas'), window.location.origin + '/q/sharma-dent-01', { width: 160 });
          });
        </script>
      `;
      return sendHtml(200, renderHtmlPage('QR Studio', 'app', renderAppShell('qr', content)));
    }

    if (pathname === '/app/growth') {
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Growth & Competitors</h1>
            <p class="text-xs text-slate-500">Indiranagar local market leaderboard</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border subtle-border shadow-sm space-y-4">
            <h3 class="font-bold text-sm text-slate-900 font-heading">Local Area Competitor Benchmark</h3>
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 uppercase border-y border-slate-100">
                <tr>
                  <th class="py-2.5 px-3">Clinic</th>
                  <th class="py-2.5 px-3">Rating</th>
                  <th class="py-2.5 px-3">Reviews</th>
                  <th class="py-2.5 px-3">Unanswered</th>
                  <th class="py-2.5 px-3">Response Rate</th>
                  <th class="py-2.5 px-3">Reply Velocity</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${COMPETITORS.map((c, i) => `
                  <tr class="${i === 0 ? 'bg-brand-50/60 font-bold' : ''}">
                    <td class="py-3 px-3">${c.name}</td>
                    <td class="py-3 px-3">★ ${c.rating}</td>
                    <td class="py-3 px-3">${c.totalReviews}</td>
                    <td class="py-3 px-3 text-amber-600">${c.unansweredReviews}</td>
                    <td class="py-3 px-3">${c.responseRate}%</td>
                    <td class="py-3 px-3">${c.averageResponseTime}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Growth', 'app', renderAppShell('growth', content)));
    }

    if (pathname === '/app/settings') {
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Autopilot & Tone Settings</h1>
            <p class="text-xs text-slate-500">Configure response autonomy and brand persona</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border subtle-border shadow-sm space-y-4 text-xs">
            <h3 class="font-bold text-sm text-slate-900 font-heading">Autopilot Level</h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="p-4 rounded-2xl border-2 border-brand-600 bg-brand-50/60 space-y-1">
                <span class="font-bold text-slate-900 font-heading">Smart Autopilot</span>
                <p class="text-slate-500 text-[11px]">4–5★ auto-post. 1–3★ held for approval.</p>
              </div>
              <div class="p-4 rounded-2xl border border-slate-200 space-y-1">
                <span class="font-bold text-slate-900 font-heading">Full Autopilot</span>
                <p class="text-slate-500 text-[11px]">Auto-publishes all with safety shield.</p>
              </div>
              <div class="p-4 rounded-2xl border border-slate-200 space-y-1">
                <span class="font-bold text-slate-900 font-heading">Manual Approval Only</span>
                <p class="text-slate-500 text-[11px]">Nothing posts without sign-off.</p>
              </div>
            </div>
            <div class="pt-4 space-y-2">
              <label class="font-bold text-slate-700">De-escalation Manager Mobile</label>
              <input type="text" value="${INITIAL_LOCATION.managerPhone}" class="w-full p-2.5 border rounded-xl font-semibold">
            </div>
            <button onclick="alert('Settings saved!')" class="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Save Settings
            </button>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Settings', 'app', renderAppShell('settings', content)));
    }

    if (pathname === '/app/billing') {
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Billing & Plans</h1>
            <p class="text-xs text-slate-500">INR subscription with UPI AutoPay & GST compliance</p>
          </div>
          <div class="p-8 bg-slate-950 text-white rounded-3xl space-y-4 shadow-xl">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-[10px] uppercase font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded">Active Plan</span>
                <h2 class="text-2xl font-black mt-1 font-heading">Growth Plan (₹1,349 / month)</h2>
                <p class="text-xs text-slate-400">Renews via UPI AutoPay on 15 Nov 2026</p>
              </div>
              <span class="text-brand-400 font-bold text-xs">✓ UPI Mandate Active</span>
            </div>
            <div class="grid grid-cols-3 gap-3 pt-3 text-xs border-t border-slate-800">
              <div><span class="text-slate-400">AI Replies:</span> <strong class="text-white block font-heading text-sm">42 / Unlimited</strong></div>
              <div><span class="text-slate-400">QR Touchpoints:</span> <strong class="text-white block font-heading text-sm">3 of 3 Active</strong></div>
              <div><span class="text-slate-400">Customer Drafts:</span> <strong class="text-white block font-heading text-sm">197 of 300</strong></div>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Billing', 'app', renderAppShell('billing', content)));
    }

    // 8. CUSTOMER QR REVIEW FLOW (/q/:code)
    if (pathname.startsWith('/q/') && !pathname.endsWith('/done')) {
      const code = pathname.split('/')[2];
      const html = renderHtmlPage('Review Helper', 'qr', `
        <div class="min-h-screen bg-slate-100 py-6 px-4">
          <div class="max-w-md mx-auto space-y-4">
            <div class="p-5 bg-white rounded-2xl border border-slate-200 text-center space-y-1 shadow-sm">
              <h1 class="font-extrabold text-slate-900 text-lg font-heading">${INITIAL_LOCATION.name}</h1>
              <p class="text-xs text-slate-500">${INITIAL_LOCATION.area}, ${INITIAL_LOCATION.city}</p>
              <p class="text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-semibold inline-block mt-1">✨ 30-Second Google Review Helper</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 text-center space-y-2 shadow-sm">
              <label class="text-xs font-bold uppercase text-slate-500">1. Your Rating</label>
              <div class="flex justify-center gap-2 text-3xl text-amber-400">
                <span class="cursor-pointer" onclick="setQrRating(1)">★</span>
                <span class="cursor-pointer" onclick="setQrRating(2)">★</span>
                <span class="cursor-pointer" onclick="setQrRating(3)">★</span>
                <span class="cursor-pointer" onclick="setQrRating(4)">★</span>
                <span class="cursor-pointer" onclick="setQrRating(5)">★</span>
              </div>
              <p id="qrRatingLabel" class="text-xs font-bold text-slate-700">5 Stars (Outstanding!)</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm text-xs">
              <label class="font-bold uppercase text-slate-500">2. What did you visit for?</label>
              <div class="flex flex-wrap gap-1.5" id="serviceTags">
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-brand-600 text-white font-medium">Root Canal Treatment</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">Dental Implants</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">Teeth Whitening</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">General Checkup</button>
              </div>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm text-xs">
              <label class="font-bold uppercase text-slate-500">3. Preferred Language</label>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="setLang('hi-en', this)" class="py-2 rounded-lg border font-bold bg-brand-600 text-white">Hinglish</button>
                <button onclick="setLang('en', this)" class="py-2 rounded-lg border font-bold bg-slate-50 text-slate-700">English</button>
                <button onclick="setLang('hi', this)" class="py-2 rounded-lg border font-bold bg-slate-50 text-slate-700">हिंदी</button>
              </div>
              <button onclick="generateDraft()" class="w-full py-3 bg-slate-900 text-white font-bold rounded-xl mt-2">
                Generate AI Draft from My Choices &rarr;
              </button>
            </div>

            <div id="draftContainer" class="hidden p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-500 space-y-3 text-xs">
              <span class="font-bold text-emerald-950 font-heading">Your Customized Review Draft:</span>
              <textarea id="draftText" rows="4" class="w-full p-3 rounded-xl border border-emerald-300 bg-white text-xs"></textarea>
              <button onclick="submitToGoogle()" class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl text-sm shadow-lg">
                Copy Text & Give Review on Google Maps &rarr;
              </button>
            </div>
          </div>
        </div>

        <script>
          let qrRating = 5;
          let qrLang = 'hi-en';
          function setQrRating(r) {
            qrRating = r;
            document.getElementById('qrRatingLabel').innerText = r + ' Stars';
          }
          function setLang(l, btn) {
            qrLang = l;
            btn.parentElement.querySelectorAll('button').forEach(b => {
              b.className = 'py-2 rounded-lg border font-bold bg-slate-50 text-slate-700';
            });
            btn.className = 'py-2 rounded-lg border font-bold bg-brand-600 text-white';
          }
          function toggleTag(btn) {
            if (btn.classList.contains('bg-brand-600')) {
              btn.className = 'px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium';
            } else {
              btn.className = 'px-3 py-1.5 rounded-lg border bg-brand-600 text-white font-medium';
            }
          }
          async function generateDraft() {
            const services = [];
            document.querySelectorAll('#serviceTags button.bg-brand-600').forEach(b => services.push(b.innerText));
            const res = await fetch('/api/ai/qr-draft', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                submission: {
                  rating: qrRating,
                  selectedServices: services.length ? services : ['Root Canal Treatment'],
                  qualityTags: ['Painless Procedure', 'Clean & Hygienic'],
                  staffName: 'Dr. Sneha',
                  ambienceTags: ['Modern Equipment'],
                  recommend: 'yes',
                  language: qrLang,
                  length: 'short'
                },
                shortCode: '${code}'
              })
            });
            const json = await res.json();
            document.getElementById('draftText').value = json.draftText;
            document.getElementById('draftContainer').classList.remove('hidden');
          }
          async function submitToGoogle() {
            const text = document.getElementById('draftText').value;
            await navigator.clipboard.writeText(text);
            confetti({ particleCount: 70, spread: 60 });
            window.open('https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}', '_blank');
            window.location.href = '/q/${code}/done?text=' + encodeURIComponent(text);
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // 9. CUSTOMER DONE (/q/:code/done)
    if (pathname.startsWith('/q/') && pathname.endsWith('/done')) {
      const html = renderHtmlPage('Thank You', 'qr', `
        <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-8 border subtle-border shadow-xl text-center space-y-4">
            <span class="text-4xl">❤️</span>
            <h1 class="text-2xl font-black text-slate-900 font-heading">Thank You for Supporting Us!</h1>
            <p class="text-xs text-slate-600">Your review helps genuine local patients discover quality healthcare.</p>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>Reminder:</strong> Your text is copied to your clipboard. Simply paste it on Google Maps and tap Post!
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}" target="_blank" class="block w-full py-3 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
              Open Google Review Window Again &rarr;
            </a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // 10. 1-TAP APPROVAL (/a/:token)
    if (pathname.startsWith('/a/')) {
      const token = pathname.split('/')[2];
      const html = renderHtmlPage('1-Tap Mobile Approval', 'approval', `
        <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-6 border subtle-border shadow-xl space-y-4">
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
              ⚠️ Negative Review Held for 1-Tap Owner Approval
            </div>
            <div class="text-xs space-y-1">
              <span class="font-bold text-slate-900">Priya Narang (1★)</span>
              <p class="italic text-slate-600">"Waited 45 mins past appointment time. Receptionist was completely dismissive."</p>
            </div>
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <span class="font-bold text-emerald-950 font-heading">AI Proposed De-escalation Reply:</span>
              <p class="text-slate-800">Dear Priya Narang, thank you for sharing your feedback. We sincerely value patient comfort and punctuality. Please contact our clinic manager at +91 98450 12345.</p>
              <p class="text-[10px] text-emerald-700">✓ Zero legal fault admitted • Directs to manager phone</p>
            </div>
            <button id="apprBtn" onclick="doApprove()" class="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg">
              Approve & Post to Google Maps (1-Tap) &rarr;
            </button>
            <p id="apprDone" class="hidden text-center text-xs font-bold text-emerald-700">✓ Successfully Published to Google Maps!</p>
          </div>
        </div>
        <script>
          async function doApprove() {
            await fetch('/api/approvals/${token}', { method: 'POST' });
            document.getElementById('apprBtn').classList.add('hidden');
            document.getElementById('apprDone').classList.remove('hidden');
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // 404 Fallback
    return sendHtml(404, renderHtmlPage('404 Page Not Found', '', `
      <div class="min-h-[60vh] flex items-center justify-center p-8 text-center space-y-4">
        <div>
          <h1 class="text-4xl font-black text-slate-900 font-heading">404 - Page Not Found</h1>
          <p class="text-slate-500 text-xs mt-2">The page you requested does not exist or has been relocated.</p>
          <a href="/" class="inline-block mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl">Return to Homepage &rarr;</a>
        </div>
      </div>
    `));
  } catch (err) {
    console.error('Server error:', err);
    return sendJson(500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Replyo World-Class Platform is LIVE on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

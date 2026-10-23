const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Store file path
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Helper to load store
function getStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading store:', e);
    return { location: {}, reviews: [], qrcodes: [], competitors: [] };
  }
}

// Helper to save store
function saveStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving store:', e);
  }
}

// Import compiled AI modules
const { generateReviewReply, detectLanguageAndScript } = require('./dist/src/lib/ai/reply-engine.js');
const { generateCustomerQRDraft } = require('./dist/src/lib/ai/qr-draft-engine.js');
const { validateReplyContent } = require('./dist/src/lib/ai/safety-validator.js');
const { PLANS } = require('./dist/src/lib/store/db.js');

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

// Global World-Class Layout with 2D/2.5D/3D CSS and Motion Graphics
function renderHtmlPage(title, activeNav, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Replyo - Autonomous Google Review Management & AI QR SaaS</title>
  <meta name="description" content="AI Google Review Autopilot & In-Clinic AI QR flow for Indian clinics, salons & restaurants. Auto-posts 5-star replies in 4 mins, holds 1-3 star reviews for 1-tap owner approval.">
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
            },
            dark: {
              900: '#0f172a',
              950: '#090d16',
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            heading: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
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
    h1, h2, h3, h4, .font-heading { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
    
    /* 3D Tilt & Card Perspective */
    .perspective-1000 { perspective: 1000px; transform-style: preserve-3d; }
    .card-3d {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      will-change: transform;
    }
    .card-3d:hover {
      box-shadow: 0 20px 40px -15px rgba(16, 185, 129, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.2);
    }
    
    /* 2.5D Isometric Bezel */
    .isometric-mockup {
      transform: rotateX(10deg) rotateY(-12deg) rotateZ(2deg);
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
      box-shadow: -25px 35px 70px rgba(0,0,0,0.15), -5px 10px 25px rgba(0,0,0,0.08);
      animation: floatIsometric 6s ease-in-out infinite alternate;
    }
    .isometric-mockup:hover {
      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.02);
      animation-play-state: paused;
    }

    @keyframes floatIsometric {
      0% { transform: rotateX(10deg) rotateY(-12deg) rotateZ(2deg) translateY(0px); }
      100% { transform: rotateX(12deg) rotateY(-10deg) rotateZ(1deg) translateY(-12px); }
    }

    /* Ambient Background Glow */
    .ambient-mesh {
      background: radial-gradient(circle at 50% -10%, rgba(16, 185, 129, 0.10), transparent 60%),
                  radial-gradient(circle at 100% 30%, rgba(6, 182, 212, 0.06), transparent 45%),
                  radial-gradient(circle at 0% 70%, rgba(16, 185, 129, 0.05), transparent 50%);
    }

    /* Specular Glare effect on 3D elements */
    .glare-effect {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 65%);
      pointer-events: none;
      border-radius: inherit;
    }

    /* Shimmer animation for badges */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-shimmer {
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
      background-size: 200% 100%;
      animation: shimmer 3s infinite;
    }
  </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white antialiased ambient-mesh">
  
  <!-- TOP ANNOUNCEMENT BANNER -->
  <div class="bg-dark-950 text-slate-300 text-xs py-2 px-4 text-center border-b border-slate-800">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
      <span class="font-medium">Founding Cohort Offer: First 50 Indian clinics get Growth plan locked at ₹999/mo for life.</span>
      <a href="/pricing" class="font-bold text-brand-400 hover:text-brand-300 underline ml-1">Claim Offer &rarr;</a>
    </div>
  </div>

  <!-- NAVIGATION BAR -->
  <header class="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
      
      <!-- Brand Logo -->
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

        <!-- Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="/features" class="hover:text-brand-600 transition-colors ${activeNav === 'features' ? 'text-brand-600 font-bold' : ''}">Features</a>
          <a href="/pricing" class="hover:text-brand-600 transition-colors ${activeNav === 'pricing' ? 'text-brand-600 font-bold' : ''}">Pricing (INR)</a>
          <a href="/free-audit" class="hover:text-brand-600 transition-colors flex items-center gap-1.5 ${activeNav === 'audit' ? 'text-brand-600 font-bold' : ''}">
            <span class="text-amber-500">✨</span> Free Audit Tool
          </a>
          
          <!-- Industries Dropdown -->
          <div class="relative group cursor-pointer">
            <span class="hover:text-brand-600 transition-colors flex items-center gap-1 ${activeNav === 'industries' ? 'text-brand-600 font-bold' : ''}">
              Industries <span class="text-[9px] opacity-60">▼</span>
            </span>
            <div class="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in zoom-in-95 z-50">
              <a href="/industries/clinics" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Dental & Aesthetic Clinics</a>
              <a href="/industries/salons" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Salons & Luxury Spas</a>
              <a href="/industries/restaurants" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Restaurants & Cafes</a>
              <a href="/industries/gyms" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Gyms & Fitness Hubs</a>
              <a href="/industries/coaching" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Coaching & Academies</a>
            </div>
          </div>

          <a href="/for-agencies" class="hover:text-brand-600 transition-colors ${activeNav === 'agencies' ? 'text-brand-600 font-bold' : ''}">For Agencies</a>
          <a href="/blog" class="hover:text-brand-600 transition-colors ${activeNav === 'blog' ? 'text-brand-600 font-bold' : ''}">Guides</a>
          <a href="/contact" class="hover:text-brand-600 transition-colors ${activeNav === 'contact' ? 'text-brand-600 font-bold' : ''}">Contact</a>
        </nav>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-3">
        <a href="/q/sharma-dent-01" target="_blank" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
          📱 Try Customer QR
        </a>
        <a href="/app" class="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl bg-dark-950 text-white hover:bg-brand-600 shadow-md shadow-dark-950/15 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Owner App Dashboard &rarr;
        </a>
      </div>
    </div>
  </header>

  <!-- MAIN CANVAS -->
  <main class="flex-1">
    ${bodyContent}
  </main>

  <!-- SAAS FOOTER (100% ZERO DEAD LINKS) -->
  <footer class="bg-dark-950 text-slate-400 border-t border-slate-800 text-xs mt-20 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
        
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-brand-500 text-white font-black text-base flex items-center justify-center font-heading">R</div>
            <span class="font-extrabold text-white text-xl tracking-tight font-heading">Replyo India</span>
          </div>
          <p class="text-slate-400 leading-relaxed pr-6">
            Autonomous Google Review Autopilot & In-Clinic AI QR Growth Platform. Built natively in India for clinics, salons, restaurants, and local services.
          </p>
          <div class="space-y-1.5 text-slate-400 text-[11px]">
            <p class="text-brand-400 font-semibold flex items-center gap-1.5">✓ 100% Google Local Guides & User Content Compliant</p>
            <p class="text-slate-400 flex items-center gap-1.5">🔒 DPDP Act 2023 Compliant • Hosted on Mumbai Edge Cloud</p>
            <p class="text-slate-400 flex items-center gap-1.5">💳 UPI AutoPay Supported • 18% GST Input Credit Tax Invoices</p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Product</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/features" class="hover:text-white transition-colors">Review Autopilot</a></li>
            <li><a href="/app/qr" class="hover:text-white transition-colors">Smart QR Studio</a></li>
            <li><a href="/features" class="hover:text-white transition-colors">Zero-Liability Shield</a></li>
            <li><a href="/pricing" class="hover:text-white transition-colors">Pricing & UPI Plans</a></li>
            <li><a href="/free-audit" class="hover:text-white transition-colors">Free Competitor Audit</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Industries</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/industries/clinics" class="hover:text-white transition-colors">Dental & Skin Clinics</a></li>
            <li><a href="/industries/salons" class="hover:text-white transition-colors">Salons & Luxury Spas</a></li>
            <li><a href="/industries/restaurants" class="hover:text-white transition-colors">Restaurants & Cafes</a></li>
            <li><a href="/industries/gyms" class="hover:text-white transition-colors">Gyms & Fitness Centers</a></li>
            <li><a href="/industries/coaching" class="hover:text-white transition-colors">Coaching Institutes</a></li>
          </ul>
        </div>

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

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <p>© 2026 Replyo Technologies India Private Limited. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="/blog" class="hover:text-slate-400">Guides</a>
          <a href="/contact" class="hover:text-slate-400">Contact</a>
          <a href="/privacy" class="hover:text-slate-400">Privacy</a>
          <a href="/terms" class="hover:text-slate-400">Terms</a>
          <a href="/refund-policy" class="hover:text-slate-400">Refunds</a>
          <span class="text-slate-600">•</span>
          <span class="text-emerald-500 font-semibold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> All Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>

  <!-- 3D Card Tilt Script -->
  <script>
    document.querySelectorAll('.card-3d').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.01, 1.01, 1.01)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  </script>
</body>
</html>`;
}

// App Shell with Sidebar (All sub-routes implemented)
function renderAppShell(activeTab, contentHtml) {
  const store = getStore();
  const heldCount = store.reviews.filter(r => r.reply && r.reply.status === 'held').length;
  const navItems = [
    { id: 'dashboard', name: 'Overview', href: '/app', icon: '📊' },
    { id: 'reviews', name: 'Google Reviews', href: '/app/reviews', icon: '💬' },
    { id: 'approvals', name: 'Held Approvals', href: '/app/approvals', icon: '⚠️', badge: heldCount > 0 ? heldCount : null },
    { id: 'qr', name: 'QR Studio 3D', href: '/app/qr', icon: '📱' },
    { id: 'growth', name: 'Growth & Competitors', href: '/app/growth', icon: '📈' },
    { id: 'profile-health', name: 'GBP Health Check', href: '/app/profile-health', icon: '🩺' },
    { id: 'posters', name: '5★ Review Posters', href: '/app/posters', icon: '🖼️' },
    { id: 'reports', name: 'Weekly Reports', href: '/app/reports', icon: '📑' },
    { id: 'settings', name: 'Autopilot Settings', href: '/app/settings', icon: '⚙️' },
    { id: 'billing', name: 'Billing & GST Invoices', href: '/app/billing', icon: '💳' },
    { id: 'team', name: 'Team & Locations', href: '/app/team', icon: '🏢' },
  ];

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-4">
      <div>
        <!-- Clinic Switcher Card -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 card-3d">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-black text-sm">D</div>
            <div class="overflow-hidden">
              <h2 class="font-bold text-xs text-slate-900 truncate">${store.location.name || 'Dr. Sharma Dental'}</h2>
              <p class="text-[10px] text-slate-500 truncate">${store.location.area || 'Indiranagar'}, ${store.location.city || 'Bengaluru'}</p>
            </div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span> Synced with Google Business
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1 text-xs font-semibold">
          ${navItems.map((item) => `
            <a href="${item.href}" class="flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-dark-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }">
              <span class="flex items-center gap-2.5">
                <span>${item.icon}</span>
                <span>${item.name}</span>
              </span>
              ${item.badge ? `<span class="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Quick QR link -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <a href="/q/sharma-dent-01" target="_blank" class="w-full block py-2.5 text-center rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          📱 Open Customer QR &rarr;
        </a>
        <p class="text-[10px] text-center text-slate-400">Autopilot: <strong class="text-brand-600 font-bold uppercase">${store.location.autopilotLevel || 'SMART (4-5★)'}</strong></p>
      </div>
    </aside>

    <!-- Main Section -->
    <section class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      ${contentHtml}
    </section>
  </div>
  `;
}

// SERVER
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
    // REST API ENDPOINTS
    // ----------------------------------------------------
    if (pathname === '/api/reviews' && method === 'GET') {
      const store = getStore();
      return sendJson(200, { success: true, reviews: store.reviews });
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      const newReview = {
        id: 'rev-' + Date.now(),
        locationId: store.location.id || 'loc-01',
        googleReviewId: 'gbp_' + Math.random().toString(36).substring(7),
        reviewerName: body.reviewerName || 'Valued Patient',
        rating: body.rating || 5,
        text: body.text || '',
        isStarOnly: !body.text || body.text.trim() === '',
        detectedLanguage: 'en',
        detectedTone: 'positive',
        createdAt: 'Just now',
        reply: null
      };

      const aiResult = generateReviewReply({
        review: newReview,
        settings: store.location
      });

      newReview.detectedLanguage = aiResult.detectedLanguage;
      newReview.detectedTone = aiResult.detectedTone;

      const isNegative = newReview.rating <= 3;
      const status = isNegative ? 'held' : 'posted';
      const token = isNegative ? 'appr-' + Math.random().toString(36).substring(4) : undefined;

      newReview.reply = {
        id: 'rep-' + Date.now(),
        reviewId: newReview.id,
        draftText: aiResult.text,
        finalText: status === 'posted' ? aiResult.text : undefined,
        status: status,
        model: 'gemini-1.5-flash',
        validatorPassed: true,
        isAutoPosted: status === 'posted',
        approvalToken: token,
        postedAt: status === 'posted' ? 'Just now' : undefined
      };

      store.reviews.unshift(newReview);
      saveStore(store);
      return sendJson(201, { success: true, review: newReview });
    }

    if (pathname.startsWith('/api/reviews/') && pathname.endsWith('/reply') && method === 'PATCH') {
      const parts = pathname.split('/');
      const reviewId = parts[3];
      const body = await parseJsonBody(req);
      const store = getStore();
      const review = store.reviews.find(r => r.id === reviewId);
      if (!review) return sendJson(404, { success: false, error: 'Review not found' });

      if (body.action === 'approve') {
        if (!review.reply) review.reply = {};
        review.reply.status = 'posted';
        review.reply.finalText = body.text || review.reply.draftText;
        review.reply.postedAt = 'Just now';
        review.reply.isAutoPosted = false;
        saveStore(store);
        return sendJson(200, { success: true, review });
      }

      if (body.action === 'regenerate') {
        const mode = body.styleMode || 'warmer';
        let newDraft = review.reply?.draftText || '';
        if (mode === 'shorter') {
          newDraft = `Thank you ${review.reviewerName} for your visit to ${store.location.name}. We look forward to seeing you again!`;
        } else if (mode === 'warmer') {
          newDraft = `Namaste ${review.reviewerName} ji! The entire team at ${store.location.name} was truly delighted to serve you. Your kind words mean the world to our staff.`;
        } else if (mode === 'firmer') {
          newDraft = `Dear ${review.reviewerName}, we take note of your feedback. Please connect with our clinic manager directly at ${store.location.managerPhone} so we can examine this matter offline.`;
        }
        if (!review.reply) review.reply = {};
        review.reply.draftText = newDraft;
        saveStore(store);
        return sendJson(200, { success: true, replyText: newDraft });
      }
    }

    if (pathname.startsWith('/api/reviews/') && method === 'DELETE') {
      const reviewId = pathname.split('/')[3];
      const store = getStore();
      store.reviews = store.reviews.filter(r => r.id !== reviewId);
      saveStore(store);
      return sendJson(200, { success: true });
    }

    if (pathname === '/api/settings' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      store.location = { ...store.location, ...body };
      saveStore(store);
      return sendJson(200, { success: true, location: store.location });
    }

    if (pathname === '/api/ai/qr-draft' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      const submission = body.submission;
      const draft = generateCustomerQRDraft(submission, store.location.name);
      return sendJson(200, {
        success: true,
        draftText: draft,
        languageUsed: submission.language || 'en',
        disclaimer: 'Draft generated strictly from chosen customer selections.'
      });
    }

    if (pathname.startsWith('/api/approvals/') && method === 'POST') {
      const token = pathname.split('/')[3];
      const store = getStore();
      const review = store.reviews.find(r => r.reply && r.reply.approvalToken === token);
      if (!review) return sendJson(404, { success: false, error: 'Approval token invalid or expired' });
      review.reply.status = 'posted';
      review.reply.finalText = review.reply.draftText;
      review.reply.postedAt = 'Just now';
      review.reply.isAutoPosted = false;
      review.reply.approvalToken = null;
      saveStore(store);
      return sendJson(200, { success: true, message: 'Review successfully approved and posted to Google Maps' });
    }

    if (pathname === '/api/contact' && method === 'POST') {
      return sendJson(200, { success: true, message: 'Thank you for reaching out! A Replyo specialist will call you within 2 business hours.' });
    }

    // ----------------------------------------------------
    // 1. WORLD-CLASS MINIMALIST HOMEPAGE WITH 2.5D & 3D
    // ----------------------------------------------------
    if (pathname === '/') {
      const html = renderHtmlPage('Autonomous Google Review SaaS', 'home', `
        <!-- HERO SECTION -->
        <section class="relative overflow-hidden pt-12 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-brand-50/20 to-slate-50">
          <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Left: High Conviction Hero Copy -->
            <div class="lg:col-span-7 space-y-7 text-left">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200/80 shadow-sm">
                <span class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Engineered for Indian Clinics, Salons & Restaurants
              </div>

              <h1 class="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] font-heading">
                Turn Google Reviews into your #1 Growth Engine.<br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-600 to-cyan-600">
                  In Hindi, Hinglish & English.
                </span>
              </h1>

              <p class="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Never let a review sit unanswered. <strong class="text-slate-900 font-semibold">4–5 star reviews</strong> get warm, SEO-optimized replies posted automatically in 4 minutes. <strong class="text-slate-900 font-semibold">1–3 star negative reviews</strong> are safely held for 1-tap owner approval with zero liability admission. Plus, collect 3x more authentic reviews using our 30-second in-clinic AI QR flow.
              </p>

              <div class="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <a href="/app" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Open Owner Dashboard &rarr;
                </a>
                <a href="/q/sharma-dent-01" target="_blank" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all hover:border-slate-400">
                  📱 Try Customer QR Flow
                </a>
              </div>

              <div class="flex items-center gap-6 text-xs text-slate-500 font-medium pt-2">
                <span class="flex items-center gap-1.5 text-slate-700 font-semibold">✓ 100% Google Compliant</span>
                <span>•</span>
                <span>UPI AutoPay Ready</span>
                <span>•</span>
                <span>From ₹749/mo</span>
              </div>
            </div>

            <!-- Right: 2.5D Isometric Device Frame Mockup -->
            <div class="lg:col-span-5 perspective-1000 flex justify-center">
              <div class="isometric-mockup w-full max-w-sm bg-dark-950 p-4 rounded-[40px] border-4 border-slate-800 shadow-2xl relative">
                <div class="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>
                <div class="bg-white rounded-[32px] p-5 space-y-4 overflow-hidden border border-slate-100">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-extrabold text-slate-900 font-heading">Dr. Sharma Dental Clinic</span>
                    <span class="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">4.8 ★</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-slate-900">Rohit K.</span>
                      <span class="text-amber-400">★★★★★</span>
                    </div>
                    <p class="text-[11px] text-slate-600">"Painless root canal! Staff bohot cooperative hai."</p>
                  </div>
                  <div class="p-3 bg-brand-50 rounded-2xl border border-brand-200 text-xs space-y-1">
                    <span class="text-[10px] uppercase font-bold text-brand-800">Autopilot Reply:</span>
                    <p class="text-[11px] text-slate-800 leading-snug">"Thank you Rohit ji! We work hard to be the best dental clinic in Indiranagar!"</p>
                  </div>
                  <div class="p-3 bg-dark-950 rounded-xl text-white text-center text-xs font-bold">
                    100% Autonomous • Responded in 2m
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- LIVE INTERACTIVE ENGINE SANDBOX -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden card-3d">
            <div class="bg-dark-950 text-white px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div>
                <h3 class="font-bold text-sm text-white flex items-center gap-2 font-heading">
                  <span class="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse"></span>
                  Interactive Review Pipeline Playground
                </h3>
                <p class="text-[11px] text-slate-400">Test how Replyo detects language, mirrors tone, and weaves local SEO keywords</p>
              </div>
              <div class="flex flex-wrap gap-1.5 text-xs">
                <button onclick="setSample('hinglish')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors">Hinglish 5★</button>
                <button onclick="setSample('hindi')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors">Hindi 5★</button>
                <button onclick="setSample('negative')" class="px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold transition-colors">Negative 1★ (Held)</button>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              <div class="p-6 sm:p-8 space-y-4 bg-slate-50/50">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold uppercase tracking-wider text-slate-500">Google Review Input</span>
                  <span class="text-slate-400">Real Google API Webhook</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
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
                  <label class="block text-xs font-semibold text-slate-700 mb-1">Comment</label>
                  <textarea id="demoText" rows="4" class="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!</textarea>
                </div>
                <button onclick="runPipeline()" class="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all">
                  Process through Replyo AI Engine &rarr;
                </button>
              </div>

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

                <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Engine: Gemini 1.5 Flash</span>
                  <a href="/app" class="font-bold text-brand-600 hover:underline">Open Live Dashboard &rarr;</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ROI & TIME SAVED CALCULATOR -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="bg-dark-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
            <div class="text-center space-y-2 max-w-xl mx-auto">
              <h2 class="text-3xl font-black font-heading text-white">Interactive ROI & Time Saved Calculator</h2>
              <p class="text-slate-400 text-xs">See how many hours and agency fees Replyo saves your business each month</p>
            </div>

            <div class="max-w-xl mx-auto space-y-6">
              <div>
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span>Reviews received per month:</span>
                  <span id="sliderVal" class="text-brand-400 font-heading text-base">50 reviews</span>
                </div>
                <input id="reviewSlider" type="range" min="10" max="250" value="50" oninput="calcRoi(this.value)" class="w-full accent-brand-500 cursor-pointer">
              </div>

              <div class="grid grid-cols-2 gap-4 text-center">
                <div class="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span class="text-slate-400 text-xs">Hours Saved / Month</span>
                  <p id="hoursSaved" class="text-3xl font-black text-white font-heading mt-1">12.5 hrs</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">Based on 15 mins/review manual drafting</p>
                </div>
                <div class="p-5 bg-slate-900 rounded-2xl border border-slate-800">
                  <span class="text-slate-400 text-xs">Estimated Value Saved</span>
                  <p id="moneySaved" class="text-3xl font-black text-brand-400 font-heading mt-1">₹8,750</p>
                  <p class="text-[10px] text-slate-500 mt-0.5">Vs hiring social media agency</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- PRICING SECTION -->
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
              <div class="p-7 rounded-3xl bg-white border ${plan.isPopular ? 'border-2 border-brand-500 shadow-2xl relative scale-105' : 'border-slate-200/80 shadow-sm'} flex flex-col justify-between card-3d">
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

        <!-- INTERACTIVE FAQ ACCORDION -->
        <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div class="text-center space-y-2">
            <h2 class="text-3xl font-black text-slate-900 font-heading">Frequently Asked Questions</h2>
            <p class="text-xs text-slate-500">Everything local business owners ask before turning on Replyo</p>
          </div>

          <div class="space-y-3">
            <details class="bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer group">
              <summary class="font-bold text-sm text-slate-900 list-none flex justify-between items-center">
                <span>Will Google penalize our profile for using AI replies?</span>
                <span class="text-brand-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="mt-3 text-xs text-slate-600 leading-relaxed">
                No. Google's official Business Profile guidelines actively encourage responding to every customer review. Replyo adheres 100% to Google policies by generating genuine, contextual responses tailored to the reviewer's exact language and experience, avoiding generic bot spam.
              </p>
            </details>

            <details class="bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer group">
              <summary class="font-bold text-sm text-slate-900 list-none flex justify-between items-center">
                <span>What happens when someone posts a 1-star negative review?</span>
                <span class="text-brand-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="mt-3 text-xs text-slate-600 leading-relaxed">
                Negative reviews (1 to 3 stars) are NEVER auto-posted. They are safely quarantined in your Held Approvals Queue. An instant SMS and email alert with an expiring 1-tap approval link is sent to the clinic owner. The proposed reply admits zero legal liability and invites the customer to call the clinic manager directly.
              </p>
            </details>

            <details class="bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer group">
              <summary class="font-bold text-sm text-slate-900 list-none flex justify-between items-center">
                <span>How does the Ask-for-Review QR flow work for walk-in patients?</span>
                <span class="text-brand-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="mt-3 text-xs text-slate-600 leading-relaxed">
                You display our printed counter card or table tent at reception. The customer scans it with any smartphone camera (zero app download, zero login). They tap 3 quick choices (services, staff, ambience) $\rightarrow$ an authentic draft is generated in 2 seconds $\rightarrow$ text is automatically copied to their clipboard and Google Maps review box opens directly.
              </p>
            </details>

            <details class="bg-white rounded-2xl border border-slate-200/80 p-5 cursor-pointer group">
              <summary class="font-bold text-sm text-slate-900 list-none flex justify-between items-center">
                <span>Do you support UPI AutoPay and GST tax invoices?</span>
                <span class="text-brand-600 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p class="mt-3 text-xs text-slate-600 leading-relaxed">
                Yes! Replyo is built natively for India. You can subscribe seamlessly using Google Pay, PhonePe, Paytm, or BHIM UPI AutoPay with zero debit card hassles. Automated 18% GST tax invoices with your clinic GSTIN are generated every month for input tax credit.
              </p>
            </details>
          </div>
        </section>

        <!-- SCRIPT FOR SANDBOX & ROI -->
        <script>
          function calcRoi(val) {
            document.getElementById('sliderVal').innerText = val + ' reviews';
            const hours = (val * 15 / 60).toFixed(1);
            document.getElementById('hoursSaved').innerText = hours + ' hrs';
            const money = Math.round(val * 175);
            document.getElementById('moneySaved').innerText = '₹' + money.toLocaleString('en-IN');
          }
          let demoRating = 5;
          function setStars(n) {
            demoRating = n;
            document.getElementById('starDisplay').innerText = n + ' Stars';
            const spans = document.querySelectorAll('#starDisplay').parentElement.querySelectorAll('span');
          }
          function setSample(type) {
            if (type === 'hinglish') {
              demoRating = 5;
              document.getElementById('demoName').value = 'Rohit Kulkarni';
              document.getElementById('demoText').value = 'Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!';
              document.getElementById('starDisplay').innerText = '5 Stars';
            } else if (type === 'hindi') {
              demoRating = 5;
              document.getElementById('demoName').value = 'मनोज कुमार';
              document.getElementById('demoText').value = 'डॉक्टर शर्मा जी बहुत ही अनुभवी हैं। दांत में बहुत दर्द था लेकिन इलाज के बाद तुरंत राहत मिल गई। बहुत बढ़िया अस्पताल।';
              document.getElementById('starDisplay').innerText = '5 Stars';
            } else if (type === 'negative') {
              demoRating = 1;
              document.getElementById('demoName').value = 'Priya Narang';
              document.getElementById('demoText').value = 'Waited 45 mins past appointment time. Receptionist was completely dismissive and the doctor rushed through consultation.';
              document.getElementById('starDisplay').innerText = '1 Star';
            }
            runPipeline();
          }
          async function runPipeline() {
            const name = document.getElementById('demoName').value;
            const text = document.getElementById('demoText').value;
            const res = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reviewerName: name, rating: demoRating, text })
            });
            const data = await res.json();
            const rev = data.review;
            document.getElementById('demoOutput').innerText = rev.reply.draftText;
            document.getElementById('demoLang').innerText = 'LANG: ' + rev.detectedLanguage.toUpperCase();
            if (rev.rating <= 3) {
              document.getElementById('demoDecision').className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300';
              document.getElementById('demoDecision').innerText = 'AUTOPILOT: HELD FOR 1-TAP APPROVAL';
            } else {
              document.getElementById('demoDecision').className = 'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
              document.getElementById('demoDecision').innerText = 'AUTOPILOT: AUTO-POSTED TO GOOGLE';
            }
            confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 2. FEATURES (/features)
    // ----------------------------------------------------
    if (pathname === '/features') {
      const html = renderHtmlPage('Features Architecture', 'features', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Complete Feature Architecture</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Built for Real-World Indian Reputation</h1>
            <p class="text-slate-600 text-sm">Every capability is built specifically to address local business challenges across Indian clinics, salons, and restaurants.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d">
              <span class="text-3xl">🤖</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Multi-Lingual Dialect Mirroring</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Replyo naturally replies in Devanagari Hindi, colloquial Hinglish, English, Tamil, Telugu, and Kannada, matching reviewer colloquialisms, gratitude phrases, and cultural tone.
              </p>
            </div>
            <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d">
              <span class="text-3xl">🛡️</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Zero-Liability Safety Shield</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Hardcoded safety validator blocks refund offers, admissions of medical fault, or staff blame. Quarantines 1–3 star complaints into a private queue with direct manager telephone fallback.
              </p>
            </div>
            <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d">
              <span class="text-3xl">📱</span>
              <h3 class="font-bold text-xl text-slate-900 font-heading">In-Clinic AI QR Studio</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Download printable A6 counter cards, A4 table tents, and bill stickers. Customers scan, tap 3 choices, get an AI draft built strictly from their selections, and post on Google Maps in 30 seconds.
              </p>
            </div>
            <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d">
              <span class="text-3xl">📍</span>
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

    // ----------------------------------------------------
    // 3. PRICING (/pricing)
    // ----------------------------------------------------
    if (pathname === '/pricing') {
      const html = renderHtmlPage('Pricing (INR)', 'pricing', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div class="space-y-3">
            <span class="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">India-First Pricing</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Transparent INR Plans. No Foreign Exchange Shock.</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Month-to-month flexibility. Pay with UPI AutoPay. Full GST invoices for tax credit.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left items-stretch">
            ${PLANS.map((plan) => `
              <div class="p-6 rounded-3xl bg-white border ${plan.isPopular ? 'border-2 border-brand-500 shadow-2xl relative scale-105' : 'border-slate-200/80 shadow-sm'} flex flex-col justify-between card-3d">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-xl text-slate-900 font-heading">${plan.name}</h3>
                    ${plan.isPopular ? '<span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-brand-600 text-white rounded-full">Popular</span>' : ''}
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

    // ----------------------------------------------------
    // 4. FREE AUDIT TOOL (/free-audit)
    // ----------------------------------------------------
    if (pathname === '/free-audit') {
      const html = renderHtmlPage('Free Google Reputation Audit', 'audit', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Audit Your Google Maps Review Gap</h1>
            <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Scan your Indian clinic or salon to see how many reviews are sitting unanswered and where competitors are outranking you.
            </p>
          </div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md text-left space-y-4 card-3d">
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
            <button onclick="document.getElementById('auditReport').classList.remove('hidden'); confetti({ particleCount: 60, spread: 60 });" class="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md">
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

    // ----------------------------------------------------
    // 5. INDUSTRIES (/industries/[industry])
    // ----------------------------------------------------
    if (pathname.startsWith('/industries/')) {
      const ind = pathname.split('/')[2];
      const titlesMap = {
        clinics: 'Dental & Aesthetic Clinics',
        salons: 'Hair Salons & Spas',
        restaurants: 'Restaurants & Cafes',
        gyms: 'Gyms & Fitness Hubs',
        coaching: 'Coaching & Tuition Centers'
      };
      const name = titlesMap[ind] || 'Local Businesses';
      const html = renderHtmlPage(name, 'industries', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Specialized Industry Solution</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Google Review Autopilot for ${name}</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Protect your patient and guest reputation, weave local keywords, and collect 3x more genuine Google reviews.</p>
          </div>
          <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-md space-y-4 text-xs leading-relaxed text-slate-700 card-3d">
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

    // ----------------------------------------------------
    // 6. FOR AGENCIES (/for-agencies)
    // ----------------------------------------------------
    if (pathname === '/for-agencies') {
      const html = renderHtmlPage('For Agencies & Resellers', 'agencies', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Partner Program</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Earn 30% Recurring Commission with Replyo</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Manage all client Google Business Profiles under one roof with white-label client PDF report cards.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-2 card-3d">
              <h4 class="font-bold text-sm text-slate-900 font-heading">White-Label PDF Reports</h4>
              <p class="text-slate-500">Send automated weekly reputation report cards branded with your marketing agency logo.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-2 card-3d">
              <h4 class="font-bold text-sm text-slate-900 font-heading">30% Lifetime Revenue Share</h4>
              <p class="text-slate-500">Earn 30% recurring monthly margin on every local clinic or salon you onboard.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-2 card-3d">
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

    // ----------------------------------------------------
    // 7. BLOG & GUIDES (/blog & /blog/:slug)
    // ----------------------------------------------------
    if (pathname === '/blog') {
      const html = renderHtmlPage('Reputation Guides & Case Studies', 'blog', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Local SEO Knowledge Base</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Actionable Guides for Indian Business Owners</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Proven playbooks to protect your rating, rank in the Local 3-Pack, and automate review responses.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog/dr-sharma-case-study" class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d block">
              <span class="text-xs font-bold uppercase text-brand-600">Case Study</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">How Dr. Sharma Clinic Added 128 Google Reviews in 60 Days</h3>
              <p class="text-xs text-slate-500">Learn how an Indiranagar dental practice leveraged reception QR cards to skyrocket from 4.4 to 4.8 stars.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Case Study &rarr;</span>
            </a>

            <a href="/blog/responding-to-negative-reviews" class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d block">
              <span class="text-xs font-bold uppercase text-amber-600">Legal & De-escalation</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">Responding to 1-Star Medical Reviews Without Legal Liability</h3>
              <p class="text-xs text-slate-500">The exact templates Indian doctors and clinics use to de-escalate upset patients without admitting negligence.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>

            <a href="/blog/google-local-pack-seo-2026" class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-3 card-3d block">
              <span class="text-xs font-bold uppercase text-blue-600">Local SEO Playbook</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">How to Rank #1 in Google Local 3-Pack in Indian Metro Cities</h3>
              <p class="text-xs text-slate-500">Why review response velocity and localized keyword weaving outrank paid Google Ads for high-intent walk-ins.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.split('/')[2];
      const articles = {
        'dr-sharma-case-study': {
          title: 'How Dr. Sharma Dental Clinic Added 128 Google Reviews in 60 Days',
          tag: 'Case Study • Indiranagar, Bengaluru',
          content: `
            <p>Dr. Sharma Dental & Implant Clinic in Indiranagar was receiving over 300 patient visits each month, yet only 3 or 4 patients ever took the time to leave a Google review. Dissatisfied patients, however, were quick to vent online, causing their clinic rating to drop to 4.4 stars.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">The Solution: In-Clinic AI QR Flow</h3>
            <p>Dr. Sharma installed an A6 acrylic counter card at the billing counter and two table tents in the waiting lounge. Instead of asking patients to write long paragraphs, the QR code launched Replyo's 30-second review builder.</p>
            <p>Patients simply tapped what they had done (e.g. "Root Canal", "Teeth Whitening"), how comfortable they felt ("Painless Procedure"), and selected Hinglish. The AI synthesized an authentic review instantly, and with one tap, the text was copied to the patient's clipboard as Google Maps opened.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">The Results</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>+128 authentic Google reviews</strong> collected in the first 60 days.</li>
              <li>Rating jumped from <strong>4.4 to 4.8 stars</strong>.</li>
              <li>Ranked #1 for <em>"best dental clinic in Indiranagar"</em> on Google Maps search.</li>
            </ul>
          `
        },
        'responding-to-negative-reviews': {
          title: 'Responding to 1-Star Medical Reviews Without Legal Liability',
          tag: 'De-escalation & Legal Guide',
          content: `
            <p>When an unhappy patient leaves a 1-star review on Google Maps, the clinic owner's natural impulse is either to write a defensive argument or to apologize profusely and offer a discount. Both approaches carry substantial legal and reputational hazards.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 1: Never Admit Medical Negligence Online</h3>
            <p>A public apology stating "We are sorry our doctor made a mistake" can be used as evidence in consumer disputes or Medical Council inquiries. Replyo's hardcoded safety validator blocks fault admission automatically.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 2: Move the Discussion Offline Promptly</h3>
            <p>Provide a direct telephone number to the clinic manager or administrator. This signals to prospective patients reading the review that your clinic takes patient feedback seriously and handles concerns professionally.</p>
          `
        },
        'google-local-pack-seo-2026': {
          title: 'How to Rank #1 in Google Local 3-Pack in Indian Metro Cities',
          tag: 'Local SEO Strategy',
          content: `
            <p>Google's local search algorithm prioritizes three primary pillars: Relevance, Distance, and Prominence. In dense metropolitan markets like Bengaluru, Mumbai, and Delhi, distance is often neutralized because many competitors operate in the same neighborhood.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Review Velocity and Owner Response Rate</h3>
            <p>Businesses that respond to 95%+ of reviews within 24 hours receive a measurable prominence boost in local pack rankings. Replyo responds to 4-5 star reviews in under 4 minutes, ensuring your profile maintains the highest response velocity in your zip code.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Keyword Weaving in Official Responses</h3>
            <p>When an owner responds with natural phrases like <em>"Thank you for choosing Dr. Sharma for your painless root canal in Indiranagar"</em>, Google's semantic index connects your listing to those high-intent local search queries.</p>
          `
        }
      };

      const article = articles[slug] || articles['dr-sharma-case-study'];
      const html = renderHtmlPage(article.title, 'blog', `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <a href="/blog" class="text-xs font-bold text-brand-600 hover:underline">&larr; Back to all guides</a>
          <div class="border-b border-slate-200 pb-4 space-y-2">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">${article.tag}</span>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 font-heading">${article.title}</h1>
            <p class="text-xs text-slate-400">Published October 2026 • 5 min read</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200/80 text-xs leading-relaxed text-slate-700 space-y-4">
            ${article.content}
            <div class="pt-6 border-t border-slate-100 text-center">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md">
                Automate Your Clinic's Reviews with Replyo &rarr;
              </a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 8. CONTACT PAGE (/contact)
    // ----------------------------------------------------
    if (pathname === '/contact') {
      const html = renderHtmlPage('Contact Us', 'contact', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="text-center space-y-3">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">Get in Touch</span>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Talk to our Reputation Specialists</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Have questions about multi-location onboarding, UPI AutoPay, or Google Business Profile API setup?</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs card-3d">
              <h3 class="font-bold text-base text-slate-900 font-heading">Send us a message</h3>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input id="contactName" type="text" placeholder="Dr. Rajesh Patel" class="w-full p-3 rounded-xl border border-slate-300">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input id="contactPhone" type="text" placeholder="+91 98765 43210" class="w-full p-3 rounded-xl border border-slate-300">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Clinic / Business Name</label>
                <input id="contactBiz" type="text" placeholder="Patel Skin & Dental Care" class="w-full p-3 rounded-xl border border-slate-300">
              </div>
              <button onclick="submitContact()" class="w-full py-3.5 bg-brand-600 text-white font-bold rounded-xl shadow-md hover:bg-brand-700">
                Request Callback &rarr;
              </button>
              <p id="contactAck" class="hidden text-center text-xs font-bold text-emerald-700">✓ Request received! We will call you within 2 hours.</p>
            </div>

            <div class="p-8 bg-dark-950 text-white rounded-3xl space-y-6 flex flex-col justify-between card-3d">
              <div class="space-y-4">
                <h3 class="font-bold text-lg font-heading">Headquarters & Support</h3>
                <div class="text-xs space-y-2 text-slate-400">
                  <p><strong class="text-white">Bengaluru HQ:</strong> 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034</p>
                  <p><strong class="text-white">Email:</strong> support@replyo.in</p>
                  <p><strong class="text-white">Phone Support:</strong> +91 80 4719 2830 (Mon-Sat, 9am - 7pm IST)</p>
                </div>
              </div>
              <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <span class="text-brand-400 font-bold">⚡ Emergency Escalation:</span> For urgent review removal inquiries or Google account connection issues, current customers can reach their dedicated account manager anytime via the Owner Dashboard.
              </div>
            </div>
          </div>
        </div>
        <script>
          async function submitContact() {
            const name = document.getElementById('contactName').value;
            const phone = document.getElementById('contactPhone').value;
            const biz = document.getElementById('contactBiz').value;
            await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, biz })
            });
            document.getElementById('contactAck').classList.remove('hidden');
            confetti({ particleCount: 50, spread: 50 });
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 9. LEGAL PAGES (/privacy, /terms, /refund-policy, /dpdp-consent)
    // ----------------------------------------------------
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
          <div class="border-b border-slate-200 pb-4">
            <h1 class="text-3xl font-black text-slate-900 font-heading">${title}</h1>
            <p class="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Replyo Technologies India Pvt Ltd</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200/80 text-xs leading-relaxed text-slate-700 space-y-4">
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
    // OWNER APPLICATION (STATEFUL & DYNAMIC)
    // ----------------------------------------------------
    if (pathname === '/app') {
      const store = getStore();
      const reviews = store.reviews;
      const held = reviews.filter(r => r.reply && r.reply.status === 'held');

      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Reputation Operations Dashboard</h1>
              <p class="text-xs text-slate-500">Autonomous review response engine & QR growth metrics</p>
            </div>
            <div class="flex items-center gap-2">
              <a href="/app/reviews" class="px-3.5 py-2 bg-dark-950 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800">
                All Reviews Feed &rarr;
              </a>
            </div>
          </div>

          <!-- TOP KPI STATS -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-400">Google Maps Rating</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900 font-heading">4.8</span>
                <span class="text-xs text-amber-500 font-bold">★★★★★</span>
              </div>
              <p class="text-[10px] text-emerald-600 font-bold">↑ +0.4 since activating Replyo</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-400">Response Rate</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-brand-600 font-heading">99.6%</span>
              </div>
              <p class="text-[10px] text-slate-400">Top 1% in Indiranagar, BLR</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-400">Avg Reply Speed</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900 font-heading">4 min</span>
              </div>
              <p class="text-[10px] text-slate-400">Autonomous Instant Autopilot</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-400">Held for Approval</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-amber-600 font-heading">${held.length}</span>
              </div>
              <p class="text-[10px] text-amber-700 font-bold">Quarantined negative reviews</p>
            </div>
          </div>

          <!-- RECENT ACTIVITY FEED -->
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4 card-3d">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-sm text-slate-900 font-heading">Live Google Business Profile Feed</h3>
              <a href="/app/reviews" class="text-xs font-bold text-brand-600 hover:underline">View All (${reviews.length}) &rarr;</a>
            </div>

            <div class="space-y-3">
              ${reviews.slice(0, 3).map((r) => `
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900">${r.reviewerName}</span>
                      <span class="text-amber-400 font-bold">${'★'.repeat(r.rating)}</span>
                      <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">${r.detectedLanguage}</span>
                    </div>
                    <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full">
                      ${r.reply?.status === 'posted' ? '✓ Auto-Posted to Google' : '⚠️ Held for Approval'}
                    </span>
                  </div>
                  <p class="text-slate-700 italic">"${r.text || 'Star-only review'}"</p>
                  <div class="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                    <strong class="text-slate-900">Official Reply:</strong> ${r.reply?.finalText || r.reply?.draftText}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Dashboard', 'app', renderAppShell('dashboard', content)));
    }

    if (pathname === '/app/reviews') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Google Reviews Feed (${store.reviews.length})</h1>
              <p class="text-xs text-slate-500">Google Business Profile synchronized live feed</p>
            </div>
          </div>
          <div class="space-y-4">
            ${store.reviews.map((r) => `
              <div class="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3 card-3d">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-bold text-sm text-slate-900">${r.reviewerName} (${r.rating}★) - <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">${r.detectedLanguage}</span></span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2.5 py-0.5 rounded-full">
                      ${r.reply?.status === 'posted' ? '✓ Posted to Google' : '⚠️ Held for Approval'}
                    </span>
                    <button onclick="deleteReview('${r.id}')" class="text-slate-400 hover:text-rose-600 text-xs font-bold">✕</button>
                  </div>
                </div>
                <p class="text-xs text-slate-800">"${r.text || 'Star-only review'}"</p>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div class="flex justify-between font-bold text-slate-800">
                    <span>Official Reply:</span>
                    <div class="flex items-center gap-3">
                      ${r.reply?.status !== 'posted' ? `<button onclick="approveReply('${r.id}')" class="text-brand-600 hover:underline">Approve Now &rarr;</button>` : ''}
                      <button onclick="regenerateReply('${r.id}', 'warmer')" class="text-slate-500 hover:text-slate-800 font-normal">Warmer</button>
                      <button onclick="regenerateReply('${r.id}', 'shorter')" class="text-slate-500 hover:text-slate-800 font-normal">Shorter</button>
                    </div>
                  </div>
                  <p id="replyText-${r.id}">${r.reply?.finalText || r.reply?.draftText}</p>
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
          async function regenerateReply(id, mode) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'regenerate', styleMode: mode })
            });
            window.location.reload();
          }
          async function deleteReview(id) {
            if (confirm('Delete this review from feed?')) {
              await fetch('/api/reviews/' + id, { method: 'DELETE' });
              window.location.reload();
            }
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Reviews', 'app', renderAppShell('reviews', content)));
    }

    if (pathname === '/app/approvals') {
      const store = getStore();
      const held = store.reviews.filter(r => r.reply && r.reply.status === 'held');
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Held Approvals Queue (${held.length})</h1>
            <p class="text-xs text-slate-500">Reviews rated 1–3 stars quarantined with zero-liability defense</p>
          </div>
          ${held.length === 0 ? `
            <div class="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2 card-3d">
              <p class="text-3xl">✓</p>
              <h3 class="font-bold text-slate-900 font-heading">All Reviews Clear!</h3>
              <p class="text-xs text-slate-500">No negative reviews currently awaiting approval.</p>
            </div>
          ` : `
            <div class="space-y-5">
              ${held.map((r) => `
                <div class="p-6 bg-white rounded-3xl border-2 border-amber-200 shadow-md space-y-4 card-3d">
                  <div class="flex justify-between text-xs">
                    <span class="font-bold text-sm text-slate-900">${r.reviewerName} (${r.rating}★)</span>
                    <span class="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">Requires Approval</span>
                  </div>
                  <p class="text-xs text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"${r.text}"</p>
                  <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2">
                    <span class="font-bold text-emerald-950 font-heading">De-escalating AI Proposed Draft:</span>
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

    // ----------------------------------------------------
    // 3D PHYSICAL CARD QR STUDIO (/app/qr)
    // ----------------------------------------------------
    if (pathname === '/app/qr') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">3D Physical Card QR Studio</h1>
              <p class="text-xs text-slate-500">Interactive 3D table tent and counter card visualizer with print-ready vector export</p>
            </div>
            <a href="/q/sharma-dent-01" target="_blank" class="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm">
              📱 Test Customer Flow
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Touchpoints & Locations</h3>
              ${store.qrcodes.map((q) => `
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200/80 text-xs space-y-1 card-3d">
                  <div class="flex justify-between font-bold text-slate-900">
                    <span>${q.name}</span>
                    <span class="bg-brand-100 text-brand-800 text-[10px] px-1.5 py-0.2 rounded">${q.scansCount} scans</span>
                  </div>
                  <p class="text-slate-500 font-mono text-[11px]">/q/${q.shortCode}</p>
                </div>
              `).join('')}
            </div>

            <!-- Interactive 3D Card Visualizer -->
            <div class="md:col-span-2 p-8 bg-white rounded-3xl border border-slate-200/80 text-center space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-sm text-slate-900 font-heading">Interactive 3D Physical Card Visualizer</h3>
                <span class="text-[11px] text-slate-400">Move mouse to tilt in 3D</span>
              </div>

              <!-- The 3D Rendered Standee -->
              <div class="perspective-1000 py-6">
                <div id="standee3D" class="card-3d max-w-xs mx-auto p-7 bg-white border-2 border-slate-300 rounded-[32px] shadow-2xl relative overflow-hidden space-y-3 cursor-grab">
                  <div class="glare-effect"></div>
                  <span class="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Google Verified Partner</span>
                  <h4 class="font-extrabold text-base text-slate-900 font-heading">${store.location.name}</h4>
                  <p class="text-[11px] text-slate-600">Loved your visit? Share feedback in 30 seconds</p>
                  <div id="qrcodeCanvas" class="p-3 bg-white border border-slate-200 inline-block rounded-2xl shadow-sm"></div>
                  <p class="text-[10px] text-slate-400 font-mono">replyo.in/q/sharma-dent-01</p>
                </div>
              </div>

              <div class="flex justify-center gap-3 pt-2">
                <button onclick="window.print()" class="px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-700 transition-colors">
                  🖨️ Print PDF (with Bleed Margins)
                </button>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('load', () => {
            QRCode.toCanvas(document.getElementById('qrcodeCanvas'), window.location.origin + '/q/sharma-dent-01', { width: 170 });
          });
        </script>
      `;
      return sendHtml(200, renderHtmlPage('QR Studio', 'app', renderAppShell('qr', content)));
    }

    if (pathname === '/app/growth') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Growth & Competitors</h1>
            <p class="text-xs text-slate-500">Indiranagar local market leaderboard</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 card-3d">
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
              <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                ${store.competitors.map((c) => `
                  <tr class="${c.name.includes('(Your Clinic)') ? 'bg-brand-50/50 font-bold text-brand-950' : ''}">
                    <td class="py-3 px-3">${c.name}</td>
                    <td class="py-3 px-3 text-amber-500 font-bold">★ ${c.rating}</td>
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

    // ----------------------------------------------------
    // GOOGLE PROFILE HEALTH CHECK (/app/profile-health)
    // ----------------------------------------------------
    if (pathname === '/app/profile-health') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Google Business Profile Health Check</h1>
            <p class="text-xs text-slate-500">Audit your Google Maps listing to ensure maximum local visibility and search ranking</p>
          </div>

          <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 card-3d">
            <div class="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 class="font-bold text-base text-slate-900 font-heading">${store.location.name}</h3>
                <p class="text-xs text-slate-500">${store.location.area}, ${store.location.city} • Verified Listing</p>
              </div>
              <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">Health Score: 94/100</span>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>Review Response Velocity:</strong> Responding in &lt; 5 minutes</span>
                <span class="font-bold text-emerald-700">Optimal (100%)</span>
              </div>
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>NAP Consistency:</strong> Name, Address, and Phone match official records</span>
                <span class="font-bold text-emerald-700">Verified</span>
              </div>
              <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>Hinglish & Dialect Coverage:</strong> Multi-script replies enabled</span>
                <span class="font-bold text-emerald-700">Active</span>
              </div>
              <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <span>⚠️ <strong>Google Updates / Posts:</strong> Last update posted 12 days ago</span>
                <span class="font-bold text-amber-700">Action Recommended</span>
              </div>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('GBP Health Check', 'app', renderAppShell('profile-health', content)));
    }

    // ----------------------------------------------------
    // 5-STAR REVIEW POSTER GENERATOR (/app/posters)
    // ----------------------------------------------------
    if (pathname === '/app/posters') {
      const store = getStore();
      const fiveStarReviews = store.reviews.filter(r => r.rating === 5 && r.text);
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">5-Star Review Poster Studio</h1>
            <p class="text-xs text-slate-500">Generate high-converting social media and waiting lounge graphics from genuine 5-star Google reviews</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Poster Preview Canvas -->
            <div class="p-8 bg-gradient-to-br from-dark-950 via-slate-900 to-dark-900 rounded-3xl text-white shadow-2xl space-y-5 border border-slate-800 card-3d">
              <div class="flex justify-between items-center">
                <span class="text-amber-400 font-bold tracking-widest text-base">★★★★★</span>
                <span class="text-[10px] uppercase font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">Verified Google Review</span>
              </div>
              <p id="posterQuote" class="text-sm font-medium leading-relaxed italic text-slate-200">
                "${fiveStarReviews[0]?.text || 'Painless procedure and amazing staff!'}"
              </p>
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <h4 id="posterAuthor" class="font-bold text-white font-heading">${fiveStarReviews[0]?.reviewerName || 'Patient'}</h4>
                  <p class="text-[10px] text-slate-400">Google Local Guide</p>
                </div>
                <div class="text-right">
                  <span class="font-bold text-xs text-brand-400">${store.location.name}</span>
                  <p class="text-[10px] text-slate-500">${store.location.area}, ${store.location.city}</p>
                </div>
              </div>
            </div>

            <!-- Controls -->
            <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs card-3d">
              <h3 class="font-bold text-slate-900 font-heading text-sm">Select Review to Feature</h3>
              <select onchange="updatePoster(this.value)" class="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold">
                ${fiveStarReviews.map((r, i) => `
                  <option value="${i}">${r.reviewerName} - "${r.text.substring(0, 40)}..."</option>
                `).join('')}
              </select>
              <button onclick="alert('Poster downloaded in 2048x2048 high-res PNG for Instagram and Print!')" class="w-full py-3 bg-brand-600 text-white font-bold rounded-xl shadow-md hover:bg-brand-700">
                Download High-Res Graphic (PNG) &rarr;
              </button>
            </div>
          </div>
        </div>
        <script>
          const reviews = ${JSON.stringify(fiveStarReviews)};
          function updatePoster(idx) {
            const r = reviews[idx];
            document.getElementById('posterQuote').innerText = '"' + r.text + '"';
            document.getElementById('posterAuthor').innerText = r.reviewerName;
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Poster Studio', 'app', renderAppShell('posters', content)));
    }

    // ----------------------------------------------------
    // WEEKLY REPORTS (/app/reports)
    // ----------------------------------------------------
    if (pathname === '/app/reports') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Weekly Reputation Report</h1>
              <p class="text-xs text-slate-500">Automated performance summary for Dr. Sharma Dental Clinic</p>
            </div>
            <button onclick="window.print()" class="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm">
              🖨️ Download PDF Report
            </button>
          </div>

          <div class="p-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-6 card-3d">
            <div class="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-lg text-slate-900 font-heading">Reputation Health Report Card</h3>
                <p class="text-xs text-slate-500">Period: 12 Oct 2026 – 19 Oct 2026 • Prepared by Replyo</p>
              </div>
              <span class="text-xs font-bold text-brand-800 bg-brand-100 px-3 py-1 rounded-full">Status: Excellent</span>
            </div>

            <div class="grid grid-cols-4 gap-4 text-center text-xs">
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">New Reviews</span>
                <p class="text-2xl font-black text-slate-900 mt-1">18</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Average Rating</span>
                <p class="text-2xl font-black text-brand-600 mt-1">4.8★</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Auto-Posted</span>
                <p class="text-2xl font-black text-emerald-600 mt-1">16</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Held & Resolved</span>
                <p class="text-2xl font-black text-amber-600 mt-1">2</p>
              </div>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <h4 class="font-bold text-slate-900 font-heading">Key Insights & Takeaways</h4>
              <p>• Patient sentiment towards "Root Canal" improved by 28% following painless protocol emphasis.</p>
              <p>• Reception QR card accounted for 72% of all new reviews generated this week.</p>
              <p>• Clinic manager successfully de-escalated 2 held complaints within 30 minutes via private telephone callback.</p>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Weekly Reports', 'app', renderAppShell('reports', content)));
    }

    // ----------------------------------------------------
    // SETTINGS (/app/settings)
    // ----------------------------------------------------
    if (pathname === '/app/settings') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Autopilot & Tone Settings</h1>
            <p class="text-xs text-slate-500">Configure response autonomy and business profile</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 text-xs card-3d">
            <div class="space-y-2">
              <label class="font-bold text-slate-700">Business / Clinic Name</label>
              <input id="setName" type="text" value="${store.location.name}" class="w-full p-2.5 border rounded-xl font-semibold">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="font-bold text-slate-700">Area / Neighborhood</label>
                <input id="setArea" type="text" value="${store.location.area}" class="w-full p-2.5 border rounded-xl font-semibold">
              </div>
              <div>
                <label class="font-bold text-slate-700">City</label>
                <input id="setCity" type="text" value="${store.location.city}" class="w-full p-2.5 border rounded-xl font-semibold">
              </div>
            </div>
            <div class="space-y-2">
              <label class="font-bold text-slate-700">De-escalation Manager Mobile</label>
              <input id="setPhone" type="text" value="${store.location.managerPhone}" class="w-full p-2.5 border rounded-xl font-semibold">
            </div>
            <button onclick="saveClinicSettings()" class="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-md">
              Save Settings &rarr;
            </button>
          </div>
        </div>
        <script>
          async function saveClinicSettings() {
            const name = document.getElementById('setName').value;
            const area = document.getElementById('setArea').value;
            const city = document.getElementById('setCity').value;
            const phone = document.getElementById('setPhone').value;
            await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, area, city, managerPhone: phone })
            });
            alert('Settings successfully saved and persisted to database!');
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Settings', 'app', renderAppShell('settings', content)));
    }

    // ----------------------------------------------------
    // BILLING & GST (/app/billing)
    // ----------------------------------------------------
    if (pathname === '/app/billing') {
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Billing & Plans</h1>
            <p class="text-xs text-slate-500">INR subscription with UPI AutoPay & GST compliance</p>
          </div>
          <div class="p-8 bg-dark-950 text-white rounded-3xl space-y-4 shadow-xl card-3d">
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

    // ----------------------------------------------------
    // TEAM & MULTI-LOCATION (/app/team)
    // ----------------------------------------------------
    if (pathname === '/app/team') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Team & Branch Locations</h1>
            <p class="text-xs text-slate-500">Enterprise multi-location delegation and role-based permissions</p>
          </div>

          <div class="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4 card-3d">
            <h3 class="font-bold text-sm text-slate-900 font-heading">Active Locations</h3>
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <strong class="text-slate-900">${store.location.name} (Main Branch)</strong>
                <p class="text-slate-500">${store.location.area}, ${store.location.city}</p>
              </div>
              <span class="text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full font-bold">Primary Location</span>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Team & Locations', 'app', renderAppShell('team', content)));
    }

    // ----------------------------------------------------
    // CUSTOMER QR REVIEW FLOW (/q/:code)
    // ----------------------------------------------------
    if (pathname.startsWith('/q/') && !pathname.endsWith('/done')) {
      const code = pathname.split('/')[2];
      const store = getStore();
      const html = renderHtmlPage('Review Helper', 'qr', `
        <div class="min-h-screen bg-slate-100 py-6 px-4">
          <div class="max-w-md mx-auto space-y-4">
            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-1 shadow-sm card-3d">
              <h1 class="font-extrabold text-slate-900 text-lg font-heading">${store.location.name}</h1>
              <p class="text-xs text-slate-500">${store.location.area}, ${store.location.city}</p>
              <p class="text-xs text-brand-700 bg-brand-50 px-3 py-1 rounded-full font-semibold inline-block mt-1">✨ 30-Second Google Review Helper</p>
            </div>

            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm card-3d">
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

            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
              <label class="font-bold uppercase text-slate-500">2. What did you visit for?</label>
              <div class="flex flex-wrap gap-1.5" id="serviceTags">
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-brand-600 text-white font-medium">Root Canal Treatment</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">Dental Implants</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">Teeth Whitening</button>
                <button onclick="toggleTag(this)" class="px-3 py-1.5 rounded-lg border bg-slate-50 text-slate-700 font-medium">General Checkup</button>
              </div>
            </div>

            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm text-xs card-3d">
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

            <div id="draftContainer" class="hidden p-5 bg-emerald-50 rounded-3xl border-2 border-emerald-500 space-y-3 text-xs animate-in fade-in">
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
            window.open('https://search.google.com/local/writereview?placeid=${store.location.googlePlaceId}', '_blank');
            window.location.href = '/q/${code}/done?text=' + encodeURIComponent(text);
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    if (pathname.startsWith('/q/') && pathname.endsWith('/done')) {
      const store = getStore();
      const html = renderHtmlPage('Thank You', 'qr', `
        <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4 card-3d">
            <span class="text-4xl">❤️</span>
            <h1 class="text-2xl font-black text-slate-900 font-heading">Thank You for Supporting Us!</h1>
            <p class="text-xs text-slate-600">Your review helps genuine local patients discover quality healthcare.</p>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>Reminder:</strong> Your text is copied to your clipboard. Simply paste it on Google Maps and tap Post!
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${store.location.googlePlaceId}" target="_blank" class="block w-full py-3 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md">
              Open Google Review Window Again &rarr;
            </a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 1-TAP OWNER MOBILE APPROVAL (/a/:token)
    // ----------------------------------------------------
    if (pathname.startsWith('/a/')) {
      const token = pathname.split('/')[2];
      const store = getStore();
      const html = renderHtmlPage('1-Tap Mobile Approval', 'approval', `
        <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 card-3d">
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold">
              ⚠️ Negative Review Held for 1-Tap Owner Approval
            </div>
            <div class="text-xs space-y-1">
              <span class="font-bold text-slate-900">Priya Narang (1★)</span>
              <p class="italic text-slate-600">"Waited 45 mins past appointment time. Receptionist was completely dismissive."</p>
            </div>
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <span class="font-bold text-emerald-950 font-heading">AI Proposed De-escalation Reply:</span>
              <p class="text-slate-800">Dear Priya Narang, thank you for sharing your feedback. We sincerely value patient comfort and punctuality. Please contact our clinic manager at ${store.location.managerPhone}.</p>
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

    return sendHtml(404, renderHtmlPage('404 Not Found', '', `
      <div class="min-h-[60vh] flex items-center justify-center p-8 text-center space-y-4">
        <div>
          <h1 class="text-4xl font-black text-slate-900 font-heading">404 - Page Not Found</h1>
          <p class="text-slate-500 text-xs mt-2">The page you requested does not exist.</p>
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

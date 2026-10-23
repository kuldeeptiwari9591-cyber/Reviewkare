const { getSvgIcon } = require('./icons.js');

function renderHtmlPage(title, activeNav, bodyContent, options = {}) {
  const isHomepage = activeNav === 'home';
  const isApp = activeNav === 'app';

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth antialiased">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Replyo — Autonomous Google Review SaaS for India</title>
  <meta name="description" content="AI Google Review Autopilot & In-Clinic AI QR flow for Indian clinics, salons & restaurants. Auto-posts 5-star replies in 4 mins, holds 1-3 star reviews for 1-tap owner approval.">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  
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
  ${isHomepage ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' : ''}
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      touch-action: manipulation;
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
    
    /* 3D Tilt & Card Perspective */
    .perspective-1000 { perspective: 1000px; transform-style: preserve-3d; }
    .card-3d {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      will-change: transform;
    }
    .card-3d:hover {
      box-shadow: 0 16px 36px -12px rgba(16, 185, 129, 0.12);
    }
    
    /* 2.5D Isometric Device Mockup */
    .isometric-mockup {
      transform: rotateX(10deg) rotateY(-12deg) rotateZ(2deg);
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
      box-shadow: -20px 30px 60px rgba(15, 23, 42, 0.15);
      animation: floatSlow 6s ease-in-out infinite alternate;
    }
    .isometric-mockup:hover {
      transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.02);
      animation-play-state: paused;
    }
    @keyframes floatSlow {
      0% { transform: rotateX(10deg) rotateY(-12deg) rotateZ(2deg) translateY(0px); }
      100% { transform: rotateX(12deg) rotateY(-10deg) rotateZ(1deg) translateY(-10px); }
    }

    /* Ambient Clean Mesh */
    .ambient-mesh {
      background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08), transparent 50%),
                  radial-gradient(circle at 100% 30%, rgba(6, 182, 212, 0.05), transparent 40%);
    }

    /* Glare effect on 3D elements */
    .glare-effect {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 65%);
      pointer-events: none;
      border-radius: inherit;
    }

    /* Accessibility: Honor reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .isometric-mockup {
        transform: none !important;
        animation: none !important;
      }
      .card-3d:hover {
        transform: none !important;
      }
    }
  </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white ambient-mesh">
  
  <!-- SKIP LINK FOR ACCESSIBILITY (Web Guidelines) -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
    Skip to main content
  </a>

  ${!isApp ? `
  <!-- TOP ANNOUNCEMENT BANNER -->
  <aside class="bg-dark-950 text-slate-300 text-xs py-2.5 px-4 text-center border-b border-slate-800" aria-label="Announcement">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-brand-400"></span>
      <span class="font-medium">Founding Cohort Offer: First 50 Indian clinics get Growth plan locked at ₹999/month for life.</span>
      <a href="/pricing" class="font-bold text-brand-400 hover:text-brand-300 underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded">Claim Offer &rarr;</a>
    </div>
  </aside>

  <!-- NAVIGATION BAR (Minimalist Swiss Bar with Cmd+K & Auth) -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl" aria-label="Replyo Homepage">
          <div class="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center font-heading transition-transform group-hover:scale-105">
            R
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-2xl text-slate-950 tracking-tight font-heading">Replyo</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                India
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Autonomous Review Reputation</p>
          </div>
        </a>

        <!-- Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600" aria-label="Main Navigation">
          <a href="/features" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'features' ? 'text-brand-600 font-bold' : ''}">Features</a>
          <a href="/pricing" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'pricing' ? 'text-brand-600 font-bold' : ''}">Pricing (INR)</a>
          <a href="/free-audit" class="hover:text-brand-600 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'audit' ? 'text-brand-600 font-bold' : ''}">
            ${getSvgIcon('sparkles', 'w-3.5 h-3.5 text-amber-500')} Free Audit Tool
          </a>
          
          <!-- Industries Dropdown -->
          <div class="relative group cursor-pointer">
            <span class="hover:text-brand-600 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'industries' ? 'text-brand-600 font-bold' : ''}">
              Industries <span class="text-[9px] opacity-60">▼</span>
            </span>
            <div class="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50">
              <a href="/industries/clinics" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Dental & Aesthetic Clinics</a>
              <a href="/industries/salons" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Salons & Luxury Spas</a>
              <a href="/industries/restaurants" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Restaurants & Cafes</a>
              <a href="/industries/gyms" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Gyms & Fitness Hubs</a>
              <a href="/industries/coaching" class="block px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">Coaching & Academies</a>
            </div>
          </div>

          <a href="/for-agencies" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'agencies' ? 'text-brand-600 font-bold' : ''}">For Agencies</a>
          <a href="/security" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'security' ? 'text-brand-600 font-bold' : ''}">Security & Trust</a>
          <a href="/blog" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'blog' ? 'text-brand-600 font-bold' : ''}">Guides</a>
          <a href="/contact" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'contact' ? 'text-brand-600 font-bold' : ''}">Contact</a>
        </nav>
      </div>

      <!-- Action buttons & Command Palette Trigger -->
      <div class="flex items-center gap-3">
        <!-- Quick Search Cmd+K -->
        <button type="button" onclick="openCommandPalette()" class="hidden lg:flex items-center gap-2 px-3 min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Search and Navigation">
          ${getSvgIcon('search', 'w-3.5 h-3.5')}
          <span>Quick Search</span>
          <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono shadow-2xs">⌘K</kbd>
        </button>

        <a href="/login" class="text-xs font-bold px-3.5 min-h-[44px] flex items-center text-slate-700 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
          Sign In
        </a>

        <a href="/app" class="inline-flex items-center gap-2 text-xs font-bold px-4 min-h-[44px] rounded-xl bg-dark-950 text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm">
          Owner App &rarr;
        </a>
      </div>
    </div>
  </header>` : ''}

  <!-- MAIN CANVAS -->
  <main id="main-content" class="flex-1 w-full">
    ${bodyContent}
  </main>

  ${!isApp ? `
  <!-- SAAS FOOTER (100% ZERO DEAD LINKS & TRUST GUARANTEE) -->
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
            <p class="text-brand-400 font-semibold flex items-center gap-1.5">
              ${getSvgIcon('check', 'w-3.5 h-3.5 text-brand-400')} 100% Google Local Guides & User Content Compliant
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              ${getSvgIcon('shield', 'w-3.5 h-3.5 text-slate-400')} DPDP Act 2023 Compliant • Hosted on Mumbai Edge Cloud
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              ${getSvgIcon('billing', 'w-3.5 h-3.5 text-slate-400')} UPI AutoPay Supported • 18% GST Input Credit Tax Invoices
            </p>
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
            <li><a href="/book-demo" class="hover:text-white transition-colors">Book Enterprise Demo</a></li>
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
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Trust & Compliance</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/security" class="hover:text-white transition-colors">Security Whitepaper</a></li>
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
          <a href="/login" class="hover:text-slate-400">Sign In</a>
          <a href="/signup" class="hover:text-slate-400">Register</a>
          <a href="/security" class="hover:text-slate-400">Security</a>
          <a href="/privacy" class="hover:text-slate-400">Privacy</a>
          <a href="/terms" class="hover:text-slate-400">Terms</a>
          <span class="text-slate-600">•</span>
          <span class="text-emerald-500 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> All Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>` : ''}

  <!-- GLOBAL COMMAND PALETTE MODAL (Cmd + K) -->
  <div id="cmdPalette" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 hidden" onclick="if(event.target===this)closeCommandPalette()">
    <div class="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
      <div class="p-4 border-b border-slate-100 flex items-center gap-3">
        ${getSvgIcon('search', 'w-5 h-5 text-slate-400')}
        <input id="cmdSearchInput" type="text" placeholder="Type a destination (e.g. reviews, qr, pricing, settings)…" oninput="filterCmdList(this.value)" class="w-full text-xs font-semibold focus:outline-none text-slate-800 placeholder:text-slate-400">
        <kbd class="px-2 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded font-mono text-slate-500">ESC</kbd>
      </div>
      <div id="cmdList" class="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
        <a href="/app" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('dashboard', 'w-4 h-4 text-slate-500')} <span>Dashboard Overview</span>
        </a>
        <a href="/app/reviews" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('reviews', 'w-4 h-4 text-slate-500')} <span>Google Reviews Feed</span>
        </a>
        <a href="/app/approvals" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('approvals', 'w-4 h-4 text-amber-500')} <span>Held Approvals Queue</span>
        </a>
        <a href="/app/qr" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('qr', 'w-4 h-4 text-slate-500')} <span>3D Physical QR Studio</span>
        </a>
        <a href="/app/staff" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('staff', 'w-4 h-4 text-slate-500')} <span>Staff Leaderboard & Attribution</span>
        </a>
        <a href="/free-audit" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-amber-500')} <span>Free Competitor Audit Tool</span>
        </a>
        <a href="/pricing" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('billing', 'w-4 h-4 text-slate-500')} <span>Pricing Plans (INR)</span>
        </a>
        <a href="/security" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('shield', 'w-4 h-4 text-emerald-600')} <span>Security & DPDP Trust Whitepaper</span>
        </a>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION POPUP CONTAINER -->
  <div id="toastContainer" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite"></div>

  <!-- SCRIPTS: 3D CARD TILT, COMMAND PALETTE, TOAST HELPER -->
  <script>
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'px-4 py-3 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto ' +
        (type === 'success' ? 'bg-emerald-600' : 'bg-slate-900');
      toast.innerHTML = '<span>' + message + '</span>';
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    function openCommandPalette() {
      const p = document.getElementById('cmdPalette');
      p.classList.remove('hidden');
      setTimeout(() => document.getElementById('cmdSearchInput').focus(), 50);
    }
    function closeCommandPalette() {
      document.getElementById('cmdPalette').classList.add('hidden');
    }
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') closeCommandPalette();
    });

    function filterCmdList(query) {
      const q = query.toLowerCase();
      document.querySelectorAll('#cmdList a').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }

    // 3D Tilt Script (respects prefers-reduced-motion)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.card-3d').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.01, 1.01, 1.01)';
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { renderHtmlPage };

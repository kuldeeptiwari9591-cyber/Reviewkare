const { getSvgIcon } = require('./icons.js');

function renderHtmlPage(title, activeNav, bodyContent, options = {}) {
  const isHomepage = activeNav === 'home';
  const isApp = activeNav === 'app';

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth antialiased">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Replyo — Autonomous Review & In-Store QR Operating System</title>
  <meta name="description" content="Autonomous Multi-Dialect Google Review Autopilot & In-Store QR flows for Indian clinics, cafes, restaurants, salons & gyms. 4-min AI replies, zero-liability quarantine shield, staff attribution leaderboard.">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb', // Precision Electric Cobalt
              700: '#1d4ed8', // Deep Royal Blue
              800: '#1e40af',
              900: '#1e3a8a',
              950: '#0f172a',
            },
            dark: {
              900: '#090d16', // Deep Obsidian
              950: '#040711',
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
            heading: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
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
      box-shadow: 0 16px 36px -12px rgba(37, 99, 235, 0.12);
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
      background: radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.06), transparent 50%),
                  radial-gradient(circle at 100% 30%, rgba(99, 102, 241, 0.04), transparent 40%);
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
<body class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-600 selection:text-white ambient-mesh">
  
  <!-- SKIP LINK FOR ACCESSIBILITY (Web Guidelines) -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
    Skip to main content
  </a>

  ${!isApp ? `
  <!-- TOP ARCHITECTURE ANNOUNCEMENT BANNER (No aggressive sales noise) -->
  <aside class="bg-dark-950 text-slate-300 text-xs py-2.5 px-4 text-center border-b border-slate-800" aria-label="Announcement">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-[10px]">
        Replyo 2.4 Architecture
      </span>
      <span class="font-medium text-slate-200">Zero-Login 30s In-Store QR, Neural Multi-Dialect Autopilot & Frontline Staff Attribution across India</span>
      <a href="/features" class="font-bold text-brand-400 hover:text-brand-300 underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded">Explore Capabilities &rarr;</a>
    </div>
  </aside>

  <!-- NAVIGATION BAR (Minimalist Swiss Bar with Cmd+K & Multi-Vertical Directory) -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl" aria-label="Replyo Homepage">
          <div class="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center font-heading transition-transform group-hover:scale-105 shadow-md shadow-brand-500/20">
            R
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-2xl text-slate-950 tracking-tight font-heading">Replyo</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 font-mono">
                OS 2.4
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium -mt-0.5">Autonomous Multi-Vertical Reputation OS</p>
          </div>
        </a>

        <!-- Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600" aria-label="Main Navigation">
          <a href="/features" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'features' ? 'text-brand-600 font-bold' : ''}">Core Engine</a>
          
          <!-- Industries Multi-Vertical Dropdown -->
          <div class="relative group cursor-pointer">
            <span class="hover:text-brand-600 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'industries' ? 'text-brand-600 font-bold' : ''}">
              Industries <span class="text-[9px] opacity-60">▼</span>
            </span>
            <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50">
              <a href="/industries/clinics" class="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">
                ${getSvgIcon('clinic', 'w-4 h-4 text-brand-600')}
                <span>Clinics & Healthcare</span>
              </a>
              <a href="/industries/restaurants" class="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">
                ${getSvgIcon('coffee', 'w-4 h-4 text-amber-600')}
                <span>Cafes, Dining & Bakeries</span>
              </a>
              <a href="/industries/salons" class="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">
                ${getSvgIcon('scissors', 'w-4 h-4 text-purple-600')}
                <span>Salons & Luxury Spas</span>
              </a>
              <a href="/industries/gyms" class="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">
                ${getSvgIcon('dumbbell', 'w-4 h-4 text-emerald-600')}
                <span>Gyms & Fitness Hubs</span>
              </a>
              <a href="/industries/coaching" class="flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 font-medium text-slate-700">
                ${getSvgIcon('academic', 'w-4 h-4 text-blue-600')}
                <span>Coaching & Academies</span>
              </a>
            </div>
          </div>

          <a href="/free-audit" class="hover:text-brand-600 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'audit' ? 'text-brand-600 font-bold' : ''}">
            ${getSvgIcon('search', 'w-3.5 h-3.5 text-brand-600')} Local 3-Pack Audit
          </a>
          <a href="/for-agencies" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'agencies' ? 'text-brand-600 font-bold' : ''}">For Agencies</a>
          <a href="/security" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'security' ? 'text-brand-600 font-bold' : ''}">Security & Trust</a>
          <a href="/pricing" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'pricing' ? 'text-brand-600 font-bold' : ''}">Pricing</a>
          <a href="/contact" class="hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1 ${activeNav === 'contact' ? 'text-brand-600 font-bold' : ''}">Contact</a>
        </nav>
      </div>

      <!-- Action buttons & Command Palette Trigger -->
      <div class="flex items-center gap-3">
        <!-- Quick Search Cmd+K -->
        <button type="button" onclick="openCommandPalette()" class="hidden lg:flex items-center gap-2 px-3 min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Search and Navigation">
          ${getSvgIcon('search', 'w-3.5 h-3.5 text-slate-400')}
          <span>Quick Search</span>
          <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-slate-200 rounded font-mono shadow-2xs">⌘K</kbd>
        </button>

        <a href="/login?demo=true" class="text-xs font-bold px-3.5 min-h-[44px] flex items-center text-slate-700 hover:text-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
          Live Demo
        </a>

        <a href="/app" class="inline-flex items-center gap-2 text-xs font-bold px-4 min-h-[44px] rounded-xl bg-dark-950 text-white hover:bg-brand-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-sm">
          <span>Enterprise Desk &rarr;</span>
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
            <div class="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-base flex items-center justify-center font-heading">R</div>
            <span class="font-extrabold text-white text-xl tracking-tight font-heading">Replyo Operating System</span>
          </div>
          <p class="text-slate-400 leading-relaxed pr-6">
            Autonomous Google Review Autopilot & In-Store AI QR Platform. Built natively in India for clinics, cafes, restaurants, salons, spas, and gyms.
          </p>
          <div class="space-y-1.5 text-slate-400 text-[11px]">
            <p class="text-brand-400 font-semibold flex items-center gap-1.5">
              ${getSvgIcon('check', 'w-3.5 h-3.5 text-brand-400')} 100% Official Google Business Profile OAuth 2.0 API Partner
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              ${getSvgIcon('shield', 'w-3.5 h-3.5 text-slate-400')} DPDP Act 2023 Compliant • Hosted on AWS Mumbai (ap-south-1)
            </p>
            <p class="text-slate-400 flex items-center gap-1.5">
              ${getSvgIcon('lock', 'w-3.5 h-3.5 text-slate-400')} Zero-PHI Medical Guarantee • Strict Zero-Liability Quarantine Shield
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Engine & Capabilities</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/features" class="hover:text-white transition-colors">Neural Dialect Autopilot</a></li>
            <li><a href="/app/qr" class="hover:text-white transition-colors">3D Physical QR Studio</a></li>
            <li><a href="/features" class="hover:text-white transition-colors">Quarantine Safety Shield</a></li>
            <li><a href="/app/staff" class="hover:text-white transition-colors">Staff Attribution Leaderboard</a></li>
            <li><a href="/app/local-pack" class="hover:text-white transition-colors">Google Local 3-Pack Engine</a></li>
            <li><a href="/book-demo" class="hover:text-white transition-colors">Schedule Solution Walkthrough</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Multi-Vertical</h4>
          <ul class="space-y-2 text-slate-400">
            <li><a href="/industries/clinics" class="hover:text-white transition-colors">Clinics & Healthcare</a></li>
            <li><a href="/industries/restaurants" class="hover:text-white transition-colors">Cafes & Artisan Dining</a></li>
            <li><a href="/industries/salons" class="hover:text-white transition-colors">Salons & Luxury Spas</a></li>
            <li><a href="/industries/gyms" class="hover:text-white transition-colors">Gyms & Athletic Hubs</a></li>
            <li><a href="/industries/coaching" class="hover:text-white transition-colors">Coaching & Academies</a></li>
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
            <li><a href="/for-agencies" class="hover:text-white transition-colors">Agency Partner Network</a></li>
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
          <span class="text-emerald-400 font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> All Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>` : ''}

  <!-- GLOBAL COMMAND PALETTE MODAL (Cmd + K) -->
  <div id="cmdPalette" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4 hidden" onclick="if(event.target===this)closeCommandPalette()">
    <div class="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
      <div class="p-4 border-b border-slate-100 flex items-center gap-3">
        ${getSvgIcon('search', 'w-5 h-5 text-slate-400')}
        <input id="cmdSearchInput" type="text" placeholder="Type a destination (e.g. reviews, qr, staff, security, clinic, cafe)…" oninput="filterCmdList(this.value)" class="w-full text-xs font-semibold focus:outline-none text-slate-800 placeholder:text-slate-400">
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
        <a href="/app/local-pack" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('localPack', 'w-4 h-4 text-slate-500')} <span>Google Local 3-Pack Simulator</span>
        </a>
        <a href="/free-audit" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-amber-500')} <span>Free Competitor Audit Tool</span>
        </a>
        <a href="/security" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('shield', 'w-4 h-4 text-slate-500')} <span>Clinical & DPDP Security Whitepaper</span>
        </a>
        <a href="/book-demo" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-slate-800">
          ${getSvgIcon('arrowRight', 'w-4 h-4 text-slate-500')} <span>Schedule Solution Walkthrough</span>
        </a>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toastContainer" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" aria-live="polite"></div>

  <script>
    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const borderClass = type === 'success' ? 'border-brand-500 bg-white text-slate-900' : 'border-slate-800 bg-dark-950 text-white';
      toast.className = 'pointer-events-auto p-3.5 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 transform translate-y-4 opacity-0 transition-all duration-300 ' + borderClass;
      toast.innerHTML = '<span>' + message + '</span>';
      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
      });
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // Command Palette Logic (Cmd+K)
    function openCommandPalette() {
      const p = document.getElementById('cmdPalette');
      p.classList.remove('hidden');
      document.getElementById('cmdSearchInput').focus();
    }
    function closeCommandPalette() {
      document.getElementById('cmdPalette').classList.add('hidden');
    }
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const p = document.getElementById('cmdPalette');
        if (p.classList.contains('hidden')) openCommandPalette();
        else closeCommandPalette();
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

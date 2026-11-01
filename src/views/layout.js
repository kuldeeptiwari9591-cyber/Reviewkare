const { getSvgIcon } = require('./icons.js');

function renderHtmlPage(title, activeNav, bodyContent, options = {}) {
  const isHomepage = activeNav === 'home';
  const isApp = activeNav === 'app';

  const description = options.description || "Autonomous Multi-Dialect Google Review Autopilot & In-Store QR flows for Indian clinics, cafes, restaurants, salons & gyms. 4-min AI replies, zero-liability quarantine shield, staff attribution leaderboard.";
  const canonicalPath = options.canonical || (isHomepage ? '/' : '');
  const canonicalUrl = `https://reviewkaro.tech${canonicalPath}`;
  const fullTitle = title.includes('ReviewKaro') ? title : `${title} | ReviewKaro — Autonomous Review & In-Store QR Operating System`;
  const ogType = options.ogType || (options.article ? 'article' : 'website');
  const ogImage = options.ogImage || 'https://reviewkaro.tech/static/og-banner.png';
  const keywords = options.keywords || 'Google review autopilot, in-store AI QR stands, Google Maps ranking, Local 3-Pack, reputation management India, clinic Google reviews, salon reviews, Hinglish AI replies, customer feedback automation';
  const robots = options.robots || (isApp ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // Build Structured Schema.org JSON-LD Graph for AEO / GEO Entity Citability
  const schemaGraph = [
    {
      "@type": "Organization",
      "@id": "https://reviewkaro.tech/#organization",
      "name": "ReviewKaro Technologies India Private Limited",
      "alternateName": "ReviewKaro",
      "url": "https://reviewkaro.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://reviewkaro.tech/static/logo.png"
      },
      "sameAs": [
        "https://twitter.com/reviewkaro",
        "https://www.linkedin.com/company/reviewkaro"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-80-4719-2830",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "80 Feet Road, 4th Block, Koramangala",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "postalCode": "560034",
        "addressCountry": "IN"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://reviewkaro.tech/#website",
      "url": "https://reviewkaro.tech",
      "name": "ReviewKaro Operating System",
      "publisher": { "@id": "https://reviewkaro.tech/#organization" }
    }
  ];

  if (isHomepage) {
    schemaGraph.push({
      "@type": "SoftwareApplication",
      "@id": "https://reviewkaro.tech/#application",
      "name": "ReviewKaro Review & In-Store QR Operating System",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, Android, iOS, Cloud",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1420",
        "bestRating": "5",
        "worstRating": "1"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": "1249",
        "highPrice": "3499",
        "offerCount": "3"
      },
      "featureList": [
        "Autonomous Multi-Dialect Google Review Autopilot",
        "Zero-App In-Store QR & NFC Review Flow in 30 Seconds",
        "Negative Review Quarantine Shield for 1-Tap Owner WhatsApp Resolution",
        "Frontline Staff Attribution & UPI Leaderboard Ledger",
        "Google Local 3-Pack Prominence & Semantic Keyword Weaving",
        "DPDP Act 2023 & NMC Medical Ethics Compliance"
      ]
    });
  }

  if (options.faqItems && options.faqItems.length > 0) {
    schemaGraph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      "mainEntity": options.faqItems.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    });
  }

  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schemaGraph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumbs`,
      "itemListElement": options.breadcrumbs.map((crumb, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": crumb.name,
        "item": crumb.url.startsWith('http') ? crumb.url : `https://reviewkaro.tech${crumb.url}`
      }))
    });
  }

  if (options.article) {
    schemaGraph.push({
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      "headline": options.article.title,
      "description": description,
      "url": canonicalUrl,
      "datePublished": options.article.publishedAt || "2026-10-15T09:00:00+05:30",
      "dateModified": options.article.modifiedAt || "2026-10-30T09:00:00+05:30",
      "author": {
        "@type": "Person",
        "name": options.article.author || "Dr. Ananya Sharma"
      },
      "publisher": { "@id": "https://reviewkaro.tech/#organization" }
    });
  }

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth antialiased">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#ff5900">
  
  <!-- Canonical & Agentic Discovery Links -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM Agent Manifest">
  <link rel="ai-catalog" type="application/json" href="/.well-known/ai-catalog.json">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">

  <!-- Open Graph Protocol (Facebook, LinkedIn, Slack, WhatsApp) -->
  <meta property="og:site_name" content="ReviewKaro Operating System">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter / X Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@reviewkaro">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Schema.org JSON-LD Knowledge Graph -->
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            ember: '#ff5900',
            abyss: '#000710',
            carbon: '#15191e',
            ink: '#000000',
            paper: '#ffffff',
            fog: '#f3f3f7',
            mist: '#b9bbc6',
            steel: '#8b8d98',
            pewter: '#6f737b',
            graphite: '#60646c',
            brand: {
              50: '#fff7ed',
              100: '#ffedd5',
              200: '#fed7aa',
              300: '#fdba74',
              400: '#fb923c',
              500: '#f97316',
              600: '#ff5900', // Brex Ember accent
              700: '#ea580c',
              800: '#c2410c',
              900: '#9a3412',
              950: '#000710', // Brex Abyss
            },
            dark: {
              900: '#15191e', // Brex Carbon
              950: '#000710', // Brex Abyss
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            heading: ['Inter', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            'tag': '6px',
            'card': '12px',
            'input': '12px',
            'btn': '12px',
          }
        }
      }
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"></script>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  ${isHomepage ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' : ''}
  
  <style>
    :root {
      --color-ember: #ff5900;
      --color-abyss: #000710;
      --color-carbon: #15191e;
      --color-ink: #000000;
      --color-paper: #ffffff;
      --color-fog: #f3f3f7;
      --color-mist: #b9bbc6;
      --color-steel: #8b8d98;
      --color-pewter: #6f737b;
      --color-graphite: #60646c;
      --font-inter: 'Inter', system-ui, sans-serif;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      letter-spacing: -0.01em;
      touch-action: manipulation;
      background-color: #ffffff;
      color: #000000;
    }
    h1, .text-display {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.03em;
      font-weight: 700;
      color: #000000;
      text-wrap: balance;
    }
    h2, .text-heading-lg {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.025em;
      font-weight: 700;
      color: #000000;
      text-wrap: balance;
    }
    h3, .text-heading {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.02em;
      font-weight: 600;
      color: #000000;
      text-wrap: balance;
    }
    h4, h5, h6, .font-heading {
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.01em;
      font-weight: 600;
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
      box-shadow: 0 16px 36px -12px rgba(255, 89, 0, 0.12);
    }
    
    /* 2.5D Isometric Device Mockup */
    .isometric-mockup {
      transform: rotateX(10deg) rotateY(-12deg) rotateZ(2deg);
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
      box-shadow: -20px 30px 60px rgba(0, 7, 16, 0.15);
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
      background: radial-gradient(circle at 50% 0%, rgba(255, 89, 0, 0.04), transparent 50%),
                  radial-gradient(circle at 100% 30%, rgba(243, 243, 247, 0.8), transparent 40%);
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
<body class="min-h-screen bg-white text-black flex flex-col selection:bg-brand-600 selection:text-white ambient-mesh">
  
  <!-- SKIP LINK FOR ACCESSIBILITY (Web Guidelines) -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
    Skip to main content
  </a>

  ${!isApp ? `
  <!-- TOP ARCHITECTURE ANNOUNCEMENT BANNER (Carbon #15191e with Ember #ff5900 accent) -->
  <aside class="bg-[#15191e] text-white text-xs py-2 px-4 text-center border-b border-[#252a32]" aria-label="Announcement">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#ff5900]/20 text-[#ff5900] font-bold uppercase tracking-wider text-[10px]">
        ReviewKaro 2.4 Architecture
      </span>
      <span class="font-medium text-[#f3f3f7]">Zero-Login 30s In-Store QR, Neural Multi-Dialect Autopilot &amp; Frontline Staff Attribution across India</span>
      <a href="/features" class="font-bold text-[#ff5900] hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded">Explore Capabilities &rarr;</a>
    </div>
  </aside>

  <!-- NAVIGATION BAR (Paper #ffffff canvas with Ink #000000 typography & Ember #ff5900 button) -->
  <header class="bg-white border-b border-[#e5e7eb] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded-xl" aria-label="ReviewKaro Homepage">
          <div class="w-10 h-10 rounded-[12px] bg-[#ff5900] text-white font-bold text-xl flex items-center justify-center font-heading transition-transform group-hover:scale-105 shadow-sm">
            R
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-2xl text-black tracking-tight font-heading">ReviewKaro</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[6px] bg-[#fff7ed] text-[#ff5900] border border-[#ffedd5] font-mono">
                OS 2.4
              </span>
            </div>
            <p class="text-[11px] text-[#60646c] font-medium -mt-0.5">Autonomous Multi-Vertical Reputation OS</p>
          </div>
        </a>

        <!-- Links -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-medium text-black" aria-label="Main Navigation">
          <a href="/features" class="hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'features' ? 'text-[#ff5900] font-bold' : ''}">Core Engine</a>
          
          <!-- Industries Multi-Vertical Dropdown -->
          <div class="relative group cursor-pointer">
            <span class="hover:text-[#ff5900] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'industries' ? 'text-[#ff5900] font-bold' : ''}">
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

          <a href="/free-audit" class="hover:text-[#ff5900] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'audit' ? 'text-[#ff5900] font-bold' : ''}">
            ${getSvgIcon('search', 'w-3.5 h-3.5 text-brand-600')} Local 3-Pack Audit
          </a>
          <a href="/for-agencies" class="hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'agencies' ? 'text-[#ff5900] font-bold' : ''}">For Agencies</a>
          <a href="/security" class="hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'security' ? 'text-[#ff5900] font-bold' : ''}">Security & Trust</a>
          <a href="/pricing" class="hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'pricing' ? 'text-[#ff5900] font-bold' : ''}">Pricing</a>
          <a href="/contact" class="hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded p-1 ${activeNav === 'contact' ? 'text-[#ff5900] font-bold' : ''}">Contact</a>
        </nav>
      </div>

      <!-- Action buttons & Command Palette Trigger -->
      <div class="flex items-center gap-3">
        <!-- Quick Search Cmd+K -->
        <button type="button" onclick="openCommandPalette()" class="hidden lg:flex items-center gap-2 px-3 min-h-[40px] rounded-[12px] border border-[#b9bbc6] bg-[#f3f3f7] text-[#60646c] hover:text-black text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900]" aria-label="Search and Navigation">
          ${getSvgIcon('search', 'w-3.5 h-3.5 text-steel')}
          <span>Quick Search</span>
          <kbd class="px-1.5 py-0.5 text-[10px] bg-white border border-[#b9bbc6] rounded font-mono shadow-2xs">⌘K</kbd>
        </button>

        <a href="/login?demo=true" class="text-xs font-semibold px-3.5 min-h-[44px] flex items-center text-black hover:text-[#ff5900] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] rounded-[12px]">
          Live Demo
        </a>

        <a href="/app" class="inline-flex items-center gap-2 text-xs font-semibold px-4 min-h-[44px] rounded-[12px] bg-[#ff5900] text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] shadow-sm">
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
  <!-- SAAS FOOTER (Brex Abyss #000710 with Mist #b9bbc6 text & Paper #ffffff headings) -->
  <footer class="bg-[#000710] text-[#b9bbc6] border-t border-[#15191e] text-xs mt-20 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#15191e]">
        
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-[12px] bg-[#ff5900] text-white font-bold text-base flex items-center justify-center font-heading">R</div>
            <span class="font-extrabold text-white text-xl tracking-tight font-heading">ReviewKaro Operating System</span>
          </div>
          <p class="text-[#8b8d98] leading-relaxed pr-6">
            Autonomous Google Review Autopilot &amp; In-Store AI QR Platform. Built natively in India for clinics, cafes, restaurants, salons, spas, and gyms.
          </p>
          <div class="space-y-1.5 text-[#8b8d98] text-[11px]">
            <p class="text-[#ff5900] font-semibold flex items-center gap-1.5">
              ${getSvgIcon('check', 'w-3.5 h-3.5 text-[#ff5900]')} 100% Official Google Business Profile OAuth 2.0 API Partner
            </p>
            <p class="text-[#8b8d98] flex items-center gap-1.5">
              ${getSvgIcon('shield', 'w-3.5 h-3.5 text-[#8b8d98]')} DPDP Act 2023 Compliant • Hosted on AWS Mumbai (ap-south-1)
            </p>
            <p class="text-[#8b8d98] flex items-center gap-1.5">
              ${getSvgIcon('lock', 'w-3.5 h-3.5 text-[#8b8d98]')} Zero-PHI Medical Guarantee • Strict Zero-Liability Quarantine Shield
            </p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Engine &amp; Capabilities</h4>
          <ul class="space-y-2 text-[#b9bbc6]">
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
          <ul class="space-y-2 text-[#b9bbc6]">
            <li><a href="/industries/clinics" class="hover:text-white transition-colors">Clinics &amp; Healthcare</a></li>
            <li><a href="/industries/restaurants" class="hover:text-white transition-colors">Cafes &amp; Artisan Dining</a></li>
            <li><a href="/industries/salons" class="hover:text-white transition-colors">Salons &amp; Luxury Spas</a></li>
            <li><a href="/industries/gyms" class="hover:text-white transition-colors">Gyms &amp; Athletic Hubs</a></li>
            <li><a href="/industries/coaching" class="hover:text-white transition-colors">Coaching &amp; Academies</a></li>
          </ul>
        </div>

        <div class="space-y-3">
          <h4 class="font-bold text-white uppercase tracking-wider text-[11px]">Trust &amp; Compliance</h4>
          <ul class="space-y-2 text-[#b9bbc6]">
            <li><a href="/security" class="hover:text-white transition-colors">Security Whitepaper</a></li>
            <li><a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="/refund-policy" class="hover:text-white transition-colors">Refund &amp; Cancellation</a></li>
            <li><a href="/dpdp-consent" class="hover:text-white transition-colors">DPDP Act 2023 Consent</a></li>
            <li><a href="/for-agencies" class="hover:text-white transition-colors">Agency Partner Network</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#60646c] gap-4">
        <p>© 2026 ReviewKaro Technologies India Private Limited. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="/login" class="hover:text-[#b9bbc6]">Sign In</a>
          <a href="/signup" class="hover:text-[#b9bbc6]">Register</a>
          <a href="/security" class="hover:text-[#b9bbc6]">Security</a>
          <a href="/privacy" class="hover:text-[#b9bbc6]">Privacy</a>
          <a href="/terms" class="hover:text-[#b9bbc6]">Terms</a>
          <span class="text-[#252a32]">•</span>
          <span class="text-[#10b981] font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span> All Systems Operational</span>
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

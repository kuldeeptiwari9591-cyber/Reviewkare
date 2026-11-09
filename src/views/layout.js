const { getSvgIcon } = require('./icons.js');

function renderHtmlPage(title, activeNav, bodyContent, options = {}) {
  const isHomepage = activeNav === 'home';
  const isApp = activeNav === 'app';

  const description = options.description || "Autonomous Multi-Dialect Google Review Autopilot & In-Store QR flows for Indian clinics, cafes, restaurants, salons & gyms. 4-min AI replies, zero-liability quarantine shield, staff attribution leaderboard.";
  const canonicalPath = options.canonical || (isHomepage ? '/' : '');
  const canonicalUrl = `https://reviewkare.tech${canonicalPath}`;
  const fullTitle = title.includes('ReviewKare') ? title : `${title} | ReviewKare — Autonomous Review & In-Store QR Operating System`;
  const ogType = options.ogType || (options.article ? 'article' : 'website');
  const ogImage = options.ogImage || 'https://reviewkare.tech/static/og-banner.png';
  const keywords = options.keywords || 'Google review autopilot, in-store AI QR stands, Google Maps ranking, Local 3-Pack, reputation management India, clinic Google reviews, salon reviews, Hinglish AI replies, customer feedback automation';
  const robots = options.robots || (isApp ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

  // Build Structured Schema.org JSON-LD Graph for AEO / GEO Entity Citability
  const schemaGraph = [
    {
      "@type": "Organization",
      "@id": "https://reviewkare.tech/#organization",
      "name": "ReviewKare Technologies India Private Limited",
      "alternateName": "ReviewKare",
      "url": "https://reviewkare.tech",
      "logo": {
        "@type": "ImageObject",
        "url": "https://reviewkare.tech/static/logo.png"
      },
      "sameAs": [
        "https://twitter.com/reviewkare",
        "https://www.linkedin.com/company/reviewkare"
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
      "@id": "https://reviewkare.tech/#website",
      "url": "https://reviewkare.tech",
      "name": "ReviewKare Operating System",
      "publisher": { "@id": "https://reviewkare.tech/#organization" }
    }
  ];

  if (isHomepage) {
    schemaGraph.push({
      "@type": "SoftwareApplication",
      "@id": "https://reviewkare.tech/#application",
      "name": "ReviewKare Review & In-Store QR Operating System",
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
        "item": crumb.url.startsWith('http') ? crumb.url : `https://reviewkare.tech${crumb.url}`
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
      "publisher": { "@id": "https://reviewkare.tech/#organization" }
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
  <meta name="theme-color" content="#D9541E">
  
  <!-- Canonical & Agentic Discovery Links -->
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM Agent Manifest">
  <link rel="ai-catalog" type="application/json" href="/.well-known/ai-catalog.json">
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">

  <!-- Open Graph Protocol (Facebook, LinkedIn, Slack, WhatsApp) -->
  <meta property="og:site_name" content="ReviewKare Operating System">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="en_IN">

  <!-- Twitter / X Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@reviewkare">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Schema.org JSON-LD Knowledge Graph -->
  <script type="application/ld+json">
  ${JSON.stringify({ "@context": "https://schema.org", "@graph": schemaGraph }, null, 2)}
  </script>

  <!-- Google Fonts: Editorial Serif (Fraunces) + Clean Sans (Plus Jakarta Sans) + Monospace (JetBrains Mono) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600..800;1,9..144,600..700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            cream: {
              DEFAULT: '#F3EEE3',
              50: '#FBF8F3',
              100: '#F3EEE3',
              200: '#EBE5D8',
              300: '#DFD7C7',
              400: '#CFC5B2',
              500: '#BDB19B',
            },
            ink: {
              DEFAULT: '#111111',
              50: '#F6F6F6',
              100: '#E7E7E7',
              200: '#D1D1D1',
              300: '#B0B0B0',
              400: '#888888',
              500: '#6E6E6E',
              600: '#4A4A4A',
              700: '#2B2B2B',
              800: '#1C1C1C',
              900: '#111111',
              950: '#0A0A0A',
            },
            orange: {
              DEFAULT: '#D9541E',
              burnt: '#D9541E',
              50: '#FAEDE8',
              100: '#F7DDD3',
              200: '#EFBCA8',
              300: '#E69B7E',
              400: '#DE7A53',
              500: '#D9541E',
              600: '#D9541E',
              700: '#BF4615',
              800: '#9F380F',
              900: '#7C2B0B',
            },
            brand: {
              50: '#FAEDE8',
              100: '#F7DDD3',
              200: '#EFBCA8',
              300: '#E69B7E',
              400: '#DE7A53',
              500: '#D9541E',
              600: '#D9541E',
              700: '#BF4615',
              800: '#9F380F',
              900: '#7C2B0B',
              950: '#111111',
            },
            dark: {
              900: '#181818',
              950: '#111111',
            },
            ember: '#D9541E',
            abyss: '#111111',
            carbon: '#181818',
            paper: '#FBF8F3',
            fog: '#F3EEE3',
            mist: '#DFD7C7',
            steel: '#888888',
            pewter: '#6E6E6E',
            graphite: '#4A4A4A',
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
            heading: ['Fraunces', 'Georgia', 'serif'],
            display: ['Fraunces', 'Georgia', 'serif'],
            serif: ['Fraunces', 'Georgia', 'serif'],
            grotesk: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            'tag': '6px',
            'card': '14px',
            'input': '10px',
            'btn': '10px',
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
      --color-cream: #F3EEE3;
      --color-cream-surface: #FBF8F3;
      --color-cream-subtle: #EBE5D8;
      --color-cream-border: #DFD7C7;
      --color-ink: #111111;
      --color-ink-muted: #4A4A4A;
      --color-ink-subtle: #6E6E6E;
      --color-orange: #D9541E;
      --color-orange-hover: #BF4615;
      --color-orange-tint: #FAEDE8;
      --font-heading: 'Fraunces', Georgia, serif;
      --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --ease-yc: cubic-bezier(0.22, 1, 0.36, 1);
      
      /* Backward compatibility mapping */
      --color-ember: #D9541E;
      --color-abyss: #111111;
      --color-carbon: #181818;
      --color-paper: #FBF8F3;
      --color-fog: #F3EEE3;
      --color-mist: #DFD7C7;
      --color-steel: #888888;
      --color-pewter: #6E6E6E;
      --color-graphite: #4A4A4A;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      letter-spacing: -0.01em;
      touch-action: manipulation;
      background-color: #F3EEE3;
      color: #111111;
      line-height: 1.6;
      font-size: 16px;
    }
    h1, .text-display {
      font-family: 'Fraunces', Georgia, serif;
      letter-spacing: -0.03em;
      font-weight: 700;
      color: #111111;
      text-wrap: balance;
    }
    h2, .text-heading-lg {
      font-family: 'Fraunces', Georgia, serif;
      letter-spacing: -0.025em;
      font-weight: 700;
      color: #111111;
      text-wrap: balance;
    }
    h3, .text-heading {
      font-family: 'Fraunces', Georgia, serif;
      letter-spacing: -0.02em;
      font-weight: 600;
      color: #111111;
      text-wrap: balance;
    }
    h4, h5, h6, .font-heading {
      font-family: 'Fraunces', Georgia, serif;
      letter-spacing: -0.015em;
      font-weight: 600;
      color: #111111;
    }
    .font-sans-clean {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .tabular-nums {
      font-variant-numeric: tabular-nums;
    }
    
    /* YC Hand-Drawn Animated Burnt Orange Underline */
    .yc-highlight {
      position: relative;
      display: inline-block;
      white-space: nowrap;
      color: #111111;
    }
    .yc-underline {
      position: absolute;
      bottom: -6px;
      left: 0;
      width: 100%;
      height: 12px;
      overflow: visible;
      pointer-events: none;
    }
    .yc-underline path {
      stroke-dasharray: 200;
      stroke-dashoffset: 200;
      transition: stroke-dashoffset 0.85s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .yc-highlight.draw .yc-underline path,
    .revealed .yc-underline path {
      stroke-dashoffset: 0;
    }

    /* Motion & Reveal Patterns (Motionsites standard) */
    .reveal-on-scroll {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: opacity, transform;
    }
    .reveal-on-scroll.revealed {
      opacity: 1;
      transform: translateY(0);
    }
    .stagger-1 { transition-delay: 80ms; }
    .stagger-2 { transition-delay: 160ms; }
    .stagger-3 { transition-delay: 240ms; }
    .stagger-4 { transition-delay: 320ms; }

    /* Button and Card Lifts */
    .btn-lift {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.22s ease, box-shadow 0.22s ease;
    }
    .btn-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(217, 84, 30, 0.3);
    }
    .card-lift {
      transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, box-shadow 0.28s ease;
    }
    .card-lift:hover {
      transform: translateY(-4px);
      border-color: #111111 !important;
      box-shadow: 0 16px 36px -10px rgba(17, 17, 17, 0.1);
    }

    /* Infinite Marquee Ticker */
    .marquee-container {
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }
    .marquee-track {
      display: inline-flex;
      animation: marqueeAnim 30s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }
    @keyframes marqueeAnim {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }

    /* Subtle Cream / Ink Grain Texture Overlay */
    .yc-cream-canvas {
      background-color: #F3EEE3;
      background-image: radial-gradient(#DFD7C7 0.75px, transparent 0.75px);
      background-size: 24px 24px;
    }

    /* 3D Tilt Card */
    .perspective-1000 { perspective: 1000px; transform-style: preserve-3d; }
    .card-3d {
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.25s ease;
      will-change: transform;
    }
    .card-3d:hover {
      box-shadow: 0 16px 36px -12px rgba(217, 84, 30, 0.15);
    }

    /* Route Transition Animation */
    @keyframes routeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .route-entrance {
      animation: routeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    /* Accessibility: Honor reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .reveal-on-scroll {
        opacity: 1 !important;
        transform: none !important;
      }
      .yc-underline path {
        stroke-dashoffset: 0 !important;
      }
      .btn-lift:hover, .card-lift:hover, .card-3d:hover {
        transform: none !important;
      }
      .marquee-track {
        animation: none !important;
      }
    }

    /* FAQ Accordion (details/summary) styling */
    details summary::-webkit-details-marker { display: none; }
    details[open] summary svg {
      transform: rotate(180deg);
    }
    details summary svg {
      transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    }
    details > div {
      animation: faqOpen 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes faqOpen {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Premium focus-visible ring */
    :focus-visible {
      outline: 2px solid #D9541E;
      outline-offset: 2px;
    }

    /* Smooth scrolling for anchor links */
    html { scroll-padding-top: 80px; }
  </style>
</head>
<body class="min-h-screen bg-[#F3EEE3] text-[#111111] flex flex-col selection:bg-[#D9541E] selection:text-white yc-cream-canvas route-entrance">
  
  <!-- SKIP LINK FOR ACCESSIBILITY (Web Guidelines) -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 bg-[#D9541E] text-white px-4 py-2 rounded-[10px] text-xs font-bold">
    Skip to main content
  </a>

  ${!isApp ? `
  <!-- TOP ANNOUNCEMENT BANNER — dismissable, real message -->
  <aside id="announceBanner" class="bg-[#111111] text-[#F3EEE3] text-xs py-2.5 px-4 text-center border-b border-[#222222]" aria-label="Announcement">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap relative">
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#D9541E]/20 text-[#D9541E] font-bold uppercase tracking-wider text-[10px] font-mono border border-[#D9541E]/30">
        New Launch
      </span>
      <span class="font-medium text-[#F3EEE3]">ReviewKare v3.0 — 30-Second In-Store QR, Dialect Autopilot &amp; Staff Attribution. Now live across India.</span>
      <a href="/features" class="font-bold text-[#D9541E] hover:underline ml-1 inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded">
        See What's New &rarr;
      </a>
      <button type="button" onclick="dismissBanner()" class="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#F3EEE3] transition-colors" aria-label="Dismiss announcement">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  </aside>

  <!-- NAVIGATION BAR -->
  <header class="bg-[#F3EEE3]/95 backdrop-blur-md border-b border-[#DFD7C7] sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-8">
        <a href="/" class="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded-xl" aria-label="ReviewKare Homepage">
          <div class="w-9 h-9 rounded-[10px] bg-[#D9541E] text-white font-bold text-lg flex items-center justify-center font-heading transition-transform group-hover:scale-105 shadow-sm flex-shrink-0">
            R
          </div>
          <span class="font-bold text-xl text-[#111111] tracking-tight font-heading">ReviewKare</span>
        </a>

        <!-- Desktop Nav Links (streamlined — 5 items max per Hick's Law) -->
        <nav class="hidden md:flex items-center gap-5 text-xs font-semibold text-[#111111]" aria-label="Main Navigation">
          <a href="/features" class="hover:text-[#D9541E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded px-1 py-1 ${activeNav === 'features' ? 'text-[#D9541E] font-bold' : ''}">Features</a>
          
          <!-- Industries Dropdown — click-accessible -->
          <div class="relative" id="navIndustriesWrapper">
            <button type="button" id="navIndustriesBtn" onclick="toggleIndustriesMenu()" class="hover:text-[#D9541E] transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded px-1 py-1 ${activeNav === 'industries' ? 'text-[#D9541E] font-bold' : ''}" aria-expanded="false" aria-haspopup="true">
              Industries
              <svg class="w-3 h-3 opacity-50 transition-transform" id="navIndustriesChevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div id="navIndustriesMenu" class="absolute top-full left-0 mt-2 w-64 bg-[#FBF8F3] rounded-2xl shadow-xl border border-[#DFD7C7] p-2 hidden z-50" role="menu">
              <a href="/industries/clinics" class="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111] transition-colors" role="menuitem">
                ${getSvgIcon('clinic', 'w-4 h-4 text-[#D9541E]')}
                <span>Clinics &amp; Healthcare</span>
              </a>
              <a href="/industries/restaurants" class="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111] transition-colors" role="menuitem">
                ${getSvgIcon('coffee', 'w-4 h-4 text-[#D9541E]')}
                <span>Cafes &amp; Dining</span>
              </a>
              <a href="/industries/salons" class="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111] transition-colors" role="menuitem">
                ${getSvgIcon('scissors', 'w-4 h-4 text-[#D9541E]')}
                <span>Salons &amp; Spas</span>
              </a>
              <a href="/industries/gyms" class="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111] transition-colors" role="menuitem">
                ${getSvgIcon('dumbbell', 'w-4 h-4 text-[#D9541E]')}
                <span>Gyms &amp; Fitness</span>
              </a>
              <a href="/industries/coaching" class="flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111] transition-colors" role="menuitem">
                ${getSvgIcon('academic', 'w-4 h-4 text-[#D9541E]')}
                <span>Coaching &amp; Academies</span>
              </a>
            </div>
          </div>

          <a href="/pricing" class="hover:text-[#D9541E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded px-1 py-1 ${activeNav === 'pricing' ? 'text-[#D9541E] font-bold' : ''}">Pricing</a>
          <a href="/free-audit" class="hover:text-[#D9541E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded px-1 py-1 ${activeNav === 'audit' ? 'text-[#D9541E] font-bold' : ''}">Free Audit</a>
          <a href="/contact" class="hover:text-[#D9541E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded px-1 py-1 ${activeNav === 'contact' ? 'text-[#D9541E] font-bold' : ''}">Contact</a>
        </nav>
      </div>

      <!-- Right: CTA buttons + mobile hamburger -->
      <div class="flex items-center gap-2.5">
        <!-- Cmd+K Search -->
        <button type="button" onclick="openCommandPalette()" class="hidden lg:flex items-center gap-1.5 px-2.5 min-h-[40px] rounded-[10px] border border-[#DFD7C7] bg-[#FBF8F3] text-[#4A4A4A] hover:text-[#111111] hover:border-[#111111] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]" aria-label="Quick search (Ctrl+K)">
          ${getSvgIcon('search', 'w-3.5 h-3.5 text-[#D9541E]')}
          <kbd class="px-1.5 py-0.5 text-[10px] bg-[#EBE5D8] border border-[#DFD7C7] text-[#111111] rounded font-mono">⌘K</kbd>
        </button>

        <a href="/login?demo=true" class="hidden sm:flex text-xs font-bold px-3.5 min-h-[44px] items-center text-[#111111] hover:text-[#D9541E] border border-[#DFD7C7] hover:border-[#111111] bg-[#FBF8F3] hover:bg-[#EBE5D8] transition-all rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]">
          Live Demo
        </a>

        <a href="/signup" class="inline-flex items-center gap-1.5 text-xs font-bold px-4 min-h-[44px] rounded-[10px] bg-[#D9541E] hover:bg-[#BF4615] text-white transition-all btn-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] shadow-sm">
          Start Free &rarr;
        </a>

        <!-- Mobile Hamburger -->
        <button type="button" id="mobileMenuBtn" onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-xl border border-[#DFD7C7] bg-[#FBF8F3] text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]" aria-label="Open menu" aria-expanded="false">
          <svg id="hamburgerIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <svg id="closeMenuIcon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div id="mobileMenu" class="md:hidden hidden bg-[#FBF8F3] border-t border-[#DFD7C7] px-4 pb-5 pt-3 space-y-1">
      <a href="/features" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#111111] hover:bg-[#EBE5D8] transition-colors ${activeNav === 'features' ? 'bg-[#EBE5D8] text-[#D9541E]' : ''}">Features</a>
      <div class="px-3 py-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider font-mono">Industries</div>
      <a href="/industries/clinics" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#EBE5D8] hover:text-[#111111] transition-colors pl-5">${getSvgIcon('clinic', 'w-3.5 h-3.5 text-[#D9541E]')} Clinics &amp; Healthcare</a>
      <a href="/industries/restaurants" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#EBE5D8] hover:text-[#111111] transition-colors pl-5">${getSvgIcon('coffee', 'w-3.5 h-3.5 text-[#D9541E]')} Cafes &amp; Dining</a>
      <a href="/industries/salons" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#EBE5D8] hover:text-[#111111] transition-colors pl-5">${getSvgIcon('scissors', 'w-3.5 h-3.5 text-[#D9541E]')} Salons &amp; Spas</a>
      <a href="/industries/gyms" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A4A4A] hover:bg-[#EBE5D8] hover:text-[#111111] transition-colors pl-5">${getSvgIcon('dumbbell', 'w-3.5 h-3.5 text-[#D9541E]')} Gyms &amp; Fitness</a>
      <a href="/pricing" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#111111] hover:bg-[#EBE5D8] transition-colors ${activeNav === 'pricing' ? 'bg-[#EBE5D8] text-[#D9541E]' : ''}">Pricing</a>
      <a href="/free-audit" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#111111] hover:bg-[#EBE5D8] transition-colors ${activeNav === 'audit' ? 'bg-[#EBE5D8] text-[#D9541E]' : ''}">Free Audit</a>
      <a href="/contact" class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#111111] hover:bg-[#EBE5D8] transition-colors ${activeNav === 'contact' ? 'bg-[#EBE5D8] text-[#D9541E]' : ''}">Contact</a>
      <div class="pt-3 border-t border-[#DFD7C7] flex flex-col gap-2">
        <a href="/login?demo=true" class="flex items-center justify-center min-h-[44px] px-4 rounded-[10px] text-sm font-bold text-[#111111] border border-[#DFD7C7] bg-white hover:bg-[#EBE5D8] transition-all">Live Demo</a>
        <a href="/signup" class="flex items-center justify-center min-h-[44px] px-4 rounded-[10px] text-sm font-bold text-white bg-[#D9541E] hover:bg-[#BF4615] transition-all">Start Free &rarr;</a>
      </div>
    </div>
  </header>` : ''}

  <!-- MAIN CANVAS -->
  <main id="main-content" class="flex-1 w-full">
    ${bodyContent}
  </main>

  ${!isApp ? `
  <!-- SAAS FOOTER (Ink Black #111111 with Cream #F3EEE3 text & Burnt Orange #D9541E accents) -->
  <footer class="bg-[#111111] text-[#CFC5B2] border-t border-[#222222] text-xs mt-20 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#222222]">
        
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-[8px] bg-[#D9541E] text-white font-bold text-base flex items-center justify-center font-heading">R</div>
            <span class="font-bold text-[#F3EEE3] text-xl tracking-tight font-heading">ReviewKare</span>
          </div>
          <p class="text-[#A09A8F] leading-relaxed pr-6 font-sans-clean">
            Autonomous Google Review Autopilot &amp; In-Store AI QR for clinics, cafes, salons, gyms, and coaching centres across India. Get more reviews. Rank higher on Google Maps.
          </p>
          <div class="space-y-1.5 text-[#A09A8F] text-[11px] font-sans-clean">
            <p class="text-[#D9541E] font-semibold flex items-center gap-1.5">
              ${getSvgIcon('check', 'w-3.5 h-3.5 text-[#D9541E]')} 100% Official Google Business Profile OAuth 2.0 API Partner
            </p>
            <p class="text-[#A09A8F] flex items-center gap-1.5">
              ${getSvgIcon('shield', 'w-3.5 h-3.5 text-[#A09A8F]')} DPDP Act 2023 Compliant • Hosted on AWS Mumbai (ap-south-1)
            </p>
            <p class="text-[#A09A8F] flex items-center gap-1.5">
              ${getSvgIcon('lock', 'w-3.5 h-3.5 text-[#A09A8F]')} Zero-PHI Medical Guarantee • Strict Zero-Liability Quarantine Shield
            </p>
          </div>
        </div>

        <div class="space-y-3 font-sans-clean">
          <h4 class="font-bold text-[#F3EEE3] uppercase tracking-wider text-[11px] font-mono">Features</h4>
          <ul class="space-y-2 text-[#CFC5B2]">
            <li><a href="/features" class="hover:text-[#D9541E] transition-colors">AI Dialect Replies</a></li>
            <li><a href="/app/qr" class="hover:text-[#D9541E] transition-colors">In-Store QR Stands</a></li>
            <li><a href="/features" class="hover:text-[#D9541E] transition-colors">Negative Review Shield</a></li>
            <li><a href="/app/staff" class="hover:text-[#D9541E] transition-colors">Staff Attribution</a></li>
            <li><a href="/app/local-pack" class="hover:text-[#D9541E] transition-colors">Google Maps Ranking</a></li>
            <li><a href="/book-demo" class="hover:text-[#D9541E] transition-colors">Book a Demo</a></li>
          </ul>
        </div>

        <div class="space-y-3 font-sans-clean">
          <h4 class="font-bold text-[#F3EEE3] uppercase tracking-wider text-[11px] font-mono">Multi-Vertical</h4>
          <ul class="space-y-2 text-[#CFC5B2]">
            <li><a href="/industries/clinics" class="hover:text-[#D9541E] transition-colors">Clinics &amp; Healthcare</a></li>
            <li><a href="/industries/restaurants" class="hover:text-[#D9541E] transition-colors">Cafes &amp; Artisan Dining</a></li>
            <li><a href="/industries/salons" class="hover:text-[#D9541E] transition-colors">Salons &amp; Luxury Spas</a></li>
            <li><a href="/industries/gyms" class="hover:text-[#D9541E] transition-colors">Gyms &amp; Athletic Hubs</a></li>
            <li><a href="/industries/coaching" class="hover:text-[#D9541E] transition-colors">Coaching &amp; Academies</a></li>
          </ul>
        </div>

        <div class="space-y-3 font-sans-clean">
          <h4 class="font-bold text-[#F3EEE3] uppercase tracking-wider text-[11px] font-mono">Trust &amp; Compliance</h4>
          <ul class="space-y-2 text-[#CFC5B2]">
            <li><a href="/security" class="hover:text-[#D9541E] transition-colors">Security Whitepaper</a></li>
            <li><a href="/privacy" class="hover:text-[#D9541E] transition-colors">Privacy Policy</a></li>
            <li><a href="/terms" class="hover:text-[#D9541E] transition-colors">Terms of Service</a></li>
            <li><a href="/refund-policy" class="hover:text-[#D9541E] transition-colors">Refund &amp; Cancellation</a></li>
            <li><a href="/dpdp-consent" class="hover:text-[#D9541E] transition-colors">DPDP Act 2023 Consent</a></li>
            <li><a href="/for-agencies" class="hover:text-[#D9541E] transition-colors">Agency Partner Network</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#888888] gap-4 font-sans-clean">
        <p>© 2026 ReviewKare Technologies India Private Limited. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <a href="/privacy" class="hover:text-[#F3EEE3] transition-colors">Privacy</a>
          <a href="/terms" class="hover:text-[#F3EEE3] transition-colors">Terms</a>
          <a href="/security" class="hover:text-[#F3EEE3] transition-colors">Security</a>
          <span class="text-[#333333]">•</span>
          <span class="text-[#D9541E] font-semibold flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#D9541E] animate-pulse"></span> All Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>` : ''}

  <!-- GLOBAL COMMAND PALETTE MODAL (Cmd + K) -->
  <div id="cmdPalette" class="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4 hidden" onclick="if(event.target===this)closeCommandPalette()">
    <div class="max-w-lg w-full bg-[#FBF8F3] rounded-2xl shadow-2xl border border-[#111111] overflow-hidden animate-in fade-in zoom-in-95">
      <div class="p-4 border-b border-[#DFD7C7] flex items-center gap-3">
        ${getSvgIcon('search', 'w-5 h-5 text-[#D9541E]')}
        <input id="cmdSearchInput" type="text" placeholder="Type a destination (e.g. reviews, qr, staff, security, clinic, cafe)…" oninput="filterCmdList(this.value)" class="w-full text-xs font-semibold focus:outline-none text-[#111111] bg-transparent placeholder:text-[#888888]">
        <kbd class="px-2 py-0.5 text-[10px] bg-[#EBE5D8] border border-[#DFD7C7] rounded font-mono text-[#111111]">ESC</kbd>
      </div>
      <div id="cmdList" class="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
        <a href="/app" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('dashboard', 'w-4 h-4 text-[#D9541E]')} <span>Dashboard Overview</span>
        </a>
        <a href="/app/reviews" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('reviews', 'w-4 h-4 text-[#D9541E]')} <span>Google Reviews Feed</span>
        </a>
        <a href="/app/approvals" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('approvals', 'w-4 h-4 text-[#D9541E]')} <span>Held Approvals Queue</span>
        </a>
        <a href="/app/qr" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('qr', 'w-4 h-4 text-[#D9541E]')} <span>3D Physical QR Studio</span>
        </a>
        <a href="/app/staff" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('staff', 'w-4 h-4 text-[#D9541E]')} <span>Staff Leaderboard &amp; Attribution</span>
        </a>
        <a href="/app/local-pack" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('localPack', 'w-4 h-4 text-[#D9541E]')} <span>Google Local 3-Pack Simulator</span>
        </a>
        <a href="/free-audit" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-[#D9541E]')} <span>Free Competitor Audit Tool</span>
        </a>
        <a href="/security" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('shield', 'w-4 h-4 text-[#D9541E]')} <span>Clinical &amp; DPDP Security Whitepaper</span>
        </a>
        <a href="/book-demo" class="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EBE5D8] font-medium text-[#111111]">
          ${getSvgIcon('arrowRight', 'w-4 h-4 text-[#D9541E]')} <span>Schedule Solution Walkthrough</span>
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
      const borderClass = type === 'success' ? 'border-[#D9541E] bg-[#FBF8F3] text-[#111111]' : 'border-[#111111] bg-[#111111] text-[#F3EEE3]';
      toast.className = 'pointer-events-auto p-3.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 transform translate-y-4 opacity-0 transition-all duration-300 ' + borderClass;
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
      if (e.key === 'Escape') { closeCommandPalette(); closeMobileMenu(); }
    });

    // Mobile Menu Toggle
    function toggleMobileMenu() {
      const menu = document.getElementById('mobileMenu');
      const btn = document.getElementById('mobileMenuBtn');
      const hamburger = document.getElementById('hamburgerIcon');
      const closeIcon = document.getElementById('closeMenuIcon');
      if (!menu) return;
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        menu.classList.add('hidden');
        btn && btn.setAttribute('aria-expanded', 'false');
        hamburger && hamburger.classList.remove('hidden');
        closeIcon && closeIcon.classList.add('hidden');
      } else {
        menu.classList.remove('hidden');
        btn && btn.setAttribute('aria-expanded', 'true');
        hamburger && hamburger.classList.add('hidden');
        closeIcon && closeIcon.classList.remove('hidden');
      }
    }
    function closeMobileMenu() {
      const menu = document.getElementById('mobileMenu');
      const btn = document.getElementById('mobileMenuBtn');
      if (menu) menu.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      const hamburger = document.getElementById('hamburgerIcon');
      const closeIcon = document.getElementById('closeMenuIcon');
      if (hamburger) hamburger.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    }
    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('mobileMenu');
      const btn = document.getElementById('mobileMenuBtn');
      if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Industries dropdown — click-toggle on desktop
    function toggleIndustriesMenu() {
      const menu = document.getElementById('navIndustriesMenu');
      const btn = document.getElementById('navIndustriesBtn');
      const chevron = document.getElementById('navIndustriesChevron');
      if (!menu) return;
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        menu.classList.add('hidden');
        btn && btn.setAttribute('aria-expanded', 'false');
        chevron && chevron.style.removeProperty('transform');
      } else {
        menu.classList.remove('hidden');
        btn && btn.setAttribute('aria-expanded', 'true');
        chevron && (chevron.style.transform = 'rotate(180deg)');
      }
    }
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('navIndustriesWrapper');
      const menu = document.getElementById('navIndustriesMenu');
      if (wrapper && menu && !wrapper.contains(e.target) && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        const btn = document.getElementById('navIndustriesBtn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        const chevron = document.getElementById('navIndustriesChevron');
        if (chevron) chevron.style.removeProperty('transform');
      }
    });

    // Announcement banner dismiss
    function dismissBanner() {
      const banner = document.getElementById('announceBanner');
      if (banner) {
        banner.style.transition = 'opacity 0.3s ease, max-height 0.4s ease';
        banner.style.opacity = '0';
        banner.style.overflow = 'hidden';
        banner.style.maxHeight = banner.offsetHeight + 'px';
        requestAnimationFrame(() => { banner.style.maxHeight = '0'; });
        setTimeout(() => banner.remove(), 400);
        try { localStorage.setItem('rk_banner_dismissed', '1'); } catch(e) {}
      }
    }
    // Auto-dismiss if previously dismissed
    try {
      if (localStorage.getItem('rk_banner_dismissed') === '1') {
        const banner = document.getElementById('announceBanner');
        if (banner) banner.remove();
      }
    } catch(e) {}

    function filterCmdList(query) {
      const q = query.toLowerCase();
      document.querySelectorAll('#cmdList a').forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }

    // Motion Observer: Scroll Reveal & Hand-Drawn Underline Triggers
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            const underlines = entry.target.querySelectorAll('.yc-highlight');
            underlines.forEach(u => u.classList.add('draw'));
          }
        });
      }, { threshold: 0.12 });

      document.querySelectorAll('.reveal-on-scroll, .yc-highlight').forEach(el => observer.observe(el));

      // Number Count-Up Observer
      const countObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetVal = parseFloat(el.getAttribute('data-count-up'));
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            const duration = 1200;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out expo
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const currentVal = targetVal * easeProgress;
              el.innerText = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal)) + suffix;
              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                countObserver.unobserve(el);
              }
            }
            requestAnimationFrame(updateCount);
          }
        });
      }, { threshold: 0.2 });

      document.querySelectorAll('[data-count-up]').forEach(el => countObserver.observe(el));
    } else {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('revealed'));
      document.querySelectorAll('.yc-highlight').forEach(el => el.classList.add('draw'));
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

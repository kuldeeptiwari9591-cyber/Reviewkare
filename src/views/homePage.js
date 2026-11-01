// Master Swiss Minimalist Multi-Vertical Homepage with 3D Visuals & Feature-First Depth
const { getSvgIcon, getStarRatingSvg } = require('./icons.js');

const HOME_FAQS = [
  {
    q: "How does ReviewKaro automate Google review replies without violating Google policies?",
    a: "ReviewKaro operates exclusively through official Google Business Profile OAuth 2.0 APIs. Instead of instantaneous automated replies that leave a bot footprint, ReviewKaro incorporates a humanized 3-to-5 minute response jitter. Every reply is uniquely generated with dialect mirroring and localized service keywords rather than robotic canned templates, in full compliance with Google's developer terms."
  },
  {
    q: "What is the Negative Review Quarantine Shield and how does it prevent legal liability?",
    a: "When a customer posts a 1-to-3 star review, ReviewKaro instantly halts automated publishing and routes the incident to the Negative Quarantine Shield. The AI generates a de-escalating draft that admits zero medical or legal liability, conveys empathy, and provides a direct telephone contact for the managing director or clinic head. The reply is dispatched to the owner's WhatsApp and email for 1-tap approval before anything goes live."
  },
  {
    q: "How does the in-store 30-second AI QR review builder work without requiring patient login?",
    a: "Customers scan an NFC or QR stand placed at your checkout counter or treatment tray. The web app loads in under 0.8 seconds (under 85KB) with zero app download, zero password prompt, and zero phone number collection. The customer taps their services, selects their attendant or doctor, and picks their preferred language. The AI generates an authentic first-person review and copies it to their clipboard while opening the official Google review dialogue in 1 tap."
  },
  {
    q: "Does ReviewKaro support regional Indian languages like Hindi, Hinglish, Tamil, Telugu, and Kannada?",
    a: "Yes. ReviewKaro is natively engineered for the Indian linguistic landscape. It detects and responds in Devanagari Hindi, colloquial Hinglish ('Bohot acha treatment tha, Dr. Sharma bilkul gentle the'), English, Tamil, Telugu, and Kannada, matching reviewer colloquialisms, gratitude phrases, and cultural tone."
  },
  {
    q: "How does ReviewKaro boost Google Local 3-Pack rankings on Google Maps?",
    a: "Google's local ranking algorithm prioritizes three core factors: Relevance, Distance, and Prominence. By maintaining a 99%+ response rate in under 4 minutes and naturally weaving local search keywords (e.g., 'painless root canal in Indiranagar Bangalore') into official replies, ReviewKaro signals high prominence and relevance to the Google Maps search algorithm."
  },
  {
    q: "Can healthcare clinics and doctors safely use ReviewKaro under NMC guidelines and DPDP Act 2023?",
    a: "Yes. ReviewKaro enforces a strict Zero-PHI (Protected Health Information) medical guarantee in adherence to National Medical Commission (NMC) ethics regulations and India's Digital Personal Data Protection Act 2023. Review responses never mention patient diagnoses, prescription details, or medical records, and all data is hosted within AWS Asia Pacific (Mumbai) data centers."
  },
  {
    q: "How does Frontline Staff Attribution and the tipping/incentive leaderboard operate?",
    a: "When customers scan your in-store QR stand, they can select the staff member who attended to them (e.g. Dr. Sneha, Barista Shreyas, Stylist Farhan). When a 5-star review mentioning their service is posted, ReviewKaro credits an attribution bonus into your internal staff performance ledger, motivating frontline teams to deliver exceptional guest hospitality."
  },
  {
    q: "What are the subscription pricing plans and is there a free trial?",
    a: "ReviewKaro offers transparent Indian Rupee (INR) pricing with zero foreign exchange fees: Starter Solo at ₹1,249/month, Growth Autopilot at ₹2,999/quarter (₹999/mo Hero Offer), and Multi-Branch Pro at ₹3,499/month. All plans include a 14-day free pilot with instant UPI activation and downloadable 18% GST tax invoices."
  }
];

function renderHomePage(store) {
  return `
  <!-- Ambient 3D Interactive Particle Background Canvas -->
  <div class="relative overflow-hidden bg-white border-b border-[#e5e7eb]">
    <canvas id="heroParticles" class="absolute inset-0 pointer-events-none opacity-40 z-0" aria-hidden="true"></canvas>

    <!-- Hero Section -->
    <section class="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left Hero Copy -->
        <div class="lg:col-span-7 space-y-6 text-left">
          
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#f3f3f7] border border-[#b9bbc6]/40 text-[#ff5900] text-xs font-bold font-mono">
            <span class="w-2 h-2 rounded-full bg-[#ff5900] animate-pulse"></span>
            <span>Operating Across Clinics, Dining, Salons &amp; Gyms in Metro India</span>
          </div>

          <h1 class="text-4xl sm:text-6xl font-bold text-black font-heading tracking-[-0.03em] leading-[1.08]" style="text-wrap: balance;">
            Autonomous Google Review OS for High-Touch Local Businesses.
          </h1>

          <p class="text-base sm:text-lg text-[#60646c] leading-relaxed max-w-2xl font-normal">
            Turn every customer visit into an authentic 5-star Google review in 30 seconds. ReviewKaro automatically mirrors customer dialect in 4 minutes with local search keywords, quarantines negative feedback for 1-tap manager resolution, and attributes reviews to frontline staff.
          </p>

          <!-- Primary Call to Actions (No cheap sales hype) -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a href="/login?demo=true" class="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#ff5900] hover:opacity-90 text-white font-semibold text-xs sm:text-sm transition-opacity flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900] shadow-sm">
              <span>Explore Multi-Vertical Demo (1-Click)</span>
              ${getSvgIcon('arrowRight', 'w-4 h-4 text-white')}
            </a>
            <a href="/free-audit" class="min-h-[48px] px-6 py-3 rounded-[12px] bg-white hover:bg-[#f3f3f7] text-black font-medium text-xs sm:text-sm border border-[#b9bbc6] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
              ${getSvgIcon('search', 'w-4 h-4 text-[#ff5900]')}
              <span>Audit My Local 3-Pack Rank</span>
            </a>
          </div>

          <!-- Architecture Metric Pillars -->
          <div class="pt-6 border-t border-[#e5e7eb] grid grid-cols-3 gap-4 text-left">
            <div>
              <div class="text-2xl font-bold text-black font-heading tabular-nums tracking-[-0.02em]">4 Mins</div>
              <div class="text-[11px] text-[#60646c] font-medium">Neural Autopilot Reply Velocity</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-black font-heading tabular-nums tracking-[-0.02em]">&lt;85 KB</div>
              <div class="text-[11px] text-[#60646c] font-medium">Zero-App In-Store QR Payload</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-black font-heading tabular-nums tracking-[-0.02em]">1-Tap</div>
              <div class="text-[11px] text-[#60646c] font-medium">Quarantined Complaint Approval</div>
            </div>
          </div>

        </div>

        <!-- Right 3D Interactive Countertop Stand Preview -->
        <div class="lg:col-span-5 flex flex-col items-center">
          
          <!-- 3D Perspective Card Container -->
          <div id="stand3D" class="w-full max-w-sm rounded-[16px] p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-[#15191e] to-[#000710] text-white shadow-2xl border border-white/10" style="perspective: 1000px;">
            
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#ff5900]"></span>
                <span id="materialBadge" class="text-[10px] font-bold uppercase tracking-wider text-[#b9bbc6] font-mono">Frosted Cast Acrylic</span>
              </div>
              <span class="text-[10px] text-[#8b8d98] font-mono">NFC + QR EMBEDDED</span>
            </div>

            <!-- Business Lockup -->
            <div class="text-center py-6 space-y-2">
              <div id="standBizName" class="text-xs uppercase tracking-widest font-bold text-[#ff5900]">Dr. Sharma Dental &amp; Implant Clinic</div>
              <h2 id="standTitle" class="text-lg font-bold font-heading text-white tracking-[-0.02em]">How was your visit today?</h2>
              <p id="standSub" class="text-[11px] text-[#b9bbc6]">Tap your phone or scan below • No app download required</p>
            </div>

            <!-- QR Target Mockup with 2.5D Glow -->
            <div class="bg-white p-4 rounded-[12px] shadow-inner max-w-[180px] mx-auto text-black text-center space-y-2">
              <div class="w-32 h-32 mx-auto bg-[#000710] rounded-[8px] p-2.5 flex flex-col items-center justify-between">
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-[#ff5900] rounded-sm"></div>
                  <div class="w-6 h-6 border-2 border-[#ff5900] rounded-sm"></div>
                </div>
                <div class="text-[9px] font-bold text-[#ff5900] tracking-tighter font-mono">REVIEWKARO 2.4</div>
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-[#ff5900] rounded-sm"></div>
                  <div class="w-2 h-2 bg-[#ff5900] rounded-full"></div>
                </div>
              </div>
              <div id="standPromptText" class="text-[10px] font-bold text-black">Scan for 30-sec Google Review</div>
            </div>

            <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8b8d98]">
              <span id="standLocText">Indiranagar 100ft Rd</span>
              <span id="standRatingText" class="text-amber-400 font-bold">4.9 ★★★★★ (143)</span>
            </div>

          </div>

          <!-- Stand Material Switcher -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#f3f3f7] rounded-[12px] border border-[#b9bbc6]/40">
            <button type="button" onclick="setMaterial('acrylic')" class="mat-btn active px-3 py-1.5 text-[11px] font-semibold rounded-[8px] transition-all bg-white text-black shadow-xs">
              Cast Acrylic
            </button>
            <button type="button" onclick="setMaterial('gold')" class="mat-btn px-3 py-1.5 text-[11px] font-medium rounded-[8px] transition-all text-[#60646c] hover:text-black">
              Champagne Gold
            </button>
            <button type="button" onclick="setMaterial('walnut')" class="mat-btn px-3 py-1.5 text-[11px] font-medium rounded-[8px] transition-all text-[#60646c] hover:text-black">
              Solid Walnut
            </button>
            <button type="button" onclick="setMaterial('obsidian')" class="mat-btn px-3 py-1.5 text-[11px] font-medium rounded-[8px] transition-all text-[#60646c] hover:text-black">
              Obsidian Black
            </button>
          </div>

        </div>

      </div>
    </section>
  </div>

  <!-- MULTI-VERTICAL INTERACTIVE WORKSPACE SELECTOR -->
  <section class="py-16 bg-slate-50 border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider font-mono">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-brand-600')} Multi-Vertical Engineering
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          One Operating System. Tailored In-Store Workflows.
        </h2>
        <p class="text-slate-600 text-sm">
          Select an industry below to see how ReviewKaro adapts its 30-second customer choices, frontline staff attribution, and Google Local 3-Pack keyword engine.
        </p>
      </div>

      <!-- Vertical Tabs -->
      <div class="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        <button type="button" onclick="selectVertical('clinic')" class="vert-tab active px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-dark-950 text-white shadow-sm" id="tab-clinic">
          ${getSvgIcon('clinic', 'w-4 h-4 text-brand-400')}
          <span>Clinics & Healthcare</span>
        </button>
        <button type="button" onclick="selectVertical('cafe')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="tab-cafe">
          ${getSvgIcon('coffee', 'w-4 h-4 text-amber-600')}
          <span>Cafes & Bakeries</span>
        </button>
        <button type="button" onclick="selectVertical('salon')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="tab-salon">
          ${getSvgIcon('scissors', 'w-4 h-4 text-purple-600')}
          <span>Salons & Luxury Spas</span>
        </button>
        <button type="button" onclick="selectVertical('gym')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="tab-gym">
          ${getSvgIcon('dumbbell', 'w-4 h-4 text-emerald-600')}
          <span>Gyms & Fitness Hubs</span>
        </button>
      </div>

      <!-- Live Dynamic Workflow Preview Card -->
      <div id="verticalContent" class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm card-3d">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Column 1: Customer In-Store Mobile Experience (Step 1 & 2) -->
          <div class="lg:col-span-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <span class="text-xs font-bold text-slate-900 font-heading">1. Customer In-Store 30-Sec Selection Screen</span>
              <span id="vertTouchpointBadge" class="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold">Billing Counter Stand</span>
            </div>
            
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span class="text-[11px] font-bold text-slate-500 uppercase">Selected Services / Menu Items</span>
                <div id="vertTagPills" class="flex flex-wrap gap-1.5 mt-1">
                  <span class="px-2.5 py-1 rounded-lg bg-brand-600 text-white font-semibold">Rotary Root Canal</span>
                  <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">Digital X-Ray</span>
                  <span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">Painless Anesthesia</span>
                </div>
              </div>

              <div>
                <span class="text-[11px] font-bold text-slate-500 uppercase">Frontline Staff Attributed</span>
                <div id="vertStaffName" class="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  ${getSvgIcon('staff', 'w-3.5 h-3.5 text-brand-600')}
                  <span>Dr. Sneha Kulkarni (Senior Endodontist)</span>
                </div>
              </div>

              <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span class="text-[10px] font-bold text-brand-700 uppercase font-mono">Synthesized Customer Review Draft:</span>
                <p id="vertReviewDraft" class="text-xs text-slate-800 italic leading-relaxed">
                  “Visited Dr. Sharma Dental Clinic for a root canal. Experience bohot painless aur gentle tha. Special mention to Dr. Sneha Kulkarni for being extremely patient. Clinic hygiene is 10/10!”
                </p>
              </div>
            </div>
          </div>

          <!-- Column 2: Autopilot 4-Min Response & Local SEO Mirroring (Step 3 & 4) -->
          <div class="lg:col-span-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <span class="text-xs font-bold text-slate-900 font-heading">2. Neural Autopilot 4-Minute SEO Response</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Auto-Posted to Google</span>
            </div>

            <div class="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-3 text-xs">
              <div class="flex justify-between items-center text-[11px]">
                <span id="vertBizHeader" class="font-bold text-emerald-950 font-heading">Dr. Sharma Dental & Implant Clinic</span>
                <span class="text-slate-500 font-mono">Response Time: 3.8 mins</span>
              </div>

              <p id="vertAutopilotReply" class="text-xs text-slate-800 leading-relaxed">
                “Namaste! Thank you so much for your kind words. Dr. Sneha Kulkarni and our team are delighted that your root canal treatment in Indiranagar was completely comfortable. Ensuring clinical sterility and painless procedures is our priority. See you for your routine checkup!”
              </p>

              <div class="pt-2 border-t border-emerald-100 flex flex-wrap gap-2 text-[10px] font-mono text-emerald-800">
                <span class="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">✓ Dialect: Hinglish Mirrored</span>
                <span id="vertKeywordsTag" class="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">✓ Local SEO: "root canal treatment in Indiranagar"</span>
              </div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span class="text-slate-600">Frontline Attribution Incentive Disbursed:</span>
              <strong id="vertIncentiveTag" class="text-brand-600 font-bold tabular-nums">₹200 to Dr. Sneha’s Ledger</strong>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- 6 CORE ARCHITECTURAL CAPABILITIES (Depth, Zero Hype) -->
  <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
    
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider font-mono">
        Platform Architecture
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
        Engineered for Compliance, Speed & Organic Google Rank
      </h2>
      <p class="text-slate-600 text-sm">
        Every component is designed to solve real operational bottlenecks across multi-location consumer businesses.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Feature 1: Multi-Dialect Neural Mirroring -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
          ${getSvgIcon('globe', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">Neural Multi-Dialect Mirroring</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Google reviews in Indian metros span colloquial Hinglish, Devanagari Hindi, Tamil, Telugu, Kannada, and English. ReviewKaro detects nuances, mirroring the customer’s exact warmth and vocabulary.
        </p>
        <div class="pt-2 text-[11px] font-bold text-brand-600 font-mono">
          Devanagari • Hinglish • Tamil • Telugu • Kannada
        </div>
      </div>

      <!-- Feature 2: 30-Sec In-Store QR Journey -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          ${getSvgIcon('smartphone', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">30-Second Zero-App In-Store Flow</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Patients or diners scan your countertop acrylic or wood stand. Loads in &lt;85KB with zero login. Customers tap services, quality, and staff. An authentic paragraph is generated for 1-tap Google Maps copy.
        </p>
        <div class="pt-2 text-[11px] font-bold text-amber-700 font-mono">
          22.4% Scan-to-Review Conversion (Vs 1.5% Industry Avg)
        </div>
      </div>

      <!-- Feature 3: Staff Attribution Leaderboard -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
          ${getSvgIcon('award', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">Frontline Staff Attribution & Incentives</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Baristas, hair stylists, fitness trainers, and clinical nurses earn automatic review attribution when named in 5★ feedback. Increases staff retention and motivates frontline teams to deliver stellar guest hospitality.
        </p>
        <div class="pt-2 text-[11px] font-bold text-purple-700 font-mono">
          Automated UPI Tip & Bonus Tracking Ledger
        </div>
      </div>

      <!-- Feature 4: Quarantine Safety Shield -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          ${getSvgIcon('shield', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">Zero-Liability Quarantine Shield</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          1–3★ complaints are quarantined automatically. The AI draft strictly forbids admitting fault or offering rash refunds. A 1-tap approval alert is dispatched to the manager’s WhatsApp before anything is posted.
        </p>
        <div class="pt-2 text-[11px] font-bold text-rose-700 font-mono">
          0% Legal Liability Admitted • Offline Escalation
        </div>
      </div>

      <!-- Feature 5: Google Local 3-Pack Algorithm Engine -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          ${getSvgIcon('localPack', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">Google Local 3-Pack Algorithm Engine</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Google Local 3-Pack ranking is governed by review response velocity, keyword density in replies, and review freshness. ReviewKaro executes replies in 4 minutes with localized service keywords.
        </p>
        <div class="pt-2 text-[11px] font-bold text-emerald-700 font-mono">
          48% Click-Through Share on Rank #1 Local Pack
        </div>
      </div>

      <!-- Feature 6: Multi-Branch Governance & DPDP Act -->
      <div class="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          ${getSvgIcon('building', 'w-6 h-6')}
        </div>
        <h3 class="text-lg font-bold text-slate-900 font-heading">Multi-Branch Governance & DPDP Act</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Centralized executive oversight for multi-chain brands across Indiranagar, Koramangala, and Lavelle Road. Full adherence to India’s DPDP Act 2023 with data residency strictly inside AWS Mumbai.
        </p>
        <div class="pt-2 text-[11px] font-bold text-blue-700 font-mono">
          AWS Mumbai ap-south-1 • SOC2 Readiness
        </div>
      </div>

    </div>
  </section>

  <!-- INTERACTIVE DIALECT MIRRORING PLAYGROUND -->
  <section class="py-16 bg-slate-50 border-t border-b border-slate-200">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider font-mono">
          Interactive Neural Engine
        </div>
        <h2 class="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
          Test Autonomous Dialect Mirroring
        </h2>
        <p class="text-slate-600 text-xs sm:text-sm">
          Click a review dialect below to watch how ReviewKaro mirrors the tone, acknowledges frontline staff, and weaves local search keywords.
        </p>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d space-y-6">
        
        <!-- Dialect Selector Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onclick="setPlaygroundDialect('hinglish')" class="dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-dark-950 text-white" id="dBtn-hinglish">
            Colloquial Hinglish
          </button>
          <button type="button" onclick="setPlaygroundDialect('hindi')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="dBtn-hindi">
            Devanagari Hindi
          </button>
          <button type="button" onclick="setPlaygroundDialect('english')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="dBtn-english">
            Corporate English
          </button>
          <button type="button" onclick="setPlaygroundDialect('complaint')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100" id="dBtn-complaint">
            1-Star Quarantined Alert
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
          
          <!-- Incoming Customer Review -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-slate-900" id="dReviewerName">Deepa Hegde (5★)</span>
              <span class="text-amber-500 font-bold" id="dStars">★★★★★</span>
            </div>
            <p id="dReviewText" class="text-xs text-slate-700 italic leading-relaxed">
              “Bohot hi smooth treatment tha! Dr. Sharma ne darr bilkul nikal diya. Clinic ka ambience 5 star jaisa clean hai aur staff bohot respectful hai.”
            </p>
            <div class="text-[10px] text-slate-400 font-mono" id="dDetectedBadge">Detected: Hinglish (Latin Script) • Tone: Warm Gratitude</div>
          </div>

          <!-- Autopilot Engine Generated Reply -->
          <div class="p-5 bg-brand-50/50 rounded-2xl border border-brand-200 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-brand-950 font-heading">Autonomous Autopilot Output</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-600 text-white font-bold" id="dStatusBadge">Auto-Posted (4m delay)</span>
            </div>
            <p id="dReplyText" class="text-xs text-slate-800 leading-relaxed font-sans">
              “Namaste Deepa ji! Aapka itna pyara feedback padhkar Dr. Sharma aur poori clinic team ko bohot khushi hui. Hamara prayas rehta hai ki har patient ka dental treatment bilkul painless aur comfortable ho. Indiranagar clinic aane ke liye bohot shukriya!”
            </p>
            <div class="text-[10px] text-brand-700 font-mono" id="dKeywordsBadge">Local Keywords Injected: "painless dental treatment Indiranagar"</div>
          </div>

        </div>

      </div>

    </div>
  </section>

  <!-- AEO & GEO KNOWLEDGE ENGINE: ENTITY DEFINITION & SPECIFICATIONS -->
  <section class="py-16 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="max-w-3xl space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider font-mono">
          System Definition & Entity Specifications
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          What is ReviewKaro? The Autonomous Google Review & In-Store QR Operating System
        </h2>
        <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
          <strong>ReviewKaro</strong> is an autonomous Google Business Profile reputation management and in-store AI QR operating system built specifically for high-touch consumer businesses in India—including dental clinics, aesthetic centers, specialty cafes, luxury salons, and fitness gyms. ReviewKaro integrates with official Google APIs to mirror customer review dialects in under 4 minutes, inject local search keywords for Google Local 3-Pack ranking prominence, and quarantine negative feedback for 1-tap manager resolution.
        </p>
      </div>

      <!-- Verified Architectural Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 card-3d">
          <div class="text-[11px] font-bold text-brand-700 uppercase font-mono">4-Minute Autopilot Velocity</div>
          <h3 class="text-base font-bold text-slate-900 font-heading">Humanized Algorithmic Jitter</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Eliminates synthetic bot footprints by introducing a 3–5 minute humanized response interval with dialect mirroring in Devanagari Hindi, colloquial Hinglish, and English.
          </p>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 card-3d">
          <div class="text-[11px] font-bold text-brand-700 uppercase font-mono">Zero Review Gating</div>
          <h3 class="text-base font-bold text-slate-900 font-heading">100% Google & FTC Adherent</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Adheres strictly to FTC 16 CFR Part 465 and Google anti-incentivization policies. Every customer is guided directly to Google Maps without filtering or gating.
          </p>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 card-3d">
          <div class="text-[11px] font-bold text-brand-700 uppercase font-mono">Zero-Liability Quarantine</div>
          <h3 class="text-base font-bold text-slate-900 font-heading">1-Tap WhatsApp Approval</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            1–3★ complaints are isolated instantly. The engine generates a de-escalating draft with zero medical or legal fault admitted and routes direct manager telephone lines.
          </p>
        </div>

        <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 card-3d">
          <div class="text-[11px] font-bold text-brand-700 uppercase font-mono">Data Sovereignty</div>
          <h3 class="text-base font-bold text-slate-900 font-heading">AWS Mumbai & DPDP 2023</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Strict adherence to India's Digital Personal Data Protection Act 2023 and NMC Medical Ethics. Hosted on AWS Mumbai (ap-south-1) with zero cross-border PHI transmission.
          </p>
        </div>
      </div>

    </div>
  </section>

  <!-- FAQ SECTION: ANSWER ENGINE OPTIMIZATION (AEO & GOOGLE FEATURED SNIPPETS) -->
  <section class="py-20 bg-slate-50 border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider font-mono">
          Authoritative Knowledge Base
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Frequently Asked Questions About Google Review Automation
        </h2>
        <p class="text-slate-600 text-sm">
          Technical, legal, and operational answers for business owners, clinic directors, and marketing leaders across India.
        </p>
      </div>

      <div class="space-y-4">
        ${HOME_FAQS.map((faq, idx) => `
          <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm card-3d space-y-2">
            <h3 class="text-base font-bold text-slate-900 font-heading flex items-start gap-3">
              <span class="text-brand-600 font-black tabular-nums">0${idx + 1}.</span>
              <span>${faq.q}</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed font-normal">
              ${faq.a}
            </p>
          </div>
        `).join('')}
      </div>

      <div class="p-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
        <h3 class="font-bold text-base text-slate-900 font-heading">Ready to see ReviewKaro active in your business?</h3>
        <p class="text-xs text-slate-500 max-w-lg mx-auto">Start with a 14-day free pilot. Instant UPI setup, zero setup fee, and cancel anytime in one click.</p>
        <div class="pt-2 flex flex-wrap justify-center gap-3">
          <a href="/signup" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            Start 14-Day Free Pilot &rarr;
          </a>
          <a href="/pricing" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all">
            View INR Subscription Plans
          </a>
        </div>
      </div>

    </div>
  </section>

  <!-- CLIENT-SIDE SCRIPTS FOR MULTI-VERTICAL & 3D INTERACTION -->
  <script>
    // 1. Multi-Vertical Data Map
    const verticalData = {
      clinic: {
        bizName: "Dr. Sharma Dental & Implant Clinic",
        title: "How was your visit today?",
        sub: "Tap your phone or scan below • No app download required",
        loc: "Indiranagar 100ft Rd",
        rating: "4.9 ★★★★★ (143)",
        touchpoint: "Reception Acrylic Stand & Operatory Tray NFC",
        tags: ["Rotary Root Canal", "Digital X-Ray", "Painless Anesthesia"],
        staff: "Dr. Sneha Kulkarni (Senior Endodontist)",
        draft: "“Visited Dr. Sharma Dental Clinic for a root canal. Experience bohot painless aur gentle tha. Special mention to Dr. Sneha Kulkarni for being extremely patient. Clinic hygiene is 10/10!”",
        bizHeader: "Dr. Sharma Dental & Implant Clinic",
        reply: "“Namaste! Thank you so much for your kind words. Dr. Sneha Kulkarni and our team are delighted that your root canal treatment in Indiranagar was completely comfortable. Ensuring clinical sterility and painless procedures is our priority. See you for your routine checkup!”",
        keywords: "✓ Local SEO: \\"root canal treatment in Indiranagar\\"",
        incentive: "₹200 to Dr. Sneha’s Ledger"
      },
      cafe: {
        bizName: "The Roastery Artisan Cafe & Sourdough Bakery",
        title: "How was your coffee & bake today?",
        sub: "Scan on table tent or tap bill folder • No login required",
        loc: "12th Main Road, Indiranagar",
        rating: "4.8 ★★★★★ (312)",
        touchpoint: "Bill Folder NFC Card & Tabletop QR Stand",
        tags: ["Ethiopian Pour-Over", "Almond Croissant", "Cold Brew Tonic"],
        staff: "Shreyas Nair (Lead Barista & Brewer)",
        draft: "“Best specialty coffee on 12th Main Indiranagar! Barista Shreyas explained the pour-over flavor notes so passionately. Flaky fresh almond croissant!”",
        bizHeader: "The Roastery Artisan Cafe",
        reply: "“Thank you so much! Shreyas and our roastery crew are thrilled you loved the single-origin Ethiopian pour-over and our freshly baked sourdough croissants. We roast our specialty beans fresh every Tuesday right here on 12th Main. See you tomorrow!”",
        keywords: "✓ Local SEO: \\"specialty coffee on 12th Main Indiranagar\\"",
        incentive: "₹150 to Barista Shreyas’s Tip Pool"
      },
      salon: {
        bizName: "Bounce Hair Studio & Luxury Spa",
        title: "How was your styling session today?",
        sub: "Scan mirror QR or tap billing counter • 30-sec rating",
        loc: "Lavelle Road, Shanthala Nagar",
        rating: "4.9 ★★★★★ (228)",
        touchpoint: "Styling Mirror QR & Billing Desk NFC Tap",
        tags: ["Ash Blonde Balayage", "Keratin Smoothing", "Scalp Massage"],
        staff: "Farhan Akhtar (Master Hair Artist)",
        draft: "“Got my balayage done with Farhan at Bounce Lavelle Road. He understood the exact ash tone I wanted without compromising hair health. Heavenly scalp massage!”",
        bizHeader: "Bounce Hair Studio & Spa",
        reply: "“Dear Tanvi, thank you for your radiant feedback! Farhan and our creative colorists take immense pride in customized balayage techniques for Bangalore weather. We look forward to pampering you at Lavelle Road on your next hair spa!”",
        keywords: "✓ Local SEO: \\"balayage specialist Lavelle Road Bangalore\\"",
        incentive: "₹300 to Stylist Farhan’s Performance Pool"
      },
      gym: {
        bizName: "IronVault Strength & Conditioning Club",
        title: "How was your workout session?",
        sub: "Tap turnstile NFC or scan water station QR • 30 secs",
        loc: "Koramangala 4th Block",
        rating: "4.8 ★★★★★ (184)",
        touchpoint: "Turnstile Check-In Stand & Locker Room NFC",
        tags: ["Deadlift Mechanics", "Competition Eleiko Bars", "Clean Showers"],
        staff: "Coach Aryan Rathore (Head Strength Coach)",
        draft: "“IronVault has the best barbell equipment in Koramangala. Coach Aryan fixed my hip hinge on deadlifts in one session. Showers and locker rooms are spotless!”",
        bizHeader: "IronVault Strength Club",
        reply: "“Awesome feedback! Coach Aryan and our coaching team are dedicated to injury-free progressive overload and maintaining competition-spec Eleiko bars for Koramangala lifters. Keep chasing those strength PRs!”",
        keywords: "✓ Local SEO: \\"strength training Koramangala Bangalore\\"",
        incentive: "₹250 to Coach Aryan’s Training Ledger"
      }
    };

    function selectVertical(vert) {
      document.querySelectorAll('.vert-tab').forEach(b => {
        b.className = 'vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
      });
      document.getElementById('tab-' + vert).className = 'vert-tab active px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-dark-950 text-white shadow-sm';

      const data = verticalData[vert];
      if (!data) return;

      // Update Stand 3D Mockup
      document.getElementById('standBizName').innerText = data.bizName;
      document.getElementById('standTitle').innerText = data.title;
      document.getElementById('standSub').innerText = data.sub;
      document.getElementById('standLocText').innerText = data.loc;
      document.getElementById('standRatingText').innerText = data.rating;

      // Update Workflow Card
      document.getElementById('vertTouchpointBadge').innerText = data.touchpoint;
      document.getElementById('vertStaffName').innerHTML = getSvgIcon('staff', 'w-3.5 h-3.5 text-brand-600') + ' <span>' + data.staff + '</span>';
      document.getElementById('vertReviewDraft').innerText = data.draft;
      document.getElementById('vertBizHeader').innerText = data.bizHeader;
      document.getElementById('vertAutopilotReply').innerText = data.reply;
      document.getElementById('vertKeywordsTag').innerText = data.keywords;
      document.getElementById('vertIncentiveTag').innerText = data.incentive;

      const pillsHtml = data.tags.map((t, i) => \`<span class="px-2.5 py-1 rounded-lg \${i === 0 ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-700'} font-semibold">\${t}</span>\`).join('');
      document.getElementById('vertTagPills').innerHTML = pillsHtml;
    }

    // 2. 3D Material Switcher
    function setMaterial(type) {
      const stand = document.getElementById('stand3D');
      const badge = document.getElementById('materialBadge');
      document.querySelectorAll('.mat-btn').forEach(b => b.classList.remove('bg-white', 'text-slate-900', 'shadow-sm'));
      event.target.classList.add('bg-white', 'text-slate-900', 'shadow-sm');

      if (type === 'acrylic') {
        stand.className = 'w-full max-w-sm rounded-3xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl border border-slate-700';
        badge.innerText = 'Frosted Cast Acrylic';
      } else if (type === 'gold') {
        stand.className = 'w-full max-w-sm rounded-3xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 text-amber-100 shadow-2xl border border-amber-600';
        badge.innerText = 'Brushed Champagne Gold';
      } else if (type === 'walnut') {
        stand.className = 'w-full max-w-sm rounded-3xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-stone-900 via-amber-950 to-stone-950 text-stone-200 shadow-2xl border border-amber-900';
        badge.innerText = 'Solid Matte Walnut Wood';
      } else if (type === 'obsidian') {
        stand.className = 'w-full max-w-sm rounded-3xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-black text-slate-100 shadow-2xl border border-slate-800';
        badge.innerText = 'Ceramic Black Obsidian';
      }
    }

    // 3. Dialect Mirroring Playground
    const dialectSamples = {
      hinglish: {
        reviewer: "Deepa Hegde",
        stars: "★★★★★",
        text: "“Bohot hi smooth treatment tha! Dr. Sharma ne darr bilkul nikal diya. Clinic ka ambience 5 star jaisa clean hai aur staff bohot respectful hai.”",
        detected: "Detected: Hinglish (Latin Script) • Tone: Warm Gratitude",
        status: "Auto-Posted (4m delay)",
        reply: "“Namaste Deepa ji! Aapka itna pyara feedback padhkar Dr. Sharma aur poori clinic team ko bohot khushi hui. Hamara prayas rehta hai ki har patient ka dental treatment bilkul painless aur comfortable ho. Indiranagar clinic aane ke liye bohot shukriya!”",
        keywords: "Local Keywords Injected: \\"painless dental treatment Indiranagar\\""
      },
      hindi: {
        reviewer: "रामेश्वर शरण त्रिपाठी",
        stars: "★★★★★",
        text: "“डॉ. शर्मा क्लिनिक में इलाज का अनुभव अत्यंत सराहनीय रहा। स्टाफ का व्यवहार बहुत विनम्र है और आधुनिक मशीनों से जांच की गई। धन्यवाद!”",
        detected: "Detected: Devanagari Hindi Script • Tone: Formal Respectful",
        status: "Auto-Posted (4m delay)",
        reply: "“सादर प्रणाम रामेश्वर जी! आपकी सकारात्मक प्रतिक्रिया के लिए डॉ. शर्मा डेंटल क्लिनिक की ओर से हार्दिक धन्यवाद। हमारा निरंतर प्रयास रहता है कि हम अपने सभी मरीजों को उच्चतम स्तर की चिकित्सकीय सुविधा प्रदान करें।”",
        keywords: "Local Keywords Injected: \\"उत्कृष्ट डेंटल क्लिनिक बैंगलोर\\""
      },
      english: {
        reviewer: "Vikramaditya Sengupta",
        stars: "★★★★★",
        text: "“Had a severe molar pain on Sunday morning. Dr. Sneha Kulkarni did a painless root canal with computerized anesthesia. The Indiranagar clinic is sparkling clean and modern.”",
        detected: "Detected: Standard English • Tone: Professional High-Praise",
        status: "Auto-Posted (4m delay)",
        reply: "“Thank you so much, Vikramaditya ji, for sharing your experience with Dr. Sharma Dental & Implant Clinic. We are delighted that Dr. Sneha Kulkarni could relieve your discomfort with our painless root canal protocol. Ensuring our Indiranagar operatory meets international sterilization standards is our highest commitment.”",
        keywords: "Local Keywords Injected: \\"painless root canal Indiranagar Bangalore\\""
      },
      complaint: {
        reviewer: "Rajesh Gokhale",
        stars: "★☆☆☆☆",
        text: "“Waited 35 mins past appointment time despite booking well in advance. The front desk did not provide any updates while we sat in the lobby.”",
        detected: "Detected: Negative Complaint (1★) • Issue: Appointment Wait Time",
        status: "Held in Quarantine Shield",
        reply: "“Dear Rajesh Gokhale, thank you for sharing your feedback. We sincerely value patient punctuality and time management. We would like to investigate this appointment delay and ensure our lobby protocols are tightened. Please contact our clinic operations manager directly at +91 98450 11223 so we can assist you personally.”",
        keywords: "Zero Liability Admitted • Direct Manager Telephone Provided"
      }
    };

    function setPlaygroundDialect(d) {
      document.querySelectorAll('.dialect-btn').forEach(b => {
        b.className = 'dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
      });
      const activeBtn = document.getElementById('dBtn-' + d);
      if (d === 'complaint') {
        activeBtn.className = 'dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-rose-600 text-white';
      } else {
        activeBtn.className = 'dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-dark-950 text-white';
      }

      const s = dialectSamples[d];
      document.getElementById('dReviewerName').innerText = s.reviewer + ' (' + s.stars + ')';
      document.getElementById('dStars').innerText = s.stars;
      document.getElementById('dReviewText').innerText = s.text;
      document.getElementById('dDetectedBadge').innerText = s.detected;
      document.getElementById('dStatusBadge').innerText = s.status;
      document.getElementById('dReplyText').innerText = s.reply;
      document.getElementById('dKeywordsBadge').innerText = s.keywords;

      if (d === 'complaint') {
        document.getElementById('dStatusBadge').className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold';
      } else {
        document.getElementById('dStatusBadge').className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-brand-600 text-white font-bold';
      }
    }

    // 4. Ambient Particle Canvas Animation (Brex Ember palette)
    (function initParticles() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const canvas = document.getElementById('heroParticles');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = 700;

      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = 700;
      });

      const particles = Array.from({ length: 35 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1
      }));

      function render() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ff5900';
        ctx.strokeStyle = 'rgba(255, 89, 0, 0.08)';

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(render);
      }
      render();
    })();

    // 5. Dynamic Mouse-Tracking 3D Tilt for Hero Acrylic QR Standee
    (function initStandTilt() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const stand = document.getElementById('stand3D');
      if (!stand || !stand.parentElement) return;
      const container = stand.parentElement;
      container.addEventListener('mousemove', (e) => {
        const rect = stand.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        stand.style.transform = 'perspective(1000px) rotateX(' + (-y * 14).toFixed(2) + 'deg) rotateY(' + (x * 14).toFixed(2) + 'deg)';
      });
      container.addEventListener('mouseleave', () => {
        stand.style.transform = 'perspective(1000px) rotateX(10deg) rotateY(-12deg)';
      });
    })();
  </script>
  `;
}

module.exports = { renderHomePage, HOME_FAQS };

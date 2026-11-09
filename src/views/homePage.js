// Master Y Combinator-Inspired Multi-Vertical Homepage: 60% Cream, 30% Ink Black, 10% Burnt Orange
const { getSvgIcon, getStarRatingSvg } = require('./icons.js');

const HOME_FAQS = [
  {
    q: "How does ReviewKare automate Google review replies without violating Google policies?",
    a: "ReviewKare operates exclusively through official Google Business Profile OAuth 2.0 APIs. Instead of instantaneous automated replies that leave a bot footprint, ReviewKare incorporates a humanized 3-to-5 minute response jitter. Every reply is uniquely generated with dialect mirroring and localized service keywords rather than robotic canned templates, in full compliance with Google's developer terms."
  },
  {
    q: "What is the Negative Review Quarantine Shield and how does it prevent legal liability?",
    a: "When a customer posts a 1-to-3 star review, ReviewKare instantly halts automated publishing and routes the incident to the Negative Quarantine Shield. The AI generates a de-escalating draft that admits zero medical or legal liability, conveys empathy, and provides a direct telephone contact for the managing director or clinic head. The reply is dispatched to the owner's WhatsApp and email for 1-tap approval before anything goes live."
  },
  {
    q: "How does the in-store 30-second AI QR review builder work without requiring patient login?",
    a: "Customers scan an NFC or QR stand placed at your checkout counter or treatment tray. The web app loads in under 0.8 seconds (under 85KB) with zero app download, zero password prompt, and zero phone number collection. The customer taps their services, selects their attendant or doctor, and picks their preferred language. The AI generates an authentic first-person review and copies it to their clipboard while opening the official Google review dialogue in 1 tap."
  },
  {
    q: "Does ReviewKare support regional Indian languages like Hindi, Hinglish, Tamil, Telugu, and Kannada?",
    a: "Yes. ReviewKare is natively engineered for the Indian linguistic landscape. It detects and responds in Devanagari Hindi, colloquial Hinglish ('Bohot acha treatment tha, Dr. Sharma bilkul gentle the'), English, Tamil, Telugu, and Kannada, matching reviewer colloquialisms, gratitude phrases, and cultural tone."
  },
  {
    q: "How does ReviewKare boost Google Local 3-Pack rankings on Google Maps?",
    a: "Google's local ranking algorithm prioritizes three core factors: Relevance, Distance, and Prominence. By maintaining a 99%+ response rate in under 4 minutes and naturally weaving local search keywords (e.g., 'painless root canal in Indiranagar Bangalore') into official replies, ReviewKare signals high prominence and relevance to the Google Maps search algorithm."
  },
  {
    q: "Can healthcare clinics and doctors safely use ReviewKare under NMC guidelines and DPDP Act 2023?",
    a: "Yes. ReviewKare enforces a strict Zero-PHI (Protected Health Information) medical guarantee in adherence to National Medical Commission (NMC) ethics regulations and India's Digital Personal Data Protection Act 2023. Review responses never mention patient diagnoses, prescription details, or medical records, and all data is hosted within AWS Asia Pacific (Mumbai) data centers."
  },
  {
    q: "How does Frontline Staff Attribution and the tipping/incentive leaderboard operate?",
    a: "When customers scan your in-store QR stand, they can select the staff member who attended to them (e.g. Dr. Sneha, Barista Shreyas, Stylist Farhan). When a 5-star review mentioning their service is posted, ReviewKare credits an attribution bonus into your internal staff performance ledger, motivating frontline teams to deliver exceptional guest hospitality."
  },
  {
    q: "What are the subscription pricing plans and is there a free trial?",
    a: "ReviewKare offers transparent Indian Rupee (INR) pricing with zero foreign exchange fees: Starter Solo at ₹1,249/month, Growth Plan at ₹2,999/quarter (₹999/mo Hero Offer), and Multi-Branch Pro at ₹3,499/month. All plans include a 14-day free trial with instant UPI activation and downloadable 18% GST tax invoices."
  }
];

function renderHomePage(store) {
  return `
  <!-- HERO SECTION WITH EDITORIAL TYPOGRAPHY & ANIMATED BURNT ORANGE UNDERLINE -->
  <div class="relative overflow-hidden bg-[#F3EEE3] border-b border-[#DFD7C7]">
    <canvas id="heroParticles" class="absolute inset-0 pointer-events-none opacity-30 z-0" aria-hidden="true"></canvas>

    <section class="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left Hero Copy -->
        <div class="lg:col-span-7 space-y-6 text-left reveal-on-scroll">
          
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#FBF8F3] border border-[#DFD7C7] text-[#D9541E] text-xs font-bold font-mono">
            <span class="w-2 h-2 rounded-full bg-[#D9541E] animate-pulse"></span>
            <span>450+ Businesses Across 12 Indian Cities</span>
          </div>

          <h1 class="text-4xl sm:text-6xl xl:text-7xl font-bold text-[#111111] font-heading tracking-[-0.035em] leading-[1.1]" style="text-wrap: balance;">
            Get More Google Reviews. <span class="yc-highlight">Rank Higher<svg class="yc-underline" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M2 9 C 25 3, 75 3, 98 8" stroke="#D9541E" stroke-width="3" stroke-linecap="round" fill="none"/></svg></span> on Maps.
          </h1>

          <p class="text-base sm:text-lg text-[#4A4A4A] leading-relaxed max-w-2xl font-sans-clean font-normal">
            ReviewKare turns every in-store visit into a 5-star Google review in 30 seconds — automatically replying in your customer's dialect, quarantining negative feedback, and crediting your frontline staff.
          </p>

          <!-- Primary Call to Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a href="/signup" class="min-h-[52px] px-7 py-3.5 rounded-[10px] bg-[#D9541E] hover:bg-[#BF4615] text-white font-bold text-sm transition-all btn-lift flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] shadow-sm">
              <span>Start Free — 14 Days</span>
              ${getSvgIcon('arrowRight', 'w-4 h-4 text-white')}
            </a>
            <a href="/login?demo=true" class="min-h-[52px] px-6 py-3.5 rounded-[10px] bg-[#FBF8F3] hover:bg-[#EBE5D8] text-[#111111] font-bold text-sm border border-[#111111] transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]">
              ${getSvgIcon('search', 'w-4 h-4 text-[#D9541E]')}
              <span>See Live Demo</span>
            </a>
          </div>

          <!-- Social Proof Stats with Count-Up -->
          <div class="pt-6 border-t border-[#DFD7C7] grid grid-cols-3 gap-4 text-left">
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-[#111111] font-heading tabular-nums tracking-tight" data-count-up="450" data-suffix="+">450+</div>
              <div class="text-xs text-[#6E6E6E] font-medium font-sans-clean mt-0.5">Businesses on Platform</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-[#111111] font-heading tabular-nums tracking-tight" data-count-up="4" data-suffix=" Min">4 Min</div>
              <div class="text-xs text-[#6E6E6E] font-medium font-sans-clean mt-0.5">Autopilot Reply Speed</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-[#111111] font-heading tabular-nums tracking-tight" data-count-up="22" data-suffix="% CVR">22% CVR</div>
              <div class="text-xs text-[#6E6E6E] font-medium font-sans-clean mt-0.5">Scan-to-Review Rate</div>
            </div>
          </div>

        </div>

        <!-- Right 3D Interactive Countertop Stand Preview -->
        <div class="lg:col-span-5 flex flex-col items-center reveal-on-scroll stagger-2">
          
          <!-- 3D Perspective Card Container -->
          <div id="stand3D" class="w-full max-w-sm rounded-2xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-[#111111] text-[#F3EEE3] shadow-2xl border border-[#222222]" style="perspective: 1000px;">
            
            <div class="flex items-center justify-between pb-4 border-b border-[#222222]">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#D9541E]"></span>
                <span id="materialBadge" class="text-[10px] font-bold uppercase tracking-wider text-[#CFC5B2] font-mono">Frosted Cast Acrylic</span>
              </div>
              <span class="text-[10px] text-[#888888] font-mono">NFC + QR EMBEDDED</span>
            </div>

            <!-- Business Lockup -->
            <div class="text-center py-6 space-y-2">
              <div id="standBizName" class="text-xs uppercase tracking-widest font-bold text-[#D9541E] font-mono">Dr. Sharma Dental &amp; Implant Clinic</div>
              <h2 id="standTitle" class="text-lg font-bold font-heading text-[#F3EEE3] tracking-tight">How was your visit today?</h2>
              <p id="standSub" class="text-[11px] text-[#A09A8F] font-sans-clean">Tap phone or scan below • No app download required</p>
            </div>

            <!-- QR Target Mockup with YC Accent -->
            <div class="bg-[#FBF8F3] p-4 rounded-xl shadow-inner max-w-[180px] mx-auto text-[#111111] text-center space-y-2 border border-[#DFD7C7]">
              <div class="w-32 h-32 mx-auto bg-[#111111] rounded-[8px] p-2.5 flex flex-col items-center justify-between">
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-[#D9541E] rounded-sm"></div>
                  <div class="w-6 h-6 border-2 border-[#D9541E] rounded-sm"></div>
                </div>
                <div class="text-[9px] font-bold text-[#D9541E] tracking-tighter font-mono">REVIEWKARE 3.0</div>
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-[#D9541E] rounded-sm"></div>
                  <div class="w-2 h-2 bg-[#D9541E] rounded-full"></div>
                </div>
              </div>
              <div id="standPromptText" class="text-[10px] font-bold text-[#111111]">Scan for 30-sec Google Review</div>
            </div>

            <div class="mt-6 pt-4 border-t border-[#222222] flex items-center justify-between text-[11px] text-[#A09A8F] font-sans-clean">
              <span id="standLocText">Indiranagar 100ft Rd</span>
              <span id="standRatingText" class="text-[#D9541E] font-bold font-mono">4.9 ★★★★★ (143)</span>
            </div>

          </div>

          <!-- Stand Material Switcher -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#FBF8F3] rounded-xl border border-[#DFD7C7]">
            <button type="button" onclick="setMaterial('acrylic')" class="mat-btn active px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all bg-[#111111] text-[#F3EEE3] shadow-xs">
              Cast Acrylic
            </button>
            <button type="button" onclick="setMaterial('gold')" class="mat-btn px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all text-[#4A4A4A] hover:text-[#111111]">
              Champagne Gold
            </button>
            <button type="button" onclick="setMaterial('walnut')" class="mat-btn px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all text-[#4A4A4A] hover:text-[#111111]">
              Solid Walnut
            </button>
            <button type="button" onclick="setMaterial('obsidian')" class="mat-btn px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all text-[#4A4A4A] hover:text-[#111111]">
              Obsidian Black
            </button>
          </div>

        </div>

      </div>
    </section>

    <!-- LIVE MARQUEE / TICKER SECTION (Motion-graphics standard) -->
    <div class="border-t border-[#DFD7C7] bg-[#FBF8F3] py-3.5 marquee-container">
      <div class="marquee-track flex items-center gap-8 text-xs font-semibold text-[#111111]">
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> Dr. Sharma Dental Clinic (Bengaluru) • 4.9★ (143 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> The Roastery Artisan Cafe (Indiranagar) • 4.8★ (312 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> Bounce Hair Studio &amp; Spa (Lavelle Road) • 4.9★ (228 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> IronVault Strength Club (Koramangala) • 4.8★ (184 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> Apex NEET Academy (Kota &amp; Jaipur) • 4.9★ (420 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> Dr. Sharma Dental Clinic (Bengaluru) • 4.9★ (143 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> The Roastery Artisan Cafe (Indiranagar) • 4.8★ (312 reviews)</span>
        <span class="text-[#DFD7C7]">/</span>
        <span class="inline-flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#D9541E]"></span> Bounce Hair Studio &amp; Spa (Lavelle Road) • 4.9★ (228 reviews)</span>
      </div>
    </div>
  </div>

  <!-- MULTI-VERTICAL INTERACTIVE WORKSPACE SELECTOR -->
  <section class="py-16 bg-[#F3EEE3] border-b border-[#DFD7C7]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-3xl mx-auto space-y-3 reveal-on-scroll">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEDE8] border border-[#EFBCA8] text-[#D9541E] text-xs font-bold uppercase tracking-wider font-mono">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-[#D9541E]')} Multi-Vertical Engineering
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
          One Operating System. Tailored In-Store Workflows.
        </h2>
        <p class="text-[#4A4A4A] text-sm font-sans-clean">
          Select an industry below to see how ReviewKare adapts its 30-second customer choices, frontline staff attribution, and Google Local 3-Pack keyword engine.
        </p>
      </div>

      <!-- Vertical Tabs -->
      <div class="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto reveal-on-scroll stagger-1">
        <button type="button" onclick="selectVertical('clinic')" class="vert-tab active px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#111111] text-[#F3EEE3] shadow-sm" id="tab-clinic">
          ${getSvgIcon('clinic', 'w-4 h-4 text-[#D9541E]')}
          <span>Clinics &amp; Healthcare</span>
        </button>
        <button type="button" onclick="selectVertical('cafe')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#FBF8F3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]" id="tab-cafe">
          ${getSvgIcon('coffee', 'w-4 h-4 text-[#D9541E]')}
          <span>Cafes &amp; Bakeries</span>
        </button>
        <button type="button" onclick="selectVertical('salon')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#FBF8F3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]" id="tab-salon">
          ${getSvgIcon('scissors', 'w-4 h-4 text-[#D9541E]')}
          <span>Salons &amp; Luxury Spas</span>
        </button>
        <button type="button" onclick="selectVertical('gym')" class="vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#FBF8F3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]" id="tab-gym">
          ${getSvgIcon('dumbbell', 'w-4 h-4 text-[#D9541E]')}
          <span>Gyms &amp; Fitness Hubs</span>
        </button>
      </div>

      <!-- Live Dynamic Workflow Preview Card -->
      <div id="verticalContent" class="bg-[#FBF8F3] rounded-2xl p-6 sm:p-10 border border-[#DFD7C7] shadow-sm card-lift reveal-on-scroll stagger-2">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Column 1: Customer In-Store Mobile Experience -->
          <div class="lg:col-span-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#DFD7C7]">
              <span class="text-xs font-bold text-[#111111] font-heading">1. Customer In-Store 30-Sec Selection Screen</span>
              <span id="vertTouchpointBadge" class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAEDE8] text-[#D9541E] font-bold border border-[#EFBCA8]">Billing Counter Stand</span>
            </div>
            
            <div class="p-4 bg-[#F3EEE3] rounded-xl border border-[#DFD7C7] space-y-3 text-xs">
              <div>
                <span class="text-[11px] font-bold text-[#6E6E6E] uppercase font-mono">Selected Services / Menu Items</span>
                <div id="vertTagPills" class="flex flex-wrap gap-1.5 mt-1">
                  <span class="px-2.5 py-1 rounded-lg bg-[#D9541E] text-white font-semibold">Rotary Root Canal</span>
                  <span class="px-2.5 py-1 rounded-lg bg-[#FBF8F3] border border-[#DFD7C7] text-[#111111]">Digital X-Ray</span>
                  <span class="px-2.5 py-1 rounded-lg bg-[#FBF8F3] border border-[#DFD7C7] text-[#111111]">Painless Anesthesia</span>
                </div>
              </div>

              <div>
                <span class="text-[11px] font-bold text-[#6E6E6E] uppercase font-mono">Frontline Staff Attributed</span>
                <div id="vertStaffName" class="text-xs font-bold text-[#111111] mt-0.5 flex items-center gap-1.5">
                  ${getSvgIcon('staff', 'w-3.5 h-3.5 text-[#D9541E]')}
                  <span>Dr. Sneha Kulkarni (Senior Endodontist)</span>
                </div>
              </div>

              <div class="p-3 bg-[#FBF8F3] rounded-xl border border-[#DFD7C7] space-y-1">
                <span class="text-[10px] font-bold text-[#D9541E] uppercase font-mono">Synthesized Customer Review Draft:</span>
                <p id="vertReviewDraft" class="text-xs text-[#111111] italic leading-relaxed font-sans-clean">
                  “Visited Dr. Sharma Dental Clinic for a root canal. Experience bohot painless aur gentle tha. Special mention to Dr. Sneha Kulkarni for being extremely patient. Clinic hygiene is 10/10!”
                </p>
              </div>
            </div>
          </div>

          <!-- Column 2: Autopilot 4-Min Response & Local SEO Mirroring -->
          <div class="lg:col-span-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-[#DFD7C7]">
              <span class="text-xs font-bold text-[#111111] font-heading">2. Automated 4-Minute Response &amp; Local SEO</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAEDE8] text-[#D9541E] font-bold border border-[#EFBCA8]">Auto-Posted to Google</span>
            </div>

            <div class="p-4 bg-[#F3EEE3] rounded-xl border border-[#DFD7C7] space-y-3 text-xs">
              <div class="flex justify-between items-center text-[11px]">
                <span id="vertBizHeader" class="font-bold text-[#111111] font-heading">Dr. Sharma Dental &amp; Implant Clinic</span>
                <span class="text-[#6E6E6E] font-mono">Response Time: 3.8 mins</span>
              </div>

              <p id="vertAutopilotReply" class="text-xs text-[#111111] leading-relaxed font-sans-clean">
                “Namaste! Thank you so much for your kind words. Dr. Sneha Kulkarni and our team are delighted that your root canal treatment in Indiranagar was completely comfortable. Ensuring clinical sterility and painless procedures is our priority. See you for your routine checkup!”
              </p>

              <div class="pt-2 border-t border-[#DFD7C7] flex flex-wrap gap-2 text-[10px] font-mono text-[#D9541E]">
                <span class="bg-[#FBF8F3] px-2 py-0.5 rounded border border-[#DFD7C7]">✓ Dialect: Hinglish Mirrored</span>
                <span id="vertKeywordsTag" class="bg-[#FBF8F3] px-2 py-0.5 rounded border border-[#DFD7C7]">✓ Local SEO: "root canal treatment in Indiranagar"</span>
              </div>
            </div>

            <div class="p-3 bg-[#FBF8F3] rounded-xl border border-[#DFD7C7] flex items-center justify-between text-xs">
              <span class="text-[#4A4A4A] font-sans-clean">Frontline Attribution Incentive Disbursed:</span>
              <strong id="vertIncentiveTag" class="text-[#D9541E] font-bold tabular-nums">₹200 to Dr. Sneha’s Ledger</strong>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- 6 CORE ARCHITECTURAL CAPABILITIES (60/30/10 YC Palette) -->
  <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
    
    <div class="text-center max-w-3xl mx-auto space-y-3 reveal-on-scroll">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8F3] border border-[#DFD7C7] text-[#111111] text-xs font-bold uppercase tracking-wider font-mono">
        Platform Features
      </div>
      <h2 class="text-3xl sm:text-4xl font-bold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
        Everything You Need to Dominate Google Maps
      </h2>
      <p class="text-[#4A4A4A] text-sm font-sans-clean">
        Six capabilities working together to get you more reviews, faster replies, and better local rankings — without any manual effort.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Feature 1: Multi-Dialect Neural Mirroring -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-1">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('globe', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">Replies in Your Customer's Language</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          Google reviews in Indian metros span colloquial Hinglish, Devanagari Hindi, Tamil, Telugu, Kannada, and English. ReviewKare detects nuances, mirroring the customer’s exact warmth and vocabulary.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          Devanagari • Hinglish • Tamil • Telugu • Kannada
        </div>
      </div>

      <!-- Feature 2: 30-Sec In-Store QR Journey -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-2">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('smartphone', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">30-Second In-Store Review QR</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          Patients or diners scan your countertop acrylic or wood stand. Loads in &lt;85KB with zero login. Customers tap services, quality, and staff. An authentic paragraph is generated for 1-tap Google Maps copy.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          22.4% Scan-to-Review Conversion (Vs 1.5% Industry Avg)
        </div>
      </div>

      <!-- Feature 3: Staff Attribution Leaderboard -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-3">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('award', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">Frontline Staff Attribution &amp; Incentives</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          Baristas, hair stylists, fitness trainers, and clinical nurses earn automatic review attribution when named in 5★ feedback. Increases staff retention and motivates frontline teams to deliver stellar guest hospitality.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          Automated UPI Tip &amp; Bonus Tracking Ledger
        </div>
      </div>

      <!-- Feature 4: Quarantine Safety Shield -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-1">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('shield', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">Negative Review Protection</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          1–3★ complaints are quarantined automatically. The AI draft strictly forbids admitting fault or offering rash refunds. A 1-tap approval alert is dispatched to the manager’s WhatsApp before anything is posted.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          0% Legal Liability Admitted • Offline Escalation
        </div>
      </div>

      <!-- Feature 5: Google Local 3-Pack Algorithm Engine -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-2">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('localPack', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">Google Maps Rank Engine</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          Google Local 3-Pack ranking is governed by review response velocity, keyword density in replies, and review freshness. ReviewKare executes replies in 4 minutes with localized service keywords.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          48% Click-Through Share on Rank #1 Local Pack
        </div>
      </div>

      <!-- Feature 6: Multi-Branch Governance & DPDP Act -->
      <div class="bg-[#FBF8F3] p-8 rounded-2xl border border-[#DFD7C7] card-lift space-y-4 reveal-on-scroll stagger-3">
        <div class="w-12 h-12 rounded-xl bg-[#FAEDE8] text-[#D9541E] flex items-center justify-center">
          ${getSvgIcon('building', 'w-6 h-6 text-[#D9541E]')}
        </div>
        <h3 class="text-lg font-bold text-[#111111] font-heading">Multi-Branch &amp; Compliance</h3>
        <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
          Centralized executive oversight for multi-chain brands across Indiranagar, Koramangala, and Lavelle Road. Full adherence to India’s DPDP Act 2023 with data residency strictly inside AWS Mumbai.
        </p>
        <div class="pt-2 text-[11px] font-bold text-[#D9541E] font-mono">
          AWS Mumbai ap-south-1 • SOC2 Readiness
        </div>
      </div>

    </div>
  </section>

  <!-- INTERACTIVE DIALECT MIRRORING PLAYGROUND -->
  <section class="py-16 bg-[#F3EEE3] border-t border-b border-[#DFD7C7]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-2xl mx-auto space-y-3 reveal-on-scroll">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEDE8] border border-[#EFBCA8] text-[#D9541E] text-xs font-bold uppercase tracking-wider font-mono">
          See It In Action
        </div>
        <h2 class="text-3xl font-bold text-[#111111] font-heading tracking-tight">
          Test Autonomous Dialect Mirroring
        </h2>
        <p class="text-[#4A4A4A] text-xs sm:text-sm font-sans-clean">
          Click a review dialect below to watch how ReviewKare mirrors the tone, acknowledges frontline staff, and weaves local search keywords.
        </p>
      </div>

      <div class="bg-[#FBF8F3] rounded-2xl p-6 sm:p-8 border border-[#DFD7C7] shadow-sm card-lift space-y-6 reveal-on-scroll stagger-1">
        
        <!-- Dialect Selector Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onclick="setPlaygroundDialect('hinglish')" class="dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#111111] text-[#F3EEE3]" id="dBtn-hinglish">
            Colloquial Hinglish
          </button>
          <button type="button" onclick="setPlaygroundDialect('hindi')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#F3EEE3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]" id="dBtn-hindi">
            Devanagari Hindi
          </button>
          <button type="button" onclick="setPlaygroundDialect('english')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#F3EEE3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]" id="dBtn-english">
            Corporate English
          </button>
          <button type="button" onclick="setPlaygroundDialect('complaint')" class="dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#FAEDE8] text-[#D9541E] border border-[#EFBCA8] hover:bg-[#F7DDD3]" id="dBtn-complaint">
            1-Star Quarantined Alert
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
          
          <!-- Incoming Customer Review -->
          <div class="p-5 bg-[#F3EEE3] rounded-xl border border-[#DFD7C7] space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-[#111111] font-heading" id="dReviewerName">Deepa Hegde (5★)</span>
              <span class="text-[#D9541E] font-bold" id="dStars">★★★★★</span>
            </div>
            <p id="dReviewText" class="text-xs text-[#111111] italic leading-relaxed font-sans-clean">
              “Bohot hi smooth treatment tha! Dr. Sharma ne darr bilkul nikal diya. Clinic ka ambience 5 star jaisa clean hai aur staff bohot respectful hai.”
            </p>
            <div class="text-[10px] text-[#6E6E6E] font-mono" id="dDetectedBadge">Detected: Hinglish (Latin Script) • Tone: Warm Gratitude</div>
          </div>

          <!-- Autopilot Engine Generated Reply -->
          <div class="p-5 bg-[#FAEDE8] rounded-xl border border-[#EFBCA8] space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-[#111111] font-heading">AI Autopilot Response</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D9541E] text-white font-bold" id="dStatusBadge">Auto-Posted (4m delay)</span>
            </div>
            <p id="dReplyText" class="text-xs text-[#111111] leading-relaxed font-sans-clean">
              “Namaste Deepa ji! Aapka itna pyara feedback padhkar Dr. Sharma aur poori clinic team ko bohot khushi hui. Hamara prayas rehta hai ki har patient ka dental treatment bilkul painless aur comfortable ho. Indiranagar clinic aane ke liye bohot shukriya!”
            </p>
            <div class="text-[10px] text-[#D9541E] font-mono font-bold" id="dKeywordsBadge">Local Keywords Injected: "painless dental treatment Indiranagar"</div>
          </div>

        </div>

      </div>

    </div>
  </section>

  <!-- SYSTEM DEFINITION & ENTITY SPECIFICATIONS (Cream Surface with Ink Typography) -->
  <section class="py-16 bg-[#FBF8F3] border-b border-[#DFD7C7]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="max-w-3xl space-y-4 reveal-on-scroll">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEDE8] border border-[#EFBCA8] text-[#D9541E] text-xs font-bold uppercase tracking-wider font-mono">
          How It Works
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
          How ReviewKare Works — The Complete Google Review Operating System
        </h2>
        <p class="text-[#4A4A4A] text-sm sm:text-base leading-relaxed font-sans-clean">
          <strong class="text-[#111111]">ReviewKare</strong> is an autonomous Google Business Profile reputation management and in-store AI QR operating system built specifically for high-touch consumer businesses in India—including dental clinics, aesthetic centers, specialty cafes, luxury salons, and fitness gyms. ReviewKare integrates with official Google APIs to mirror customer review dialects in under 4 minutes, inject local search keywords for Google Local 3-Pack ranking prominence, and quarantine negative feedback for 1-tap manager resolution.
        </p>
      </div>

      <!-- Verified Architectural Pillars -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="p-6 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] space-y-2 card-lift reveal-on-scroll stagger-1">
          <div class="text-[11px] font-bold text-[#D9541E] uppercase font-mono">4-Minute Reply Speed</div>
          <h3 class="text-base font-bold text-[#111111] font-heading">Humanized Algorithmic Jitter</h3>
          <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
            Eliminates synthetic bot footprints by introducing a 3–5 minute humanized response interval with dialect mirroring in Devanagari Hindi, colloquial Hinglish, and English.
          </p>
        </div>

        <div class="p-6 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] space-y-2 card-lift reveal-on-scroll stagger-2">
          <div class="text-[11px] font-bold text-[#D9541E] uppercase font-mono">Zero Review Gating</div>
          <h3 class="text-base font-bold text-[#111111] font-heading">100% Google &amp; FTC Adherent</h3>
          <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
            Adheres strictly to FTC 16 CFR Part 465 and Google anti-incentivization policies. Every customer is guided directly to Google Maps without filtering or gating.
          </p>
        </div>

        <div class="p-6 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] space-y-2 card-lift reveal-on-scroll stagger-3">
          <div class="text-[11px] font-bold text-[#D9541E] uppercase font-mono">Zero-Liability Quarantine</div>
          <h3 class="text-base font-bold text-[#111111] font-heading">1-Tap WhatsApp Approval</h3>
          <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
            1–3★ complaints are isolated instantly. The engine generates a de-escalating draft with zero medical or legal fault admitted and routes direct manager telephone lines.
          </p>
        </div>

        <div class="p-6 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] space-y-2 card-lift reveal-on-scroll stagger-4">
          <div class="text-[11px] font-bold text-[#D9541E] uppercase font-mono">Data Sovereignty</div>
          <h3 class="text-base font-bold text-[#111111] font-heading">AWS Mumbai &amp; DPDP 2023</h3>
          <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean">
            Strict adherence to India's Digital Personal Data Protection Act 2023 and NMC Medical Ethics. Hosted on AWS Mumbai (ap-south-1) with zero cross-border PHI transmission.
          </p>
        </div>
      </div>

    </div>
  </section>

  <!-- FAQ SECTION: ANSWER ENGINE OPTIMIZATION (AEO & GOOGLE FEATURED SNIPPETS) -->
  <section class="py-20 bg-[#F3EEE3] border-b border-[#DFD7C7]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div class="text-center max-w-2xl mx-auto space-y-3 reveal-on-scroll">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF8F3] border border-[#DFD7C7] text-[#111111] text-xs font-bold uppercase tracking-wider font-mono">
          Common Questions
        </div>
        <h2 class="text-3xl sm:text-4xl font-bold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
          Frequently Asked Questions
        </h2>
        <p class="text-[#4A4A4A] text-sm font-sans-clean">
          Technical, legal, and operational answers for business owners, clinic directors, and marketing leaders across India.
        </p>
      </div>

      <div class="space-y-4 reveal-on-scroll stagger-1">
        ${HOME_FAQS.map((faq, idx) => `
          <details class="bg-[#FBF8F3] rounded-xl border border-[#DFD7C7] overflow-hidden" ${idx < 3 ? 'open' : ''}>
            <summary class="flex items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer list-none select-none hover:bg-[#EBE5D8] transition-colors" style="display:flex">
              <h3 class="text-sm font-bold text-[#111111] font-heading flex items-start gap-3 text-left">
                <span class="text-[#D9541E] font-bold tabular-nums flex-shrink-0 font-mono text-xs pt-0.5">${String(idx+1).padStart(2,'0')}</span>
                <span>${faq.q}</span>
              </h3>
              <svg class="w-4 h-4 text-[#D9541E] flex-shrink-0" style="transition:transform 0.2s" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <div class="px-5 sm:px-6 pb-5 pt-0 border-t border-[#DFD7C7]">
              <p class="text-sm text-[#4A4A4A] leading-relaxed font-sans-clean pt-4 pl-7">${faq.a}</p>
            </div>
          </details>
        `).join('')}
      </div>

      <!-- FINAL HIGH-CONVERTING YC CTA CARD -->
      <div class="p-8 sm:p-12 bg-[#111111] text-[#F3EEE3] rounded-2xl border border-[#222222] text-center space-y-4 shadow-xl reveal-on-scroll stagger-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9541E]/20 text-[#D9541E] text-xs font-bold uppercase font-mono border border-[#D9541E]/30">
          Start Free Today
        </div>
        <h3 class="font-bold text-2xl sm:text-3xl text-[#F3EEE3] font-heading tracking-tight">More Reviews. Higher Rankings. Zero Manual Work.</h3>
        <p class="text-xs sm:text-sm text-[#CFC5B2] max-w-lg mx-auto font-sans-clean leading-relaxed">
          Start with a 14-day free trial. Instant UPI setup, zero setup fee, and cancel anytime with a single click.
        </p>
        <div class="pt-2 flex flex-wrap justify-center gap-3">
          <a href="/signup" class="px-6 py-3 bg-[#D9541E] hover:bg-[#BF4615] text-white font-bold text-xs sm:text-sm rounded-[10px] shadow-sm transition-all btn-lift">
            Start Free — 14 Days →
          </a>
          <a href="/pricing" class="px-6 py-3 bg-[#FBF8F3] hover:bg-[#EBE5D8] text-[#111111] font-bold text-xs sm:text-sm rounded-[10px] transition-all border border-[#DFD7C7]">
            See Pricing →
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
        b.className = 'vert-tab px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#FBF8F3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]';
      });
      document.getElementById('tab-' + vert).className = 'vert-tab active px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all bg-[#111111] text-[#F3EEE3] shadow-sm';

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
      document.getElementById('vertStaffName').innerHTML = getSvgIcon('staff', 'w-3.5 h-3.5 text-[#D9541E]') + ' <span>' + data.staff + '</span>';
      document.getElementById('vertReviewDraft').innerText = data.draft;
      document.getElementById('vertBizHeader').innerText = data.bizHeader;
      document.getElementById('vertAutopilotReply').innerText = data.reply;
      document.getElementById('vertKeywordsTag').innerText = data.keywords;
      document.getElementById('vertIncentiveTag').innerText = data.incentive;

      const pillsHtml = data.tags.map((t, i) => \`<span class="px-2.5 py-1 rounded-lg \${i === 0 ? 'bg-[#D9541E] text-white' : 'bg-[#FBF8F3] border border-[#DFD7C7] text-[#111111]'} font-semibold">\${t}</span>\`).join('');
      document.getElementById('vertTagPills').innerHTML = pillsHtml;
    }

    // 2. 3D Material Switcher
    function setMaterial(type) {
      const stand = document.getElementById('stand3D');
      const badge = document.getElementById('materialBadge');
      document.querySelectorAll('.mat-btn').forEach(b => {
        b.classList.remove('bg-[#111111]', 'text-[#F3EEE3]', 'shadow-xs');
        b.classList.add('text-[#4A4A4A]');
      });
      event.target.classList.add('bg-[#111111]', 'text-[#F3EEE3]', 'shadow-xs');
      event.target.classList.remove('text-[#4A4A4A]');

      if (type === 'acrylic') {
        stand.className = 'w-full max-w-sm rounded-2xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-[#111111] text-[#F3EEE3] shadow-2xl border border-[#222222]';
        badge.innerText = 'Frosted Cast Acrylic';
      } else if (type === 'gold') {
        stand.className = 'w-full max-w-sm rounded-2xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-[#2B1B0E] to-[#111111] text-[#F7DDD3] shadow-2xl border border-[#D9541E]';
        badge.innerText = 'Brushed Champagne Gold';
      } else if (type === 'walnut') {
        stand.className = 'w-full max-w-sm rounded-2xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-gradient-to-br from-[#1C1611] to-[#111111] text-[#EBE5D8] shadow-2xl border border-[#8A310D]';
        badge.innerText = 'Solid Matte Walnut Wood';
      } else if (type === 'obsidian') {
        stand.className = 'w-full max-w-sm rounded-2xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-[#0A0A0A] text-[#F3EEE3] shadow-2xl border border-[#222222]';
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
        b.className = 'dialect-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#F3EEE3] text-[#111111] border border-[#DFD7C7] hover:bg-[#EBE5D8]';
      });
      const activeBtn = document.getElementById('dBtn-' + d);
      if (d === 'complaint') {
        activeBtn.className = 'dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#D9541E] text-white';
      } else {
        activeBtn.className = 'dialect-btn active px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-[#111111] text-[#F3EEE3]';
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
        document.getElementById('dStatusBadge').className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-[#D9541E] text-white font-bold';
      } else {
        document.getElementById('dStatusBadge').className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-[#111111] text-[#F3EEE3] font-bold';
      }
    }

    // 4. Ambient Particle Canvas Animation (Burnt Orange palette)
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

      const particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1
      }));

      function render() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#D9541E';
        ctx.strokeStyle = 'rgba(217, 84, 30, 0.08)';

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
        stand.style.transform = 'perspective(1000px) rotateX(' + (-y * 12).toFixed(2) + 'deg) rotateY(' + (x * 12).toFixed(2) + 'deg)';
      });
      container.addEventListener('mouseleave', () => {
        stand.style.transform = 'perspective(1000px) rotateX(10deg) rotateY(-12deg)';
      });
    })();
  </script>
  `;
}

module.exports = { renderHomePage, HOME_FAQS };

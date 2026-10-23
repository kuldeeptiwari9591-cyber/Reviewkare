// Master Swiss Minimalist Homepage with 3D/2.5D Interactive Visuals & High-Trust Proof
const { getSvgIcon, getStarRatingSvg } = require('./icons.js');

function renderHomePage(store) {
  return `
  <!-- Ambient 3D Interactive Particle Background Canvas -->
  <div class="relative overflow-hidden bg-white">
    <canvas id="heroParticles" class="absolute inset-0 pointer-events-none opacity-40 z-0" aria-hidden="true"></canvas>

    <!-- Top Announcement Bar -->
    <div class="relative z-10 bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center border-b border-slate-800">
      <div class="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-bold uppercase tracking-wider text-[10px]">
          NEW FOR 2026
        </span>
        <span>India DPDP Act 2023 & NMC Compliant Review Autopilot for Healthcare & Salons</span>
        <a href="/security" class="font-bold text-brand-400 hover:text-brand-300 underline ml-1">Read Security Whitepaper &rarr;</a>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="relative z-10 pt-12 pb-16 sm:pt-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left Hero Copy -->
        <div class="lg:col-span-7 space-y-6 text-left">
          
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Trusted by 140+ Clinics & Salons in Bengaluru, Mumbai & Delhi NCR</span>
          </div>

          <h1 class="text-4xl sm:text-6xl font-black text-slate-950 font-heading tracking-tight leading-[1.1]" style="text-wrap: balance;">
            Dominate Google 3-Pack with Autonomous Review AI.
          </h1>

          <p class="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            Turn every in-clinic patient visit into a 5-star Google review in 30 seconds. Replyo automatically replies to 5★ reviews with local SEO keywords in 4 minutes, and quarantines negative reviews for 1-tap WhatsApp owner approval.
          </p>

          <!-- Primary Call to Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a href="/login?demo=true" class="min-h-[48px] px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span>Explore Live Clinic Demo (1-Click)</span>
              ${getSvgIcon('arrowRight', 'w-4 h-4')}
            </a>
            <a href="/free-audit" class="min-h-[48px] px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
              ${getSvgIcon('search', 'w-4 h-4 text-brand-600')}
              <span>Audit My Google 3-Pack Rank</span>
            </a>
          </div>

          <!-- Proof Metrics Bar -->
          <div class="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-left">
            <div>
              <div class="text-2xl font-black text-slate-950 font-heading tabular-nums">4 Mins</div>
              <div class="text-[11px] text-slate-500 font-medium">Autopilot Reply Jitter</div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-950 font-heading tabular-nums">0%</div>
              <div class="text-[11px] text-slate-500 font-medium">Legal Fault Admitted</div>
            </div>
            <div>
              <div class="text-2xl font-black text-slate-950 font-heading tabular-nums">22.4%</div>
              <div class="text-[11px] text-slate-500 font-medium">In-Clinic QR Scan-to-Review</div>
            </div>
          </div>

        </div>

        <!-- Right 3D Interactive QR Counter Stand Preview -->
        <div class="lg:col-span-5 flex flex-col items-center">
          
          <!-- 3D Perspective Card Container -->
          <div id="stand3D" class="w-full max-w-sm rounded-3xl p-6 transition-all duration-200 card-3d relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl border border-slate-800" style="perspective: 1000px;">
            
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-brand-400"></span>
                <span id="materialBadge" class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Frosted Cast Acrylic</span>
              </div>
              <span class="text-[10px] text-slate-400 font-mono">NFC + QR ENABLED</span>
            </div>

            <!-- Clinic Brand Lockup -->
            <div class="text-center py-6 space-y-2">
              <div class="text-xs uppercase tracking-widest font-bold text-brand-400">Dr. Sharma Dental & Implant Clinic</div>
              <h2 class="text-lg font-black font-heading text-white">How was your visit today?</h2>
              <p class="text-[11px] text-slate-300">Tap your phone or scan below • No app download required</p>
            </div>

            <!-- QR Target Mockup with 2.5D Glow -->
            <div class="bg-white p-4 rounded-2xl shadow-inner max-w-[180px] mx-auto text-slate-900 text-center space-y-2">
              <div class="w-32 h-32 mx-auto bg-slate-950 rounded-xl p-2.5 flex flex-col items-center justify-between">
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-brand-400 rounded-sm"></div>
                  <div class="w-6 h-6 border-2 border-brand-400 rounded-sm"></div>
                </div>
                <div class="text-[9px] font-black text-brand-400 tracking-tighter">REPLYO AI</div>
                <div class="flex justify-between w-full">
                  <div class="w-6 h-6 border-2 border-brand-400 rounded-sm"></div>
                  <div class="w-2 h-2 bg-brand-400 rounded-full"></div>
                </div>
              </div>
              <div class="text-[10px] font-bold text-slate-800">Scan for 30-sec Google Review</div>
            </div>

            <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span>Indiranagar 100ft Rd</span>
              <span class="text-amber-400 font-bold">4.9 ★★★★★ (143)</span>
            </div>

          </div>

          <!-- Material Switcher Controls -->
          <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button type="button" onclick="setMaterial('acrylic')" class="mat-btn active px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all bg-white text-slate-900 shadow-sm">
              Frosted Acrylic
            </button>
            <button type="button" onclick="setMaterial('gold')" class="mat-btn px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all text-slate-600 hover:text-slate-900">
              Brushed Gold
            </button>
            <button type="button" onclick="setMaterial('walnut')" class="mat-btn px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all text-slate-600 hover:text-slate-900">
              Matte Walnut
            </button>
            <button type="button" onclick="setMaterial('obsidian')" class="mat-btn px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all text-slate-600 hover:text-slate-900">
              Ceramic Black
            </button>
          </div>

        </div>

      </div>
    </section>
  </div>

  <!-- Real-Time Interactive Google 3-Pack Simulator -->
  <section class="py-16 bg-slate-50 border-t border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-900 text-xs font-bold uppercase tracking-wider">
          ${getSvgIcon('localPack', 'w-4 h-4 text-brand-700')} Google Maps Algorithm Decoded
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Why #1 Local 3-Pack Rank Captures 48% of All New Patients
        </h2>
        <p class="text-slate-600 text-sm">
          When a patient in Indiranagar or Koramangala searches <em>“best dental clinic near me”</em>, Google highlights only the top 3 businesses based on reply speed, keyword density, and review freshness.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <!-- Live Toggle Widget -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-700">Google Local 3-Pack Simulation: Bengaluru</span>
            <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button type="button" id="btnBefore" onclick="toggleSimState(false)" class="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900">Without Replyo</button>
              <button type="button" id="btnAfter" onclick="toggleSimState(true)" class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">With Replyo Autopilot</button>
            </div>
          </div>

          <!-- The Dynamic SERP Card -->
          <div id="simClinicCard" class="p-5 rounded-2xl border-2 transition-all duration-300 bg-emerald-50/50 border-emerald-500 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <h3 id="simClinicName" class="text-base font-extrabold text-slate-900 font-heading">Dr. Sharma Dental & Implant Clinic</h3>
              <span id="simRankBadge" class="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">Rank #1 in 3-Pack</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span id="simRating" class="font-bold text-amber-500">4.9 ★★★★★</span>
              <span id="simCount" class="text-slate-500 font-medium">(143 reviews)</span>
              <span class="text-slate-300">•</span>
              <span class="text-slate-600">Indiranagar 100ft Rd</span>
            </div>
            <p id="simSnippet" class="text-xs text-slate-600 leading-relaxed">
              “Dr. Sharma explained the dental implant clearly. Anesthesia was painless and clinic hygiene is 10/10.”
            </p>
            <div id="simTags" class="pt-2 flex flex-wrap gap-2 text-[11px] font-medium text-emerald-800">
              <span class="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">Autopilot Reply: 3.8 mins</span>
              <span class="bg-white/80 px-2 py-0.5 rounded border border-emerald-200">Local SEO Keywords: Root Canal, Dental Implants</span>
            </div>
          </div>

          <!-- Secondary Competitors -->
          <div class="space-y-2 opacity-75">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700">Apollo Dental Indiranagar (4.4★, 89 reviews)</span>
              <span class="text-slate-500">Rank #2 • Reply delay: 4 days</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span class="font-bold text-slate-700">Clove Dental Indiranagar (4.3★, 112 reviews)</span>
              <span class="text-slate-500">Rank #3 • Reply delay: 8 days</span>
            </div>
          </div>

        </div>

        <!-- Calculated Financial Impact Box -->
        <div class="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d space-y-6">
          <h3 class="text-base font-bold text-slate-900 font-heading">Calculated Organic Patient Growth</h3>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Monthly In-Clinic Patients</span>
                <span id="calcPatientVal" class="text-brand-600">350 Patients</span>
              </div>
              <input type="range" id="calcSlider" min="100" max="1200" step="50" value="350" oninput="updateCalculator(this.value)" class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600">
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-600">Traditional Review Intake (1.5%):</span>
                <span id="calcTradReviews" class="font-bold text-slate-900">5 reviews / mo</span>
              </div>
              <div class="flex justify-between text-brand-700 font-bold">
                <span>With Replyo QR Flow (22%):</span>
                <span id="calcReplyoReviews" class="font-extrabold text-brand-600">77 reviews / mo (+15x)</span>
              </div>
            </div>

            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <div class="text-[11px] font-bold text-emerald-950 uppercase">Projected Extra Monthly Revenue</div>
              <div id="calcRevenueLift" class="text-2xl font-black text-emerald-700 font-heading tabular-nums">₹1,85,000 / mo</div>
              <p class="text-[11px] text-emerald-800">Derived from 37 extra organic OPD bookings at ₹5,000 avg ticket.</p>
            </div>
          </div>

          <a href="/pricing" class="w-full min-h-[44px] flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            <span>View UPI & GST Subscription Plans &rarr;</span>
          </a>
        </div>

      </div>

    </div>
  </section>

  <!-- How It Works: 4-Step Engineering Architecture -->
  <section class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
        End-to-End Workflow
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
        From In-Clinic Visit to 5-Star SEO Reply in 4 Minutes
      </h2>
      <p class="text-slate-600 text-sm">
        Zero login barrier for patients. Zero manual writing for clinic doctors. Zero legal liability risk.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
        <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-black flex items-center justify-center">1</div>
        <h3 class="font-bold text-sm text-slate-900 font-heading">30-Sec In-Clinic QR</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          Patient scans the acrylic stand at checkout. The <100KB page loads instantly. They tap service tags (e.g. "Root Canal", "Dr. Sneha", "Painless").
        </p>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
        <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-black flex items-center justify-center">2</div>
        <h3 class="font-bold text-sm text-slate-900 font-heading">AI Review Synthesis</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          The natural language engine turns choices into an authentic patient paragraph, copies it to their clipboard, and launches Google Maps in 1 tap.
        </p>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
        <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-black flex items-center justify-center">3</div>
        <h3 class="font-bold text-sm text-slate-900 font-heading">4-Min Autopilot Reply</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          When the 5★ review hits Google, Replyo detects the language/dialect (Hindi, Hinglish, English) and auto-posts an SEO-optimized response in 4 minutes.
        </p>
      </div>

      <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-black flex items-center justify-center">4</div>
        <h3 class="font-bold text-sm text-slate-900 font-heading">1-Tap Owner Shield</h3>
        <p class="text-xs text-slate-600 leading-relaxed">
          If a 1-3★ review appears, it is quarantined immediately. A WhatsApp alert sends a zero-liability de-escalation draft for 1-tap doctor approval.
        </p>
      </div>
    </div>
  </section>

  <!-- Clinic Case Studies & Real Results -->
  <section class="py-16 bg-slate-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
          Clinically Verified Impact
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
          Real Bengaluru Clinics. Real 3-Pack Growth.
        </h2>
        <p class="text-slate-400 text-xs sm:text-sm">
          Verified metrics from flagship multi-chair healthcare practices.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4 card-3d">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm text-white">Dr. Sharma Dental</h3>
              <p class="text-[11px] text-slate-400">Indiranagar, Bengaluru</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">#1 3-Pack</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-center py-2 bg-slate-900/60 rounded-xl">
            <div>
              <div class="text-xs text-slate-400">Reviews</div>
              <div class="text-lg font-black text-white font-heading">34 &rarr; 143</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Google Rating</div>
              <div class="text-lg font-black text-amber-400 font-heading">4.2 &rarr; 4.9★</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 italic leading-relaxed">
            “Replyo solved our biggest problem: our happy patients never reviewed us while occasional complainers did. The QR flow transformed our walk-in volume.”
          </p>
          <div class="text-[11px] font-bold text-brand-400">— Dr. Ananya Sharma, Chief Implantologist</div>
        </div>

        <div class="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4 card-3d">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm text-white">Aura Skin & Laser</h3>
              <p class="text-[11px] text-slate-400">Koramangala 4th Block</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">#1 3-Pack</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-center py-2 bg-slate-900/60 rounded-xl">
            <div>
              <div class="text-xs text-slate-400">Reviews</div>
              <div class="text-lg font-black text-white font-heading">61 &rarr; 218</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Google Rating</div>
              <div class="text-lg font-black text-amber-400 font-heading">4.1 &rarr; 4.8★</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 italic leading-relaxed">
            “The Hinglish dialect matching is magical. Patients write naturally, and Replyo responds with the exact same warmth and local aesthetic keywords.”
          </p>
          <div class="text-[11px] font-bold text-brand-400">— Dr. Vikram Rao, Consulting Dermatologist</div>
        </div>

        <div class="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-4 card-3d">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-sm text-white">Envy Salon & Spa</h3>
              <p class="text-[11px] text-slate-400">HSR Layout Sector 1</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">#2 3-Pack</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-center py-2 bg-slate-900/60 rounded-xl">
            <div>
              <div class="text-xs text-slate-400">Reviews</div>
              <div class="text-lg font-black text-white font-heading">88 &rarr; 312</div>
            </div>
            <div>
              <div class="text-xs text-slate-400">Google Rating</div>
              <div class="text-lg font-black text-amber-400 font-heading">4.3 &rarr; 4.9★</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 italic leading-relaxed">
            “Our hair stylists love the staff attribution leaderboard. When their names are mentioned in 5★ Google reviews, they earn automatic bonus tips!”
          </p>
          <div class="text-[11px] font-bold text-brand-400">— Priya Nair, Salon Operations Director</div>
        </div>

      </div>

    </div>
  </section>

  <!-- Interactive Three-Tier Rupee Pricing Preview -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Straightforward Indian Pricing
        </div>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
          No Hidden Fees. 100% Tax Deductible with GST Invoices.
        </h2>
        <p class="text-slate-600 text-xs sm:text-sm">
          Includes 14-day risk-free trial. UPI, NetBanking, and all Corporate Cards supported via Razorpay.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        
        <!-- Starter Plan -->
        <div class="p-6 rounded-3xl border border-slate-200 bg-white card-3d space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-900">Starter Clinic</h3>
            <p class="text-xs text-slate-500 mt-0.5">Single practitioner or standalone clinic</p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-slate-950 font-heading">₹749</span>
            <span class="text-xs text-slate-500">/ month + GST</span>
          </div>
          <ul class="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-4">
            <li class="flex items-center gap-2">✓ Up to 50 AI review replies / mo</li>
            <li class="flex items-center gap-2">✓ 1-Tap Negative WhatsApp Shield</li>
            <li class="flex items-center gap-2">✓ Printable Counter QR Poster (PDF)</li>
            <li class="flex items-center gap-2">✓ Hinglish & English Dialect Support</li>
          </ul>
          <a href="/login?demo=true" class="w-full min-h-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors">
            Start Free Pilot &rarr;
          </a>
        </div>

        <!-- Pro Clinic Plan (Featured) -->
        <div class="p-6 rounded-3xl border-2 border-brand-500 bg-gradient-to-b from-brand-50/40 to-white card-3d space-y-4 relative shadow-md">
          <div class="absolute -top-3 right-6 px-3 py-0.5 bg-brand-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <div>
            <h3 class="font-bold text-base text-slate-900">Pro Clinic & Salon</h3>
            <p class="text-xs text-slate-500 mt-0.5">Multi-chair clinic or premium brand</p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-brand-600 font-heading">₹1,349</span>
            <span class="text-xs text-slate-500">/ month + GST</span>
          </div>
          <ul class="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-4">
            <li class="flex items-center gap-2">✓ Unlimited AI review replies</li>
            <li class="flex items-center gap-2">✓ 1 Free Frosted Acrylic QR Stand</li>
            <li class="flex items-center gap-2">✓ Staff Attribution & Tip Leaderboard</li>
            <li class="flex items-center gap-2">✓ Google 3-Pack Local Rank Simulator</li>
            <li class="flex items-center gap-2">✓ Hindi, Tamil, Telugu & Kannada</li>
          </ul>
          <a href="/login?demo=true" class="w-full min-h-[44px] flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
            Activate Pro Pilot &rarr;
          </a>
        </div>

        <!-- Multi-Branch Chain -->
        <div class="p-6 rounded-3xl border border-slate-200 bg-white card-3d space-y-4">
          <div>
            <h3 class="font-bold text-base text-slate-900">Multi-Branch Chain</h3>
            <p class="text-xs text-slate-500 mt-0.5">Healthcare groups & franchise networks</p>
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-slate-950 font-heading">₹1,949</span>
            <span class="text-xs text-slate-500">/ location / mo</span>
          </div>
          <ul class="text-xs text-slate-600 space-y-2 border-t border-b border-slate-100 py-4">
            <li class="flex items-center gap-2">✓ Centralized Multi-Branch Switcher</li>
            <li class="flex items-center gap-2">✓ Consolidated GST Billing Invoices</li>
            <li class="flex items-center gap-2">✓ Dedicated WhatsApp Account Manager</li>
            <li class="flex items-center gap-2">✓ Custom ERP / Practice Management Webhooks</li>
          </ul>
          <a href="/book-demo" class="w-full min-h-[44px] flex items-center justify-center bg-dark-950 hover:bg-brand-600 text-white font-bold text-xs rounded-xl transition-colors">
            Book Enterprise Demo &rarr;
          </a>
        </div>

      </div>

    </div>
  </section>

  <!-- Client-side Interactive Scripts -->
  <script>
    // 3D Stand Material Switcher
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
        badge.innerText = 'Matte Solid Walnut Wood';
      } else if (type === 'obsidian') {
        stand.className = 'w-full max-w-sm rounded-3xl p-6 transition-all duration-300 card-3d relative overflow-hidden bg-black text-slate-100 shadow-2xl border border-slate-800';
        badge.innerText = 'Ceramic Black Obsidian';
      }
    }

    // Interactive SERP Simulator
    function toggleSimState(withReplyo) {
      const card = document.getElementById('simClinicCard');
      const rank = document.getElementById('simRankBadge');
      const rating = document.getElementById('simRating');
      const count = document.getElementById('simCount');
      const tags = document.getElementById('simTags');
      const btnBefore = document.getElementById('btnBefore');
      const btnAfter = document.getElementById('btnAfter');

      if (withReplyo) {
        card.className = 'p-5 rounded-2xl border-2 transition-all duration-300 bg-emerald-50/50 border-emerald-500 shadow-sm space-y-2';
        rank.className = 'px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white';
        rank.innerText = 'Rank #1 in 3-Pack';
        rating.innerText = '4.9 ★★★★★';
        count.innerText = '(143 reviews)';
        tags.classList.remove('hidden');
        btnAfter.className = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm';
        btnBefore.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
      } else {
        card.className = 'p-5 rounded-2xl border transition-all duration-300 bg-slate-50 border-slate-200 space-y-2';
        rank.className = 'px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700';
        rank.innerText = 'Rank #4 (Outside 3-Pack)';
        rating.innerText = '4.1 ★★★★☆';
        count.innerText = '(34 reviews)';
        tags.classList.add('hidden');
        btnBefore.className = 'px-3 py-1.5 rounded-lg bg-slate-800 text-white shadow-sm';
        btnAfter.className = 'px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
      }
    }

    // Dynamic Financial Calculator
    function updateCalculator(val) {
      document.getElementById('calcPatientVal').innerText = val + ' Patients';
      const tradReviews = Math.round(val * 0.015);
      const replyoReviews = Math.round(val * 0.22);
      document.getElementById('calcTradReviews').innerText = tradReviews + ' reviews / mo';
      document.getElementById('calcReplyoReviews').innerText = replyoReviews + ' reviews / mo (+' + Math.round(replyoReviews / (tradReviews || 1)) + 'x)';
      
      const extraPatients = Math.round(replyoReviews * 0.48);
      const extraRev = extraPatients * 5000;
      document.getElementById('calcRevenueLift').innerText = '₹' + extraRev.toLocaleString('en-IN') + ' / mo';
    }

    // Ambient Particle Canvas Animation
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
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1
      }));

      function render() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';

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
  </script>
  `;
}

module.exports = { renderHomePage };

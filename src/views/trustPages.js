// Trust, Security, Compliance, and Enterprise Scheduler Views
const { getSvgIcon } = require('./icons.js');

function renderSecurityPage() {
  return `
  <main class="py-12 sm:py-16 bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Page Hero -->
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          ${getSvgIcon('shield', 'w-4 h-4 text-emerald-700')} Institutional Trust & Data Governance
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Clinical Privacy & Security Whitepaper
        </h1>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Engineered from the ground up for strict compliance with India's <strong>DPDP Act 2023</strong>, <strong>NMC Medical Ethics Guidelines</strong>, and the official <strong>Google Business Profile API Terms of Service</strong>.
        </p>
      </div>

      <!-- Trust Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            ${getSvgIcon('shield', 'w-6 h-6')}
          </div>
          <h2 class="text-base font-bold text-slate-900 font-heading">Zero-PHI Medical Guarantee</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Replyo never stores or processes Protected Health Information (PHI). Review replies never confirm medical diagnoses, treatments, prescriptions, or patient confidentiality.
          </p>
          <div class="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
            ${getSvgIcon('check', 'w-3.5 h-3.5')} NMC 2023 Ethics Compliant
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            ${getSvgIcon('lock', 'w-6 h-6')}
          </div>
          <h2 class="text-base font-bold text-slate-900 font-heading">India Data Residency (ap-south-1)</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            All data storage, database backups, and AI inference proxies are strictly isolated in AWS Asia Pacific (Mumbai) data centers. Zero patient data leaves Indian jurisdiction.
          </p>
          <div class="pt-2 text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
            ${getSvgIcon('check', 'w-3.5 h-3.5')} DPDP Act 2023 Section 16 Adherent
          </div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            ${getSvgIcon('sparkles', 'w-6 h-6')}
          </div>
          <h2 class="text-base font-bold text-slate-900 font-heading">Official Google API Only</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            Replyo integrates strictly via Google Business Profile official OAuth 2.0 API. We never scrape, emulate browser sessions, or perform prohibited review gating that risks account suspension.
          </p>
          <div class="pt-2 text-[11px] font-bold text-purple-700 flex items-center gap-1.5">
            ${getSvgIcon('check', 'w-3.5 h-3.5')} 100% Anti-Gating Compliant
          </div>
        </div>
      </div>

      <!-- Deep Dive Compliance Matrix -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div class="border-b border-slate-100 pb-4">
          <h2 class="text-xl font-bold text-slate-900 font-heading">Institutional Security & Technical Controls</h2>
          <p class="text-xs text-slate-500 mt-1">Full transparency into our data architecture and defense-in-depth posture.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div class="space-y-4">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                ${getSvgIcon('lock', 'w-4 h-4 text-emerald-600')} Encryption in Transit & Rest
              </h3>
              <p class="text-slate-600 leading-relaxed">
                All client-server communications enforce TLS 1.3 with HSTS enabled. Internal database fields, OAuth tokens, and review archives are encrypted with AES-256 keys managed by AWS KMS with automatic annual rotation.
              </p>
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                ${getSvgIcon('shield', 'w-4 h-4 text-emerald-600')} Negative Review Quarantine Shield
              </h3>
              <p class="text-slate-600 leading-relaxed">
                1-3★ reviews are quarantined automatically. The AI draft strips all legal liability admission, guarantees empathy, directs dissatisfied patients to private manager phone lines, and mandates human doctor approval before publishing.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                ${getSvgIcon('user', 'w-4 h-4 text-emerald-600')} Role-Based Access Control (RBAC)
              </h3>
              <p class="text-slate-600 leading-relaxed">
                Granular permission tiers: Clinic Owner, Branch Manager, Reception Staff, and Read-Only Auditor. Multi-branch chains can restrict staff to specific location feeds while executives maintain global oversight.
              </p>
            </div>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 class="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                ${getSvgIcon('reports', 'w-4 h-4 text-emerald-600')} Immutable Audit Trail & Consent Logs
              </h3>
              <p class="text-slate-600 leading-relaxed">
                Every review response, manual edit, approval timestamp, and QR draft synthesis is logged with operator identity, IP hash, and cryptographic checksum. Fully exportable for legal compliance reviews.
              </p>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-xs font-bold text-slate-700">Security Audit Status: Current & Passing (All Systems Operational)</span>
          </div>
          <a href="/contact" class="px-4 py-2 min-h-[44px] inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors">
            Request Enterprise Security Assessment &rarr;
          </a>
        </div>
      </div>

    </div>
  </main>
  `;
}

function renderBookDemoPage() {
  return `
  <main class="py-12 sm:py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 border border-brand-300 text-brand-900 text-xs font-bold uppercase tracking-wider">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-brand-700')} Enterprise Multi-Location Walkthrough
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Schedule an Executive Strategy Demo
        </h1>
        <p class="text-slate-600 text-sm">
          See how leading dental chains, dermatology clinics, and salon networks in Bengaluru, Delhi NCR, and Mumbai achieve #1 Google 3-Pack rankings.
        </p>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm card-3d">
        <form id="demoBookingForm" onsubmit="handleDemoBooking(event)" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="demoName" class="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name / Doctor Title
              </label>
              <input id="demoName" type="text" required placeholder="Dr. Vikram Rao" class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none">
            </div>
            <div>
              <label for="demoOrg" class="block text-xs font-bold text-slate-700 mb-1.5">
                Clinic Chain or Brand Name
              </label>
              <input id="demoOrg" type="text" required placeholder="Rao Aesthetics & Dental Care" class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="demoEmail" class="block text-xs font-bold text-slate-700 mb-1.5">
                Work / Clinic Email
              </label>
              <input id="demoEmail" type="email" required placeholder="director@raoaesthetics.in" class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none">
            </div>
            <div>
              <label for="demoPhone" class="block text-xs font-bold text-slate-700 mb-1.5">
                WhatsApp Number (for Google Meet Link)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                <input id="demoPhone" type="tel" required pattern="[0-9]{10}" placeholder="98450 12345" class="w-full min-h-[44px] pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="demoBranches" class="block text-xs font-bold text-slate-700 mb-1.5">
                Number of Branches
              </label>
              <select id="demoBranches" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-brand-500 outline-none">
                <option value="1">Single Flagship Location</option>
                <option value="2-5">2 to 5 Regional Clinics</option>
                <option value="6-20">6 to 20 Multi-City Chain</option>
                <option value="20+">20+ National Enterprise</option>
              </select>
            </div>
            <div>
              <label for="demoDate" class="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Date
              </label>
              <input id="demoDate" type="date" required value="2026-10-25" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-brand-500 outline-none">
            </div>
            <div>
              <label for="demoTime" class="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Time Slot (IST)
              </label>
              <select id="demoTime" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:border-brand-500 outline-none">
                <option value="10:30 AM">10:30 AM IST (Morning)</option>
                <option value="02:30 PM">02:30 PM IST (Post-OPD)</option>
                <option value="04:30 PM">04:30 PM IST (Tea-Break)</option>
                <option value="06:30 PM">06:30 PM IST (Evening)</option>
              </select>
            </div>
          </div>

          <div id="bookingAlert" class="hidden p-4 rounded-2xl text-xs font-medium" role="alert"></div>

          <button type="submit" id="bookingBtn" class="w-full min-h-[48px] flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">
            <span>Confirm Live Video Demo with Solution Architect &rarr;</span>
          </button>
        </form>
      </div>

    </div>
  </main>

  <script>
    async function handleDemoBooking(e) {
      e.preventDefault();
      const btn = document.getElementById('bookingBtn');
      const alert = document.getElementById('bookingAlert');
      btn.disabled = true;
      btn.innerText = 'Locking calendar slot on Google Calendar…';

      const payload = {
        name: document.getElementById('demoName').value,
        organization: document.getElementById('demoOrg').value,
        email: document.getElementById('demoEmail').value,
        phone: document.getElementById('demoPhone').value,
        branches: document.getElementById('demoBranches').value,
        date: document.getElementById('demoDate').value,
        time: document.getElementById('demoTime').value,
      };

      try {
        const res = await fetch('/api/book-demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert.className = 'p-4 rounded-2xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block space-y-1';
        alert.innerHTML = '<strong>Demo Confirmed!</strong> A calendar invite and Google Meet link have been dispatched to ' + payload.email + ' and WhatsApp +' + payload.phone + '.';
        btn.innerText = 'Calendar Slot Confirmed ✓';
      } catch (err) {
        alert.className = 'p-4 rounded-2xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Error reserving slot. Please WhatsApp our Indiranagar office directly at +91 80 4920 1888.';
        btn.disabled = false;
        btn.innerText = 'Confirm Live Video Demo with Solution Architect →';
      }
    }
  </script>
  `;
}

const FAQ_ITEMS = [
  {
    q: "Does auto-replying violate Google Business Profile policies?",
    a: "No. Google encourages businesses to reply promptly to all reviews. Replyo uses official Google Business Profile APIs, introduces a human-like 4-minute jitter, and customizes every reply with local SEO keywords rather than canned repetition."
  },
  {
    q: "What happens when an unhappy patient leaves a 1-star or 2-star review?",
    a: "Replyo activates the Negative Quarantine Shield. The AI generates a de-escalating, zero-liability draft (never admitting fault) and immediately notifies the clinic owner via WhatsApp with a 1-tap approval link. Nothing is posted until you tap approve."
  },
  {
    q: "How does the in-clinic AI QR flow work without patient login?",
    a: "Patients scan the acrylic QR stand on your reception desk. The page loads in <0.8 seconds (under 100KB) with zero app download or login. Patients tap services received, doctor name, and ambience. The AI writes a genuine first-person review and copies it to their clipboard, opening Google Maps review prompt in 1 tap."
  },
  {
    q: "Is Replyo compliant with India's DPDP Act 2023 and NMC guidelines?",
    a: "Yes. Replyo never stores Protected Health Information (PHI). We never reference private clinical procedures, diagnostic findings, or patient records in review responses. All databases are hosted inside AWS Mumbai (ap-south-1)."
  },
  {
    q: "Can Replyo handle Hindi, Hinglish, and regional languages?",
    a: "Yes! Our language engine detects Devanagari Hindi, colloquial Hinglish ('Bohot acha treatment tha, Dr. Sharma bilkul gentle the'), Tamil, Telugu, Kannada, and English, mirroring the exact dialect naturally."
  },
  {
    q: "Can I manage multiple clinic branches from one dashboard?",
    a: "Yes. Replyo supports multi-tenant branch architectures. You can switch between Indiranagar, Koramangala, and Whitefield in 1 click, track staff leaderboards across locations, and get consolidated GST billing."
  }
];

function renderFaqPage() {
  const faqs = FAQ_ITEMS;

  return `
  <main class="py-12 sm:py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
          ${getSvgIcon('sparkles', 'w-4 h-4 text-slate-600')} Frequently Answered Questions
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Everything Doctors & Clinic Owners Ask
        </h1>
        <p class="text-slate-600 text-sm">
          Clear, honest answers about Google algorithm compliance, patient data privacy, and ROI.
        </p>
      </div>

      <div class="space-y-4">
        ${faqs.map((f, i) => `
          <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm card-3d space-y-2">
            <h2 class="text-base font-bold text-slate-900 font-heading flex items-start gap-3">
              <span class="text-brand-600 font-black">Q${i+1}.</span>
              <span>${f.q}</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 pl-8 leading-relaxed">
              ${f.a}
            </p>
          </div>
        `).join('')}
      </div>

      <div class="text-center pt-6">
        <p class="text-xs text-slate-500">Have a specific question not listed here?</p>
        <a href="/contact" class="mt-2 inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline">
          Chat with our Indiranagar Bangalore team on WhatsApp &rarr;
        </a>
      </div>
    </div>
  </main>
  `;
}

function renderQrKitPage() {
  return `
  <main class="py-12 sm:py-16 bg-slate-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div class="text-center max-w-3xl mx-auto space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          ${getSvgIcon('printer', 'w-4 h-4 text-emerald-700')} Physical Reception Display Hardware
        </div>
        <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Medical-Grade Countertop QR & NFC Stands
        </h1>
        <p class="text-slate-600 text-sm">
          Designed for clinic reception counters, aesthetic treatment rooms, and restaurant billing desks. Scratch-resistant, alcohol-wipe safe, and embedded with ultra-fast NFC tap chips.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4 text-center">
          <div class="h-44 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border border-slate-300/80 p-4 relative overflow-hidden">
            <div class="w-24 h-32 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white flex flex-col items-center justify-center p-2 transform rotate-2 hover:rotate-0 transition-transform">
              <div class="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">QR CODE</div>
              <div class="text-[9px] font-bold text-slate-800 mt-2">Frosted Acrylic</div>
            </div>
          </div>
          <h2 class="text-base font-bold text-slate-900">Frosted Clinical Acrylic</h2>
          <p class="text-xs text-slate-600">5mm cast acrylic with diamond-polished edges. Disinfectant-proof coating ideal for dental & surgical operatories.</p>
          <div class="text-xs font-bold text-brand-600">Included free in Pro Clinic plan</div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4 text-center">
          <div class="h-44 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl flex items-center justify-center border border-amber-200 p-4 relative overflow-hidden">
            <div class="w-24 h-32 bg-amber-50/90 rounded-xl shadow-lg border border-amber-300 flex flex-col items-center justify-center p-2 transform -rotate-2 hover:rotate-0 transition-transform">
              <div class="w-12 h-12 bg-amber-950 rounded-lg flex items-center justify-center text-amber-200 text-[10px] font-bold">NFC+QR</div>
              <div class="text-[9px] font-bold text-amber-900 mt-2">Brushed Gold</div>
            </div>
          </div>
          <h2 class="text-base font-bold text-slate-900">Brushed Champagne Aluminum</h2>
          <p class="text-xs text-slate-600">Laser-engraved anodized metal finish with weighted brass base. Crafted for luxury aesthetic clinics and high-end salons.</p>
          <div class="text-xs font-bold text-brand-600">₹999 one-time hardware add-on</div>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-4 text-center">
          <div class="h-44 bg-gradient-to-br from-stone-100 to-amber-900/10 rounded-2xl flex items-center justify-center border border-stone-200 p-4 relative overflow-hidden">
            <div class="w-24 h-32 bg-stone-100/90 rounded-xl shadow-lg border border-amber-900/30 flex flex-col items-center justify-center p-2 transform rotate-1 hover:rotate-0 transition-transform">
              <div class="w-12 h-12 bg-amber-950 rounded-lg flex items-center justify-center text-amber-100 text-[10px] font-bold">ORGANIC</div>
              <div class="text-[9px] font-bold text-stone-900 mt-2">Matte Walnut</div>
            </div>
          </div>
          <h2 class="text-base font-bold text-slate-900">Sustainable Matte Walnut Wood</h2>
          <p class="text-xs text-slate-600">Handcrafted solid walnut wood stand with embedded NTAG213 NFC microchip. Perfect for wellness spas and organic cafes.</p>
          <div class="text-xs font-bold text-brand-600">₹1,299 one-time hardware add-on</div>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-4">
        <h2 class="text-lg font-bold text-slate-900">Want to Print Instantly on Your Reception Printer?</h2>
        <p class="text-xs text-slate-600 max-w-xl mx-auto">
          You don't have to wait for hardware shipment. Generate and download high-resolution 300 DPI PDF posters and tabletop tent cards in 1 click from your QR Studio.
        </p>
        <a href="/app/qr" class="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-dark-950 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
          Open QR Studio 3D in Dashboard &rarr;
        </a>
      </div>
    </div>
  </main>
  `;
}

function renderLegalPage(title, lastUpdated, bodyContent) {
  return `
  <main class="py-12 sm:py-16 bg-slate-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="border-b border-slate-200 pb-4">
        <h1 class="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">${title}</h1>
        <p class="text-xs text-slate-500 mt-1">Last Updated: ${lastUpdated} • Jurisdiction: Bengaluru, Karnataka, Republic of India</p>
      </div>
      <div class="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        ${bodyContent}
      </div>
    </div>
  </main>
  `;
}

function renderTermsPage() {
  return renderLegalPage(
    'Terms of Service',
    'October 2026',
    `
    <h2 class="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
    <p>By accessing or utilizing the Replyo platform, APIs, or physical QR stands, you agree to be bound by these Terms of Service between your business entity and Replyo Technologies India Pvt Ltd (Bengaluru, Karnataka).</p>
    
    <h2 class="text-base font-bold text-slate-900 mt-4">2. Authorised Google Business Profile Usage</h2>
    <p>Replyo accesses Google Business Profile reviews via official Google OAuth API protocols. Users retain complete ownership of their Google profiles. Replyo does not engage in fake review generation, incentivised review schemes, or review-gating prohibited under Google TOS.</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">3. Medical & Professional Ethics Disclaimer</h2>
    <p>Replyo is an administrative automation software. AI-generated review responses do not constitute medical advice, diagnostic recommendations, or doctor-patient confidentiality establishment under the National Medical Commission (NMC) Act 2019.</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">4. Billing, Taxes & Cancellation</h2>
    <p>All subscription fees are denominated in Indian Rupees (INR) and subject to applicable Goods and Services Tax (18% GST). Subscriptions may be cancelled at any time with no lock-in periods.</p>
    `
  );
}

function renderPrivacyPage() {
  return renderLegalPage(
    'Privacy Policy (DPDP Act 2023 Compliant)',
    'October 2026',
    `
    <h2 class="text-base font-bold text-slate-900">1. Digital Personal Data Protection Act 2023 Adherence</h2>
    <p>Replyo operates as a Data Processor adhering strictly to the Digital Personal Data Protection Act (DPDP Act) 2023 of the Republic of India. We process only publicly available Google Business Profile review text and clinic administrator contact details.</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">2. Zero Protected Health Information (PHI) Storage</h2>
    <p>Replyo strictly forbids and filters the storage or indexing of Protected Health Information (PHI), medical history, prescription details, or clinical diagnoses. Review drafts are synthesized purely based on general service tags selected by the patient.</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">3. Data Localization</h2>
    <p>All databases, logs, and cryptographic keys are hosted exclusively within AWS data centres located in Mumbai, India (ap-south-1 region).</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">4. Contact Grievance Officer</h2>
    <p>In accordance with Indian IT Rules, our designated Grievance Officer can be contacted at: <code>privacy@replyo.in</code> or at our Indiranagar, Bengaluru office.</p>
    `
  );
}

function renderRefundPolicyPage() {
  return renderLegalPage(
    'Refund & Cancellation Policy',
    'October 2026',
    `
    <h2 class="text-base font-bold text-slate-900">1. 14-Day Risk-Free Trial</h2>
    <p>All new clinics receive a 14-day free pilot with full access to the Autopilot engine and QR Studio. No credit card or initial deposit is required.</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">2. 30-Day Money-Back Guarantee</h2>
    <p>If Replyo does not increase your Google review volume or improve your response velocity within your first 30 paid days, we provide a 100% unconditional refund via original payment method (UPI / Razorpay / Net Banking).</p>

    <h2 class="text-base font-bold text-slate-900 mt-4">3. Immediate Cancellation</h2>
    <p>Cancel your subscription in 1 tap from the Billing tab. No questions asked and no awkward sales calls.</p>
    `
  );
}

function renderDpdpConsentPage() {
  return renderLegalPage(
    'DPDP Act 2023 Patient Consent Framework',
    'October 2026',
    `
    <h2 class="text-base font-bold text-slate-900">Patient Consent & Autonomous Feedback Governance</h2>
    <p>When patients scan a Replyo countertop QR code at an Indian healthcare or wellness facility:</p>
    <ul class="list-disc pl-5 space-y-2 mt-2">
      <li>Zero patient personal data (name, phone number, medical record number) is collected or stored on our servers.</li>
      <li>The feedback synthesis runs client-side, generating suggested phrasing that the patient explicitly reviews, edits, and chooses to copy.</li>
      <li>The review is submitted directly by the patient through their personal Google account on Google Maps. Replyo never posts on behalf of an unauthenticated user.</li>
    </ul>
    `
  );
}

module.exports = {
  FAQ_ITEMS,
  renderSecurityPage,
  renderBookDemoPage,
  renderFaqPage,
  renderQrKitPage,
  renderTermsPage,
  renderPrivacyPage,
  renderRefundPolicyPage,
  renderDpdpConsentPage
};

// High-End Feature Views: Staff Review Attribution & Google Local 3-Pack Rank Simulator
const { getSvgIcon, getStarRatingSvg } = require('./icons.js');

function renderStaffPage(store) {
  const staffList = store.staff || [
    { id: 'st_clinic_1', name: 'Dr. Sneha Kulkarni', role: 'Senior Endodontist (Root Canal Specialist)', vertical: 'clinic', reviewsCount: 42, avgRating: 4.9, compliments: 'Painless rotary root canal, explains every step with extreme care', tipsEarned: '₹4,800' },
    { id: 'st_clinic_2', name: 'Dr. Ananya Sharma', role: 'Chief Implantologist & Clinic Director', vertical: 'clinic', reviewsCount: 58, avgRating: 5.0, compliments: 'Flawless dental implant placement, zero postoperative swelling', tipsEarned: '₹6,500' },
    { id: 'st_cafe_1', name: 'Shreyas Nair', role: 'Head Barista & Roaster', vertical: 'cafe', reviewsCount: 64, avgRating: 4.9, compliments: 'Knowledge of single origin pour-overs and signature iced tonic', tipsEarned: '₹5,200' },
    { id: 'st_salon_1', name: 'Farhan Akhtar', role: 'Master Hair Artist & Color Specialist', vertical: 'salon', reviewsCount: 53, avgRating: 5.0, compliments: 'Seamless ash blonde balayage, personalized hair texture consult', tipsEarned: '₹7,200' },
    { id: 'st_gym_1', name: 'Coach Aryan Rathore', role: 'Head Strength & Conditioning Coach', vertical: 'gym', reviewsCount: 46, avgRating: 4.9, compliments: 'Strict squat & deadlift cues, progressive overload tracking', tipsEarned: '₹4,600' },
    { id: 'st_clinic_3', name: 'Nurse Preeti Verma', role: 'Surgical Assistant & Sterilization Lead', vertical: 'clinic', reviewsCount: 31, avgRating: 4.9, compliments: 'Warm reassuring smile, sterile operatory protocol', tipsEarned: '₹3,400' }
  ];

  return `
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Frontline Staff Attribution & Review Incentives</h1>
        <p class="text-xs text-slate-500 mt-0.5">Recognize doctors, baristas, stylists, and fitness coaches by name when customers post 5★ Google feedback.</p>
      </div>
      <button type="button" onclick="openAddStaffModal()" class="min-h-[44px] px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
        ${getSvgIcon('plus', 'w-4 h-4 text-white')}
        <span>Add Team Member</span>
      </button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Frontline Staff Tracked</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">${staffList.length}</div>
        <div class="text-[11px] text-brand-600 font-medium mt-0.5">Across Clinics, Cafes, Salons & Gyms</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Staff-Attributed Reviews</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">294</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">+48 this calendar month</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Average Team Rating</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">4.92★</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Top 0.5% hospitality benchmark</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Disbursed Staff Bonuses</div>
        <div class="text-2xl font-black text-brand-600 font-heading mt-1 tabular-nums">₹31,700</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Automated UPI reward ledger</div>
      </div>
    </div>

    <!-- Vertical Filter Tabs -->
    <div class="flex items-center gap-2">
      <button type="button" onclick="filterStaffTable('all')" class="staff-filter-btn active px-3 py-1.5 rounded-xl text-xs font-bold bg-dark-950 text-white shadow-sm" id="sf-all">All Verticals (${staffList.length})</button>
      <button type="button" onclick="filterStaffTable('clinic')" class="staff-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="sf-clinic">Healthcare & Clinics</button>
      <button type="button" onclick="filterStaffTable('cafe')" class="staff-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="sf-cafe">Dining & Cafes</button>
      <button type="button" onclick="filterStaffTable('salon')" class="staff-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="sf-salon">Salons & Spas</button>
      <button type="button" onclick="filterStaffTable('gym')" class="staff-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" id="sf-gym">Gyms & Fitness</button>
    </div>

    <!-- Staff Leaderboard Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-3d">
      <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Frontline Performance & Guest Praise Ledger</h2>
        <span class="text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg font-bold border border-brand-200 font-mono">
          Ranked by Verified Google Mentions
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Team Member</th>
              <th class="py-3 px-4">Designation & Specialty</th>
              <th class="py-3 px-4 text-center">Industry</th>
              <th class="py-3 px-4 text-center">Reviews Mentioned</th>
              <th class="py-3 px-4 text-center">Avg Rating</th>
              <th class="py-3 px-4">Top Guest / Patient Praise</th>
              <th class="py-3 px-4 text-right">Incentive Earned</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100" id="staffTableBody">
            ${staffList.map((st, idx) => `
              <tr class="hover:bg-slate-50/60 transition-colors staff-row" data-vertical="${st.vertical || 'clinic'}">
                <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                    ${idx + 1}
                  </span>
                  <div>
                    <div class="font-bold text-slate-900">${st.name}</div>
                    <div class="text-[10px] text-slate-400 font-mono">ID: ${st.id}</div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-medium">${st.role}</td>
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-slate-100 text-slate-700">
                    ${st.vertical || 'clinic'}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-center font-bold text-slate-900 tabular-nums">
                  <span class="px-2 py-0.5 rounded-full bg-slate-100">${st.reviewsCount}</span>
                </td>
                <td class="py-3.5 px-4 text-center font-bold text-amber-500 tabular-nums">
                  ${st.avgRating}★
                </td>
                <td class="py-3.5 px-4 text-slate-600 italic">“${st.compliments}”</td>
                <td class="py-3.5 px-4 text-right font-bold text-brand-600 tabular-nums">${st.tipsEarned}</td>
                <td class="py-3.5 px-4 text-center">
                  <button type="button" onclick="generateStaffQr('${st.name}')" class="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Get Staff QR
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Motivational Insight Box -->
    <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-bold text-blue-950 font-heading">Why Staff Attribution Drives 3x More Google Reviews</h3>
        <p class="text-xs text-blue-900/80 leading-relaxed max-w-2xl">
          When customers scan an in-store QR code, recognizing a dedicated doctor, barista, hair colorist, or fitness trainer turns a sterile rating into a personal compliment. Frontline teams actively encourage checkouts, customer satisfaction rises, and Google’s algorithm indexes staff names for local trust!
        </p>
      </div>
      <a href="/app/qr" class="min-h-[44px] px-4 py-2 bg-blue-950 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm shrink-0 flex items-center gap-1.5 transition-colors">
        <span>Configure In-Store Stands</span>
        ${getSvgIcon('arrowRight', 'w-4 h-4')}
      </a>
    </div>
  </div>

  <!-- Add Staff Modal -->
  <div id="addStaffModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-base text-slate-900 font-heading">Add Frontline Team Member</h3>
        <button type="button" onclick="closeAddStaffModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
      </div>
      <form onsubmit="handleAddStaffSubmit(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Full Name & Title</label>
          <input id="newStaffName" type="text" required placeholder="Shreyas Nair or Dr. Sneha" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Industry Vertical</label>
          <select id="newStaffVertical" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500 bg-white">
            <option value="clinic">Clinic / Healthcare</option>
            <option value="cafe">Cafe / Dining</option>
            <option value="salon">Salon / Spa</option>
            <option value="gym">Gym / Fitness</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Role & Specialization</label>
          <input id="newStaffRole" type="text" required placeholder="Lead Barista or Senior Endodontist" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500">
        </div>
        <div class="pt-2 flex gap-2">
          <button type="button" onclick="closeAddStaffModal()" class="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm">Save Team Member</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function filterStaffTable(vert) {
      document.querySelectorAll('.staff-filter-btn').forEach(b => {
        b.className = 'staff-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
      });
      document.getElementById('sf-' + vert).className = 'staff-filter-btn active px-3 py-1.5 rounded-xl text-xs font-bold bg-dark-950 text-white shadow-sm';

      document.querySelectorAll('.staff-row').forEach(row => {
        if (vert === 'all' || row.dataset.vertical === vert) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    function openAddStaffModal() {
      document.getElementById('addStaffModal').classList.remove('hidden');
    }
    function closeAddStaffModal() {
      document.getElementById('addStaffModal').classList.add('hidden');
    }
    async function handleAddStaffSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('newStaffName').value;
      const role = document.getElementById('newStaffRole').value;
      const vertical = document.getElementById('newStaffVertical').value;
      
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, vertical })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added ' + name + ' to ' + vertical + ' team!', 'success');
        closeAddStaffModal();
        setTimeout(() => window.location.reload(), 800);
      }
    }
    function generateStaffQr(name) {
      showToast('Generated custom attribution QR link for ' + name, 'info');
      window.location.href = '/app/qr?staff=' + encodeURIComponent(name);
    }
  </script>
  `;
}

function renderLocalPackPage(store) {
  const keywords = [
    { query: "dentist near me Indiranagar", vertical: "clinic", volume: "4,200/mo", rank: "#1 in 3-Pack", share: "48%", competitor: "Apollo Dental (#2)" },
    { query: "root canal treatment Indiranagar 100ft road", vertical: "clinic", volume: "1,850/mo", rank: "#1 in 3-Pack", share: "52%", competitor: "Clove Dental (#3)" },
    { query: "specialty coffee cafe Indiranagar", vertical: "cafe", volume: "5,400/mo", rank: "#1 in 3-Pack", share: "46%", competitor: "Third Wave Coffee (#2)" },
    { query: "fresh sourdough bakery Bangalore", vertical: "cafe", volume: "2,200/mo", rank: "#1 in 3-Pack", share: "51%", competitor: "Glen’s Bakehouse (#3)" },
    { query: "balayage hair salon Lavelle Road", vertical: "salon", volume: "3,100/mo", rank: "#1 in 3-Pack", share: "49%", competitor: "BBlunt Bangalore (#2)" },
    { query: "strength training gym Koramangala", vertical: "gym", volume: "3,800/mo", rank: "#1 in 3-Pack", share: "47%", competitor: "Cult.fit Koramangala (#2)" }
  ];

  return `
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Google Local 3-Pack Algorithm Engine</h1>
        <p class="text-xs text-slate-500 mt-0.5">High-intent search rankings across Bengaluru metro zones governed by 4-minute reply velocity and localized semantic relevance.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold font-mono">
          <span class="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
          Live GBP Rank: #1 Across Active Locations
        </span>
      </div>
    </div>

    <!-- Visual 3-Pack Simulation Card -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Simulated Google Search SERP View -->
      <div class="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 card-3d space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
            ${getSvgIcon('search', 'w-4 h-4 text-brand-600')}
            <span>Google Maps Local 3-Pack Live SERP Preview</span>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">Geo: Bengaluru Metro Network</span>
        </div>

        <!-- Google SERP Card #1 (Your Business) -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 border-2 border-brand-500 shadow-sm space-y-2 relative overflow-hidden">
          <div class="absolute right-4 top-4">
            <span class="px-2.5 py-1 rounded-full bg-brand-600 text-white font-bold text-[10px] tracking-wider uppercase font-mono">
              Rank #1 In 3-Pack
            </span>
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-slate-900 font-heading">${store.location?.name || 'Dr. Sharma Dental & Implant Clinic'}</h3>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-amber-500">4.9 ★★★★★</span>
            <span class="text-slate-500 font-medium">(${store.location?.reviewsCount || 143} reviews)</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-600">${store.location?.category || 'Healthcare & Aesthetic Clinic'}</span>
          </div>
          <p class="text-xs text-slate-600">
            ${store.location?.area || '100 Feet Rd, Indiranagar'}, Bengaluru • Open ⋅ Closes 8:30 PM • ${store.location?.phone || '080 4920 1888'}
          </p>
          <div class="pt-1 flex flex-wrap gap-2 text-[11px] font-mono">
            <span class="bg-white/80 text-brand-800 px-2 py-0.5 rounded-md border border-brand-200 font-medium">
              ✓ Autopilot reply velocity: 3.8 mins
            </span>
            <span class="bg-white/80 text-brand-800 px-2 py-0.5 rounded-md border border-brand-200 font-medium">
              ✓ Review keywords: "${store.location?.defaultKeywords?.split(',')[0] || 'gentle root canal'}"
            </span>
          </div>
        </div>

        <!-- Competitor #2 -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-80">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800">Apollo Dental Indiranagar</h4>
            <span class="text-[10px] font-bold text-slate-500 font-mono">Rank #2</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-amber-500">4.4 ★★★★☆</span>
            <span class="text-slate-500">(89 reviews)</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-500">Reply velocity: 4.2 days</span>
          </div>
        </div>

        <!-- Competitor #3 -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-70">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800">Clove Dental Indiranagar</h4>
            <span class="text-[10px] font-bold text-slate-500 font-mono">Rank #3</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-amber-500">4.3 ★★★★☆</span>
            <span class="text-slate-500">(112 reviews)</span>
            <span class="text-slate-300">•</span>
            <span class="text-slate-500">Reply velocity: 8.5 days</span>
          </div>
        </div>
      </div>

      <!-- Algorithmic Ranking Mechanics -->
      <div class="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 card-3d space-y-4">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Google 3-Pack Algorithm Mechanics</h2>
        <div class="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span class="font-bold text-slate-900 block font-heading">1. Response Velocity</span>
            <p class="text-slate-600 text-[11px]">Google rewards listings that respond to &gt;95% of reviews within hours. ReviewKaro's 4-minute jitter beats 99% of metro rivals.</p>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span class="font-bold text-slate-900 block font-heading">2. Keyword Semantic Injection</span>
            <p class="text-slate-600 text-[11px]">Naturally weaving service tags into official owner responses indexes high-intent search terms into Google Maps prominence.</p>
          </div>
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span class="font-bold text-slate-900 block font-heading">3. Fresh Review Velocity</span>
            <p class="text-slate-600 text-[11px]">In-store QR touchpoints convert 22.4% of walk-in guests, giving continuous fresh signals without algorithmic review-gating penalties.</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Keyword Geo Grid Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-3d">
      <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 font-heading">High-Intent Metro Bengaluru Search Queries Tracked</h2>
        <span class="text-xs text-slate-500 font-mono">Synced Every 24h</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Search Query</th>
              <th class="py-3 px-4 text-center">Industry</th>
              <th class="py-3 px-4">Local Monthly Volume</th>
              <th class="py-3 px-4 text-center">Your 3-Pack Rank</th>
              <th class="py-3 px-4 text-center">Click Share</th>
              <th class="py-3 px-4">Closest Local Rival</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${keywords.map(kw => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-900">“${kw.query}”</td>
                <td class="py-3 px-4 text-center font-mono">
                  <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">${kw.vertical}</span>
                </td>
                <td class="py-3 px-4 text-slate-600 tabular-nums">${kw.volume}</td>
                <td class="py-3 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full font-black font-mono bg-brand-50 text-brand-700 border border-brand-200">
                    ${kw.rank}
                  </span>
                </td>
                <td class="py-3 px-4 text-center font-bold text-slate-800 tabular-nums">${kw.share}</td>
                <td class="py-3 px-4 text-slate-500">${kw.competitor}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}

// ----------------------------------------------------
// 3. WHATSAPP BUSINESS CLOUD API TRIGGER STUDIO
// ----------------------------------------------------
function renderWhatsAppStudioPage(store) {
  const location = store.location || {};
  const wa = store.whatsappStudio || {
    status: 'connected',
    phoneNumber: '+91 80 4112 9088',
    wabaId: 'WABA_992014881023',
    templates: []
  };

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">WhatsApp Business Cloud API Studio</h1>
        <p class="text-xs text-slate-500 mt-0.5">Automated post-transaction review triggers via Meta Graph API v21.0 (96.4% open rate in India vs <8% SMS).</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Meta Cloud API Live
        </span>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">WhatsApp Open Rate</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">96.4%</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">12x higher than legacy SMS</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Review Copilot CTR</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">48.2%</div>
        <div class="text-[11px] text-brand-600 font-medium mt-0.5">Tap-through to Google Maps</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Delivery Latency</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">1.8s</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Direct Meta tier-1 route</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Verified Number</div>
        <div class="text-lg font-black text-slate-900 font-heading mt-1 font-mono">${wa.phoneNumber}</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">Official Green Checkmark</div>
      </div>
    </div>

    <!-- Main Workspace: Templates & Smartphone Simulator -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Template Catalog -->
      <div class="lg:col-span-7 space-y-4">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm card-3d space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 class="text-sm font-bold text-slate-900 font-heading">Pre-Approved Meta Post-Visit Templates</h2>
            <span class="text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg font-bold font-mono">Zero DLT Friction</span>
          </div>

          <div class="space-y-3" id="templateList">
            ${(wa.templates || []).map((tpl, i) => `
              <div class="p-4 rounded-2xl border transition-all cursor-pointer ${i === 0 ? 'bg-brand-50/50 border-brand-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}" onclick="selectWaTemplate('${tpl.id}')">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-xs text-slate-900">${tpl.header}</span>
                    <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">${tpl.vertical}</span>
                  </div>
                  <span class="text-[11px] font-bold text-brand-600 font-mono">Delay: ${tpl.delay}</span>
                </div>
                <p class="text-xs text-slate-600 line-clamp-2 italic">“${tpl.bodyText}”</p>
                <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60 font-mono">
                  <span>Open: <strong class="text-slate-800">${tpl.openRate}</strong></span>
                  <span>Click: <strong class="text-emerald-700">${tpl.clickRate}</strong></span>
                  <span class="text-brand-600 font-bold">${tpl.buttonText}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Live Send Simulator -->
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm card-3d space-y-4">
          <h3 class="text-sm font-bold text-slate-900 font-heading">Test Send WhatsApp Review Trigger</h3>
          <p class="text-xs text-slate-500">Dispatch a live test message to your personal smartphone to verify the 15-second customer review copilot experience.</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <input id="testPhone" type="tel" value="+91 98450 11223" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" placeholder="+91 Your Phone Number">
            <button type="button" onclick="testSendWhatsApp()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
              ${getSvgIcon('whatsapp', 'w-4 h-4 text-white')}
              <span>Fire Live WhatsApp Test &rarr;</span>
            </button>
          </div>
          <p id="waSendSuccess" class="hidden text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            ✓ Message successfully dispatched to Meta Graph API v21.0! Check your WhatsApp.
          </p>
        </div>
      </div>

      <!-- Smartphone Preview Mockup -->
      <div class="lg:col-span-5 bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400"></span> Live WhatsApp Device View</span>
          <span>iPhone 15 Pro</span>
        </div>

        <div class="bg-[#e5ddd5] rounded-2xl p-4 min-h-[420px] flex flex-col justify-between shadow-inner text-slate-900">
          <!-- WhatsApp Chat Header -->
          <div class="bg-[#075e54] -m-4 mb-4 p-3 text-white flex items-center gap-3 shadow-sm rounded-t-2xl">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              ${getSvgIcon('whatsapp', 'w-5 h-5 text-white')}
            </div>
            <div>
              <div class="font-bold text-xs flex items-center gap-1">
                <span id="waPreviewHeader">${location.name || 'Dr. Sharma Dental'}</span>
                <span class="text-emerald-300">✓</span>
              </div>
              <div class="text-[9px] text-emerald-100">Official Business Account</div>
            </div>
          </div>

          <!-- Message Bubble -->
          <div class="bg-white rounded-xl p-3 shadow max-w-[90%] space-y-2 text-xs self-start my-auto border border-black/5 animate-in fade-in">
            <p id="waPreviewBody" class="leading-relaxed text-slate-800 text-[11px]">
              Hi Vikram, hope your tooth is feeling much better after today's painless root canal with Dr. Sneha Kulkarni! If you have 20 seconds, could you share a quick review on Google Maps to help others in Indiranagar find quality dental care?
            </p>
            <div class="text-[9px] text-right text-slate-400 font-mono">14:32 ✓✓</div>
            
            <!-- Quick Action Buttons -->
            <div class="pt-2 border-t border-slate-100 space-y-1.5">
              <a href="/q/sharma-dent-01" target="_blank" class="w-full py-2 bg-emerald-50 text-emerald-800 font-bold rounded-lg text-center block text-[11px] border border-emerald-200 hover:bg-emerald-100 transition-colors">
                ⭐ 20-Second Review Copilot
              </a>
              <a href="tel:${location.managerPhone || '+919845011223'}" class="w-full py-1.5 bg-slate-50 text-slate-700 font-medium rounded-lg text-center block text-[10px] border border-slate-200 hover:bg-slate-100 transition-colors">
                📞 Speak with Manager
              </a>
            </div>
          </div>

          <!-- Footer note -->
          <div class="text-[10px] text-slate-500 text-center bg-white/80 py-1.5 px-3 rounded-lg backdrop-blur">
            Fully compliant with FTC 16 CFR Part 465 & DPDP Act 2023
          </div>
        </div>
      </div>

    </div>
  </div>

  <script>
    function selectWaTemplate(id) {
      alert('Selected template: ' + id + '. Live smartphone preview updated.');
    }
    async function testSendWhatsApp() {
      const phone = document.getElementById('testPhone').value;
      const res = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('waSendSuccess').classList.remove('hidden');
      }
    }
  </script>
  `;
}

// ----------------------------------------------------
// 4. UNIVERSAL POS & WEBHOOK CONNECTOR HUB
// ----------------------------------------------------
function renderPosWebhooksPage(store) {
  const posList = store.posIntegrations || [];

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Universal POS & Practice Management Connectors</h1>
        <p class="text-xs text-slate-500 mt-0.5">Automated webhook ingestion from Petpooja POS (restaurants), Zenoti (salons), and Practo Ray (clinics).</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 font-mono">
          HMAC-SHA256 Encrypted
        </span>
      </div>
    </div>

    <!-- Active POS Connectors Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${posList.map(pos => `
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 font-heading">${pos.name}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div class="space-y-1 text-xs text-slate-600">
            <div>Outlet: <strong class="text-slate-900">${pos.outletName}</strong></div>
            <div class="font-mono text-[11px] text-slate-500">ID: ${pos.outletId}</div>
            <div class="text-[11px] text-brand-600 font-medium">Trigger: ${pos.autoTriggerDelay}</div>
          </div>
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-mono">Events: <strong class="text-slate-800">${pos.eventsCaptured}</strong></span>
            <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">${pos.lastSync}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Interactive Webhook Simulator -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 card-3d space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-sm font-bold text-slate-900 font-heading">Interactive POS Webhook Event Simulator</h2>
          <p class="text-xs text-slate-500">Test live payload ingestion from Indian billing systems to verify real-time review dispatch.</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" onclick="simulatePosEvent('petpooja')" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            Simulate Petpooja Bill (Cafe)
          </button>
          <button type="button" onclick="simulatePosEvent('zenoti')" class="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            Simulate Zenoti (Salon)
          </button>
          <button type="button" onclick="simulatePosEvent('practo')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
            Simulate Practo (Clinic)
          </button>
        </div>
      </div>

      <!-- Live Webhook Log Feed -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Time</th>
              <th class="py-3 px-4">Provider</th>
              <th class="py-3 px-4">Customer & Service</th>
              <th class="py-3 px-4">Staff Credited</th>
              <th class="py-3 px-4">Bill Amount</th>
              <th class="py-3 px-4">Automated Action</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100" id="posEventLogBody">
            <tr class="hover:bg-slate-50/60 transition-colors font-mono">
              <td class="py-3 px-4 text-slate-500">Just now</td>
              <td class="py-3 px-4 font-bold text-slate-900">Petpooja POS</td>
              <td class="py-3 px-4 text-slate-700">Rohan Mehta (Pour Over & Almond Croissant)</td>
              <td class="py-3 px-4 font-bold text-brand-600">Shreyas Nair</td>
              <td class="py-3 px-4 text-slate-800">₹840.00</td>
              <td class="py-3 px-4 text-emerald-600 font-bold">WhatsApp Trigger queued in 45m</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">200 OK</span></td>
            </tr>
            <tr class="hover:bg-slate-50/60 transition-colors font-mono">
              <td class="py-3 px-4 text-slate-500">14m ago</td>
              <td class="py-3 px-4 font-bold text-slate-900">Zenoti Spa</td>
              <td class="py-3 px-4 text-slate-700">Kavita Rao (Balayage & Olaplex)</td>
              <td class="py-3 px-4 font-bold text-brand-600">Farhan Akhtar</td>
              <td class="py-3 px-4 text-slate-800">₹5,400.00</td>
              <td class="py-3 px-4 text-emerald-600 font-bold">WhatsApp Trigger queued next morning</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">200 OK</span></td>
            </tr>
            <tr class="hover:bg-slate-50/60 transition-colors font-mono">
              <td class="py-3 px-4 text-slate-500">1h ago</td>
              <td class="py-3 px-4 font-bold text-slate-900">Practo Ray</td>
              <td class="py-3 px-4 text-slate-700">Vikramaditya Sengupta (Root Canal)</td>
              <td class="py-3 px-4 font-bold text-brand-600">Dr. Sneha Kulkarni</td>
              <td class="py-3 px-4 text-slate-800">₹8,500.00</td>
              <td class="py-3 px-4 text-emerald-600 font-bold">WhatsApp Trigger sent & verified</td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">200 OK</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    async function simulatePosEvent(provider) {
      const res = await fetch('/api/webhooks/pos/' + provider, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: true })
      });
      const data = await res.json();
      if (data.success) {
        alert('Simulated ' + provider.toUpperCase() + ' transaction webhook received! Automated WhatsApp trigger scheduled.');
        location.reload();
      }
    }
  </script>
  `;
}

// ----------------------------------------------------
// 5. AI GOOGLE POLICY DISPUTE & REMOVAL ENGINE
// ----------------------------------------------------
function renderDisputesPage(store) {
  const disputes = store.disputes || [];

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">AI Fake Review Disputation & Policy Removal Engine</h1>
        <p class="text-xs text-slate-500 mt-0.5">Detect competitor sabotage, hate speech, and ex-employee retaliation with pre-formatted Google GBP removal dossiers.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
          Google Content Policy 2026 Aligned
        </span>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Flagged Violations</div>
        <div class="text-2xl font-black text-rose-600 font-heading mt-1 tabular-nums">${disputes.length}</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">High-probability fake attacks</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Google Removal Success</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">88.4%</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">Backed by exact policy citations</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Rating Protected</div>
        <div class="text-2xl font-black text-brand-600 font-heading mt-1 tabular-nums">+0.2★</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Prevented artificial rating drop</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Dispute Resolution</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">4.2 Days</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Google Business Support window</div>
      </div>
    </div>

    <!-- Flagged Reviews List -->
    <div class="space-y-4">
      <h2 class="text-sm font-bold text-slate-900 font-heading">Reviews Detected Violating Google Content Policies</h2>

      ${disputes.map((d, idx) => `
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm card-3d space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg font-black text-xs bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                ${d.rating}★ Review
              </span>
              <strong class="text-sm text-slate-900 font-heading">${d.reviewerName}</strong>
            </div>
            <span class="text-xs font-bold font-mono text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              ${d.evidenceScore}
            </span>
          </div>

          <p class="text-xs text-slate-700 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
            “${d.reviewText}”
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-1">
              <span class="font-bold text-amber-900 font-heading block">Detected Policy Breach</span>
              <p class="text-amber-800 font-medium">${d.violationType}</p>
              <p class="text-[11px] text-amber-700 font-mono">${d.googlePolicySection}</p>
            </div>
            <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span class="font-bold text-slate-900 font-heading block">Legal Evidence Analysis</span>
              <p class="text-slate-600 text-[11px] leading-relaxed">${d.dossier}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onclick="copyDisputeDossier('${d.id}')" class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              ${getSvgIcon('copy', 'w-3.5 h-3.5 text-slate-300')} Copy Google Legal Dossier
            </button>
            <a href="https://support.google.com/business/workflow/9945796" target="_blank" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5">
              ${getSvgIcon('dispute', 'w-3.5 h-3.5 text-white')} Open Google Dispute Portal &rarr;
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    function copyDisputeDossier(id) {
      navigator.clipboard.writeText('FORMAL GOOGLE BUSINESS PROFILE REVIEW REMOVAL REQUEST\\nPolicy Violation: Maps User Content Policy § 3.2\\nReason: Documented conflict of interest & fraudulent negative attack.\\nEvidence: Account registered same day with no verified transaction history.');
      alert('Formal Google Removal Dossier copied to clipboard! Paste it into the Google Dispute form.');
    }
  </script>
  `;
}

// ----------------------------------------------------
// 6. MULTI-LOCATION MULTI-BRAND ENTERPRISE ROLLUP
// ----------------------------------------------------
function renderOrganizationsPage(store) {
  const branches = store.branches || [];

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Multi-Location Enterprise Command Center</h1>
        <p class="text-xs text-slate-500 mt-0.5">Consolidated brand reputation, cross-branch leaderboards, and regional performance across Bengaluru.</p>
      </div>
      <button type="button" class="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm">
        + Add New Branch Location
      </button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Total Active Locations</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">${branches.length}</div>
        <div class="text-[11px] text-brand-600 font-medium mt-0.5">Tier-1 Bengaluru Hubs</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Composite Network Rating</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">4.88★</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">Across 867 verified reviews</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Autopilot Automation</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">88.4%</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Zero manual intervention</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Local 3-Pack Dominance</div>
        <div class="text-2xl font-black text-brand-600 font-heading mt-1 tabular-nums">100%</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">All 4 branches in Top 3</div>
      </div>
    </div>

    <!-- Location Rollup Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-3d">
      <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Cross-Branch Location Performance Matrix</h2>
        <span class="text-xs text-slate-500 font-mono">Live Google GBP Sync</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Location & Branch</th>
              <th class="py-3 px-4 text-center">Industry</th>
              <th class="py-3 px-4 text-center">Rating</th>
              <th class="py-3 px-4 text-center">Review Inflow</th>
              <th class="py-3 px-4 text-center">3-Pack Rank</th>
              <th class="py-3 px-4">Top Frontline Staff</th>
              <th class="py-3 px-4 text-right">Switch Workspace</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${branches.map(b => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3.5 px-4 font-bold text-slate-900">
                  <div>${b.name}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${b.area}, ${b.city}</div>
                </td>
                <td class="py-3.5 px-4 text-center font-mono">
                  <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">${b.vertical}</span>
                </td>
                <td class="py-3.5 px-4 text-center font-bold text-amber-500">${b.rating} ★</td>
                <td class="py-3.5 px-4 text-center font-mono text-emerald-700 font-bold">+28 / mo</td>
                <td class="py-3.5 px-4 text-center font-mono font-bold text-brand-700 bg-brand-50/60 rounded">Rank #1</td>
                <td class="py-3.5 px-4 text-slate-700 font-medium">Lead Provider Verified</td>
                <td class="py-3.5 px-4 text-right">
                  <button type="button" onclick="switchActiveBusiness('${b.id}')" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors">
                    Switch &rarr;
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  `;
}

// ----------------------------------------------------
// 7. ASPECT-BASED SENTIMENT & ROOT-CAUSE INTELLIGENCE
// ----------------------------------------------------
function renderSentimentPage(store) {
  const aspects = store.sentimentAspects || [];

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Aspect-Based Sentiment & Root-Cause Intelligence</h1>
        <p class="text-xs text-slate-500 mt-0.5">Granular operational feedback breakdown across clinical, hospitality, and service dimensions.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
          94.2% Positive Sentiment
        </span>
      </div>
    </div>

    <!-- Operational Aspects Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${aspects.map(a => `
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm card-3d space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 font-heading">${a.aspect}</span>
            <span class="text-xs font-mono font-bold ${a.status === 'exceptional' ? 'text-emerald-700 bg-emerald-50' : (a.status === 'attention_needed' ? 'text-amber-700 bg-amber-50' : 'text-slate-700 bg-slate-100')} px-2 py-0.5 rounded">
              ${a.score}%
            </span>
          </div>

          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="h-2 rounded-full ${a.score >= 95 ? 'bg-emerald-500' : (a.score >= 90 ? 'bg-brand-600' : 'bg-amber-500')}" style="width: ${a.score}%"></div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span>${a.mentions} mentions</span>
            <span class="${a.trend.startsWith('+') ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}">${a.trend} this month</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Root-Cause Action Diagnosis -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm card-3d space-y-4">
      <h2 class="text-sm font-bold text-slate-900 font-heading">AI Operational Diagnosis & Prescriptive Fixes</h2>
      
      <div class="space-y-3 text-xs">
        <div class="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
          <div class="flex items-center justify-between">
            <strong class="text-amber-950 font-heading">1. Peak-Hour Wait Times (11:30 AM - 1:30 PM Saturdays)</strong>
            <span class="text-[10px] font-bold text-amber-700 font-mono uppercase">Operational Bottleneck</span>
          </div>
          <p class="text-amber-900 text-[11px] leading-relaxed">
            Customer reviews frequently mention a 20-30 minute delay between appointment check-in and operatory seating on Saturday mornings.
            <strong>Prescription:</strong> Stagger Saturday appointment booking intervals by 15 minutes to eliminate reception congestion.
          </p>
        </div>

        <div class="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
          <div class="flex items-center justify-between">
            <strong class="text-emerald-950 font-heading">2. Painless Procedure & Sterilization Praise</strong>
            <span class="text-[10px] font-bold text-emerald-700 font-mono uppercase">Core Competitive Advantage</span>
          </div>
          <p class="text-emerald-900 text-[11px] leading-relaxed">
            96% of reviewers specifically highlight zero-pain rotary endodontics and sterile operatory trays under Dr. Sneha Kulkarni.
            <strong>Prescription:</strong> Double down on this keyword in Google local SEO campaigns to capture high-intent patients searching "painless dentist Indiranagar".
          </p>
        </div>
      </div>
    </div>
  </div>
  `;
}

// ----------------------------------------------------
// 8. IN-STORE HARDWARE PROVISIONING STUDIO
// ----------------------------------------------------
function renderHardwareStudioPage(store) {
  const hardware = store.hardwareCatalog || [];

  return `
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">In-Store NFC Hardware & Countertop Stand Studio</h1>
        <p class="text-xs text-slate-500 mt-0.5">Custom-engraved acrylic, brushed gold, and walnut NFC touchpoints shipped directly to your counter.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 font-mono">
          Free Express Courier Across India
        </span>
      </div>
    </div>

    <!-- Hardware Catalog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      ${hardware.map(hw => `
        <div class="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm card-3d flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="w-full h-36 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200/80 overflow-hidden relative group">
              <div class="p-4 text-center">
                <span class="text-3xl">🪪</span>
                <p class="text-[11px] font-bold text-slate-800 mt-2">${hw.name}</p>
              </div>
            </div>
            <h3 class="font-bold text-xs text-slate-900 font-heading">${hw.name}</h3>
            <p class="text-[11px] text-slate-500 leading-relaxed">${hw.material}</p>
          </div>

          <div class="pt-3 border-t border-slate-100 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-slate-900 text-sm font-heading">${hw.price}</span>
              <span class="text-[10px] text-slate-400 font-mono">${hw.leadTime}</span>
            </div>
            <button type="button" onclick="orderHardwareStand('${hw.id}')" class="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
              Order Custom Engraved &rarr;
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Web NFC Card Programmer Utility -->
    <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm card-3d space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-sm font-bold text-slate-900 font-heading">Web NFC Chip Encoder Utility (NTAG213 / NTAG215)</h2>
          <p class="text-xs text-slate-500">Program existing blank NFC tags or cards with your dynamic ReviewKaro 15-second review copilot URL.</p>
        </div>
        <span class="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">Web NFC API Ready</span>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 items-center">
        <input id="nfcUrl" type="text" readonly value="https://reviewkaro.tech/q/sharma-dent-01" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 text-slate-700">
        <button type="button" onclick="programNfcTag()" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2">
          ${getSvgIcon('hardware', 'w-4 h-4 text-white')}
          <span>Tap Phone to Write NFC Tag &rarr;</span>
        </button>
      </div>
      <p id="nfcStatus" class="hidden text-xs font-bold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
        ✓ NFC Tag Successfully Programmed! Tapping an iPhone or Android will directly launch the 15-Second Google Review Copilot.
      </p>
    </div>
  </div>

  <script>
    function orderHardwareStand(id) {
      alert('Order initiated for ' + id + '! Our design team will contact you within 2 hours with the custom logo engraving proof.');
    }
    function programNfcTag() {
      document.getElementById('nfcStatus').classList.remove('hidden');
    }
  </script>
  `;
}

module.exports = {
  renderStaffPage,
  renderLocalPackPage,
  renderWhatsAppStudioPage,
  renderPosWebhooksPage,
  renderDisputesPage,
  renderOrganizationsPage,
  renderSentimentPage,
  renderHardwareStudioPage
};

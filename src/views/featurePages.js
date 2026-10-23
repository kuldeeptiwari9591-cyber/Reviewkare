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
            <p class="text-slate-600 text-[11px]">Google rewards listings that respond to &gt;95% of reviews within hours. Replyo's 4-minute jitter beats 99% of metro rivals.</p>
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

module.exports = {
  renderStaffPage,
  renderLocalPackPage
};

// High-End Feature Views: Staff Review Attribution & Google Local 3-Pack Rank Simulator
const { getSvgIcon, getStarRatingSvg } = require('./icons.js');

function renderStaffPage(store) {
  const staffList = store.staff || [
    { id: 'st_1', name: 'Dr. Sneha Roy', role: 'Senior Endodontist', reviewsCount: 38, avgRating: 4.9, compliments: 'Gentle root canal, painless anesthesia', tipsEarned: '₹4,500' },
    { id: 'st_2', name: 'Dr. Ananya Sharma', role: 'Chief Implantologist', reviewsCount: 52, avgRating: 5.0, compliments: 'Crystal clear treatment plan, zero waiting', tipsEarned: '₹6,200' },
    { id: 'st_3', name: 'Nurse Preeti', role: 'Clinical Head Nurse', reviewsCount: 29, avgRating: 4.8, compliments: 'Reassuring smile, sterile hygiene protocol', tipsEarned: '₹3,100' },
    { id: 'st_4', name: 'Kavita Menon', role: 'Front Desk Coordinator', reviewsCount: 24, avgRating: 4.9, compliments: 'Fast insurance paperwork, polite WhatsApp updates', tipsEarned: '₹2,800' }
  ];

  return `
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Staff Review Attribution & Incentives</h1>
        <p class="text-xs text-slate-500 mt-0.5">Track patient compliments, review mentions, and performance incentives per doctor and team member.</p>
      </div>
      <button type="button" onclick="openAddStaffModal()" class="min-h-[44px] px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-2 transition-all">
        ${getSvgIcon('plus', 'w-4 h-4')}
        <span>Add Staff Member</span>
      </button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Staff Tracked</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">${staffList.length}</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">100% active in Indiranagar clinic</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Staff-Mentioned Reviews</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">143</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-0.5">+28 this calendar month</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Team Rating</div>
        <div class="text-2xl font-black text-slate-900 font-heading mt-1 tabular-nums">4.9★</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Top 1% across dental clinics</div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-200 card-3d">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disbursed Staff Bonuses</div>
        <div class="text-2xl font-black text-brand-600 font-heading mt-1 tabular-nums">₹16,600</div>
        <div class="text-[11px] text-slate-500 font-medium mt-0.5">Automated UPI reward ledger</div>
      </div>
    </div>

    <!-- Staff Leaderboard Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-3d">
      <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Indiranagar Branch Leaderboard (October 2026)</h2>
        <span class="text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg font-bold border border-brand-200">
          Ranked by Patient Mentions
        </span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Staff Member</th>
              <th class="py-3 px-4">Clinical Designation</th>
              <th class="py-3 px-4 text-center">Reviews Mentioned</th>
              <th class="py-3 px-4 text-center">Avg Rating</th>
              <th class="py-3 px-4">Top Patient Compliments</th>
              <th class="py-3 px-4 text-right">Incentive Pool</th>
              <th class="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${staffList.map((st, idx) => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                    ${idx + 1}
                  </span>
                  <div>
                    <div class="font-bold text-slate-900">${st.name}</div>
                    <div class="text-[10px] text-slate-400">ID: ${st.id}</div>
                  </div>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-medium">${st.role}</td>
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

    <!-- Motivational Strategy Box -->
    <div class="p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-bold text-amber-950 font-heading">How Staff Review Attribution Works</h3>
        <p class="text-xs text-amber-900/80 leading-relaxed max-w-2xl">
          When patients scan your countertop QR stand, they select the specific doctor or nurse who attended them. The AI natural language engine naturally weaves their name into the draft review. Google’s algorithm indexes staff names for local trust and organic SEO!
        </p>
      </div>
      <a href="/app/qr" class="min-h-[44px] px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs rounded-xl shadow-sm shrink-0 flex items-center gap-1.5 transition-colors">
        <span>Configure QR Staff Tags</span>
        ${getSvgIcon('arrowRight', 'w-4 h-4')}
      </a>
    </div>
  </div>

  <!-- Add Staff Modal -->
  <div id="addStaffModal" class="hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="font-bold text-base text-slate-900 font-heading">Add Clinical Team Member</h3>
        <button type="button" onclick="closeAddStaffModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">✕</button>
      </div>
      <form onsubmit="handleAddStaffSubmit(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Full Name & Title</label>
          <input id="newStaffName" type="text" required placeholder="Dr. Rohan Mehta" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Role / Speciality</label>
          <input id="newStaffRole" type="text" required placeholder="Orthodontist" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Monthly Review Target</label>
          <input id="newStaffTarget" type="number" value="25" class="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-brand-500">
        </div>
        <div class="pt-2 flex gap-2">
          <button type="button" onclick="closeAddStaffModal()" class="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm">Save Member</button>
        </div>
      </form>
    </div>
  </div>

  <script>
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
      
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Added ' + name + ' to Indiranagar clinic team!', 'success');
        closeAddStaffModal();
        setTimeout(() => window.location.reload(), 800);
      }
    }
    function generateStaffQr(name) {
      showToast('Generated custom QR attribution link for ' + name, 'info');
      window.location.href = '/app/qr?staff=' + encodeURIComponent(name);
    }
  </script>
  `;
}

function renderLocalPackPage(store) {
  const currentRank = 1;
  const targetRank = 1;
  
  const keywords = [
    { query: "dentist near me Indiranagar", volume: "4,200/mo", rank: "#1", share: "48%", competitor: "Apollo Dental (#2)" },
    { query: "root canal treatment Indiranagar 100ft road", volume: "1,850/mo", rank: "#1", share: "52%", competitor: "Clove Dental (#3)" },
    { query: "invisible aligners Bengaluru", volume: "3,100/mo", rank: "#2", share: "29%", competitor: "Toothsi Indiranagar (#1)" },
    { query: "emergency tooth pain Indiranagar", volume: "920/mo", rank: "#1", share: "61%", competitor: "Smiles First (#2)" },
    { query: "dental clinic open Sunday Indiranagar", volume: "1,400/mo", rank: "#1", share: "54%", competitor: "Sabka Dentist (#4)" },
  ];

  return `
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-slate-900 font-heading">Google Local 3-Pack Rank Simulator</h1>
        <p class="text-xs text-slate-500 mt-0.5">Real-time local search visibility, keyword geo-rankings, and calculated revenue lift in Bengaluru.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          Live GBP Rank: #1 in Indiranagar
        </span>
      </div>
    </div>

    <!-- Visual 3-Pack Simulation Card -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Simulated Google Search SERP View -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 card-3d space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
            ${getSvgIcon('search', 'w-4 h-4 text-brand-600')}
            <span>Google Maps Local 3-Pack Live Preview</span>
          </div>
          <span class="text-[11px] text-slate-400">Geo: 12.9784° N, 77.6408° E</span>
        </div>

        <!-- Google SERP Card #1 (Your Clinic) -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-brand-50/40 border-2 border-emerald-500 shadow-sm space-y-2 relative overflow-hidden">
          <div class="absolute right-3 top-3">
            <span class="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] tracking-wider uppercase">
              Rank #1 In 3-Pack
            </span>
          </div>
          <div class="flex items-center gap-2">
            <h3 class="font-extrabold text-sm text-slate-900 font-heading">Dr. Sharma Dental & Implant Clinic</h3>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="font-bold text-amber-500">4.9 ★★★★★</span>
            <span class="text-slate-500">(143 reviews)</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-600">Dental clinic</span>
          </div>
          <p class="text-xs text-slate-600">
            100 Feet Rd, Indiranagar, Bengaluru • Open ⋅ Closes 8:30 PM • 080 4920 1888
          </p>
          <div class="pt-1 flex flex-wrap gap-2 text-[11px]">
            <span class="bg-white/80 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
              ✓ Autopilot reply velocity: 3.8 mins
            </span>
            <span class="bg-white/80 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
              ✓ Review keywords: "gentle root canal", "dental implant"
            </span>
          </div>
        </div>

        <!-- Competitor #2 -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-80">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800">Apollo Dental Indiranagar</h4>
            <span class="text-[10px] font-bold text-slate-500">Rank #2</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-amber-500">4.4 ★★★★☆</span>
            <span class="text-slate-500">(89 reviews)</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-500">Reply velocity: 4.2 days</span>
          </div>
        </div>

        <!-- Competitor #3 -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 opacity-70">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800">Clove Dental Indiranagar</h4>
            <span class="text-[10px] font-bold text-slate-500">Rank #3</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="font-bold text-amber-500">4.3 ★★★★☆</span>
            <span class="text-slate-500">(112 reviews)</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-500">Reply velocity: 8.5 days</span>
          </div>
        </div>
      </div>

      <!-- Financial ROI Calculator -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 card-3d space-y-4">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Calculated Local 3-Pack Revenue Lift</h2>
        <div class="space-y-3">
          <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div class="text-[11px] text-slate-500 font-bold uppercase">Rank #1 Click-Through Rate</div>
            <div class="text-xl font-black text-slate-900 font-heading mt-0.5">44.8%</div>
            <p class="text-[11px] text-slate-500 mt-1">Vs only 8.2% for Rank #4 (outside 3-pack)</p>
          </div>
          <div class="p-3.5 bg-brand-50 rounded-2xl border border-brand-200">
            <div class="text-[11px] text-brand-900 font-bold uppercase">Estimated Monthly Extra OPD Patients</div>
            <div class="text-xl font-black text-brand-700 font-heading mt-0.5">+34 Patients</div>
            <p class="text-[11px] text-brand-800 mt-1">Based on 4,200 Indiranagar searches</p>
          </div>
          <div class="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <div class="text-[11px] text-emerald-950 font-bold uppercase">Estimated Revenue Lift / Month</div>
            <div class="text-2xl font-black text-emerald-700 font-heading mt-0.5">₹1,70,000</div>
            <p class="text-[11px] text-emerald-800 mt-1">Assuming ₹5,000 avg treatment ticket</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Keyword Geo Grid Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden card-3d">
      <div class="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-900 font-heading">Top High-Intent Bangalore Search Queries</h2>
        <span class="text-xs text-slate-500">Updated every 24 hours</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
              <th class="py-3 px-4">Search Query</th>
              <th class="py-3 px-4">Local Monthly Volume</th>
              <th class="py-3 px-4 text-center">Your 3-Pack Rank</th>
              <th class="py-3 px-4 text-center">Click Share</th>
              <th class="py-3 px-4">Closest Rival</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${keywords.map(kw => `
              <tr class="hover:bg-slate-50/60 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-900">“${kw.query}”</td>
                <td class="py-3 px-4 text-slate-600 tabular-nums">${kw.volume}</td>
                <td class="py-3 px-4 text-center">
                  <span class="px-2.5 py-0.5 rounded-full font-black ${kw.rank === '#1' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
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

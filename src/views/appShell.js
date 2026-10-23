const { getSvgIcon } = require('./icons.js');

function renderAppShell(activeTab, contentHtml, store = {}) {
  const reviews = store.reviews || [];
  const notifications = store.notifications || [];
  const location = store.location || { name: 'Dr. Sharma Dental & Implant Clinic', area: 'Indiranagar', city: 'Bengaluru' };
  const branches = store.branches || [
    { id: 'b_1', name: 'Indiranagar Main Clinic', area: 'Indiranagar', city: 'Bengaluru', rating: 4.9, isPrimary: true },
    { id: 'b_2', name: 'Koramangala 4th Block', area: 'Koramangala', city: 'Bengaluru', rating: 4.8 },
    { id: 'b_3', name: 'Whitefield Branch', area: 'Whitefield', city: 'Bengaluru', rating: 4.7 }
  ];
  const heldCount = reviews.filter(r => r.reply && r.reply.status === 'held').length;
  const unreadNotifs = notifications.filter(n => n.unread).length;
  
  const navItems = [
    { id: 'dashboard', name: 'Overview', href: '/app', icon: 'dashboard' },
    { id: 'reviews', name: 'Google Reviews', href: '/app/reviews', icon: 'reviews' },
    { id: 'approvals', name: 'Held Approvals', href: '/app/approvals', icon: 'approvals', badge: heldCount > 0 ? heldCount : null },
    { id: 'qr', name: 'QR Studio 3D', href: '/app/qr', icon: 'qr' },
    { id: 'growth', name: 'Growth & Competitors', href: '/app/growth', icon: 'growth' },
    { id: 'staff', name: 'Staff Leaderboard', href: '/app/staff', icon: 'staff' },
    { id: 'local-pack', name: 'Local 3-Pack Simulator', href: '/app/local-pack', icon: 'localPack' },
    { id: 'profile-health', name: 'GBP Health Check', href: '/app/profile-health', icon: 'health' },
    { id: 'posters', name: '5★ Review Posters', href: '/app/posters', icon: 'posters' },
    { id: 'reports', name: 'Weekly Reports', href: '/app/reports', icon: 'reports' },
    { id: 'settings', name: 'Autopilot Settings', href: '/app/settings', icon: 'settings' },
    { id: 'billing', name: 'Billing & GST Invoices', href: '/app/billing', icon: 'billing' },
    { id: 'team', name: 'Team & Locations', href: '/app/team', icon: 'team' },
  ];

  const currentTabName = navItems.find(i => i.id === activeTab)?.name || 'Dashboard';

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 p-4" aria-label="Dashboard Sidebar">
      <div>
        <!-- Clinic Switcher Card -->
        <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-4 card-3d">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center font-bold text-sm">D</div>
            <div class="overflow-hidden">
              <h2 class="font-bold text-xs text-slate-900 truncate">${location.name || 'Dr. Sharma Dental'}</h2>
              <p class="text-[11px] text-slate-500 truncate">${location.area || 'Indiranagar'}, ${location.city || 'Bengaluru'}</p>
            </div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Synced with Google Business
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1 text-xs font-semibold" aria-label="Dashboard Navigation">
          ${navItems.map((item) => `
            <a href="${item.href}" class="flex items-center justify-between px-3 min-h-[40px] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              activeTab === item.id ? 'bg-dark-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }">
              <span class="flex items-center gap-2.5">
                ${getSvgIcon(item.icon, activeTab === item.id ? 'w-4 h-4 text-white' : 'w-4 h-4 text-slate-500')}
                <span>${item.name}</span>
              </span>
              ${item.badge ? `<span class="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full tabular-nums">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Quick QR link -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <a href="/q/sharma-dent-01" target="_blank" class="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          ${getSvgIcon('smartphone', 'w-4 h-4 text-slate-500')} Customer QR &rarr;
        </a>
        <p class="text-[11px] text-center text-slate-500">Autopilot: <strong class="text-brand-600 font-bold uppercase">${location.autopilotLevel || 'SMART (4-5★)'}</strong></p>
      </div>
    </aside>

    <!-- Main Section with Executive Top Bar -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- EXECUTIVE DASHBOARD TOP BAR -->
      <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
        <!-- Left: Breadcrumbs -->
        <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
          <a href="/app" class="hover:text-slate-900 transition-colors">Dashboard</a>
          <span>/</span>
          <span class="font-bold text-slate-900">${currentTabName}</span>
        </div>

        <!-- Right: Actions, Notifications & Profile -->
        <div class="flex items-center gap-3">
          
          <!-- Branch Switcher Dropdown -->
          <div class="relative group">
            <button type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="truncate max-w-[140px]">${(branches && branches[0]?.name) || 'Indiranagar Main'}</span>
              <span class="text-[9px] text-slate-400">▼</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50">
              <span class="block px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Branch Location</span>
              ${branches.map(b => `
                <button type="button" onclick="showToast('Switched to ${b.name}')" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between text-slate-800">
                  <div>
                    <strong class="block">${b.name}</strong>
                    <span class="text-[10px] text-slate-400">${b.city} • ${b.rating}★</span>
                  </div>
                  ${b.isPrimary ? '<span class="text-[9px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-bold">Main</span>' : ''}
                </button>
              `).join('')}
              <div class="pt-2 border-t border-slate-100">
                <a href="/app/team" class="block px-3 py-1.5 text-xs text-brand-600 font-bold hover:underline">+ Add New Branch</a>
              </div>
            </div>
          </div>

          <!-- Quick Simulate Review Button -->
          <button type="button" onclick="triggerSimulateReview()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" title="Simulate a real patient review to test autopilot response">
            ${getSvgIcon('plus', 'w-3.5 h-3.5 text-emerald-700')}
            <span>+ Simulate Review</span>
          </button>

          <!-- Notification Bell Dropdown -->
          <div class="relative group">
            <button type="button" class="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Notifications">
              ${getSvgIcon('bell', 'w-4 h-4')}
              ${unreadNotifs > 0 ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>` : ''}
            </button>
            <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <strong class="font-bold text-slate-900">Notifications (${unreadNotifs} unread)</strong>
                <button type="button" onclick="showToast('All notifications marked as read')" class="text-[10px] text-brand-600 hover:underline">Mark all read</button>
              </div>
              <div class="py-2 space-y-2 max-h-64 overflow-y-auto">
                ${notifications.map(n => `
                  <a href="${n.link || '/app'}" class="block p-2 rounded-xl hover:bg-slate-50 space-y-0.5 ${n.unread ? 'bg-amber-50/50' : ''}">
                    <div class="flex justify-between font-bold text-slate-900">
                      <span>${n.title}</span>
                      <span class="text-[10px] text-slate-400 font-normal">${n.time}</span>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-snug">${n.message}</p>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative group">
            <button type="button" class="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <div class="w-7 h-7 rounded-lg bg-dark-950 text-white font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span class="hidden md:inline font-bold text-xs text-slate-900">Dr. Sharma</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="px-3 py-2 border-b border-slate-100">
                <strong class="block text-slate-900 font-bold">${store.user?.name || 'Dr. Ananya Sharma'}</strong>
                <span class="text-[10px] text-slate-500">${store.user?.role || 'Clinic Owner'}</span>
                <span class="inline-block mt-1 text-[9px] bg-brand-50 text-brand-800 font-bold px-1.5 py-0.5 rounded border border-brand-200">${store.user?.plan || 'Growth Plan'}</span>
              </div>
              <div class="py-1">
                <a href="/app/settings" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Autopilot Settings</a>
                <a href="/app/billing" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Billing & Invoices</a>
                <a href="/security" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Security & Compliance</a>
                <a href="/login" class="block px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold">Sign Out</a>
              </div>
            </div>
          </div>

        </div>
      </header>

      <!-- Content Canvas -->
      <section class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        ${contentHtml}
      </section>

    </div>
  </div>

  <script>
    async function triggerSimulateReview() {
      showToast('Simulating incoming patient review webhook…', 'info');
      const res = await fetch('/api/simulate-review', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('New review from ' + data.review.reviewerName + ' (' + data.review.rating + '★) processed by Autopilot!', 'success');
        setTimeout(() => window.location.reload(), 1200);
      }
    }
  </script>
  `;
}

module.exports = { renderAppShell };

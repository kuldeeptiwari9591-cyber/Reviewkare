const { getSvgIcon } = require('./icons.js');

function renderAppShell(activeTab, contentHtml, store = {}) {
  const reviews = store.reviews || [];
  const notifications = store.notifications || [];
  const location = store.location || { name: 'Dr. Sharma Dental & Implant Clinic', area: 'Indiranagar', city: 'Bengaluru', vertical: 'clinic' };
  const businesses = store.businesses || [
    { id: 'b_clinic', name: 'Dr. Sharma Dental Clinic', area: 'Indiranagar 100ft Rd', city: 'Bengaluru', vertical: 'clinic', rating: 4.9 },
    { id: 'b_cafe', name: 'The Roastery Artisan Cafe', area: '12th Main Indiranagar', city: 'Bengaluru', vertical: 'cafe', rating: 4.8 },
    { id: 'b_salon', name: 'Bounce Hair Studio & Spa', area: 'Lavelle Road', city: 'Bengaluru', vertical: 'salon', rating: 4.9 },
    { id: 'b_gym', name: 'IronVault Strength Club', area: '4th Block Koramangala', city: 'Bengaluru', vertical: 'gym', rating: 4.8 }
  ];
  
  const heldCount = reviews.filter(r => r.reply && r.reply.status === 'held').length;
  const unreadNotifs = notifications.filter(n => n.unread).length;
  
  const navItems = [
    { id: 'dashboard', name: 'Operations Overview', href: '/app', icon: 'dashboard' },
    { id: 'reviews', name: 'Google Reviews Feed', href: '/app/reviews', icon: 'reviews' },
    { id: 'approvals', name: 'Held Approvals Shield', href: '/app/approvals', icon: 'approvals', badge: heldCount > 0 ? heldCount : null },
    { id: 'whatsapp', name: 'WhatsApp Cloud API', href: '/app/integrations/whatsapp', icon: 'whatsapp' },
    { id: 'pos', name: 'POS Webhooks (Petpooja)', href: '/app/integrations/pos', icon: 'webhook' },
    { id: 'disputes', name: 'AI Policy Disputes', href: '/app/disputes', icon: 'dispute' },
    { id: 'sentiment', name: 'Sentiment & Root-Cause', href: '/app/sentiment', icon: 'sentiment' },
    { id: 'qr', name: '3D In-Store QR Studio', href: '/app/qr', icon: 'qr' },
    { id: 'hardware', name: 'NFC Hardware Studio', href: '/app/hardware', icon: 'hardware' },
    { id: 'staff', name: 'Staff Review Attribution', href: '/app/staff', icon: 'staff' },
    { id: 'local-pack', name: 'Google Local 3-Pack Simulator', href: '/app/local-pack', icon: 'localPack' },
    { id: 'organizations', name: 'Multi-Unit Enterprise', href: '/app/organizations', icon: 'organizations' },
    { id: 'reports', name: 'Weekly Performance Reports', href: '/app/reports', icon: 'reports' },
    { id: 'settings', name: 'Autopilot Engine Rules', href: '/app/settings', icon: 'settings' },
    { id: 'billing', name: 'GST Invoices & Subscription', href: '/app/billing', icon: 'billing' },
  ];

  const currentTabName = navItems.find(i => i.id === activeTab)?.name || 'Dashboard';

  // Vertical Icon Resolver
  const verticalIconName = location.vertical === 'cafe' ? 'coffee' : (location.vertical === 'salon' ? 'scissors' : (location.vertical === 'gym' ? 'dumbbell' : 'clinic'));

  return `
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
    
    <!-- Sidebar Navigation -->
    <aside class="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 p-4" aria-label="Dashboard Sidebar">
      <div>
        
        <!-- Active Business Card Lockup -->
        <div class="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 mb-4 card-3d">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-brand-500/20">
              ${getSvgIcon(verticalIconName, 'w-4 h-4 text-white')}
            </div>
            <div class="overflow-hidden">
              <h2 class="font-bold text-xs text-slate-900 truncate">${location.name || 'Dr. Sharma Dental'}</h2>
              <p class="text-[11px] text-slate-500 truncate">${location.area || 'Indiranagar'}, ${location.city || 'Bengaluru'}</p>
            </div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 flex items-center gap-1.5 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span> Google Business API Live
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1 text-xs font-semibold" aria-label="Dashboard Navigation">
          ${navItems.map((item) => `
            <a href="${item.href}" class="flex items-center justify-between px-3 min-h-[40px] rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              activeTab === item.id ? 'bg-dark-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }">
              <span class="flex items-center gap-2.5">
                ${getSvgIcon(item.icon, activeTab === item.id ? 'w-4 h-4 text-brand-400' : 'w-4 h-4 text-slate-500')}
                <span>${item.name}</span>
              </span>
              ${item.badge ? `<span class="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full tabular-nums">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Quick QR link & Autopilot State -->
      <div class="pt-4 border-t border-slate-100 space-y-2">
        <a href="/q/sharma-dent-01" target="_blank" class="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          ${getSvgIcon('smartphone', 'w-4 h-4 text-brand-600')} Live Customer QR &rarr;
        </a>
        <p class="text-[10px] text-center text-slate-500 font-medium">Autopilot: <strong class="text-brand-600 font-bold uppercase font-mono">${location.autopilotLevel || 'SMART (4-5★)'}</strong></p>
      </div>
    </aside>

    <!-- Main Section with Executive Top Bar -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- EXECUTIVE DASHBOARD TOP BAR -->
      <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
        
        <!-- Left: Breadcrumbs -->
        <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
          <a href="/app" class="hover:text-slate-900 transition-colors">Workspace</a>
          <span class="text-slate-300">/</span>
          <span class="font-bold text-slate-900">${currentTabName}</span>
        </div>

        <!-- Right: Actions, Multi-Vertical Switcher, Notifications & Profile -->
        <div class="flex items-center gap-3">
          
          <!-- Multi-Vertical Business Switcher Dropdown -->
          <div class="relative group">
            <button type="button" class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-brand-600"></span>
              <span class="truncate max-w-[150px]">${location.name || 'Dr. Sharma Dental'}</span>
              <span class="text-[9px] text-slate-400">▼</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50">
              <span class="block px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Switch Location & Industry</span>
              ${businesses.map(b => `
                <button type="button" onclick="switchActiveBusiness('${b.id}')" class="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between text-slate-800 transition-colors ${b.id === location.id ? 'bg-brand-50/60 font-bold' : ''}">
                  <div class="flex items-center gap-2 overflow-hidden">
                    <span class="w-2 h-2 rounded-full ${b.id === location.id ? 'bg-brand-600' : 'bg-slate-300'}"></span>
                    <div class="overflow-hidden">
                      <strong class="block truncate">${b.name}</strong>
                      <span class="text-[10px] text-slate-500 truncate block">${b.area} • ${b.rating}★</span>
                    </div>
                  </div>
                  <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0 font-mono">${b.vertical}</span>
                </button>
              `).join('')}
              <div class="pt-2 mt-1 border-t border-slate-100">
                <a href="/app/team" class="block px-3 py-1.5 text-xs text-brand-600 font-bold hover:underline">+ Register New Location</a>
              </div>
            </div>
          </div>

          <!-- Quick Simulate Review Button -->
          <button type="button" onclick="triggerSimulateReview()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" title="Simulate a real patient/customer review to test autopilot response">
            ${getSvgIcon('plus', 'w-3.5 h-3.5 text-brand-600')}
            <span>+ Simulate Review</span>
          </button>

          <!-- Notification Bell Dropdown -->
          <div class="relative group">
            <button type="button" class="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500" aria-label="Notifications">
              ${getSvgIcon('bell', 'w-4 h-4')}
              ${unreadNotifs > 0 ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>` : ''}
            </button>
            <div class="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <strong class="font-bold text-slate-900">Notifications (${unreadNotifs} unread)</strong>
                <button type="button" onclick="markAllNotificationsRead()" class="text-[10px] text-brand-600 hover:underline">Mark all read</button>
              </div>
              <div class="py-2 space-y-2 max-h-64 overflow-y-auto">
                ${notifications.map(n => `
                  <a href="${n.link || '/app'}" class="block p-2 rounded-xl hover:bg-slate-50 space-y-0.5 ${n.unread ? 'bg-amber-50/40 border border-amber-200/60' : ''}">
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
            <button type="button" class="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <div class="w-7 h-7 rounded-lg bg-dark-950 text-white font-bold text-xs flex items-center justify-center font-heading">
                ${(store.user?.name || 'Dr. Sharma')[0]}
              </div>
              <span class="text-xs font-bold text-slate-700 hidden sm:inline max-w-[120px] truncate">${store.user?.name || 'Dr. Ananya Sharma'}</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="px-3 py-2 border-b border-slate-100">
                <strong class="block text-slate-900 font-bold">${store.user?.name || 'Dr. Ananya Sharma'}</strong>
                <span class="text-[10px] text-slate-500">${store.user?.role || 'Executive Group Director'}</span>
                <span class="inline-block mt-1 text-[9px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200 font-mono">${store.user?.plan || 'Enterprise Multi-Location'}</span>
              </div>
              <div class="py-1">
                <a href="/app/settings" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Autopilot Rules</a>
                <a href="/app/team" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Manage Branches</a>
                <a href="/app/billing" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">GST Invoices</a>
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
      showToast('Simulating incoming customer review webhook…', 'info');
      const res = await fetch('/api/simulate-review', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('New review from ' + data.review.reviewerName + ' (' + data.review.rating + '★) processed by Autopilot!', 'success');
        setTimeout(() => window.location.reload(), 1100);
      }
    }

    async function switchActiveBusiness(branchId) {
      showToast('Switching active operating workspace…', 'info');
      const res = await fetch('/api/branch/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Switched to ' + data.location.name, 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    }

    async function markAllNotificationsRead() {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      showToast('All notifications marked as read', 'success');
      setTimeout(() => window.location.reload(), 600);
    }
  </script>
  `;
}

module.exports = { renderAppShell };

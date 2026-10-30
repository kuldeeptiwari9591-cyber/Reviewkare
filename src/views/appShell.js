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
  
  const primaryQrCode = (store.qrcodes && store.qrcodes[0]) ? store.qrcodes[0].code : 'sharma-dent-01';

  const navItems = [
    { id: 'dashboard', name: 'Overview', href: '/app', icon: 'dashboard' },
    { id: 'reviews', name: 'Google Reviews Feed', href: '/app/reviews', icon: 'reviews' },
    { id: 'approvals', name: 'Held Approvals Shield', href: '/app/approvals', icon: 'approvals', badge: heldCount > 0 ? heldCount : null },
    { id: 'qr', name: 'In-Store Smart QR Studio', href: '/app/qr', icon: 'qr' },
    { id: 'staff', name: 'Staff Review Attribution', href: '/app/staff', icon: 'staff' },
    { id: 'local-pack', name: 'Local 3-Pack SEO Simulator', href: '/app/local-pack', icon: 'localPack' },
    { id: 'sentiment', name: 'Sentiment & Root-Cause', href: '/app/sentiment', icon: 'sentiment' },
    { id: 'settings', name: 'Autopilot Engine Rules', href: '/app/settings', icon: 'settings' },
    { id: 'billing', name: 'Subscription & Razorpay', href: '/app/billing', icon: 'billing' },
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
        <a href="/q/${primaryQrCode}" target="_blank" class="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
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
          
          <!-- Plan Badge -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>${store.user?.plan?.name || (typeof store.user?.plan === 'string' ? store.user?.plan : '14-Day Free Pilot')}</span>
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
                ${(store.user?.name || location.name || 'R')[0]}
              </div>
              <span class="text-xs font-bold text-slate-700 hidden sm:inline max-w-[120px] truncate">${store.user?.name || location.name}</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="px-3 py-2 border-b border-slate-100">
                <strong class="block text-slate-900 font-bold truncate">${store.user?.name || location.name}</strong>
                <span class="text-[10px] text-slate-500 truncate block">${store.user?.email || 'admin@replyo.in'}</span>
                <span class="inline-block mt-1 text-[9px] bg-brand-50 text-brand-700 font-bold px-1.5 py-0.5 rounded border border-brand-200 font-mono">${store.user?.plan?.name || (typeof store.user?.plan === 'string' ? store.user?.plan : 'Starter Trial')}</span>
              </div>
              <div class="py-1">
                <a href="/app/settings" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Autopilot Rules</a>
                <a href="/app/billing" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Subscription & Razorpay</a>
                <a href="/security" class="block px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium">Security & Compliance</a>
                <a href="/logout" class="block px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center justify-between"><span>Sign Out</span><span class="text-[10px] text-rose-400 font-normal">Secure</span></a>
              </div>
            </div>
          </div>

        </div>
      </header>

      <!-- Content Canvas -->
      <section class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto mb-16 md:mb-0">
        ${contentHtml}
      </section>

      <!-- Mobile Bottom Navigation Bar (Thumb-Friendly on Smartphones) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex items-center justify-around py-2 px-1 shadow-xl" aria-label="Mobile Navigation">
        <a href="/app" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-brand-600' : 'text-slate-500'}">
          ${getSvgIcon('dashboard', 'w-5 h-5')}
          <span>Overview</span>
        </a>
        <a href="/app/reviews" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'reviews' ? 'text-brand-600' : 'text-slate-500'}">
          ${getSvgIcon('reviews', 'w-5 h-5')}
          <span>Reviews</span>
        </a>
        <a href="/app/approvals" class="flex flex-col items-center gap-1 text-[10px] font-bold relative ${activeTab === 'approvals' ? 'text-brand-600' : 'text-slate-500'}">
          ${getSvgIcon('approvals', 'w-5 h-5')}
          ${heldCount > 0 ? `<span class="absolute -top-1 -right-2 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">${heldCount}</span>` : ''}
          <span>Held</span>
        </a>
        <a href="/app/qr" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'qr' ? 'text-brand-600' : 'text-slate-500'}">
          ${getSvgIcon('qr', 'w-5 h-5')}
          <span>My QR</span>
        </a>
        <a href="/app/billing" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'billing' ? 'text-brand-600' : 'text-slate-500'}">
          ${getSvgIcon('billing', 'w-5 h-5')}
          <span>Plans</span>
        </a>
      </nav>
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

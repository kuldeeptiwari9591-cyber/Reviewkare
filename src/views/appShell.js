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
    { id: 'reviews', name: 'Reviews Feed', href: '/app/reviews', icon: 'reviews' },
    { id: 'approvals', name: 'Review Approvals', href: '/app/approvals', icon: 'approvals', badge: heldCount > 0 ? heldCount : null },
    { id: 'qr', name: 'QR Stands', href: '/app/qr', icon: 'qr' },
    { id: 'staff', name: 'Staff Attribution', href: '/app/staff', icon: 'staff' },
    { id: 'local-pack', name: 'Local SEO', href: '/app/local-pack', icon: 'localPack' },
    { id: 'sentiment', name: 'Sentiment Analysis', href: '/app/sentiment', icon: 'sentiment' },
    { id: 'settings', name: 'Settings', href: '/app/settings', icon: 'settings' },
    { id: 'billing', name: 'Billing', href: '/app/billing', icon: 'billing' },
  ];

  const currentTabName = navItems.find(i => i.id === activeTab)?.name || 'Dashboard';

  // Vertical Icon Resolver
  const verticalIconName = location.vertical === 'cafe' ? 'coffee' : (location.vertical === 'salon' ? 'scissors' : (location.vertical === 'gym' ? 'dumbbell' : 'clinic'));

  return `
  <div class="min-h-screen bg-[#F3EEE3] flex flex-col md:flex-row font-sans text-[#111111]">
    
    <!-- Sidebar Navigation (Cream Surface #FBF8F3 with Ink Borders #DFD7C7) -->
    <aside class="w-full md:w-64 bg-[#FBF8F3] border-r border-[#DFD7C7] flex flex-col justify-between shrink-0 p-4" aria-label="Dashboard Sidebar">
      <div>
        
        <!-- Active Business Card Lockup -->
        <div class="p-3.5 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] mb-4 card-lift">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-[10px] bg-[#D9541E] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              ${getSvgIcon(verticalIconName, 'w-4 h-4 text-white')}
            </div>
            <div class="overflow-hidden">
              <h2 class="font-bold text-xs text-[#111111] truncate font-heading">${location.name || 'Dr. Sharma Dental'}</h2>
              <p class="text-[11px] text-[#6E6E6E] truncate font-sans-clean">${location.area || 'Indiranagar'}, ${location.city || 'Bengaluru'}</p>
            </div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-[#D9541E] bg-[#FAEDE8] px-2 py-0.5 rounded-md border border-[#EFBCA8] flex items-center gap-1.5 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-[#D9541E] animate-pulse"></span> Google Business API Live
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1 text-xs font-semibold" aria-label="Dashboard Navigation">
          ${navItems.map((item) => `
            <a href="${item.href}" class="flex items-center justify-between px-3 min-h-[40px] rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] ${
              activeTab === item.id ? 'bg-[#111111] text-[#F3EEE3] shadow-sm font-bold' : 'text-[#111111] hover:bg-[#EBE5D8] hover:text-[#111111]'
            }">
              <span class="flex items-center gap-2.5">
                ${getSvgIcon(item.icon, activeTab === item.id ? 'w-4 h-4 text-[#D9541E]' : 'w-4 h-4 text-[#6E6E6E]')}
                <span>${item.name}</span>
              </span>
              ${item.badge ? `<span class="bg-[#D9541E] text-white font-bold text-[10px] px-2 py-0.5 rounded-full tabular-nums">${item.badge}</span>` : ''}
            </a>
          `).join('')}
        </nav>
      </div>

      <!-- Quick QR link & Autopilot State -->
      <div class="pt-4 border-t border-[#DFD7C7] space-y-2">
        <a href="/q/${primaryQrCode}" target="_blank" class="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-[10px] border border-[#111111] bg-[#FBF8F3] text-xs font-bold text-[#111111] hover:bg-[#EBE5D8] transition-all btn-lift shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]">
          ${getSvgIcon('smartphone', 'w-4 h-4 text-[#D9541E]')} Live Customer QR &rarr;
        </a>
        <p class="text-[10px] text-center text-[#6E6E6E] font-medium font-sans-clean">Autopilot: <strong class="text-[#D9541E] font-bold uppercase font-mono">${location.autopilotLevel || 'SMART (4-5★)'}</strong></p>
      </div>
    </aside>

    <!-- Main Section with Executive Top Bar -->
    <div class="flex-1 flex flex-col min-w-0">
      
      <!-- EXECUTIVE DASHBOARD TOP BAR -->
      <header class="bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#DFD7C7] px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
        
        <!-- Left: Breadcrumbs -->
        <div class="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] font-sans-clean">
          <span class="font-bold text-[#111111]">${currentTabName}</span>
        </div>

        <!-- Right: Actions, Notifications & Profile -->
        <div class="flex items-center gap-3">
          
          <!-- Plan Badge -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAEDE8] border border-[#EFBCA8] text-[#D9541E] text-[11px] font-bold font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-[#D9541E] animate-pulse"></span>
            <span>${store.user?.plan?.name || (typeof store.user?.plan === 'string' ? store.user?.plan : '14-Day Free Trial')}</span>
          </div>

          <!-- Quick Simulate Review Button -->
          <button type="button" onclick="triggerSimulateReview()" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAEDE8] hover:bg-[#F7DDD3] text-[#D9541E] border border-[#EFBCA8] rounded-[10px] text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]" title="Simulate a real patient/customer review to test autopilot response">
            ${getSvgIcon('plus', 'w-3.5 h-3.5 text-[#D9541E]')}
            <span>Test Autopilot</span>
          </button>

          <!-- Notification Bell Dropdown -->
          <div class="relative group">
            <button type="button" class="relative p-2 rounded-xl border border-[#DFD7C7] hover:border-[#111111] bg-[#FBF8F3] hover:bg-[#EBE5D8] text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]" aria-label="Notifications">
              ${getSvgIcon('bell', 'w-4 h-4 text-[#111111]')}
              ${unreadNotifs > 0 ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-[#D9541E] rounded-full border-2 border-white"></span>` : ''}
            </button>
            <div class="absolute right-0 top-full mt-2 w-80 bg-[#FBF8F3] rounded-2xl shadow-2xl border border-[#111111] p-3 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="flex justify-between items-center pb-2 border-b border-[#DFD7C7]">
                <strong class="font-bold text-[#111111]">Notifications (${unreadNotifs} unread)</strong>
                <button type="button" onclick="markAllNotificationsRead()" class="text-[10px] text-[#D9541E] hover:underline font-bold">Mark all read</button>
              </div>
              <div class="py-2 space-y-2 max-h-64 overflow-y-auto">
                ${notifications.map(n => `
                  <a href="${n.link || '/app'}" class="block p-2 rounded-xl hover:bg-[#EBE5D8] space-y-0.5 ${n.unread ? 'bg-[#FAEDE8] border border-[#EFBCA8]' : ''}">
                    <div class="flex justify-between font-bold text-[#111111]">
                      <span>${n.title}</span>
                      <span class="text-[10px] text-[#6E6E6E] font-normal">${n.time}</span>
                    </div>
                    <p class="text-[11px] text-[#4A4A4A] leading-snug font-sans-clean">${n.message}</p>
                  </a>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative group">
            <button type="button" class="flex items-center gap-2 p-1 pl-2 rounded-xl border border-[#DFD7C7] hover:border-[#111111] bg-[#FBF8F3] hover:bg-[#EBE5D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]">
              <div class="w-7 h-7 rounded-lg bg-[#111111] text-[#F3EEE3] font-bold text-xs flex items-center justify-center font-heading">
                ${(store.user?.name || location.name || 'R')[0]}
              </div>
              <span class="text-xs font-bold text-[#111111] hidden sm:inline max-w-[120px] truncate">${store.user?.name || location.name}</span>
            </button>
            <div class="absolute right-0 top-full mt-2 w-56 bg-[#FBF8F3] rounded-2xl shadow-2xl border border-[#111111] p-2 hidden group-hover:block animate-in fade-in z-50 text-xs">
              <div class="px-3 py-2 border-b border-[#DFD7C7]">
                <strong class="block text-[#111111] font-bold truncate">${store.user?.name || location.name}</strong>
                <span class="text-[10px] text-[#6E6E6E] truncate block font-sans-clean">${store.user?.email || 'admin@reviewkare.tech'}</span>
                <span class="inline-block mt-1 text-[9px] bg-[#FAEDE8] text-[#D9541E] font-bold px-1.5 py-0.5 rounded border border-[#EFBCA8] font-mono">${store.user?.plan?.name || (typeof store.user?.plan === 'string' ? store.user?.plan : 'Starter Trial')}</span>
              </div>
              <div class="py-1">
                <a href="/app/settings" class="block px-3 py-2 rounded-xl hover:bg-[#EBE5D8] text-[#111111] font-medium">Settings</a>
                <a href="/app/billing" class="block px-3 py-2 rounded-xl hover:bg-[#EBE5D8] text-[#111111] font-medium">Billing</a>
                <a href="/security" class="block px-3 py-2 rounded-xl hover:bg-[#EBE5D8] text-[#111111] font-medium">Security &amp; Compliance</a>
                <a href="/logout" class="block px-3 py-2 rounded-xl hover:bg-[#FAEDE8] text-[#D9541E] font-bold flex items-center justify-between"><span>Sign Out</span><span class="text-[10px] text-[#D9541E]/80 font-mono">Secure</span></a>
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
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-[#FBF8F3] border-t border-[#DFD7C7] z-50 flex items-center justify-around py-2 px-1 shadow-xl" aria-label="Mobile Navigation">
        <a href="/app" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-[#D9541E]' : 'text-[#6E6E6E]'}">
          ${getSvgIcon('dashboard', 'w-5 h-5')}
          <span>Overview</span>
        </a>
        <a href="/app/reviews" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'reviews' ? 'text-[#D9541E]' : 'text-[#6E6E6E]'}">
          ${getSvgIcon('reviews', 'w-5 h-5')}
          <span>Reviews</span>
        </a>
        <a href="/app/approvals" class="flex flex-col items-center gap-1 text-[10px] font-bold relative ${activeTab === 'approvals' ? 'text-[#D9541E]' : 'text-[#6E6E6E]'}">
          ${getSvgIcon('approvals', 'w-5 h-5')}
          ${heldCount > 0 ? `<span class="absolute -top-1 -right-2 bg-[#D9541E] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">${heldCount}</span>` : ''}
          <span>Approvals</span>
        </a>
        <a href="/app/qr" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'qr' ? 'text-[#D9541E]' : 'text-[#6E6E6E]'}">
          ${getSvgIcon('qr', 'w-5 h-5')}
          <span>QR Studio</span>
        </a>
        <a href="/app/staff" class="flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'staff' ? 'text-[#D9541E]' : 'text-[#6E6E6E]'}">
          ${getSvgIcon('staff', 'w-5 h-5')}
          <span>Staff</span>
        </a>
      </nav>

    </div>
  </div>

  <script>
    async function triggerSimulateReview() {
      try {
        const res = await fetch('/api/simulate-review', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          showToast('✓ Real review simulated: "' + data.review.text.substring(0, 40) + '…"', 'success');
          setTimeout(() => window.location.reload(), 1200);
        }
      } catch (e) {
        showToast('Error simulating review', 'error');
      }
    }

    async function markAllNotificationsRead() {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      window.location.reload();
    }
  </script>
  `;
}

module.exports = { renderAppShell };

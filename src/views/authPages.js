// Authentication Views adhering to Swiss Minimalist Design & Web Guidelines Standard
const { getSvgIcon } = require('./icons.js');

function renderLoginPage(query = {}) {
  const isDemo = query.demo === 'true';
  const emailVal = isDemo ? 'dr.sharma@sharmadental.in' : '';
  const pwdVal = isDemo ? 'ClinicalDemo@2026' : '';
  const isLoggedOut = query.logged_out === '1' || query.logged_out === 'true';
  const isAuthRequired = query.auth_required === '1' || query.auth_required === 'true';
  const redirectTarget = query.redirect || '/app';

  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-md w-full space-y-8">
      
      <!-- Brand Header -->
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-6 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
          <div class="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center text-brand-400 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-slate-900">Replyo</span>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Sign in to Replyo Enterprise OS
        </h1>
        <p class="mt-2 text-xs text-slate-500 font-medium">
          Manage Google Business reviews, frontline staff attribution & in-store QR flows across your locations.
        </p>
      </div>

      ${isLoggedOut ? `
      <!-- Secure Logout Success Banner -->
      <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in" role="status">
        ${getSvgIcon('check', 'w-4 h-4 text-emerald-600 shrink-0')}
        <span>You have been safely signed out. Your clinic session and cookies were cleared.</span>
      </div>
      ` : ''}

      ${isAuthRequired ? `
      <!-- Authentication Required Notice -->
      <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-2.5 text-xs font-semibold shadow-xs animate-in fade-in" role="alert">
        ${getSvgIcon('lock', 'w-4 h-4 text-amber-600 shrink-0')}
        <span>Authentication required. Please sign in or use the 1-Click Demo account below to access the workspace.</span>
      </div>
      ` : ''}

      <!-- Quick 1-Click Multi-Vertical Demo Account Card -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/60 border border-brand-200 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-600 text-white text-[10px] font-bold tracking-wide uppercase font-mono">
              ${getSvgIcon('sparkles', 'w-3 h-3')} 1-Click Multi-Vertical Demo
            </div>
            <h2 class="text-xs font-bold text-slate-900">Dr. Sharma Dental, The Roastery Cafe, Bounce Salon & IronVault Gym</h2>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              Explore the live executive dashboard with 4 multi-vertical businesses, real-world reviews, and frontline staff leaderboards.
            </p>
          </div>
        </div>
        <button type="button" onclick="fillDemoAndLogin()" class="mt-3 w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
          <span>Enter Live Workspace (Instant 1-Click)</span>
          ${getSvgIcon('arrowRight', 'w-4 h-4')}
        </button>
      </div>

      <!-- Standard Login Form -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d">
        <form id="loginForm" onsubmit="handleLoginSubmit(event)" class="space-y-4">
          <div>
            <label for="emailInput" class="block text-xs font-bold text-slate-700 mb-1.5">
              Registered Clinic Email
            </label>
            <div class="relative">
              <input 
                id="emailInput" 
                type="email" 
                required 
                value="${emailVal}"
                placeholder="doctor@clinic.in"
                autocomplete="email"
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="passwordInput" class="block text-xs font-bold text-slate-700">
                Password
              </label>
              <a href="/forgot-password" class="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
                Forgot password?
              </a>
            </div>
            <div class="relative">
              <input 
                id="passwordInput" 
                type="password" 
                required 
                value="${pwdVal}"
                placeholder="••••••••••••"
                autocomplete="current-password"
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              />
              <button 
                type="button" 
                onclick="togglePwdVisibility()" 
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Toggle password visibility"
              >
                ${getSvgIcon('lock', 'w-4 h-4')}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input type="checkbox" id="rememberMe" checked class="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500">
              <span>Remember this reception terminal</span>
            </label>
          </div>

          <div id="loginAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="loginSubmitBtn"
            class="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-950 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span>Sign In to Dashboard</span>
            ${getSvgIcon('arrowRight', 'w-4 h-4')}
          </button>
        </form>

        <div class="mt-6 pt-6 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-500 font-medium">
            New clinic or multi-chain group?
            <a href="/signup" class="font-bold text-brand-600 hover:text-brand-700 hover:underline ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded">
              Start 14-day free trial &rarr;
            </a>
          </p>
        </div>
      </div>

      <!-- Compliance & Security Trust Footer -->
      <div class="flex items-center justify-center gap-4 text-[11px] text-slate-500">
        <span class="flex items-center gap-1.5">
          ${getSvgIcon('shield', 'w-3.5 h-3.5 text-emerald-600')} DPDP Act 2023 Compliant
        </span>
        <span class="text-slate-300">•</span>
        <span class="flex items-center gap-1.5">
          ${getSvgIcon('lock', 'w-3.5 h-3.5 text-emerald-600')} 256-Bit TLS 1.3
        </span>
        <span class="text-slate-300">•</span>
        <span class="flex items-center gap-1.5">
          ${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} Official Google API
        </span>
      </div>

    </div>
  </main>

  <script>
    function togglePwdVisibility() {
      const pwd = document.getElementById('passwordInput');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
    }

    function fillDemoAndLogin() {
      document.getElementById('emailInput').value = 'dr.sharma@sharmadental.in';
      document.getElementById('passwordInput').value = 'ClinicalDemo@2026';
      handleLoginSubmit(new Event('submit'));
    }

    async function handleLoginSubmit(e) {
      if (e) e.preventDefault();
      const email = document.getElementById('emailInput').value;
      const pwd = document.getElementById('passwordInput').value;
      const btn = document.getElementById('loginSubmitBtn');
      const alert = document.getElementById('loginAlert');

      btn.disabled = true;
      btn.innerHTML = 'Authenticating with Google OAuth API…';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pwd, redirect: '${redirectTarget}' })
        });
        const data = await res.json();
        
        if (data.success) {
          alert.className = 'p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block';
          alert.innerText = 'Login successful! Redirecting to clinic dashboard…';
          setTimeout(() => { window.location.href = data.redirect || '${redirectTarget}'; }, 500);
        } else {
          alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
          alert.innerText = data.error || 'Invalid clinic credentials. Try the 1-Click Demo button above.';
          btn.disabled = false;
          btn.innerHTML = '<span>Sign In to Dashboard</span>';
        }
      } catch (err) {
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Connection error. Please try again.';
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In to Dashboard</span>';
      }
    }
  </script>
  `;
}

function renderSignupPage() {
  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-xl w-full space-y-8">
      
      <!-- Brand Header -->
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-xl">
          <div class="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center text-brand-400 font-black text-xl shadow-md">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-slate-900">Replyo</span>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight" style="text-wrap: balance;">
          Start Your 14-Day Free Clinic Trial
        </h1>
        <p class="mt-2 text-xs text-slate-500 font-medium">
          Automate 5-star Google replies in 4 minutes. No credit card required. Instant UPI activation.
        </p>
      </div>

      <!-- Registration Multi-Step Card -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <span class="text-xs font-bold text-slate-900">Clinic Profile</span>
          </div>
          <div class="h-0.5 w-12 bg-slate-200"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">2</span>
            <span class="text-xs font-bold text-slate-500">Google Link</span>
          </div>
          <div class="h-0.5 w-12 bg-slate-200"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">3</span>
            <span class="text-xs font-bold text-slate-500">Live Pilot</span>
          </div>
        </div>

        <form id="signupForm" onsubmit="handleSignupSubmit(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="clinicName" class="block text-xs font-bold text-slate-700 mb-1">
                Business / Clinic / Brand Name
              </label>
              <input 
                id="clinicName" 
                type="text" 
                required 
                placeholder="Dr. Sharma Dental, Roastery Cafe, or Bounce Salon" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div>
              <label for="industrySelect" class="block text-xs font-bold text-slate-700 mb-1">
                Industry Specialty
              </label>
              <select 
                id="industrySelect" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none bg-white"
              >
                <option value="dental">Dental & Implant Clinic</option>
                <option value="derma">Dermatology, Trichology & Aesthetics</option>
                <option value="cafe">Specialty Cafe, Bakery & Bistro</option>
                <option value="restaurant">Fine Dining, Bar & Restobar</option>
                <option value="salon">Hair Studio & Luxury Spa</option>
                <option value="gym">Gym, CrossFit & Athletic Club</option>
                <option value="coaching">Coaching & Academic Institute</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="citySelect" class="block text-xs font-bold text-slate-700 mb-1">
                City / Metro Region
              </label>
              <select 
                id="citySelect" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none bg-white"
              >
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Delhi NCR">Delhi NCR (Gurugram/Noida)</option>
                <option value="Mumbai">Mumbai / MMR</option>
                <option value="Hyderabad">Hyderabad (Telangana)</option>
                <option value="Pune">Pune (Maharashtra)</option>
                <option value="Chennai">Chennai (Tamil Nadu)</option>
                <option value="Other">Other Indian City</option>
              </select>
            </div>
            <div>
              <label for="ownerPhone" class="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Number (for 1-tap alerts)
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                <input 
                  id="ownerPhone" 
                  type="tel" 
                  required 
                  pattern="[0-9]{10}"
                  placeholder="98765 43210" 
                  class="w-full min-h-[44px] pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="signupEmail" class="block text-xs font-bold text-slate-700 mb-1">
              Official Email
            </label>
            <input 
              id="signupEmail" 
              type="email" 
              required 
              placeholder="contact@apexdental.in" 
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          <div>
            <label for="signupPwd" class="block text-xs font-bold text-slate-700 mb-1">
              Create Password
            </label>
            <input 
              id="signupPwd" 
              type="password" 
              required 
              minlength="8"
              placeholder="Minimum 8 characters" 
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div class="font-bold text-slate-900">Included in your 14-day free pilot:</div>
            <ul class="space-y-0.5">
              <li>• Unlimited AI review replies with dialect detection</li>
              <li>• In-clinic 30-sec QR generator with printable poster</li>
              <li>• 1-Tap WhatsApp owner approval for 1–3★ complaints</li>
              <li>• Zero setup fee • Cancel anytime in 1 click</li>
            </ul>
          </div>

          <div id="signupAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="signupSubmitBtn"
            class="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span>Activate 14-Day Free Pilot &rarr;</span>
          </button>
        </form>

        <div class="pt-4 border-t border-slate-100 text-center">
          <p class="text-xs text-slate-500">
            Already have an active account?
            <a href="/login" class="font-bold text-brand-600 hover:text-brand-700 hover:underline ml-1">
              Sign In here &rarr;
            </a>
          </p>
        </div>
      </div>

    </div>
  </main>

  <script>
    async function handleSignupSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('signupSubmitBtn');
      const alert = document.getElementById('signupAlert');
      btn.disabled = true;
      btn.innerText = 'Creating clinic account & linking Google Sandbox…';

      const payload = {
        clinicName: document.getElementById('clinicName').value,
        industry: document.getElementById('industrySelect').value,
        city: document.getElementById('citySelect').value,
        phone: document.getElementById('ownerPhone').value,
        email: document.getElementById('signupEmail').value,
      };

      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert.className = 'p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block';
          alert.innerText = 'Account successfully initialized! Directing to clinic dashboard…';
          setTimeout(() => { window.location.href = '/app'; }, 800);
        } else {
          alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
          alert.innerText = data.error || 'Failed to create account.';
          btn.disabled = false;
          btn.innerText = 'Activate 14-Day Free Pilot →';
        }
      } catch (err) {
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Network error. Please try again.';
        btn.disabled = false;
        btn.innerText = 'Activate 14-Day Free Pilot →';
      }
    }
  </script>
  `;
}

function renderForgotPasswordPage() {
  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-4 group">
          <div class="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center text-brand-400 font-black text-xl shadow-md">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-slate-900">Replyo</span>
        </a>
        <h1 class="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
          Reset Clinic Password
        </h1>
        <p class="mt-2 text-xs text-slate-500">
          Enter your registered clinic email or WhatsApp phone number to receive a secure OTP reset link.
        </p>
      </div>

      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm card-3d space-y-4">
        <form id="forgotForm" onsubmit="handleForgotSubmit(event)" class="space-y-4">
          <div>
            <label for="recoveryInput" class="block text-xs font-bold text-slate-700 mb-1.5">
              Clinic Email or 10-digit WhatsApp Number
            </label>
            <input 
              id="recoveryInput" 
              type="text" 
              required 
              placeholder="doctor@clinic.in or 9876543210" 
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          <div id="forgotAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="forgotSubmitBtn"
            class="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-950 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <span>Send Reset OTP via WhatsApp & Email &rarr;</span>
          </button>
        </form>

        <div class="pt-4 border-t border-slate-100 text-center">
          <a href="/login" class="text-xs font-bold text-slate-600 hover:text-brand-600">
            &larr; Back to Sign In
          </a>
        </div>
      </div>
    </div>
  </main>

  <script>
    async function handleForgotSubmit(e) {
      e.preventDefault();
      const input = document.getElementById('recoveryInput').value;
      const btn = document.getElementById('forgotSubmitBtn');
      const alert = document.getElementById('forgotAlert');

      btn.disabled = true;
      btn.innerText = 'Dispatching secure OTP…';

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: input })
        });
        const data = await res.json();
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 block';
        alert.innerText = data.message || 'OTP reset instructions dispatched to your verified WhatsApp and email.';
        btn.disabled = false;
        btn.innerText = 'OTP Dispatched ✓';
      } catch (err) {
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Error sending request. Please contact support.';
        btn.disabled = false;
        btn.innerText = 'Send Reset OTP via WhatsApp & Email →';
      }
    }
  </script>
  `;
}

module.exports = {
  renderLoginPage,
  renderSignupPage,
  renderForgotPasswordPage
};

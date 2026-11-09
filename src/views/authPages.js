// Authentication Views adhering to Swiss Minimalist Design & Web Guidelines Standard
const { getSvgIcon } = require('./icons.js');
const { VERTICAL_PROFILES } = require('../lib/verticals.js');

function renderLoginPage(query = {}) {
  const isDemo = query.demo === 'true';
  const emailVal = isDemo ? 'dr.sharma@sharmadental.in' : '';
  const pwdVal = isDemo ? 'ClinicalDemo@2026' : '';
  const isLoggedOut = query.logged_out === '1' || query.logged_out === 'true';
  const isAuthRequired = query.auth_required === '1' || query.auth_required === 'true';
  const redirectTarget = query.redirect || '/app';

  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F3EEE3]">
    <div class="max-w-md w-full space-y-6">
      
      <!-- Brand Header -->
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded-xl">
          <div class="w-10 h-10 rounded-xl bg-[#D9541E] flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform font-heading">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-[#111111]">ReviewKare</span>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
          Sign in to ReviewKare Enterprise
        </h1>
        <p class="mt-1.5 text-xs text-[#6E6E6E] font-medium">
          Autonomous Google Review Autopilot & In-Store Smart QR Operating System
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
        <span>Please sign in with your business email to access your ReviewKare workspace.</span>
      </div>
      ` : ''}

      <!-- Clean Standard Login Form -->
      <div class="bg-[#FBF8F3] rounded-3xl p-6 sm:p-8 border border-[#DFD7C7] shadow-sm card-3d card-lift">
        <form id="loginForm" onsubmit="handleLoginSubmit(event)" class="space-y-4">
          <div>
            <label for="emailInput" class="block text-xs font-bold text-[#2B2B2B] mb-1.5">
              Registered Business Email
            </label>
            <div class="relative">
              <input 
                id="emailInput" 
                type="email" 
                required 
                value="${emailVal}"
                placeholder="owner@yourbusiness.in"
                autocomplete="email"
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] bg-[#FBF8F3] placeholder-[#888888] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="passwordInput" class="block text-xs font-bold text-[#2B2B2B]">
                Password
              </label>
              <a href="/forgot-password" class="text-xs font-medium text-[#D9541E] hover:text-[#D9541E] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded">
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
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] bg-[#FBF8F3] placeholder-[#888888] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none transition-all"
              />
              <button 
                type="button" 
                onclick="togglePwdVisibility()" 
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#888888] hover:text-[#4A4A4A] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]"
                aria-label="Toggle password visibility"
              >
                ${getSvgIcon('lock', 'w-4 h-4')}
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-[#4A4A4A]">
              <input type="checkbox" id="rememberMe" checked class="w-4 h-4 rounded border-[#DFD7C7] text-[#D9541E] focus:ring-[#D9541E]">
              <span>Remember this terminal</span>
            </label>
          </div>

          <div id="loginAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="loginSubmitBtn"
            class="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D9541E] hover:bg-[#BF4615] text-white font-bold text-xs rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]"
          >
            <span>Sign In</span>
            ${getSvgIcon('arrowRight', 'w-4 h-4')}
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-[#DFD7C7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E6E6E] gap-2">
          <span>New business or clinic? <a href="/signup" class="font-bold text-[#D9541E] hover:underline">Start 14-day free pilot &rarr;</a></span>
          <button type="button" onclick="fillDemoAndLogin()" class="text-[11px] text-[#888888] hover:text-[#2B2B2B] underline focus-visible:outline-none">Test Demo Login</button>
        </div>
      </div>

      <!-- Compliance & Security Trust Footer -->
      <div class="flex items-center justify-center gap-4 text-[11px] text-[#6E6E6E]">
        <span class="flex items-center gap-1.5">
          ${getSvgIcon('shield', 'w-3.5 h-3.5 text-emerald-600')} DPDP Act 2023 Compliant
        </span>
        <span class="text-[#DFD7C7]">•</span>
        <span class="flex items-center gap-1.5">
          ${getSvgIcon('lock', 'w-3.5 h-3.5 text-emerald-600')} 256-Bit TLS 1.3
        </span>
        <span class="text-[#DFD7C7]">•</span>
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
          btn.innerHTML = '<span>Sign In</span>';
        }
      } catch (err) {
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Connection error. Please try again.';
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span>';
      }
    }
  </script>
  `;
}

function renderSignupPage() {
  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F3EEE3]">
    <div class="max-w-xl w-full space-y-8">
      
      <!-- Brand Header -->
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E] rounded-xl">
          <div class="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center text-brand-400 font-black text-xl shadow-md">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-[#111111]">ReviewKare</span>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#111111] font-heading tracking-tight" style="text-wrap: balance;">
          Start Your Free Trial
        </h1>
        <p class="mt-2 text-xs text-[#6E6E6E] font-medium">
          Calibrated onboarding for 8 Indian business verticals. Autonomous 4-minute replies & digital QR flow.
        </p>
      </div>

      <!-- Registration Multi-Step Card -->
      <div class="bg-[#FBF8F3] rounded-3xl p-6 sm:p-8 border border-[#DFD7C7] shadow-sm card-3d card-lift space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-[#DFD7C7]">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#D9541E] text-white font-bold text-xs flex items-center justify-center">1</span>
            <span class="text-xs font-bold text-[#111111]">Business Profile</span>
          </div>
          <div class="h-0.5 w-12 bg-[#EBE5D8]"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#F3EEE3] text-[#4A4A4A] font-bold text-xs flex items-center justify-center">2</span>
            <span class="text-xs font-bold text-[#6E6E6E]">QR Calibration</span>
          </div>
          <div class="h-0.5 w-12 bg-[#EBE5D8]"></div>
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#F3EEE3] text-[#4A4A4A] font-bold text-xs flex items-center justify-center">3</span>
            <span class="text-xs font-bold text-[#6E6E6E]">Live Pilot</span>
          </div>
        </div>

        <form id="signupForm" onsubmit="handleSignupSubmit(event)" class="space-y-4">
          
          <!-- Step 1: Industry Specialty Selection -->
          <div>
            <label for="industrySelect" class="block text-xs font-bold text-[#2B2B2B] mb-1">
              Select Your Business Vertical
            </label>
            <select 
              id="industrySelect" 
              onchange="onVerticalChange(this.value)"
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border-2 border-[#D9541E] text-xs font-bold text-[#111111] focus:border-brand-600 focus:ring-2 focus:ring-[#D9541E]/20 outline-none bg-[#FAEDE8]/20"
            >
              <option value="clinic">Healthcare & Dental Clinics (4-Step Deep Clinical Trust Flow)</option>
              <option value="cafe">Specialty Cafes & Bakeries (2-Step Micro-Flow, &lt;15s Speed)</option>
              <option value="restaurant">Restaurants & Dining Lounges (3-Step Table & Bill Flow)</option>
              <option value="salon">Hair Salons & Spas (3-Step Stylist Attribution Flow)</option>
              <option value="gym">Gyms & Fitness Hubs (3-Step Coach & Facility Flow)</option>
              <option value="coaching">Coaching & Academic Academies (4-Step Student & Parent Flow)</option>
              <option value="auto">Automotive Service & Detailing (3-Step Estimate Trust Flow)</option>
              <option value="hospitality">Hotels, Boutique Stays & Resorts (3-Step Guest Flow)</option>
            </select>
          </div>

          <!-- Dynamic Calibration Badge -->
          <div id="verticalCalibrationBadge" class="p-3 bg-[#FAEDE8]/70 rounded-2xl border border-[#EFBCA8] flex items-start gap-2.5 text-xs text-brand-900">
            <span class="text-base" id="vIcon">🛡️</span>
            <div>
              <span class="font-bold block" id="vBadgeTitle">Deep Trust Clinical Flow (4 Questions)</span>
              <span class="text-[11px] text-brand-800" id="vBadgeDesc">Strict adherence to NMC 2023 Ethics. Captures treatment procedure, hygiene sterility, and attending doctor attribution.</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="clinicName" id="businessNameLabel" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                Clinic / Hospital / Practice Name
              </label>
              <input 
                id="clinicName" 
                type="text" 
                required 
                placeholder="e.g. Apex Dental & Implant Clinic" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
              />
            </div>
            <div>
              <label for="ownerName" id="ownerNameLabel" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                Lead Doctor / Practice Director
              </label>
              <input 
                id="ownerName" 
                type="text" 
                required 
                placeholder="e.g. Dr. Ananya Sharma, MDS" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
              />
            </div>
          </div>

          <!-- Dynamic Field: Specialty Treatments or Signature Bestsellers -->
          <div>
            <label for="specialtyServices" id="customFieldLabel" class="block text-xs font-bold text-[#2B2B2B] mb-1">
              Primary Treatments or Hero Services (Comma Separated)
            </label>
            <input 
              id="specialtyServices" 
              type="text" 
              value="Painless Root Canal, Clear Aligners, Laser Whitening, Implants"
              placeholder="e.g. Root Canal, Clear Aligners, Dental Implants" 
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none font-mono"
            />
            <span class="text-[10px] text-[#888888] mt-1 block">These pills will appear on your customer’s phone when scanning your digital QR.</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="citySelect" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                City / Metro Region
              </label>
              <select 
                id="citySelect" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none bg-[#FBF8F3]"
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
              <label for="ownerPhone" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                Manager WhatsApp for 1-Tap Approvals
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6E6E6E]">+91</span>
                <input 
                  id="ownerPhone" 
                  type="tel" 
                  required 
                  pattern="[0-9]{10}"
                  placeholder="98765 43210" 
                  class="w-full min-h-[44px] pl-12 pr-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="signupEmail" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                Official Business Email
              </label>
              <input 
                id="signupEmail" 
                type="email" 
                required 
                placeholder="owner@yourbusiness.in" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
              />
            </div>
            <div>
              <label for="signupPwd" class="block text-xs font-bold text-[#2B2B2B] mb-1">
                Create Secure Password
              </label>
              <input 
                id="signupPwd" 
                type="password" 
                required 
                minlength="8"
                placeholder="Minimum 8 characters" 
                class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
              />
            </div>
          </div>

          <!-- Real-Time Customer QR Flow Preview Box -->
          <div class="p-4 bg-[#F3EEE3] rounded-2xl border border-[#DFD7C7] text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#111111] font-heading">Online QR Review Process Preview:</span>
              <span id="previewStepCount" class="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#EBE5D8] text-[#1C1C1C] font-bold">4 Questions</span>
            </div>
            <ul id="previewQuestionsList" class="space-y-1 text-[#4A4A4A] text-[11px]">
              <li>• 1. Overall Patient Experience Rating (1-5★)</li>
              <li>• 2. Procedure / Treatment Received</li>
              <li>• 3. Clinical Care & Hygiene Sterility</li>
              <li>• 4. Attending Doctor Attribution & Dialect Choice</li>
            </ul>
          </div>

          <div id="signupAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="signupSubmitBtn"
            class="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D9541E] hover:bg-[#BF4615] text-white font-bold text-xs rounded-xl shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9541E]"
          >
            <span>Create Free Account &rarr;</span>
          </button>
        </form>

        <div class="pt-4 border-t border-[#DFD7C7] text-center">
          <p class="text-xs text-[#6E6E6E]">
            Already have an active account?
            <a href="/login" class="font-bold text-[#D9541E] hover:text-[#D9541E] hover:underline ml-1">
              Sign In here &rarr;
            </a>
          </p>
        </div>
      </div>

    </div>
  </main>

  <script>
    const VERTICAL_DATA = ${JSON.stringify(VERTICAL_PROFILES)};

    function onVerticalChange(val) {
      const v = VERTICAL_DATA[val] || VERTICAL_DATA['clinic'];
      
      // Update badge
      document.getElementById('vIcon').innerText = val === 'cafe' ? '☕' : (val === 'restaurant' ? '🍽️' : (val === 'salon' ? '💇‍♀️' : (val === 'gym' ? '🏋️' : (val === 'coaching' ? '📚' : (val === 'auto' ? '🔧' : (val === 'hospitality' ? '🏨' : '🛡️'))))));
      document.getElementById('vBadgeTitle').innerText = v.badge;
      document.getElementById('vBadgeDesc').innerText = v.description;

      // Update labels & placeholders
      document.getElementById('businessNameLabel').innerText = v.onboarding.businessNameLabel;
      document.getElementById('clinicName').placeholder = v.onboarding.businessNamePlaceholder;
      document.getElementById('ownerNameLabel').innerText = v.onboarding.ownerNameLabel;
      document.getElementById('ownerName').placeholder = v.onboarding.ownerNamePlaceholder;

      document.getElementById('customFieldLabel').innerText = v.onboarding.customField1Label;
      document.getElementById('specialtyServices').placeholder = v.onboarding.customField1Placeholder;
      document.getElementById('specialtyServices').value = v.onboarding.defaultServices.slice(0, 4).join(', ');

      // Update QR preview
      document.getElementById('previewStepCount').innerText = v.questionCount + ' Questions (' + v.flowType.toUpperCase() + ')';
      
      let qList = '<li>• 1. ' + v.qrFlow.step1Title + ' (1-5★)</li>';
      qList += '<li>• 2. ' + v.qrFlow.step2Title + '</li>';
      if (v.qrFlow.step3Title) {
        qList += '<li>• 3. ' + v.qrFlow.step3Title + '</li>';
      }
      if (v.qrFlow.step4Title) {
        qList += '<li>• 4. ' + v.qrFlow.step4Title + '</li>';
      }
      document.getElementById('previewQuestionsList').innerHTML = qList;
    }

    async function handleSignupSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById('signupSubmitBtn');
      const alert = document.getElementById('signupAlert');
      btn.disabled = true;
      btn.innerText = 'Initializing vertical workspace & calibrated QR flow…';

      const payload = {
        clinicName: document.getElementById('clinicName').value,
        ownerName: document.getElementById('ownerName').value,
        industry: document.getElementById('industrySelect').value,
        specialtyServices: document.getElementById('specialtyServices').value,
        city: document.getElementById('citySelect').value,
        phone: document.getElementById('ownerPhone').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPwd').value
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
          alert.innerText = 'Account initialized! Redirecting to calibrated dashboard…';
          setTimeout(() => { window.location.href = '/app'; }, 800);
        } else {
          alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
          alert.innerText = data.error || 'Failed to create account.';
          btn.disabled = false;
          btn.innerText = 'Create Free Account →';
        }
      } catch (err) {
        alert.className = 'p-3 rounded-xl text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 block';
        alert.innerText = 'Network error. Please try again.';
        btn.disabled = false;
        btn.innerText = 'Create Free Account →';
      }
    }
  </script>
  `;
}

function renderForgotPasswordPage() {
  return `
  <main class="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F3EEE3]">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <a href="/" class="inline-flex items-center gap-2.5 mb-4 group">
          <div class="w-10 h-10 rounded-xl bg-dark-950 flex items-center justify-center text-brand-400 font-black text-xl shadow-md">
            R
          </div>
          <span class="font-heading font-black text-2xl tracking-tight text-[#111111]">ReviewKare</span>
        </a>
        <h1 class="text-2xl font-extrabold text-[#111111] font-heading tracking-tight">
          Reset Clinic Password
        </h1>
        <p class="mt-2 text-xs text-[#6E6E6E]">
          Enter your registered clinic email or WhatsApp phone number to receive a secure OTP reset link.
        </p>
      </div>

      <div class="bg-[#FBF8F3] rounded-3xl p-6 sm:p-8 border border-[#DFD7C7] shadow-sm card-3d card-lift space-y-4">
        <form id="forgotForm" onsubmit="handleForgotSubmit(event)" class="space-y-4">
          <div>
            <label for="recoveryInput" class="block text-xs font-bold text-[#2B2B2B] mb-1.5">
              Clinic Email or 10-digit WhatsApp Number
            </label>
            <input 
              id="recoveryInput" 
              type="text" 
              required 
              placeholder="doctor@clinic.in or 9876543210" 
              class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFD7C7] text-xs text-[#111111] focus:border-[#D9541E] focus:ring-2 focus:ring-[#D9541E]/20 outline-none"
            />
          </div>

          <div id="forgotAlert" class="hidden p-3 rounded-xl text-xs font-medium" role="alert"></div>

          <button 
            type="submit" 
            id="forgotSubmitBtn"
            class="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-950 hover:bg-[#D9541E] text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <span>Send Reset OTP via WhatsApp & Email &rarr;</span>
          </button>
        </form>

        <div class="pt-4 border-t border-[#DFD7C7] text-center">
          <a href="/login" class="text-xs font-bold text-[#4A4A4A] hover:text-[#D9541E]">
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

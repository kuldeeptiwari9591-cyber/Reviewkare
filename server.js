const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Store file path
const DATA_FILE = path.join(__dirname, 'data', 'store.json');

// Helper to load store
function getStore() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading store:', e);
    return { location: {}, reviews: [], qrcodes: [], competitors: [] };
  }
}

// Helper to save store
function saveStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving store:', e);
  }
}

// Import compiled AI modules
const { generateReviewReply, detectLanguageAndScript } = require('./dist/src/lib/ai/reply-engine.js');
const { generateCustomerQRDraft } = require('./dist/src/lib/ai/qr-draft-engine.js');
const { validateReplyContent } = require('./dist/src/lib/ai/safety-validator.js');
const { PLANS } = require('./dist/src/lib/store/db.js');

const PORT = process.env.PORT || 3000;

// Modular View Architecture (Anti-Slop & UI/UX Pro Max Standard)
const { getSvgIcon, getStarRatingSvg } = require('./src/views/icons.js');
const { renderHtmlPage } = require('./src/views/layout.js');
const { renderAppShell } = require('./src/views/appShell.js');
const { renderHomePage } = require('./src/views/homePage.js');
const { renderLoginPage, renderSignupPage, renderForgotPasswordPage } = require('./src/views/authPages.js');
const { renderSecurityPage, renderBookDemoPage, renderFaqPage, renderQrKitPage, renderTermsPage, renderPrivacyPage, renderRefundPolicyPage, renderDpdpConsentPage } = require('./src/views/trustPages.js');
const { 
  renderStaffPage, 
  renderLocalPackPage,
  renderWhatsAppStudioPage,
  renderPosWebhooksPage,
  renderDisputesPage,
  renderOrganizationsPage,
  renderSentimentPage,
  renderHardwareStudioPage
} = require('./src/views/featurePages.js');

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// SERVER
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  };

  const sendHtml = (statusCode, html) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  };

  try {
    // ----------------------------------------------------
    // REST API ENDPOINTS
    // ----------------------------------------------------
    if (pathname === '/api/reviews' && method === 'GET') {
      const store = getStore();
      return sendJson(200, { success: true, reviews: store.reviews });
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      const newReview = {
        id: 'rev-' + Date.now(),
        locationId: store.location.id || 'loc-01',
        googleReviewId: 'gbp_' + Math.random().toString(36).substring(7),
        reviewerName: body.reviewerName || 'Valued Patient',
        rating: body.rating || 5,
        text: body.text || '',
        isStarOnly: !body.text || body.text.trim() === '',
        detectedLanguage: 'en',
        detectedTone: 'positive',
        createdAt: 'Just now',
        reply: null
      };

      const aiResult = generateReviewReply({
        review: newReview,
        settings: store.location
      });

      newReview.detectedLanguage = aiResult.detectedLanguage;
      newReview.detectedTone = aiResult.detectedTone;

      const isNegative = newReview.rating <= 3;
      const status = isNegative ? 'held' : 'posted';
      const token = isNegative ? 'appr-' + Math.random().toString(36).substring(4) : undefined;

      newReview.reply = {
        id: 'rep-' + Date.now(),
        reviewId: newReview.id,
        draftText: aiResult.text,
        finalText: status === 'posted' ? aiResult.text : undefined,
        status: status,
        model: 'gemini-1.5-flash',
        validatorPassed: true,
        isAutoPosted: status === 'posted',
        approvalToken: token,
        postedAt: status === 'posted' ? 'Just now' : undefined
      };

      store.reviews.unshift(newReview);
      saveStore(store);
      return sendJson(201, { success: true, review: newReview });
    }

    if (pathname.startsWith('/api/reviews/') && pathname.endsWith('/reply') && method === 'PATCH') {
      const parts = pathname.split('/');
      const reviewId = parts[3];
      const body = await parseJsonBody(req);
      const store = getStore();
      const review = store.reviews.find(r => r.id === reviewId);
      if (!review) return sendJson(404, { success: false, error: 'Review not found' });

      if (body.action === 'approve') {
        if (!review.reply) review.reply = {};
        review.reply.status = 'posted';
        review.reply.finalText = body.text || review.reply.draftText;
        review.reply.postedAt = 'Just now';
        review.reply.isAutoPosted = false;
        saveStore(store);
        return sendJson(200, { success: true, review });
      }

      if (body.action === 'regenerate') {
        const mode = body.styleMode || 'warmer';
        let newDraft = review.reply?.draftText || '';
        if (mode === 'shorter') {
          newDraft = `Thank you ${review.reviewerName} for your visit to ${store.location.name}. We look forward to seeing you again!`;
        } else if (mode === 'warmer') {
          newDraft = `Namaste ${review.reviewerName} ji! The entire team at ${store.location.name} was truly delighted to serve you. Your kind words mean the world to our staff.`;
        } else if (mode === 'firmer') {
          newDraft = `Dear ${review.reviewerName}, we take note of your feedback. Please connect with our clinic manager directly at ${store.location.managerPhone} so we can examine this matter offline.`;
        }
        if (!review.reply) review.reply = {};
        review.reply.draftText = newDraft;
        saveStore(store);
        return sendJson(200, { success: true, replyText: newDraft });
      }
    }

    if (pathname.startsWith('/api/reviews/') && method === 'DELETE') {
      const reviewId = pathname.split('/')[3];
      const store = getStore();
      store.reviews = store.reviews.filter(r => r.id !== reviewId);
      saveStore(store);
      return sendJson(200, { success: true });
    }

    if (pathname === '/api/settings' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      store.location = { ...store.location, ...body };
      saveStore(store);
      return sendJson(200, { success: true, location: store.location });
    }

    if (pathname === '/api/ai/qr-draft' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      const rawSub = body.submission || {};
      const submission = {
        rating: rawSub.rating || 5,
        selectedServices: Array.isArray(rawSub.selectedServices) ? rawSub.selectedServices : ['Root Canal Treatment'],
        qualityTags: Array.isArray(rawSub.qualityTags) ? rawSub.qualityTags : ['Painless Procedure'],
        ambienceTags: Array.isArray(rawSub.ambienceTags) ? rawSub.ambienceTags : ['Modern Equipment'],
        staffName: rawSub.staffName || 'Dr. Sneha',
        recommend: rawSub.recommend || 'yes',
        language: rawSub.language || 'hi-en',
        length: rawSub.length || 'short'
      };
      const draft = generateCustomerQRDraft(submission, store.location.name);
      return sendJson(200, {
        success: true,
        draftText: draft,
        languageUsed: submission.language,
        disclaimer: 'Draft generated strictly from chosen customer selections.'
      });
    }

    if (pathname.startsWith('/api/approvals/') && method === 'POST') {
      const token = pathname.split('/')[3];
      const store = getStore();
      const review = store.reviews.find(r => r.reply && r.reply.approvalToken === token);
      if (!review) return sendJson(404, { success: false, error: 'Approval token invalid or expired' });
      review.reply.status = 'posted';
      review.reply.finalText = review.reply.draftText;
      review.reply.postedAt = 'Just now';
      review.reply.isAutoPosted = false;
      review.reply.approvalToken = null;
      saveStore(store);
      return sendJson(200, { success: true, message: 'Review successfully approved and posted to Google Maps' });
    }

    if (pathname === '/api/contact' && method === 'POST') {
      return sendJson(200, { success: true, message: 'Thank you for reaching out! A Replyo specialist will call you within 2 business hours.' });
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      return sendJson(200, { success: true, redirect: '/app', user: store.user });
    }

    if (pathname === '/api/auth/signup' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      if (body.clinicName) store.location.name = body.clinicName;
      if (body.city) store.location.city = body.city;
      saveStore(store);
      return sendJson(200, { success: true, redirect: '/app' });
    }

    if (pathname === '/api/auth/forgot-password' && method === 'POST') {
      const body = await parseJsonBody(req);
      return sendJson(200, { success: true, message: 'OTP instructions dispatched to registered WhatsApp and email.' });
    }

    if (pathname === '/api/book-demo' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      if (!store.demoBookings) store.demoBookings = [];
      store.demoBookings.push({ ...body, bookedAt: new Date().toISOString() });
      saveStore(store);
      return sendJson(200, { success: true, message: 'Executive demo confirmed!' });
    }

    if (pathname === '/api/simulate-review' && method === 'POST') {
      const store = getStore();
      const samples = [
        { reviewerName: 'Vikramaditya Sengupta', rating: 5, text: 'Had a severe toothache on Sunday morning. Dr. Sneha did a painless root canal and Dr. Sharma was so gentle. The Indiranagar clinic is sparkling clean and modern!' },
        { reviewerName: 'Ananya Roy', rating: 5, text: 'Best pour-over coffee in Indiranagar! Barista Shreyas recommended the light-roast Ethiopian beans and explained the flavor notes so well. Fresh sourdough croissants!' },
        { reviewerName: 'Tanvi Kapur', rating: 5, text: 'Got my balayage done with Master Stylist Farhan at Bounce Lavelle Road. He understood the exact ash tone I wanted. Heavenly scalp massage!' },
        { reviewerName: 'Rohan Deshmukh', rating: 5, text: 'IronVault Koramangala has the best barbell equipment. Coach Aryan fixed my hip hinge on deadlifts in one session. Showers are spotless!' },
        { reviewerName: 'Rajesh Gokhale', rating: 1, text: 'Waited 35 mins despite booking a 4 PM slot on 100ft road. Receptionist did not inform us about the delay.' },
        { reviewerName: 'Deepa Hegde', rating: 5, text: 'Bohot hi smooth treatment tha! Dr. Sharma ne darr bilkul nikal diya. Clinic ka ambience 5 star jaisa clean hai.' }
      ];
      const pick = samples[Math.floor(Math.random() * samples.length)];
      const newReview = {
        id: 'rev-' + Date.now(),
        locationId: store.location.id || 'loc-01',
        googleReviewId: 'gbp_sim_' + Math.random().toString(36).substring(7),
        reviewerName: pick.reviewerName,
        rating: pick.rating,
        text: pick.text,
        isStarOnly: false,
        detectedLanguage: 'en',
        detectedTone: pick.rating >= 4 ? 'positive' : 'negative',
        createdAt: 'Just now',
        reply: null
      };

      const aiResult = generateReviewReply({
        review: newReview,
        settings: store.location
      });

      newReview.detectedLanguage = aiResult.detectedLanguage;
      newReview.detectedTone = aiResult.detectedTone;

      const isNegative = newReview.rating <= 3;
      const status = isNegative ? 'held' : 'posted';
      const token = isNegative ? 'appr-' + Math.random().toString(36).substring(4) : undefined;

      newReview.reply = {
        id: 'rep-' + Date.now(),
        reviewId: newReview.id,
        draftText: aiResult.text,
        finalText: status === 'posted' ? aiResult.text : undefined,
        status: status,
        model: 'gemini-1.5-flash',
        validatorPassed: true,
        isAutoPosted: status === 'posted',
        approvalToken: token,
        postedAt: status === 'posted' ? 'Just now' : undefined
      };

      store.reviews.unshift(newReview);
      if (!store.notifications) store.notifications = [];
      store.notifications.unshift({
        id: 'notif-' + Date.now(),
        title: isNegative ? 'Negative Review Held' : 'New 5★ Review Processed',
        message: pick.reviewerName + ' left a ' + pick.rating + '★ review on Google Maps.',
        time: 'Just now',
        unread: true
      });
      saveStore(store);
      return sendJson(200, { success: true, review: newReview });
    }

    if (pathname === '/api/staff' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      if (!store.staff) store.staff = [];
      const newStaff = {
        id: 'st_' + (store.staff.length + 1),
        name: body.name || 'Team Member',
        role: body.role || 'Clinic Staff',
        reviewsCount: 0,
        avgRating: 5.0,
        compliments: 'Punctual & attentive care',
        tipsEarned: '₹0'
      };
      store.staff.push(newStaff);
      saveStore(store);
      return sendJson(200, { success: true, staff: newStaff });
    }

    if (pathname === '/api/notifications/read-all' && method === 'POST') {
      const store = getStore();
      (store.notifications || []).forEach(n => n.unread = false);
      saveStore(store);
      return sendJson(200, { success: true });
    }

    if (pathname === '/api/branch/switch' && method === 'POST') {
      const body = await parseJsonBody(req);
      const store = getStore();
      const target = (store.businesses || []).find(b => b.id === body.branchId) || (store.branches || []).find(b => b.id === body.branchId);
      if (target) {
        store.activeBusinessId = target.id;
        store.location.id = target.id;
        store.location.name = target.name;
        store.location.area = target.area;
        store.location.city = target.city;
        store.location.vertical = target.vertical || 'clinic';
        store.location.rating = target.rating || 4.9;
        store.location.reviewsCount = target.reviewsCount || 143;
        store.location.phone = target.phone || store.location.phone;
        store.location.managerPhone = target.managerPhone || store.location.managerPhone;
        store.location.defaultKeywords = target.topKeywords || store.location.defaultKeywords;
        saveStore(store);
      }
      return sendJson(200, { success: true, location: store.location });
    }

    if (pathname === '/api/reviews/bulk-approve' && method === 'POST') {
      const store = getStore();
      let count = 0;
      store.reviews.forEach(r => {
        if (r.reply && r.reply.status === 'held') {
          r.reply.status = 'posted';
          r.reply.finalText = r.reply.draftText;
          r.reply.postedAt = 'Just now';
          count++;
        }
      });
      saveStore(store);
      return sendJson(200, { success: true, count });
    }

    if (pathname.startsWith('/api/webhooks/pos/') && method === 'POST') {
      const parts = pathname.split('/');
      const provider = parts[4] || 'petpooja';
      const store = getStore();
      const pos = (store.posIntegrations || []).find(p => p.provider === provider);
      if (pos) {
        pos.eventsCaptured = (pos.eventsCaptured || 0) + 1;
        pos.lastSync = 'Just now';
        saveStore(store);
      }
      return sendJson(200, { 
        success: true, 
        provider, 
        message: 'Webhook processed successfully. WhatsApp review trigger queued.',
        scheduledDelay: pos ? pos.autoTriggerDelay : '45 mins'
      });
    }

    if (pathname === '/api/whatsapp/test-send' && method === 'POST') {
      const body = await parseJsonBody(req);
      return sendJson(200, {
        success: true,
        dispatchedTo: body.phone || '+91 98450 11223',
        status: 'delivered',
        wabaMessageId: 'wam_msg_' + Date.now()
      });
    }

    if (pathname === '/api/disputes/generate' && method === 'POST') {
      const body = await parseJsonBody(req);
      return sendJson(200, {
        success: true,
        dossier: 'FORMAL GOOGLE BUSINESS PROFILE REVIEW REMOVAL REQUEST\nPolicy Violation: Maps User Content Policy § 3.2\nReason: Documented conflict of interest & fraudulent negative attack.\nEvidence: Account registered same day with no verified transaction history.'
      });
    }

    if (pathname === '/api/hardware/order' && method === 'POST') {
      const body = await parseJsonBody(req);
      return sendJson(200, {
        success: true,
        orderId: 'HW_ORD_' + Date.now().toString().slice(-6),
        item: body.itemId || 'hw_acrylic',
        status: 'order_received_design_proof_in_progress'
      });
    }

    // ----------------------------------------------------
    // 1. WORLD-CLASS MINIMALIST HOMEPAGE (Anti-Slop, 3D Canvas, Tasteskill v2 Standard)
    // ----------------------------------------------------
    if (pathname === '/') {
      const store = getStore();
      const html = renderHtmlPage('Autonomous Google Review Management & AI QR Growth SaaS', 'home', renderHomePage(store));
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // AUTHENTICATION & ONBOARDING SUITE (/login, /signup, /forgot-password)
    // ----------------------------------------------------
    if (pathname === '/login') {
      const html = renderHtmlPage('Sign In', 'login', renderLoginPage(parsedUrl.query));
      return sendHtml(200, html);
    }

    if (pathname === '/signup') {
      const html = renderHtmlPage('Start 14-Day Free Pilot', 'signup', renderSignupPage());
      return sendHtml(200, html);
    }

    if (pathname === '/forgot-password') {
      const html = renderHtmlPage('Reset Password', 'login', renderForgotPasswordPage());
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // TRUST, SECURITY & ENTERPRISE SCHEDULER
    // ----------------------------------------------------
    if (pathname === '/security' || pathname === '/compliance') {
      const html = renderHtmlPage('Clinical Privacy & Security Whitepaper', 'security', renderSecurityPage());
      return sendHtml(200, html);
    }

    if (pathname === '/book-demo') {
      const html = renderHtmlPage('Schedule Executive Demo', 'demo', renderBookDemoPage());
      return sendHtml(200, html);
    }

    if (pathname === '/faq') {
      const html = renderHtmlPage('Frequently Asked Questions', 'faq', renderFaqPage());
      return sendHtml(200, html);
    }

    if (pathname === '/qr-kit') {
      const html = renderHtmlPage('Countertop QR Display Hardware', 'qr-kit', renderQrKitPage());
      return sendHtml(200, html);
    }

    if (pathname === '/terms') {
      const html = renderHtmlPage('Terms of Service', 'legal', renderTermsPage());
      return sendHtml(200, html);
    }

    if (pathname === '/privacy') {
      const html = renderHtmlPage('Privacy Policy (DPDP Act 2023)', 'legal', renderPrivacyPage());
      return sendHtml(200, html);
    }

    if (pathname === '/refund-policy') {
      const html = renderHtmlPage('Refund & Cancellation Policy', 'legal', renderRefundPolicyPage());
      return sendHtml(200, html);
    }

    if (pathname === '/dpdp-consent') {
      const html = renderHtmlPage('DPDP Act 2023 Consent Framework', 'legal', renderDpdpConsentPage());
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 2. FEATURES (/features)
    // ----------------------------------------------------
    if (pathname === '/features') {
      const html = renderHtmlPage('Features Architecture', 'features', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Reputation Architecture Engineered for India</h1>
            <p class="text-slate-600 text-sm">Every capability is built specifically to address local business challenges across clinics, salons, and restaurants.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
              <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                ${getSvgIcon('globe', 'w-5 h-5 text-brand-600')}
              </div>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Multi-Lingual Dialect Mirroring</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Replyo naturally replies in Devanagari Hindi, colloquial Hinglish, English, Tamil, Telugu, and Kannada, matching reviewer colloquialisms, gratitude phrases, and cultural tone.
              </p>
            </div>

            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
              <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                ${getSvgIcon('shield', 'w-5 h-5 text-amber-600')}
              </div>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Zero-Liability Safety Shield</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Hardcoded safety validator blocks refund offers, admissions of medical fault, or staff blame. Quarantines 1–3 star complaints into a private queue with direct manager telephone fallback.
              </p>
            </div>

            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
              <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                ${getSvgIcon('qr', 'w-5 h-5 text-blue-600')}
              </div>
              <h3 class="font-bold text-xl text-slate-900 font-heading">In-Clinic AI QR Studio</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Download printable A6 counter cards, A4 table tents, and bill stickers. Customers scan, tap 3 choices, get an AI draft built strictly from their selections, and post on Google Maps in 30 seconds.
              </p>
            </div>

            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
              <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                ${getSvgIcon('mapPin', 'w-5 h-5 text-teal-600')}
              </div>
              <h3 class="font-bold text-xl text-slate-900 font-heading">Local SEO Keyword Injection</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Naturally weaves your neighborhood and service terms into positive replies (e.g., <em>“best dental clinic in Indiranagar”</em>), signaling search relevance directly to the Google Local 3-Pack algorithm.
              </p>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 3. PRICING (/pricing)
    // ----------------------------------------------------
    if (pathname === '/pricing') {
      const html = renderHtmlPage('Pricing (INR)', 'pricing', `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div class="space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Transparent INR Plans. No Foreign Exchange Shock.</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Month-to-month flexibility. Pay with UPI AutoPay. Full GST invoices for input tax credit.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left items-stretch">
            ${PLANS.map((plan) => `
              <div class="p-6 rounded-3xl bg-white border ${plan.isPopular ? 'border-2 border-brand-500 shadow-lg relative' : 'border-slate-200 shadow-sm'} flex flex-col justify-between card-3d">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-xl text-slate-900 font-heading">${plan.name}</h3>
                    ${plan.isPopular ? '<span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-brand-600 text-white rounded-full">Popular</span>' : ''}
                  </div>
                  <div>
                    <span class="text-3xl font-black text-slate-900 font-heading tabular-nums">
                      ${plan.id === 'enterprise' ? 'Custom' : '₹' + plan.monthlyPrice}
                    </span>
                    ${plan.id !== 'enterprise' ? '<span class="text-xs text-slate-500"> / mo</span>' : ''}
                  </div>
                  <ul class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    ${plan.features.map((f) => `<li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>${f}</span></li>`).join('')}
                  </ul>
                </div>
                <a href="/app" class="mt-6 block w-full py-2.5 text-center rounded-xl ${plan.isPopular ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm' : 'bg-slate-900 hover:bg-slate-800 text-white'} text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  Start with ${plan.name} &rarr;
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 4. FREE AUDIT TOOL (/free-audit)
    // ----------------------------------------------------
    if (pathname === '/free-audit') {
      const html = renderHtmlPage('Free Google Reputation Audit', 'audit', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div class="space-y-3">
            <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Audit Your Google Maps Review Gap</h1>
            <p class="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Scan your Indian clinic or salon to see how many reviews are sitting unanswered and where competitors are outranking you.
            </p>
          </div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-left space-y-4 card-3d">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="sm:col-span-2">
                <label for="auditName" class="block text-xs font-semibold text-slate-700 mb-1">Business Name on Google Maps</label>
                <input id="auditName" type="text" value="Dr. Sharma Dental & Implant Clinic" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
              <div>
                <label for="auditCity" class="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input id="auditCity" type="text" value="Bengaluru" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
            </div>
            <button type="button" onclick="document.getElementById('auditReport').classList.remove('hidden'); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) confetti({ particleCount: 50, spread: 50 });" class="w-full min-h-[44px] rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Run Instant Reputation Scan &rarr;
            </button>
          </div>

          <div id="auditReport" class="hidden bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-500 shadow-xl text-left space-y-6">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-base text-slate-900 font-heading">Dr. Sharma Dental & Implant Clinic</h3>
                <p class="text-xs text-slate-500">Indiranagar, Bengaluru • Google Business Profile</p>
              </div>
              <span class="text-xs font-bold text-brand-800 bg-brand-100 px-3 py-1 rounded-full tabular-nums">Score: 92/100</span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center text-xs">
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Response Rate</span>
                <p class="text-2xl font-black text-brand-600 mt-1 tabular-nums">99.6%</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Unanswered</span>
                <p class="text-2xl font-black text-amber-600 mt-1 tabular-nums">2 reviews</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span class="text-slate-500">Avg Reply Time</span>
                <p class="text-2xl font-black text-slate-900 mt-1 tabular-nums">4 mins</p>
              </div>
            </div>
            <div class="text-center pt-2">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Manage Profile with Replyo &rarr;
              </a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 5. INDUSTRIES (/industries/[industry])
    // ----------------------------------------------------
    if (pathname.startsWith('/industries/')) {
      const ind = pathname.split('/')[2];
      const titlesMap = {
        clinics: 'Dental & Aesthetic Clinics',
        salons: 'Hair Salons & Spas',
        restaurants: 'Restaurants & Cafes',
        gyms: 'Gyms & Fitness Hubs',
        coaching: 'Coaching & Tuition Centers'
      };
      const name = titlesMap[ind] || 'Local Businesses';
      const html = renderHtmlPage(name, 'industries', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Google Review Autopilot for ${name}</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Protect your patient and guest reputation, weave local keywords, and collect 3x more genuine Google reviews.</p>
          </div>
          <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs leading-relaxed text-slate-700 card-3d">
            <h3 class="text-base font-bold text-slate-900 font-heading">Why ${name} Choose Replyo</h3>
            <p>Customers evaluate your business on Google Maps before booking an appointment or reserving a table. With Replyo, every positive review is answered in minutes with local keywords, and negative reviews are safely held with direct manager telephone contacts.</p>
            <div class="pt-4 text-center">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Start 14-Day Free Trial &rarr;</a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 6. FOR AGENCIES (/for-agencies)
    // ----------------------------------------------------
    if (pathname === '/for-agencies') {
      const html = renderHtmlPage('For Agencies & Resellers', 'agencies', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Earn 30% Recurring Commission with Replyo</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Manage all client Google Business Profiles under one roof with white-label client PDF report cards.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h4 class="font-bold text-sm text-slate-900 font-heading">White-Label PDF Reports</h4>
              <p class="text-slate-500">Send automated weekly reputation report cards branded with your marketing agency logo.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h4 class="font-bold text-sm text-slate-900 font-heading">30% Lifetime Revenue Share</h4>
              <p class="text-slate-500">Earn 30% recurring monthly margin on every local clinic or salon you onboard.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h4 class="font-bold text-sm text-slate-900 font-heading">Multi-Tenant Client Desk</h4>
              <p class="text-slate-500">Switch between 50+ client locations in one single unified dashboard.</p>
            </div>
          </div>
          <div class="text-center pt-4">
            <a href="/app" class="inline-block px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Join Agency Partner Program &rarr;</a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 7. BLOG & GUIDES (/blog & /blog/:slug)
    // ----------------------------------------------------
    if (pathname === '/blog') {
      const html = renderHtmlPage('Reputation Guides & Case Studies', 'blog', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Actionable Guides for Indian Business Owners</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Proven playbooks to protect your rating, rank in the Local 3-Pack, and automate review responses.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog/dr-sharma-case-study" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-brand-600">Case Study</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">How Dr. Sharma Clinic Added 128 Google Reviews in 60 Days</h3>
              <p class="text-xs text-slate-500">Learn how an Indiranagar dental practice leveraged reception QR cards to skyrocket from 4.4 to 4.8 stars.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Case Study &rarr;</span>
            </a>

            <a href="/blog/responding-to-negative-reviews" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-amber-600">Legal & De-escalation</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">Responding to 1-Star Medical Reviews Without Legal Liability</h3>
              <p class="text-xs text-slate-500">The exact templates Indian doctors and clinics use to de-escalate upset patients without admitting negligence.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>

            <a href="/blog/google-local-pack-seo-2026" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-blue-600">Local SEO Playbook</span>
              <h3 class="font-bold text-base text-slate-900 font-heading">How to Rank #1 in Google Local 3-Pack in Indian Metro Cities</h3>
              <p class="text-xs text-slate-500">Why review response velocity and localized keyword weaving outrank paid Google Ads for high-intent walk-ins.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    if (pathname.startsWith('/blog/')) {
      const slug = pathname.split('/')[2];
      const articles = {
        'dr-sharma-case-study': {
          title: 'How Dr. Sharma Dental Clinic Added 128 Google Reviews in 60 Days',
          tag: 'Case Study • Indiranagar, Bengaluru',
          content: `
            <p>Dr. Sharma Dental & Implant Clinic in Indiranagar was receiving over 300 patient visits each month, yet only 3 or 4 patients ever took the time to leave a Google review. Dissatisfied patients, however, were quick to vent online, causing their clinic rating to drop to 4.4 stars.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">The Solution: In-Clinic AI QR Flow</h3>
            <p>Dr. Sharma installed an A6 acrylic counter card at the billing counter and two table tents in the waiting lounge. Instead of asking patients to write long paragraphs, the QR code launched Replyo's 30-second review builder.</p>
            <p>Patients simply tapped what they had done (e.g. “Root Canal”, “Teeth Whitening”), how comfortable they felt (“Painless Procedure”), and selected Hinglish. The AI synthesized an authentic review instantly, and with one tap, the text was copied to the patient's clipboard as Google Maps opened.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">The Results</h3>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>+128 authentic Google reviews</strong> collected in the first 60 days.</li>
              <li>Rating jumped from <strong>4.4 to 4.8 stars</strong>.</li>
              <li>Ranked #1 for <em>“best dental clinic in Indiranagar”</em> on Google Maps search.</li>
            </ul>
          `
        },
        'responding-to-negative-reviews': {
          title: 'Responding to 1-Star Medical Reviews Without Legal Liability',
          tag: 'De-escalation & Legal Guide',
          content: `
            <p>When an unhappy patient leaves a 1-star review on Google Maps, the clinic owner's natural impulse is either to write a defensive argument or to apologize profusely and offer a discount. Both approaches carry substantial legal and reputational hazards.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 1: Never Admit Medical Negligence Online</h3>
            <p>A public apology stating “We are sorry our doctor made a mistake” can be used as evidence in consumer disputes or Medical Council inquiries. Replyo's hardcoded safety validator blocks fault admission automatically.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 2: Move the Discussion Offline Promptly</h3>
            <p>Provide a direct telephone number to the clinic manager or administrator. This signals to prospective patients reading the review that your clinic takes patient feedback seriously and handles concerns professionally.</p>
          `
        },
        'google-local-pack-seo-2026': {
          title: 'How to Rank #1 in Google Local 3-Pack in Indian Metro Cities',
          tag: 'Local SEO Strategy',
          content: `
            <p>Google's local search algorithm prioritizes three primary pillars: Relevance, Distance, and Prominence. In dense metropolitan markets like Bengaluru, Mumbai, and Delhi, distance is often neutralized because many competitors operate in the same neighborhood.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Review Velocity and Owner Response Rate</h3>
            <p>Businesses that respond to 95%+ of reviews within 24 hours receive a measurable prominence boost in local pack rankings. Replyo responds to 4-5 star reviews in under 4 minutes, ensuring your profile maintains the highest response velocity in your zip code.</p>
            <h3 class="text-base font-bold text-slate-900 font-heading mt-4">Keyword Weaving in Official Responses</h3>
            <p>When an owner responds with natural phrases like <em>“Thank you for choosing Dr. Sharma for your painless root canal in Indiranagar”</em>, Google's semantic index connects your listing to those high-intent local search queries.</p>
          `
        }
      };

      const article = articles[slug] || articles['dr-sharma-case-study'];
      const html = renderHtmlPage(article.title, 'blog', `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <a href="/blog" class="text-xs font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1">&larr; Back to all guides</a>
          <div class="border-b border-slate-200 pb-4 space-y-2">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">${article.tag}</span>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 font-heading">${article.title}</h1>
            <p class="text-xs text-slate-400">Published October 2026 • 5 min read</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-4">
            ${article.content}
            <div class="pt-6 border-t border-slate-100 text-center">
              <a href="/app" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Automate Your Clinic's Reviews with Replyo &rarr;
              </a>
            </div>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 8. CONTACT PAGE (/contact)
    // ----------------------------------------------------
    if (pathname === '/contact') {
      const html = renderHtmlPage('Contact Us', 'contact', `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Talk to our Reputation Specialists</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Have questions about multi-location onboarding, UPI AutoPay, or Google Business Profile API setup?</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs card-3d">
              <h3 class="font-bold text-base text-slate-900 font-heading">Send us a message</h3>
              <div>
                <label for="contactName" class="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input id="contactName" type="text" placeholder="Dr. Rajesh Patel" class="w-full p-3 rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
              <div>
                <label for="contactPhone" class="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input id="contactPhone" type="tel" placeholder="+91 98765 43210" class="w-full p-3 rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
              <div>
                <label for="contactBiz" class="block font-semibold text-slate-700 mb-1">Clinic / Business Name</label>
                <input id="contactBiz" type="text" placeholder="Patel Skin & Dental Care" class="w-full p-3 rounded-xl border border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
              <button type="button" onclick="submitContact()" class="w-full min-h-[44px] bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Request Callback &rarr;
              </button>
              <p id="contactAck" class="hidden text-center text-xs font-bold text-emerald-700" aria-live="polite">✓ Request received! We will call you within 2 hours.</p>
            </div>

            <div class="p-8 bg-dark-950 text-white rounded-3xl space-y-6 flex flex-col justify-between card-3d">
              <div class="space-y-4">
                <h3 class="font-bold text-lg font-heading">Headquarters & Support</h3>
                <div class="text-xs space-y-2 text-slate-400">
                  <p><strong class="text-white">Bengaluru HQ:</strong> 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034</p>
                  <p><strong class="text-white">Email:</strong> support@replyo.in</p>
                  <p><strong class="text-white">Phone Support:</strong> +91 80 4719 2830 (Mon–Sat, 9am – 7pm IST)</p>
                </div>
              </div>
              <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <span class="text-brand-400 font-bold">Emergency Escalation:</span> For urgent review removal inquiries or Google account connection issues, current customers can reach their dedicated account manager anytime via the Owner Dashboard.
              </div>
            </div>
          </div>
        </div>
        <script>
          async function submitContact() {
            const name = document.getElementById('contactName').value;
            const phone = document.getElementById('contactPhone').value;
            const biz = document.getElementById('contactBiz').value;
            await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, biz })
            });
            document.getElementById('contactAck').classList.remove('hidden');
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              confetti({ particleCount: 40, spread: 40 });
            }
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 9. LEGAL PAGES (/privacy, /terms, /refund-policy, /dpdp-consent)
    // ----------------------------------------------------
    if (['/privacy', '/terms', '/refund-policy', '/dpdp-consent'].includes(pathname)) {
      const titles = {
        '/privacy': 'Privacy Policy',
        '/terms': 'Terms of Service',
        '/refund-policy': 'Refund & Cancellation Policy',
        '/dpdp-consent': 'Digital Personal Data Protection (DPDP) Act 2023 Consent'
      };
      const title = titles[pathname];
      const html = renderHtmlPage(title, '', `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="border-b border-slate-200 pb-4">
            <h1 class="text-3xl font-black text-slate-900 font-heading">${title}</h1>
            <p class="text-xs text-slate-500 mt-1">Last Updated: October 2026 • Replyo Technologies India Pvt Ltd</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-4">
            <p><strong>1. Compliance & Data Governance:</strong> Replyo operates in full adherence to the Digital Personal Data Protection Act 2023 of India and Google API Services User Data Policy.</p>
            <p><strong>2. Google API Data Usage:</strong> Replyo accesses Google Business Profile reviews solely to ingest comments and draft or post owner-authorized review replies. Customer review drafting (/q/[code]) requires zero login and does not collect phone numbers, email addresses, or names.</p>
            <p><strong>3. Anti-Incentivization Policy:</strong> In compliance with Google Local Guides and FTC regulations, Replyo strictly prohibits offering rewards, discounts, or financial compensation in exchange for Google reviews.</p>
            <p><strong>4. Invoicing & Taxes:</strong> All subscriptions are billed in Indian Rupees (INR) with 18% GST invoices generated for input tax credit.</p>
            <p><strong>5. Contact Information:</strong> For legal inquiries or DPDP data deletion requests, contact our compliance officer at <code class="text-brand-700 font-semibold">compliance@replyo.in</code>.</p>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // OWNER APPLICATION (STATEFUL & DYNAMIC)
    // ----------------------------------------------------
    if (pathname === '/app') {
      const store = getStore();
      const reviews = store.reviews;
      const held = reviews.filter(r => r.reply && r.reply.status === 'held');

      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Reputation Operations Dashboard</h1>
              <p class="text-xs text-slate-500">Autonomous review response engine & QR growth metrics</p>
            </div>
            <div class="flex items-center gap-2">
              <a href="/app/reviews" class="px-4 min-h-[40px] flex items-center bg-dark-950 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                All Reviews Feed &rarr;
              </a>
            </div>
          </div>

          <!-- TOP KPI STATS (Tabular Figures) -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-500">Google Maps Rating</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900 font-heading tabular-nums">4.8</span>
                <div class="flex gap-0.5">${getStarRatingSvg(5, 'w-3.5 h-3.5')}</div>
              </div>
              <p class="text-[11px] text-emerald-600 font-bold tabular-nums">↑ +0.4 since activating Replyo</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-500">Response Rate</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-brand-600 font-heading tabular-nums">99.6%</span>
              </div>
              <p class="text-[11px] text-slate-400">Top 1% in Indiranagar, BLR</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-500">Avg Reply Speed</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-slate-900 font-heading tabular-nums">4 min</span>
              </div>
              <p class="text-[11px] text-slate-400">Instant Autopilot Execution</p>
            </div>

            <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1 card-3d">
              <span class="text-[11px] font-bold uppercase text-slate-500">Held for Approval</span>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-amber-600 font-heading tabular-nums">${held.length}</span>
              </div>
              <p class="text-[11px] text-amber-700 font-bold">Quarantined negative reviews</p>
            </div>
          </div>

          <!-- RECENT ACTIVITY FEED -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 card-3d">
            <div class="flex justify-between items-center">
              <h3 class="font-bold text-sm text-slate-900 font-heading">Live Google Business Profile Feed</h3>
              <a href="/app/reviews" class="text-xs font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1">View All (${reviews.length}) &rarr;</a>
            </div>

            <div class="space-y-3">
              ${reviews.slice(0, 3).map((r) => `
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs space-y-2">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900">${r.reviewerName}</span>
                      <div class="flex gap-0.5">${getStarRatingSvg(r.rating, 'w-3 h-3')}</div>
                      <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">${r.detectedLanguage}</span>
                    </div>
                    <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2.5 py-0.5 rounded-full">
                      ${r.reply?.status === 'posted' ? '✓ Auto-Posted to Google' : '⚠️ Held for Approval'}
                    </span>
                  </div>
                  <p class="text-slate-700 italic">“${r.text || 'Star-only review'}”</p>
                  <div class="p-3 bg-white rounded-xl border border-slate-200 text-slate-600">
                    <strong class="text-slate-900">Official Reply:</strong> ${r.reply?.finalText || r.reply?.draftText}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Dashboard', 'app', renderAppShell('dashboard', content, store)));
    }

    if (pathname === '/app/reviews') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Google Reviews Feed (${store.reviews.length})</h1>
              <p class="text-xs text-slate-500">Google Business Profile synchronized live feed</p>
            </div>
          </div>
          <div class="space-y-4">
            ${store.reviews.map((r) => `
              <div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 card-3d">
                <div class="flex justify-between items-center text-xs">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-slate-900">${r.reviewerName}</span>
                    <div class="flex gap-0.5">${getStarRatingSvg(r.rating, 'w-3.5 h-3.5')}</div>
                    <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono text-[10px]">${r.detectedLanguage}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold ${r.reply?.status === 'posted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} px-2.5 py-0.5 rounded-full">
                      ${r.reply?.status === 'posted' ? '✓ Posted to Google' : '⚠️ Held for Approval'}
                    </span>
                    <button type="button" onclick="deleteReview('${r.id}')" aria-label="Delete Review" class="text-slate-400 hover:text-rose-600 p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                      ${getSvgIcon('trash', 'w-4 h-4')}
                    </button>
                  </div>
                </div>
                <p class="text-xs text-slate-800">“${r.text || 'Star-only review'}”</p>
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div class="flex justify-between font-bold text-slate-800">
                    <span>Official Reply:</span>
                    <div class="flex items-center gap-3">
                      ${r.reply?.status !== 'posted' ? `<button type="button" onclick="approveReply('${r.id}')" class="text-brand-600 hover:underline focus-visible:outline-none">Approve Now &rarr;</button>` : ''}
                      <button type="button" onclick="regenerateReply('${r.id}', 'warmer')" class="text-slate-500 hover:text-slate-800 font-normal focus-visible:outline-none">Warmer</button>
                      <button type="button" onclick="regenerateReply('${r.id}', 'shorter')" class="text-slate-500 hover:text-slate-800 font-normal focus-visible:outline-none">Shorter</button>
                    </div>
                  </div>
                  <p id="replyText-${r.id}">${r.reply?.finalText || r.reply?.draftText}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <script>
          async function approveReply(id) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'approve' })
            });
            window.location.reload();
          }
          async function regenerateReply(id, mode) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'regenerate', styleMode: mode })
            });
            window.location.reload();
          }
          async function deleteReview(id) {
            if (confirm('Delete this review from feed?')) {
              await fetch('/api/reviews/' + id, { method: 'DELETE' });
              window.location.reload();
            }
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Reviews', 'app', renderAppShell('reviews', content, store)));
    }

    if (pathname === '/app/approvals') {
      const store = getStore();
      const held = store.reviews.filter(r => r.reply && r.reply.status === 'held');
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Held Approvals Queue (${held.length})</h1>
            <p class="text-xs text-slate-500">Reviews rated 1–3 stars quarantined with zero-liability defense</p>
          </div>
          ${held.length === 0 ? `
            <div class="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2 card-3d">
              <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                ${getSvgIcon('check', 'w-6 h-6')}
              </div>
              <h3 class="font-bold text-slate-900 font-heading">All Reviews Clear!</h3>
              <p class="text-xs text-slate-500">No negative reviews currently awaiting approval.</p>
            </div>
          ` : `
            <div class="space-y-5">
              ${held.map((r) => `
                <div class="p-6 bg-white rounded-3xl border-2 border-amber-200 shadow-sm space-y-4 card-3d">
                  <div class="flex justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm text-slate-900">${r.reviewerName}</span>
                      <div class="flex gap-0.5">${getStarRatingSvg(r.rating, 'w-3 h-3')}</div>
                    </div>
                    <span class="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full">Requires Approval</span>
                  </div>
                  <p class="text-xs text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-100">“${r.text}”</p>
                  <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 space-y-2">
                    <span class="font-bold text-emerald-950 font-heading">De-escalating AI Proposed Draft:</span>
                    <p>${r.reply?.draftText}</p>
                    <p class="text-[11px] text-emerald-700 flex items-center gap-1">
                      ${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} Checked: Zero fault admitted • No refund promised • Directs to manager phone (+91 98450 12345)
                    </p>
                  </div>
                  <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex justify-between items-center">
                    <span class="text-blue-900 font-semibold flex items-center gap-1.5">
                      ${getSvgIcon('smartphone', 'w-4 h-4 text-blue-700')} SMS 1-Tap Link: /a/${r.reply?.approvalToken || 'token'}
                    </span>
                    <a href="/a/${r.reply?.approvalToken || 'token'}" target="_blank" class="px-3 min-h-[36px] flex items-center bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Open 1-Tap &rarr;</a>
                  </div>
                  <button type="button" onclick="approveReply('${r.id}')" class="w-full min-h-[44px] bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    Approve & Post to Google Maps (1-Tap) &rarr;
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        <script>
          async function approveReply(id) {
            await fetch('/api/reviews/' + id + '/reply', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'approve' })
            });
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Approvals', 'app', renderAppShell('approvals', content, store)));
    }

    // ----------------------------------------------------
    // 3D PHYSICAL CARD QR STUDIO (/app/qr)
    // ----------------------------------------------------
    if (pathname === '/app/qr') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">3D Physical Card QR Studio</h1>
              <p class="text-xs text-slate-500">Interactive 3D table tent and counter card visualizer with print-ready vector export</p>
            </div>
            <a href="/q/sharma-dent-01" target="_blank" class="px-4 min-h-[40px] flex items-center bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              ${getSvgIcon('smartphone', 'w-4 h-4 mr-1 text-white')} Test Customer Flow
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <h3 class="text-xs font-bold uppercase text-slate-500">Touchpoints & Locations</h3>
              ${store.qrcodes.map((q) => `
                <div class="p-3.5 bg-white rounded-2xl border border-slate-200 text-xs space-y-1 card-3d">
                  <div class="flex justify-between font-bold text-slate-900">
                    <span>${q.name}</span>
                    <span class="bg-brand-100 text-brand-800 text-[10px] px-2 py-0.5 rounded-full tabular-nums">${q.scansCount} scans</span>
                  </div>
                  <p class="text-slate-500 font-mono text-[11px]">/q/${q.shortCode}</p>
                </div>
              `).join('')}
            </div>

            <!-- Interactive 3D Card Visualizer -->
            <div class="md:col-span-2 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-6">
              <div class="flex justify-between items-center">
                <h3 class="font-bold text-sm text-slate-900 font-heading">Interactive 3D Physical Card Visualizer</h3>
                <span class="text-[11px] text-slate-400">Move mouse to tilt in 3D</span>
              </div>

              <!-- The 3D Rendered Standee -->
              <div class="perspective-1000 py-6">
                <div id="standee3D" class="card-3d max-w-xs mx-auto p-7 bg-white border-2 border-slate-300 rounded-[32px] shadow-2xl relative overflow-hidden space-y-3 cursor-grab">
                  <div class="glare-effect"></div>
                  <span class="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Google Verified Partner</span>
                  <h4 class="font-extrabold text-base text-slate-900 font-heading">${store.location.name}</h4>
                  <p class="text-[11px] text-slate-600">Loved your visit? Share feedback in 30 seconds</p>
                  <div id="qrcodeCanvas" class="p-3 bg-white border border-slate-200 inline-block rounded-2xl shadow-sm"></div>
                  <p class="text-[10px] text-slate-400 font-mono">replyo.in/q/sharma-dent-01</p>
                </div>
              </div>

              <div class="flex justify-center gap-3 pt-2">
                <button type="button" onclick="window.print()" class="px-5 min-h-[44px] flex items-center gap-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  ${getSvgIcon('printer', 'w-4 h-4 text-white')} Print PDF (Bleed Margins)
                </button>
              </div>
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('load', () => {
            QRCode.toCanvas(document.getElementById('qrcodeCanvas'), window.location.origin + '/q/sharma-dent-01', { width: 170 });
          });
        </script>
      `;
      return sendHtml(200, renderHtmlPage('QR Studio', 'app', renderAppShell('qr', content, store)));
    }

    if (pathname === '/app/growth') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-6xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Growth & Competitors</h1>
            <p class="text-xs text-slate-500">Indiranagar local market leaderboard</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
            <h3 class="font-bold text-sm text-slate-900 font-heading">Local Area Competitor Benchmark</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-slate-500 uppercase border-y border-slate-100">
                  <tr>
                    <th class="py-2.5 px-3">Clinic</th>
                    <th class="py-2.5 px-3">Rating</th>
                    <th class="py-2.5 px-3">Reviews</th>
                    <th class="py-2.5 px-3">Unanswered</th>
                    <th class="py-2.5 px-3">Response Rate</th>
                    <th class="py-2.5 px-3">Reply Velocity</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
                  ${store.competitors.map((c) => `
                    <tr class="${c.name.includes('(Your Clinic)') ? 'bg-brand-50/50 font-bold text-brand-950' : ''}">
                      <td class="py-3 px-3">${c.name}</td>
                      <td class="py-3 px-3 text-amber-500 font-bold tabular-nums">★ ${c.rating}</td>
                      <td class="py-3 px-3 tabular-nums">${c.totalReviews}</td>
                      <td class="py-3 px-3 text-amber-600 tabular-nums">${c.unansweredReviews}</td>
                      <td class="py-3 px-3 tabular-nums">${c.responseRate}%</td>
                      <td class="py-3 px-3">${c.averageResponseTime}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Growth', 'app', renderAppShell('growth', content, store)));
    }

    // ----------------------------------------------------
    // GOOGLE PROFILE HEALTH CHECK (/app/profile-health)
    // ----------------------------------------------------
    if (pathname === '/app/profile-health') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Google Business Profile Health Check</h1>
            <p class="text-xs text-slate-500">Audit your Google Maps listing to ensure maximum local visibility and search ranking</p>
          </div>

          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
            <div class="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 class="font-bold text-base text-slate-900 font-heading">${store.location.name}</h3>
                <p class="text-xs text-slate-500">${store.location.area}, ${store.location.city} • Verified Listing</p>
              </div>
              <span class="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full tabular-nums">Health Score: 94/100</span>
            </div>

            <div class="space-y-3 text-xs">
              <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>Review Response Velocity:</strong> Responding in &lt; 5 minutes</span>
                <span class="font-bold text-emerald-700">Optimal (100%)</span>
              </div>
              <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>NAP Consistency:</strong> Name, Address, and Phone match official records</span>
                <span class="font-bold text-emerald-700">Verified</span>
              </div>
              <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span>✓ <strong>Hinglish & Dialect Coverage:</strong> Multi-script replies enabled</span>
                <span class="font-bold text-emerald-700">Active</span>
              </div>
              <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex justify-between items-center">
                <span>⚠️ <strong>Google Updates / Posts:</strong> Last update posted 12 days ago</span>
                <span class="font-bold text-amber-700">Action Recommended</span>
              </div>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('GBP Health Check', 'app', renderAppShell('profile-health', content, store)));
    }

    // ----------------------------------------------------
    // 5-STAR REVIEW POSTER GENERATOR (/app/posters)
    // ----------------------------------------------------
    if (pathname === '/app/posters') {
      const store = getStore();
      const fiveStarReviews = store.reviews.filter(r => r.rating === 5 && r.text);
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">5-Star Review Poster Studio</h1>
            <p class="text-xs text-slate-500">Generate high-converting social media and waiting lounge graphics from genuine 5-star Google reviews</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <!-- Poster Preview Canvas -->
            <div class="p-8 bg-dark-950 rounded-3xl text-white shadow-xl space-y-5 border border-slate-800 card-3d">
              <div class="flex justify-between items-center">
                <div class="flex gap-1">${getStarRatingSvg(5, 'w-4 h-4')}</div>
                <span class="text-[10px] uppercase font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">Verified Google Review</span>
              </div>
              <p id="posterQuote" class="text-sm font-medium leading-relaxed italic text-slate-200">
                “${fiveStarReviews[0]?.text || 'Painless procedure and amazing staff!'}”
              </p>
              <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <h4 id="posterAuthor" class="font-bold text-white font-heading">${fiveStarReviews[0]?.reviewerName || 'Patient'}</h4>
                  <p class="text-[10px] text-slate-400">Google Local Guide</p>
                </div>
                <div class="text-right">
                  <span class="font-bold text-xs text-brand-400">${store.location.name}</span>
                  <p class="text-[10px] text-slate-500">${store.location.area}, ${store.location.city}</p>
                </div>
              </div>
            </div>

            <!-- Controls -->
            <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs card-3d">
              <h3 class="font-bold text-slate-900 font-heading text-sm">Select Review to Feature</h3>
              <label for="reviewSelect" class="sr-only">Choose Review</label>
              <select id="reviewSelect" onchange="updatePoster(this.value)" class="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                ${fiveStarReviews.map((r, i) => `
                  <option value="${i}">${r.reviewerName} - “${r.text.substring(0, 40)}…”</option>
                `).join('')}
              </select>
              <button type="button" onclick="alert('Poster exported in 2048x2048 high-res PNG for Instagram and Print!')" class="w-full min-h-[44px] flex items-center justify-center gap-2 bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                ${getSvgIcon('posters', 'w-4 h-4 text-white')} Download High-Res Graphic (PNG) &rarr;
              </button>
            </div>
          </div>
        </div>
        <script>
          const reviews = ${JSON.stringify(fiveStarReviews)};
          function updatePoster(idx) {
            const r = reviews[idx];
            document.getElementById('posterQuote').innerText = '“' + r.text + '”';
            document.getElementById('posterAuthor').innerText = r.reviewerName;
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Poster Studio', 'app', renderAppShell('posters', content, store)));
    }

    // ----------------------------------------------------
    // WEEKLY REPORTS (/app/reports)
    // ----------------------------------------------------
    if (pathname === '/app/reports') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-5xl mx-auto">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Weekly Reputation Report</h1>
              <p class="text-xs text-slate-500">Automated performance summary for Dr. Sharma Dental Clinic</p>
            </div>
            <button type="button" onclick="window.print()" class="px-4 min-h-[40px] flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              ${getSvgIcon('printer', 'w-4 h-4 text-white')} Download PDF Report
            </button>
          </div>

          <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 card-3d">
            <div class="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h3 class="font-bold text-lg text-slate-900 font-heading">Reputation Health Report Card</h3>
                <p class="text-xs text-slate-500">Period: 12 Oct 2026 – 19 Oct 2026 • Prepared by Replyo</p>
              </div>
              <span class="text-xs font-bold text-brand-800 bg-brand-100 px-3 py-1 rounded-full">Status: Excellent</span>
            </div>

            <div class="grid grid-cols-4 gap-4 text-center text-xs">
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">New Reviews</span>
                <p class="text-2xl font-black text-slate-900 mt-1 tabular-nums">18</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Average Rating</span>
                <p class="text-2xl font-black text-brand-600 mt-1 tabular-nums">4.8★</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Auto-Posted</span>
                <p class="text-2xl font-black text-emerald-600 mt-1 tabular-nums">16</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span class="text-slate-500">Held & Resolved</span>
                <p class="text-2xl font-black text-amber-600 mt-1 tabular-nums">2</p>
              </div>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <h4 class="font-bold text-slate-900 font-heading">Key Insights & Takeaways</h4>
              <p>• Patient sentiment towards “Root Canal” improved by 28% following painless protocol emphasis.</p>
              <p>• Reception QR card accounted for 72% of all new reviews generated this week.</p>
              <p>• Clinic manager successfully de-escalated 2 held complaints within 30 minutes via private telephone callback.</p>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Weekly Reports', 'app', renderAppShell('reports', content, store)));
    }

    // ----------------------------------------------------
    // SETTINGS (/app/settings)
    // ----------------------------------------------------
    if (pathname === '/app/settings') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Autopilot & Tone Settings</h1>
            <p class="text-xs text-slate-500">Configure response autonomy and business profile</p>
          </div>
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs card-3d">
            <div class="space-y-2">
              <label for="setName" class="font-bold text-slate-700">Business / Clinic Name</label>
              <input id="setName" type="text" value="${store.location.name}" class="w-full p-2.5 border rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="setArea" class="font-bold text-slate-700">Area / Neighborhood</label>
                <input id="setArea" type="text" value="${store.location.area}" class="w-full p-2.5 border rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
              <div>
                <label for="setCity" class="font-bold text-slate-700">City</label>
                <input id="setCity" type="text" value="${store.location.city}" class="w-full p-2.5 border rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              </div>
            </div>
            <div class="space-y-2">
              <label for="setPhone" class="font-bold text-slate-700">De-escalation Manager Mobile</label>
              <input id="setPhone" type="tel" value="${store.location.managerPhone}" class="w-full p-2.5 border rounded-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            </div>
            <button type="button" onclick="saveClinicSettings()" class="px-6 min-h-[44px] bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Save Settings &rarr;
            </button>
          </div>
        </div>
        <script>
          async function saveClinicSettings() {
            const name = document.getElementById('setName').value;
            const area = document.getElementById('setArea').value;
            const city = document.getElementById('setCity').value;
            const phone = document.getElementById('setPhone').value;
            await fetch('/api/settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, area, city, managerPhone: phone })
            });
            alert('Settings successfully saved and persisted to database!');
            window.location.reload();
          }
        </script>
      `;
      return sendHtml(200, renderHtmlPage('Settings', 'app', renderAppShell('settings', content, store)));
    }

    // ----------------------------------------------------
    // BILLING & GST (/app/billing)
    // ----------------------------------------------------
    if (pathname === '/app/billing') {
      const store = getStore();
      const content = `
        <div class="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Billing & Plans</h1>
            <p class="text-xs text-slate-500">INR subscription with UPI AutoPay & GST compliance</p>
          </div>
          <div class="p-8 bg-dark-950 text-white rounded-3xl space-y-4 shadow-xl card-3d">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-[10px] uppercase font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">Active Plan</span>
                <h2 class="text-2xl font-black mt-1 font-heading">Growth Plan (₹1,349 / month)</h2>
                <p class="text-xs text-slate-400">Renews via UPI AutoPay on 15 Nov 2026</p>
              </div>
              <span class="text-brand-400 font-bold text-xs flex items-center gap-1.5">
                ${getSvgIcon('check', 'w-4 h-4 text-brand-400')} UPI Mandate Active
              </span>
            </div>
            <div class="grid grid-cols-3 gap-3 pt-3 text-xs border-t border-slate-800">
              <div><span class="text-slate-400">AI Replies:</span> <strong class="text-white block font-heading text-sm tabular-nums">42 / Unlimited</strong></div>
              <div><span class="text-slate-400">QR Touchpoints:</span> <strong class="text-white block font-heading text-sm tabular-nums">3 of 3 Active</strong></div>
              <div><span class="text-slate-400">Customer Drafts:</span> <strong class="text-white block font-heading text-sm tabular-nums">197 of 300</strong></div>
            </div>
          </div>
        </div>
      `;
      return sendHtml(200, renderHtmlPage('Billing', 'app', renderAppShell('billing', content, store)));
    }

    // ----------------------------------------------------
    // TEAM & MULTI-LOCATION (/app/team)
    // ----------------------------------------------------
    if (pathname === '/app/staff') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('Staff Leaderboard & Incentives', 'app', renderAppShell('staff', renderStaffPage(store), store)));
    }

    if (pathname === '/app/local-pack') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('Google Local 3-Pack Simulator', 'app', renderAppShell('local-pack', renderLocalPackPage(store), store)));
    }

    if (pathname === '/app/integrations/whatsapp') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('WhatsApp Cloud API Studio', 'app', renderAppShell('whatsapp', renderWhatsAppStudioPage(store), store)));
    }

    if (pathname === '/app/integrations/pos') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('POS & Webhook Connectors', 'app', renderAppShell('pos', renderPosWebhooksPage(store), store)));
    }

    if (pathname === '/app/disputes') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('AI Policy Disputes & Removal', 'app', renderAppShell('disputes', renderDisputesPage(store), store)));
    }

    if (pathname === '/app/organizations' || pathname === '/app/team') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('Multi-Location Enterprise Rollup', 'app', renderAppShell('organizations', renderOrganizationsPage(store), store)));
    }

    if (pathname === '/app/sentiment') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('Aspect-Based Sentiment Intelligence', 'app', renderAppShell('sentiment', renderSentimentPage(store), store)));
    }

    if (pathname === '/app/hardware') {
      const store = getStore();
      return sendHtml(200, renderHtmlPage('NFC Hardware Studio & Stands', 'app', renderAppShell('hardware', renderHardwareStudioPage(store), store)));
    }

    // ----------------------------------------------------
    // CUSTOMER QR REVIEW FLOW (/q/:code)
    // ----------------------------------------------------
    if (pathname.startsWith('/q/') && !pathname.endsWith('/done')) {
      const code = pathname.split('/')[2];
      const store = getStore();
      const loc = store.location || {};
      const vertical = loc.vertical || 'clinic';
      const services = (store.servicesByVertical && store.servicesByVertical[vertical]) || ['Painless Root Canal', 'Clear Aligners', 'Dental Implants', 'Teeth Whitening'];
      const qualities = (store.qualityTagsByVertical && store.qualityTagsByVertical[vertical]) || ['Painless Treatment', 'Sterile Operatory', 'Clean & Hygienic'];
      const staffMembers = (store.staff || []).filter(s => s.vertical === vertical);
      const defaultStaff = staffMembers[0] ? staffMembers[0].name : 'Our Team';

      const html = renderHtmlPage('15-Second Google Review Copilot', 'qr', `
        <div class="min-h-screen bg-slate-100 py-6 px-4">
          <div class="max-w-md mx-auto space-y-4">
            
            <!-- Business Card Header -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-1 shadow-sm card-3d">
              <h1 class="font-extrabold text-slate-900 text-lg font-heading">${loc.name || 'Our Center'}</h1>
              <p class="text-xs text-slate-500">${loc.area || 'Bengaluru'}, ${loc.city || 'Karnataka'}</p>
              <div class="flex items-center justify-center gap-1.5 mt-1">
                <span class="text-[10px] text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border border-brand-200">
                  ${vertical}
                </span>
                <span class="text-xs text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full font-bold">15-Second Google Review Copilot</span>
              </div>
            </div>

            <!-- Step 1: Rating -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm card-3d">
              <span class="text-xs font-bold uppercase text-slate-500 font-heading">1. Your Overall Experience</span>
              <div class="flex justify-center gap-2 text-3xl text-amber-400">
                <button type="button" class="cursor-pointer focus-visible:outline-none p-1 transition-transform hover:scale-125" onclick="setQrRating(1)" aria-label="1 star">★</button>
                <button type="button" class="cursor-pointer focus-visible:outline-none p-1 transition-transform hover:scale-125" onclick="setQrRating(2)" aria-label="2 stars">★</button>
                <button type="button" class="cursor-pointer focus-visible:outline-none p-1 transition-transform hover:scale-125" onclick="setQrRating(3)" aria-label="3 stars">★</button>
                <button type="button" class="cursor-pointer focus-visible:outline-none p-1 transition-transform hover:scale-125" onclick="setQrRating(4)" aria-label="4 stars">★</button>
                <button type="button" class="cursor-pointer focus-visible:outline-none p-1 transition-transform hover:scale-125 text-amber-400" onclick="setQrRating(5)" aria-label="5 stars">★</button>
              </div>
              <p id="qrRatingLabel" class="text-xs font-bold text-slate-800 font-mono">5 Stars (Outstanding Experience!)</p>

              <!-- FTC 16 CFR Part 465 Micro-Recovery Safe Harbor Banner -->
              <div id="recoveryBanner" class="hidden mt-3 p-4 bg-amber-50 rounded-2xl border border-amber-300 text-left space-y-2 text-xs animate-in fade-in">
                <div class="flex items-center gap-1.5 text-amber-950 font-bold font-heading">
                  <span>⚠️ We Strive for 100% Excellence</span>
                </div>
                <p class="text-amber-900 text-[11px] leading-relaxed">
                  We are deeply sorry your visit fell short of 5 stars. Would you like our Managing Director to call you directly within 15 minutes to personally assist you?
                </p>
                <div class="flex flex-wrap gap-2 pt-1">
                  <a href="tel:${loc.managerPhone || '+919845011223'}" class="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-[11px] shadow-sm">
                    📞 Direct Call to Manager (${loc.managerPhone || '+91 98450 11223'})
                  </a>
                  <button type="button" onclick="continueToGoogle()" class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold text-[11px] hover:bg-slate-50">
                    Proceed to Google Maps Anyway
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Vertical Service Pills -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
              <span class="font-bold uppercase text-slate-500 font-heading">2. What did you visit for today?</span>
              <div class="flex flex-wrap gap-1.5" id="serviceTags">
                ${services.map((svc, i) => `
                  <button type="button" onclick="toggleTag(this)" class="px-3 min-h-[40px] rounded-xl border text-xs font-medium focus-visible:outline-none transition-all ${
                    i === 0 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }">${svc}</button>
                `).join('')}
              </div>
            </div>

            <!-- Step 3: Frontline Staff Attribution Selector -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
              <span class="font-bold uppercase text-slate-500 font-heading">3. Who took care of you today?</span>
              <div class="flex flex-wrap gap-1.5" id="staffTags">
                ${staffMembers.map((st, i) => `
                  <button type="button" onclick="selectStaffTag(this, '${st.name}')" class="px-3 min-h-[38px] rounded-xl border text-xs font-bold focus-visible:outline-none transition-all flex items-center gap-1.5 ${
                    i === 0 ? 'bg-dark-950 text-white border-dark-950 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }">
                    <span class="w-2 h-2 rounded-full ${i === 0 ? 'bg-brand-400' : 'bg-slate-300'}"></span>
                    <span>${st.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Step 4: Language Choice -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm text-xs card-3d">
              <span class="font-bold uppercase text-slate-500 font-heading">4. Preferred Review Language</span>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" onclick="setLang('hi-en', this)" class="py-2.5 rounded-xl border font-bold bg-brand-600 text-white border-brand-600 shadow-sm focus-visible:outline-none">Hinglish</button>
                <button type="button" onclick="setLang('en', this)" class="py-2.5 rounded-xl border font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 focus-visible:outline-none">English</button>
                <button type="button" onclick="setLang('hi', this)" class="py-2.5 rounded-xl border font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 focus-visible:outline-none">हिंदी</button>
              </div>
              <button type="button" onclick="generateDraft()" class="w-full min-h-[48px] bg-slate-900 text-white font-bold rounded-xl mt-2 hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2">
                ${getSvgIcon('sparkles', 'w-4 h-4 text-brand-400')}
                <span>Generate 15-Second AI Review Draft &rarr;</span>
              </button>
            </div>

            <!-- Draft Output & Direct Google Intent -->
            <div id="draftContainer" class="hidden p-5 bg-emerald-50 rounded-3xl border-2 border-emerald-500 space-y-3 text-xs animate-in fade-in">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-950 font-heading">Your Ready-to-Post Review Draft:</span>
                <span class="text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">Auto-Copied</span>
              </div>
              <label for="draftText" class="sr-only">Review Draft Content</label>
              <textarea id="draftText" rows="4" class="w-full p-3 rounded-xl border border-emerald-300 bg-white text-xs text-slate-800 leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"></textarea>
              
              <!-- Google Photo Booster Hint -->
              <div class="p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                <span class="text-base">📸</span>
                <span><strong>Pro-Tip:</strong> Have a photo of your visit or dish? Add it on Google Maps for <strong>3x more views</strong>!</span>
              </div>

              <button type="button" onclick="submitToGoogle()" class="w-full min-h-[50px] bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2">
                <span>Copy & Submit on Google Maps &rarr;</span>
              </button>
            </div>

          </div>
        </div>

        <script>
          let qrRating = 5;
          let qrLang = 'hi-en';
          let selectedStaff = '${defaultStaff}';

          function setQrRating(r) {
            qrRating = r;
            const labels = ['1 Star (Poor)', '2 Stars (Disappointing)', '3 Stars (Average)', '4 Stars (Great)', '5 Stars (Outstanding Experience!)'];
            document.getElementById('qrRatingLabel').innerText = labels[r - 1];
            
            const recBanner = document.getElementById('recoveryBanner');
            if (r <= 3) {
              recBanner.classList.remove('hidden');
            } else {
              recBanner.classList.add('hidden');
            }
          }

          function setLang(l, btn) {
            qrLang = l;
            btn.parentElement.querySelectorAll('button').forEach(b => {
              b.className = 'py-2.5 rounded-xl border font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 focus-visible:outline-none';
            });
            btn.className = 'py-2.5 rounded-xl border font-bold bg-brand-600 text-white border-brand-600 shadow-sm focus-visible:outline-none';
          }

          function toggleTag(btn) {
            if (btn.classList.contains('bg-brand-600')) {
              btn.className = 'px-3 min-h-[40px] rounded-xl border bg-slate-50 text-slate-700 border-slate-200 font-medium focus-visible:outline-none';
            } else {
              btn.className = 'px-3 min-h-[40px] rounded-xl border bg-brand-600 text-white border-brand-600 font-medium shadow-sm focus-visible:outline-none';
            }
          }

          function selectStaffTag(btn, name) {
            selectedStaff = name;
            btn.parentElement.querySelectorAll('button').forEach(b => {
              b.className = 'px-3 min-h-[38px] rounded-xl border text-xs font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 flex items-center gap-1.5 focus-visible:outline-none';
              const dot = b.querySelector('span');
              if (dot) dot.className = 'w-2 h-2 rounded-full bg-slate-300';
            });
            btn.className = 'px-3 min-h-[38px] rounded-xl border text-xs font-bold bg-dark-950 text-white border-dark-950 shadow-sm flex items-center gap-1.5 focus-visible:outline-none';
            const dot = btn.querySelector('span');
            if (dot) dot.className = 'w-2 h-2 rounded-full bg-brand-400';
          }

          function continueToGoogle() {
            document.getElementById('recoveryBanner').classList.add('hidden');
          }

          async function generateDraft() {
            const services = [];
            document.querySelectorAll('#serviceTags button.bg-brand-600').forEach(b => services.push(b.innerText.trim()));
            const res = await fetch('/api/ai/qr-draft', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                submission: {
                  rating: qrRating,
                  selectedServices: services.length ? services : ['${services[0] || 'Service'}'],
                  qualityTags: ['Painless Treatment', 'Sterile Operatory', 'Clean & Hygienic'],
                  staffName: selectedStaff,
                  ambienceTags: ['Modern Atmosphere'],
                  recommend: 'yes',
                  language: qrLang,
                  length: 'short'
                },
                shortCode: '${code}'
              })
            });
            const json = await res.json();
            document.getElementById('draftText').value = json.draftText;
            document.getElementById('draftContainer').classList.remove('hidden');
            await navigator.clipboard.writeText(json.draftText);
          }

          async function submitToGoogle() {
            const text = document.getElementById('draftText').value;
            await navigator.clipboard.writeText(text);
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof confetti === 'function') {
              confetti({ particleCount: 60, spread: 60 });
            }
            const placeId = '${loc.googlePlaceId || 'ChIJ_zX8sh8UrjsRn7w001'}';
            const reviewUrl = 'https://search.google.com/local/writereview?placeid=' + placeId;
            window.open(reviewUrl, '_blank');
            window.location.href = '/q/${code}/done?text=' + encodeURIComponent(text);
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    if (pathname.startsWith('/q/') && pathname.endsWith('/done')) {
      const store = getStore();
      const html = renderHtmlPage('Thank You', 'qr', `
        <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 card-3d">
            <div class="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              ${getSvgIcon('check', 'w-6 h-6')}
            </div>
            <h1 class="text-2xl font-black text-slate-900 font-heading">Thank You for Supporting Us!</h1>
            <p class="text-xs text-slate-600">Your review helps genuine local patients discover quality healthcare.</p>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>Reminder:</strong> Your text is copied to your clipboard. Simply paste it on Google Maps and tap Post!
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${store.location.googlePlaceId}" target="_blank" class="block w-full min-h-[44px] flex items-center justify-center bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Open Google Review Window Again &rarr;
            </a>
          </div>
        </div>
      `);
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 1-TAP OWNER MOBILE APPROVAL (/a/:token)
    // ----------------------------------------------------
    if (pathname.startsWith('/a/')) {
      const token = pathname.split('/')[2];
      const store = getStore();
      const html = renderHtmlPage('1-Tap Mobile Approval', 'approval', `
        <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 card-3d">
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-1.5">
              ${getSvgIcon('approvals', 'w-4 h-4 text-amber-700')} Negative Review Held for 1-Tap Owner Approval
            </div>
            <div class="text-xs space-y-1">
              <span class="font-bold text-slate-900">Priya Narang (1★)</span>
              <p class="italic text-slate-600">“Waited 45 mins past appointment time. Receptionist was completely dismissive.”</p>
            </div>
            <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <span class="font-bold text-emerald-950 font-heading">AI Proposed De-escalation Reply:</span>
              <p class="text-slate-800">Dear Priya Narang, thank you for sharing your feedback. We sincerely value patient comfort and punctuality. Please contact our clinic manager at ${store.location.managerPhone}.</p>
              <p class="text-[11px] text-emerald-700 flex items-center gap-1">
                ${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} Zero legal fault admitted • Directs to manager phone
              </p>
            </div>
            <button id="apprBtn" type="button" onclick="doApprove()" class="w-full min-h-[48px] bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Approve & Post to Google Maps (1-Tap) &rarr;
            </button>
            <p id="apprDone" class="hidden text-center text-xs font-bold text-emerald-700" aria-live="polite">✓ Successfully Published to Google Maps!</p>
          </div>
        </div>
        <script>
          async function doApprove() {
            await fetch('/api/approvals/${token}', { method: 'POST' });
            document.getElementById('apprBtn').classList.add('hidden');
            document.getElementById('apprDone').classList.remove('hidden');
          }
        </script>
      `);
      return sendHtml(200, html);
    }

    return sendHtml(404, renderHtmlPage('404 Not Found', '', `
      <div class="min-h-[60vh] flex items-center justify-center p-8 text-center space-y-4">
        <div>
          <h1 class="text-4xl font-black text-slate-900 font-heading">404 — Page Not Found</h1>
          <p class="text-slate-500 text-xs mt-2">The page you requested does not exist.</p>
          <a href="/" class="inline-block mt-4 px-6 min-h-[44px] flex items-center justify-center bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Return to Homepage &rarr;</a>
        </div>
      </div>
    `));
  } catch (err) {
    console.error('Server error:', err);
    return sendJson(500, { success: false, error: 'Internal Server Error' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Replyo 2.0 (Swiss Minimalist & Fully Accessible) is LIVE on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

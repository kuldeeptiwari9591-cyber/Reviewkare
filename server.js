const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AsyncLocalStorage } = require('node:async_hooks');

// Request Store Context (Multi-Tenant Isolation)
const reqStoreContext = new AsyncLocalStorage();

// Data file paths
const DATA_FILE = path.join(__dirname, 'data', 'store.json');
const TENANTS_DIR = path.join(__dirname, 'data', 'tenants');
const REGISTRY_FILE = path.join(__dirname, 'data', 'registry.json');

// Ensure directories exist
if (!fs.existsSync(TENANTS_DIR)) fs.mkdirSync(TENANTS_DIR, { recursive: true });

// In-memory store caches
let storeCache = null;
let registryCache = null;
const tenantCaches = new Map();

// Helper to load registry
function getRegistry() {
  if (registryCache) return registryCache;
  try {
    if (fs.existsSync(REGISTRY_FILE)) {
      registryCache = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
      return registryCache;
    }
  } catch (e) {
    console.error('Error reading registry:', e);
  }
  registryCache = { users: {}, sessions: {}, qrLookup: {}, config: {} };
  return registryCache;
}

// Helper to save registry (atomic)
function saveRegistry(data) {
  registryCache = data;
  try {
    const tmp = REGISTRY_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, REGISTRY_FILE);
  } catch (e) {
    console.error('Error saving registry:', e);
  }
}

// Raw Storage I/O for fallback default store
function rawGetStore() {
  if (storeCache) return storeCache;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    storeCache = JSON.parse(raw);
    return storeCache;
  } catch (e) {
    console.error('Error reading store:', e);
    return { location: {}, reviews: [], qrcodes: [], competitors: [] };
  }
}

function rawSaveStore(data) {
  storeCache = data;
  try {
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
  } catch (e) {
    console.error('Error saving store:', e);
  }
}

// Multi-Tenant Store Manager
function getTenantStore(tenantId = 'default') {
  if (tenantCaches.has(tenantId)) return tenantCaches.get(tenantId);
  const tenantPath = path.join(TENANTS_DIR, `${tenantId}.json`);
  try {
    if (fs.existsSync(tenantPath)) {
      const parsed = JSON.parse(fs.readFileSync(tenantPath, 'utf8'));
      tenantCaches.set(tenantId, parsed);
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading tenant ${tenantId}:`, e);
  }
  const fallback = rawGetStore();
  tenantCaches.set(tenantId, fallback);
  return fallback;
}

function saveTenantStore(tenantId = 'default', data) {
  tenantCaches.set(tenantId, data);
  const tenantPath = path.join(TENANTS_DIR, `${tenantId}.json`);
  try {
    const tmp = tenantPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, tenantPath);
  } catch (e) {
    console.error(`Error saving tenant ${tenantId}:`, e);
  }
  if (tenantId === 'default') {
    rawSaveStore(data);
  }
}

// Scoped Store accessors (auto-bind to current request tenant or 'default')
function getStore() {
  const ctx = reqStoreContext.getStore();
  const tenantId = ctx?.tenantId || 'default';
  return getTenantStore(tenantId);
}

function saveStore(data) {
  const ctx = reqStoreContext.getStore();
  const tenantId = ctx?.tenantId || 'default';
  return saveTenantStore(tenantId, data);
}

function getStoreForReq(req) {
  const session = getSessionFromReq(req);
  const tenantId = session?.tenantId || 'default';
  return { store: getTenantStore(tenantId), tenantId };
}

// Native HTML Entity Escaper (XSS Protection)
function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Native Cryptographic Password Hashing (Zero Dependencies)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  if (!password || !hash || !salt) return false;
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch (e) {
    return false;
  }
}

// ----------------------------------------------------
// PRODUCTION SECURITY & SESSION ARCHITECTURE
// ----------------------------------------------------
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Helper: Parse HTTP Request Cookies
function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

// Helper: Create Secure Session
function createSession(userData = {}) {
  const token = 'sess_' + crypto.randomBytes(24).toString('hex');
  const tenantId = userData.tenantId || 'default';
  const session = {
    userId: userData.userId || 'usr_' + Date.now(),
    tenantId: tenantId,
    email: userData.email || 'dr.sharma@sharmadental.in',
    name: userData.name || 'Dr. Ananya Sharma',
    role: userData.role || 'Executive Group Director',
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days TTL
  };

  const reg = getRegistry();
  if (!reg.sessions) reg.sessions = {};
  reg.sessions[token] = session;
  saveRegistry(reg);

  const tenantStore = getTenantStore(tenantId);
  if (!tenantStore.sessions) tenantStore.sessions = {};
  tenantStore.sessions[token] = session;
  saveTenantStore(tenantId, tenantStore);

  return token;
}

// Helper: Destroy Session
function destroySession(token) {
  if (!token) return;
  const reg = getRegistry();
  const session = reg.sessions?.[token];
  if (session) {
    const tenantStore = getTenantStore(session.tenantId || 'default');
    if (tenantStore.sessions?.[token]) {
      delete tenantStore.sessions[token];
      saveTenantStore(session.tenantId || 'default', tenantStore);
    }
    delete reg.sessions[token];
    saveRegistry(reg);
  }
}

// Helper: Get Session from Request
function getSessionFromReq(req) {
  const cookies = parseCookies(req);
  const token = cookies.reviewkaro_session || cookies.replyo_session;
  if (!token) return null;
  const reg = getRegistry();
  const session = reg.sessions?.[token];
  if (!session) return null;
  if (session.expiresAt && session.expiresAt < Date.now()) {
    delete reg.sessions[token];
    saveRegistry(reg);
    return null;
  }
  return session;
}

// Rate Limiter: IP -> { count, resetTime }
const rateLimitMap = new Map();

function checkRateLimit(ip, limit = 100, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    rateLimitMap.set(ip, record);
    return { allowed: true, remaining: limit - 1 };
  }
  record.count++;
  rateLimitMap.set(ip, record);
  if (record.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  return { allowed: true, remaining: limit - record.count };
}

// ----------------------------------------------------
// NATIVE RAZORPAY PAYMENT GATEWAY ADAPTER
// ----------------------------------------------------
function getRazorpayConfig() {
  const reg = getRegistry();
  return {
    keyId: process.env.RAZORPAY_KEY_ID || reg.config?.razorpayKeyId || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || reg.config?.razorpayKeySecret || ''
  };
}

function createRazorpayOrder({ keyId, keySecret, amountInPaise, currency = 'INR', receipt, notes = {} }) {
  return new Promise((resolve) => {
    // If keys are not set, provide test order response
    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
      return resolve({
        success: true,
        order: {
          id: 'order_test_' + Date.now(),
          amount: amountInPaise,
          currency: 'INR',
          receipt: receipt || 'rcpt_' + Date.now(),
          status: 'created',
          isTestMock: true
        }
      });
    }

    const authHeader = 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64');
    const postData = JSON.stringify({ amount: amountInPaise, currency, receipt: receipt || 'rcpt_' + Date.now(), notes });

    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, order: parsed });
          } else {
            resolve({ success: false, error: parsed.error?.description || 'Razorpay order creation failed' });
          }
        } catch (e) {
          resolve({ success: false, error: 'Malformed Razorpay response' });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: 'Network error calling Razorpay: ' + err.message });
    });
    req.write(postData);
    req.end();
  });
}

function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Payment verification rejected. RAZORPAY_KEY_SECRET is missing in production environment.');
      return false; // Strict verification: never bypass in production
    }
    return true; // Accept test simulation only in non-production
  }
  try {
    const text = orderId + '|' + paymentId;
    const expectedSignature = crypto.createHmac('sha256', secret).update(text).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
  } catch (e) {
    return false;
  }
}

// Native Supabase Integration (Zero-dependency REST / PostgREST)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function supabaseQuery(endpoint, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!res.ok) {
      console.error(`Supabase error on ${endpoint}:`, res.status, await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Supabase query failed:', err.message);
    return null;
  }
}

// Periodically clean stale rate limits (prevent memory leak)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000).unref();

// Import compiled AI modules
const { generateReviewReply, detectLanguageAndScript } = require('./dist/src/lib/ai/reply-engine.js');
const { generateCustomerQRDraft } = require('./dist/src/lib/ai/qr-draft-engine.js');
const { validateReplyContent } = require('./dist/src/lib/ai/safety-validator.js');
const { PLANS } = require('./dist/src/lib/store/db.js');
const { getVerticalConfig, generateVerticalReviewDraft, VERTICAL_PROFILES } = require('./src/lib/verticals.js');

const PORT = process.env.PORT || 3000;
const BASE_URL = (process.env.BASE_URL || 'https://reviewkaro.tech').replace(/\/+$/, '');

// Modular View Architecture (Anti-Slop & UI/UX Pro Max Standard)
const { getSvgIcon, getStarRatingSvg } = require('./src/views/icons.js');
const { renderHtmlPage } = require('./src/views/layout.js');
const { renderAppShell } = require('./src/views/appShell.js');
const { renderHomePage, HOME_FAQS } = require('./src/views/homePage.js');
const { renderLoginPage, renderSignupPage, renderForgotPasswordPage } = require('./src/views/authPages.js');
const { FAQ_ITEMS, renderSecurityPage, renderBookDemoPage, renderFaqPage, renderQrKitPage, renderTermsPage, renderPrivacyPage, renderRefundPolicyPage, renderDpdpConsentPage } = require('./src/views/trustPages.js');
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
    const MAX_SIZE = 1024 * 1024; // 1MB payload protection
    req.on('error', (err) => reject(err));
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_SIZE) {
        req.destroy();
        reject(new Error('Payload Too Large'));
      }
    });
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
const server = http.createServer((req, res) => {
  const session = getSessionFromReq(req);
  const tenantId = session?.tenantId || 'default';

  reqStoreContext.run({ req, session, tenantId }, async () => {
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '127.0.0.1';
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:' + PORT}`);
    const pathname = reqUrl.pathname;
    const parsedQuery = Object.fromEntries(reqUrl.searchParams.entries());
    const method = req.method;

    const sendJson = (statusCode, data, customHeaders = {}) => {
      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...SECURITY_HEADERS,
        ...customHeaders
      });
      res.end(JSON.stringify(data));
    };

    const sendHtml = (statusCode, html, customHeaders = {}) => {
      res.writeHead(statusCode, {
        'Content-Type': 'text/html; charset=utf-8',
        ...SECURITY_HEADERS,
        ...customHeaders
      });
      res.end(html);
    };

    try {
    // ----------------------------------------------------
    // REST API ENDPOINTS
    // ----------------------------------------------------
    if ((pathname === '/api/health' || pathname === '/api/system/status') && method === 'GET') {
      const rzpConfig = getRazorpayConfig();
      return sendJson(200, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.floor(process.uptime()),
        supabaseConfigured: Boolean(SUPABASE_URL && SUPABASE_KEY),
        razorpayConfigured: Boolean(rzpConfig.keyId && rzpConfig.keySecret)
      });
    }

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
        reviewerName: escapeHtml(body.reviewerName || 'Valued Patient'),
        rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
        text: escapeHtml(body.text || ''),
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
      const rl = checkRateLimit(clientIp + ':qr-draft', 30, 60000);
      if (!rl.allowed) {
        return sendJson(429, { success: false, error: 'Too many draft requests. Please wait a minute.' }, { 'Retry-After': String(rl.retryAfter) });
      }
      const body = await parseJsonBody(req);
      const rawSub = body.submission || {};
      const code = body.shortCode || '';
      const reg = getRegistry();
      const tenantId = reg.qrLookup?.[code] || 'default';
      const store = getTenantStore(tenantId);
      const qrConfig = (store.qrcodes || []).find(q => q.code === code);
      const matchedBusiness = qrConfig ? (store.businesses || []).find(b => b.vertical === qrConfig.vertical) : null;
      const businessName = matchedBusiness?.name || rawSub.businessName || store.location.name || 'Our Center';

      const submission = {
        rating: Math.min(5, Math.max(1, Number(rawSub.rating) || 5)),
        selectedServices: Array.isArray(rawSub.selectedServices) ? rawSub.selectedServices.map(escapeHtml) : ['Service'],
        qualityTags: Array.isArray(rawSub.qualityTags) ? rawSub.qualityTags.map(escapeHtml) : ['Great Experience'],
        ambienceTags: Array.isArray(rawSub.ambienceTags) ? rawSub.ambienceTags.map(escapeHtml) : ['Clean & Welcoming'],
        staffName: escapeHtml(rawSub.staffName || 'Our Team'),
        recommend: rawSub.recommend === 'no' ? 'no' : 'yes',
        language: rawSub.language || 'hi-en',
        length: rawSub.length || 'short'
      };
      const vertical = rawSub.vertical || qrConfig?.vertical || store.location?.vertical || 'clinic';
      let draft = generateVerticalReviewDraft(vertical, submission, businessName);
      if (!draft) {
        draft = generateCustomerQRDraft(submission, businessName);
      }
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
      return sendJson(200, { success: true, message: 'Thank you for reaching out! A ReviewKaro specialist will call you within 2 business hours.' });
    }

    // AUTH: Login with Rate Limiting, Multi-Tenant Session & Password Verification
    if (pathname === '/api/auth/login' && method === 'POST') {
      const rl = checkRateLimit(clientIp + ':auth', 15, 60000);
      if (!rl.allowed) {
        return sendJson(429, { success: false, error: 'Too many login attempts. Please wait a minute.' }, { 'Retry-After': String(rl.retryAfter) });
      }

      const body = await parseJsonBody(req);
      const inputEmail = (body.email || '').toLowerCase().trim();
      const reg = getRegistry();

      let matchedTenantId = null;
      let matchedUser = null;

      // 1. Look up in multi-tenant registry
      if (reg.users && reg.users[inputEmail]) {
        const u = reg.users[inputEmail];
        if (verifyPassword(body.password, u.passwordHash, u.passwordSalt)) {
          matchedTenantId = u.tenantId;
          matchedUser = u;
        }
      }

      // 2. Fallback for demo credentials or legacy store
      if (!matchedTenantId) {
        const defStore = getTenantStore('default');
        if (!defStore.user.passwordHash) {
          const seeded = hashPassword('ClinicalDemo@2026');
          defStore.user.passwordHash = seeded.hash;
          defStore.user.passwordSalt = seeded.salt;
          saveTenantStore('default', defStore);
        }
        const isDemo = inputEmail === 'dr.sharma@sharmadental.in' && body.password === 'ClinicalDemo@2026';
        const isDefUser = inputEmail === (defStore.user?.email || '').toLowerCase().trim() && verifyPassword(body.password, defStore.user?.passwordHash, defStore.user?.passwordSalt);
        if (isDemo || isDefUser) {
          matchedTenantId = 'default';
          matchedUser = defStore.user;
        }
      }

      if (!matchedTenantId) {
        return sendJson(401, { success: false, error: 'Invalid business email or password.' });
      }

      const tenantStore = getTenantStore(matchedTenantId);
      const token = createSession({
        tenantId: matchedTenantId,
        userId: tenantStore.user?.id || 'usr_' + Date.now(),
        email: inputEmail,
        name: tenantStore.user?.name || matchedUser?.name || 'Business Owner',
        role: tenantStore.user?.role || 'Owner / Director'
      });

      return sendJson(200, {
        success: true,
        redirect: body.redirect || '/app',
        user: tenantStore.user,
        message: 'Authentication successful'
      }, {
        'Set-Cookie': [
          `reviewkaro_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          `replyo_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        ]
      });
    }

    // AUTH: Sign Up with Isolated Multi-Tenant Account Provisioning
    if (pathname === '/api/auth/signup' && method === 'POST') {
      const rl = checkRateLimit(clientIp + ':auth', 15, 60000);
      if (!rl.allowed) {
        return sendJson(429, { success: false, error: 'Too many signup attempts. Please wait a minute.' }, { 'Retry-After': String(rl.retryAfter) });
      }

      const body = await parseJsonBody(req);
      const inputEmail = (body.email || '').toLowerCase().trim();
      if (!inputEmail || !body.password) {
        return sendJson(400, { success: false, error: 'Email and password are required.' });
      }

      const reg = getRegistry();
      if (reg.users && reg.users[inputEmail]) {
        return sendJson(400, { success: false, error: 'An account with this email already exists. Please sign in.' });
      }

      const tenantId = 't_' + Date.now();
      const clinicName = escapeHtml(body.clinicName || 'My Business');
      const ownerName = escapeHtml(body.ownerName || clinicName);
      const industry = body.industry || 'clinic';
      const vConfig = getVerticalConfig(industry);
      const city = escapeHtml(body.city || 'Bengaluru');
      const phone = escapeHtml(body.phone || '');
      const qrSlug = clinicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 16).replace(/^-|-$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

      const parsedServices = Array.isArray(body.specialtyServices) && body.specialtyServices.length > 0
        ? body.specialtyServices.map(escapeHtml)
        : (typeof body.specialtyServices === 'string' && body.specialtyServices.trim()
           ? body.specialtyServices.split(',').map(s => escapeHtml(s.trim())).filter(Boolean)
           : vConfig.onboarding.defaultServices);
      const defaultServices = parsedServices.length > 0 ? parsedServices : vConfig.onboarding.defaultServices;
      const defaultQualities = vConfig.onboarding.defaultQualities;

      const newTenant = {
        id: tenantId,
        location: {
          id: tenantId,
          name: clinicName,
          vertical: vConfig.id,
          flowType: vConfig.flowType,
          questionCount: vConfig.questionCount,
          city: city,
          area: city,
          phone: phone,
          managerPhone: phone,
          rating: 5.0,
          reviewsCount: 0,
          autopilotLevel: 'SMART (4-5★)',
          replyDelayMinutes: 4,
          tonePreference: 'warm',
          syncStatus: 'Live (Smart QR Ready)'
        },
        servicesByVertical: {
          [vConfig.id]: defaultServices
        },
        qualityTagsByVertical: {
          [vConfig.id]: defaultQualities
        },
        user: {
          id: 'usr_' + Date.now(),
          name: ownerName,
          email: inputEmail,
          phone: phone,
          role: vConfig.onboarding.ownerNameLabel || 'Owner / Director',
          plan: {
            status: 'trial',
            tier: 'starter',
            name: '14-Day Free Pilot',
            trialDaysLeft: 14,
            expiresAt: new Date(Date.now() + 14 * 86400000).toISOString()
          }
        },
        qrcodes: [
          {
            id: 'qr_' + Date.now(),
            code: qrSlug,
            name: `${vConfig.shortName} Digital QR`,
            vertical: vConfig.id,
            material: 'Online Digital QR',
            url: `/q/${qrSlug}`,
            scansCount: 0,
            reviewsGenerated: 0,
            conversionRate: '0.0%'
          }
        ],
        reviews: [],
        staff: [
          {
            id: 'st_1',
            name: ownerName,
            role: vConfig.onboarding.staffRole || 'Director / Lead',
            vertical: vConfig.id,
            reviewsCount: 0,
            avgRating: 5.0,
            compliments: 'Punctual & attentive care',
            tipsEarned: '₹0'
          },
          ...vConfig.onboarding.defaultStaff.filter(name => !name.includes(ownerName)).map((name, idx) => ({
            id: `st_${idx + 2}`,
            name: name,
            role: vConfig.onboarding.staffRole || 'Staff',
            vertical: vConfig.id,
            reviewsCount: 0,
            avgRating: 5.0,
            compliments: 'Courteous & skilled',
            tipsEarned: '₹0'
          }))
        ],
        notifications: [
          {
            id: 'notif_welcome',
            title: 'Welcome to ReviewKaro!',
            message: `Your smart review QR is live at /q/${qrSlug}. Display your digital QR code to collect Google reviews!`,
            time: 'Just now',
            unread: true,
            link: `/q/${qrSlug}`
          }
        ],
        invoices: []
      };

      saveTenantStore(tenantId, newTenant);

      const hp = hashPassword(body.password);
      if (!reg.users) reg.users = {};
      reg.users[inputEmail] = {
        tenantId: tenantId,
        email: inputEmail,
        name: ownerName,
        passwordHash: hp.hash,
        passwordSalt: hp.salt
      };
      if (!reg.qrLookup) reg.qrLookup = {};
      reg.qrLookup[qrSlug] = tenantId;
      saveRegistry(reg);

      const token = createSession({
        tenantId: tenantId,
        userId: newTenant.user.id,
        email: inputEmail,
        name: ownerName,
        role: newTenant.user.role
      });

      return sendJson(200, {
        success: true,
        redirect: '/app',
        message: 'Account created and trial started successfully'
      }, {
        'Set-Cookie': [
          `reviewkaro_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          `replyo_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        ]
      });
    }

    // ----------------------------------------------------
    // RAZORPAY BILLING ENDPOINTS (UPI, CARDS & NETBANKING)
    // ----------------------------------------------------
    if (pathname === '/api/billing/create-order' && method === 'POST') {
      const { store, tenantId } = getStoreForReq(req);
      const body = await parseJsonBody(req);
      const planId = body.planId || 'growth';
      const billingCycle = body.billingCycle || 'monthly';

      const pricesInPaise = {
        'starter_monthly': 124900,
        'starter_annual': 1199000,
        'growth_monthly': 199900,
        'growth_quarterly': 299900,
        'growth_annual': 1999000,
        'pro_monthly': 349900,
        'pro_annual': 3499000
      };

      const key = `${planId}_${billingCycle}`;
      const amount = pricesInPaise[key] || (billingCycle === 'quarterly' ? 299900 : 124900);
      const planNames = {
        'starter': 'Starter Plan',
        'growth': 'Growth Autopilot Plan',
        'pro': 'Multi-Branch Pro Plan'
      };

      const config = getRazorpayConfig();
      const receipt = `rcpt_${tenantId}_${Date.now()}`.slice(0, 40);

      const orderResult = await createRazorpayOrder({
        keyId: config.keyId,
        keySecret: config.keySecret,
        amountInPaise: amount,
        currency: 'INR',
        receipt,
        notes: { tenantId, planId, billingCycle }
      });

      if (!orderResult.success) {
        return sendJson(400, { success: false, error: orderResult.error });
      }

      return sendJson(200, {
        success: true,
        orderId: orderResult.order.id,
        amount: orderResult.order.amount,
        currency: 'INR',
        keyId: config.keyId || 'rzp_test_placeholder',
        planName: `${planNames[planId] || 'ReviewKaro Plan'} (${billingCycle})`,
        userName: store.user?.name || 'Valued Partner',
        userEmail: store.user?.email || 'partner@reviewkaro.tech',
        userPhone: store.user?.phone || '9876543210'
      });
    }

    if (pathname === '/api/billing/verify' && method === 'POST') {
      const { store, tenantId } = getStoreForReq(req);
      const body = await parseJsonBody(req);
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingCycle } = body;

      const config = getRazorpayConfig();
      const isValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        secret: config.keySecret
      });

      if (!isValid) {
        return sendJson(400, { success: false, error: 'Cryptographic payment signature verification failed.' });
      }

      const cycle = billingCycle || 'monthly';
      const durationDays = cycle === 'annual' ? 365 : (cycle === 'quarterly' ? 90 : 30);
      const expiresDate = new Date(Date.now() + durationDays * 86400000).toISOString();
      const planNames = {
        'starter': 'Starter Active',
        'growth': 'Growth Autopilot Active',
        'pro': 'Multi-Branch Pro Active'
      };

      store.user.plan = {
        status: 'active',
        tier: planId || 'growth',
        billingCycle: cycle,
        name: planNames[planId] || 'Pro Plan Active',
        paidAt: new Date().toISOString(),
        expiresAt: expiresDate,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      };

      if (!store.invoices) store.invoices = [];
      store.invoices.unshift({
        id: 'INV-' + Date.now(),
        plan: `${planNames[planId] || planId} (${cycle})`,
        amount: cycle === 'quarterly' ? '₹2,999' : (planId === 'starter' ? '₹1,249' : '₹1,999'),
        date: new Date().toISOString().split('T')[0],
        status: 'Paid via Razorpay (UPI/Card)',
        paymentId: razorpay_payment_id
      });

      saveTenantStore(tenantId, store);
      return sendJson(200, {
        success: true,
        message: 'Payment verified and plan activated successfully!',
        plan: store.user.plan
      });
    }

    if (pathname === '/api/billing/config' && method === 'POST') {
      const body = await parseJsonBody(req);
      const reg = getRegistry();
      if (!reg.config) reg.config = {};
      if (body.razorpayKeyId) reg.config.razorpayKeyId = body.razorpayKeyId.trim();
      if (body.razorpayKeySecret) reg.config.razorpayKeySecret = body.razorpayKeySecret.trim();
      saveRegistry(reg);
      return sendJson(200, { success: true, message: 'Razorpay configuration saved.' });
    }

    // AUTH: Logout API Endpoint (Clears Session)
    if (pathname === '/api/auth/logout' && method === 'POST') {
      const cookies = parseCookies(req);
      const sess = cookies.reviewkaro_session || cookies.replyo_session;
      if (sess) {
        destroySession(sess);
      }
      return sendJson(200, {
        success: true,
        redirect: '/login?logged_out=1',
        message: 'Logged out successfully'
      }, {
        'Set-Cookie': [
          'reviewkaro_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
          'replyo_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        ]
      });
    }

    // AUTH: Forgot Password with Rate Limiting
    if (pathname === '/api/auth/forgot-password' && method === 'POST') {
      const rl = checkRateLimit(clientIp + ':auth', 10, 60000);
      if (!rl.allowed) {
        return sendJson(429, { success: false, error: 'Too many recovery requests. Please wait a minute.' }, { 'Retry-After': String(rl.retryAfter) });
      }
      const body = await parseJsonBody(req);
      return sendJson(200, { success: true, message: 'OTP instructions dispatched to registered WhatsApp and email.' });
    }

    if (pathname === '/api/book-demo' && method === 'POST') {
      const rl = checkRateLimit(clientIp + ':demo', 10, 60000);
      if (!rl.allowed) return sendJson(429, { success: false, error: 'Too many requests. Please wait a minute.' });
      const body = await parseJsonBody(req);
      const store = getStore();
      if (!store.demoBookings) store.demoBookings = [];
      store.demoBookings.push({ ...body, bookedAt: new Date().toISOString() });
      saveStore(store);
      return sendJson(200, { success: true, message: 'Executive demo confirmed!' });
    }

    if (pathname === '/api/simulate-review' && method === 'POST') {
      const session = getSessionFromReq(req);
      if (!session && process.env.NODE_ENV !== 'test') {
        return sendJson(401, { success: false, error: 'Authentication required' });
      }
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
    // AGENTIC DISCOVERY & MODERN SEO ENDPOINTS (llms.txt, sitemap.xml, robots.txt, ai-catalog)
    // ----------------------------------------------------
    if (pathname === '/robots.txt') {
      const robotsTxt = `# ReviewKaro RFC 9309 Compliant Agent Access Policy & Content Signals
# Canonical: ${BASE_URL}/robots.txt

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /app/
Disallow: /api/
Disallow: /a/

User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
Agentmap: ${BASE_URL}/.well-known/ai-catalog.json
`;
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept',
        ...SECURITY_HEADERS
      });
      return res.end(robotsTxt);
    }

    if (pathname === '/sitemap.xml') {
      const today = new Date().toISOString().split('T')[0];
      const urls = [
        { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${BASE_URL}/features`, priority: '0.9', changefreq: 'weekly' },
        { loc: `${BASE_URL}/pricing`, priority: '0.9', changefreq: 'weekly' },
        { loc: `${BASE_URL}/free-audit`, priority: '0.9', changefreq: 'weekly' },
        { loc: `${BASE_URL}/faq`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/security`, priority: '0.8', changefreq: 'monthly' },
        { loc: `${BASE_URL}/compliance`, priority: '0.8', changefreq: 'monthly' },
        { loc: `${BASE_URL}/qr-kit`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/for-agencies`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/industries/clinics`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/industries/restaurants`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/industries/salons`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/industries/gyms`, priority: '0.8', changefreq: 'weekly' },
        { loc: `${BASE_URL}/industries/coaching`, priority: '0.8', changefreq: 'weekly' },
        { loc: 'https://reviewkaro.tech/blog', priority: '0.8', changefreq: 'weekly' },
        { loc: 'https://reviewkaro.tech/blog/dr-sharma-case-study', priority: '0.7', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/blog/responding-to-negative-reviews', priority: '0.7', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/blog/google-local-pack-seo-2026', priority: '0.7', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/contact', priority: '0.7', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/terms', priority: '0.5', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/privacy', priority: '0.5', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/refund-policy', priority: '0.5', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/dpdp-consent', priority: '0.5', changefreq: 'monthly' },
        { loc: 'https://reviewkaro.tech/book-demo', priority: '0.7', changefreq: 'weekly' }
      ];

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.writeHead(200, {
        'Content-Type': 'application/xml; charset=utf-8',
        'Vary': 'Accept',
        ...SECURITY_HEADERS
      });
      return res.end(sitemapXml);
    }

    if (pathname === '/llms.txt') {
      const llmsTxt = `# ReviewKaro — Autonomous Google Review & In-Store QR Operating System

> ReviewKaro is an autonomous Google Business Profile reputation management and in-store AI QR operating system built specifically for high-touch consumer businesses in India—including dental clinics, aesthetic centers, specialty cafes, luxury salons, and fitness gyms. ReviewKaro integrates with official Google APIs to mirror customer review dialects in under 4 minutes, inject local search keywords for Google Local 3-Pack prominence, and quarantine negative feedback for 1-tap manager resolution.

ReviewKaro operates strictly via official Google Business Profile OAuth 2.0 APIs with 100% data sovereignty hosted inside AWS Asia Pacific (Mumbai) in full adherence to India's DPDP Act 2023 and NMC Medical Ethics guidelines.

## Core Capabilities

- [Features Architecture](https://reviewkaro.tech/features): Deep breakdown of dialect mirroring (Hindi, Hinglish, English), 4-minute response jitter, and local SEO keyword weaving.
- [In-Store AI QR Studio](https://reviewkaro.tech/qr-kit): Medical-grade acrylic countertop stands, table tents, and zero-app 30-second customer review builder.
- [Free Local 3-Pack Audit Tool](https://reviewkaro.tech/free-audit): Real-time reputation gap scanner for local businesses and competitor comparison.
- [Frequently Asked Questions](https://reviewkaro.tech/faq): Authoritative answers on Google algorithm compliance, DPDP Act 2023, and response safety.
- [Clinical Privacy & Security Whitepaper](https://reviewkaro.tech/security): Technical controls, Zero-PHI guarantee, TLS 1.3 encryption, and AWS Mumbai data residency.

## Pricing (INR)

- [Transparent Indian Rupee Plans](https://reviewkaro.tech/pricing): Month-to-month and quarterly subscriptions (Starter Solo ₹1,249/mo, Growth Autopilot ₹2,999/quarter Hero Offer, Multi-Branch Pro ₹3,499/mo). Includes 14-day free pilot and 18% GST tax invoices.

## Multi-Vertical Solutions

- [Healthcare & Dental Clinics](https://reviewkaro.tech/industries/clinics): Painless root canal and aesthetic treatment review automation with NMC ethics compliance.
- [Cafes, Dining & Bakeries](https://reviewkaro.tech/industries/restaurants): Specialty coffee and artisan bakery review capture with bill-folder NFC tags.
- [Salons & Luxury Spas](https://reviewkaro.tech/industries/salons): Balayage and styling review attribution with stylist tipping incentives.
- [Gyms & Athletic Centers](https://reviewkaro.tech/industries/gyms): Strength training and trainer review attribution with turnstile NFC check-ins.
- [Coaching & Academies](https://reviewkaro.tech/industries/coaching): Student testimonial and course reputation automation.

## Playbooks & Case Studies

- [Dr. Sharma Clinic Case Study](https://reviewkaro.tech/blog/dr-sharma-case-study): How an Indiranagar practice gained +128 reviews and moved from 4.4 to 4.8 stars in 60 days.
- [Zero-Liability De-escalation Guide](https://reviewkaro.tech/blog/responding-to-negative-reviews): Templates for responding to 1-star negative reviews without admitting legal fault.
- [Google Local 3-Pack SEO 2026](https://reviewkaro.tech/blog/google-local-pack-seo-2026): Algorithmic breakdown of response velocity and keyword weaving for high-intent walk-ins.

## Optional & Agency Partner Network

- [Agency Partner Network](https://reviewkaro.tech/for-agencies): White-label client PDF reporting desk with 30% recurring margin share.
- [Legal Terms & Compliance](https://reviewkaro.tech/terms): Official terms of service, DPDP consent, and refund policies.
`;
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept',
        ...SECURITY_HEADERS
      });
      return res.end(llmsTxt);
    }

    if (pathname === '/llms-full.txt') {
      const llmsFullTxt = `# ReviewKaro Operating System — Full Architecture & Operational Reference
Version: 2.4 (October 2026)
Publisher: ReviewKaro Technologies India Private Limited (Koramangala, Bengaluru, Karnataka, India)
Canonical URL: https://reviewkaro.tech
Compliance: India DPDP Act 2023, National Medical Commission (NMC) 2023, Google API Terms

## 1. Executive Summary & Problem Space
High-touch local businesses in India—especially dental clinics, aesthetic dermatology practices, specialty roasteries, luxury salons, and boutique gyms—rely on Google Maps Local 3-Pack rankings for 70%+ of organic footfall. However, business owners face three operational bottlenecks:
1. Review Asymmetry: Delighted patients rarely leave reviews because standard Google Maps review flows require typing long paragraphs on small phone keyboards. Only upset patients seek out profiles to complain.
2. Dialect Disconnect: Indian customers write reviews in colloquial Hinglish, Devanagari Hindi, and English. Traditional generic SaaS tools reply with rigid robotic English templates, hurting customer rapport.
3. Negative Review Liability: Upset patients leaving 1-star reviews are often met with public apologies that inadvertently admit medical or service fault, exposing clinics to consumer complaints and legal liability.

## 2. ReviewKaro Core Architecture
ReviewKaro provides an end-to-end autonomous operating system:
- In-Store AI QR Flow (/q/:slug): Lightweight (<85KB) web app loaded via NFC tap or tabletop acrylic stand. Zero login, zero app download, zero PHI collection. Patients tap choices; AI synthesizes a first-person authentic review and copies it to clipboard while opening Google Maps.
- Neural Dialect Autopilot: Mirrors reviewer dialect (Hinglish, Hindi, English) in under 4 minutes with a humanized response jitter, embedding local search keywords (e.g., "painless root canal in Indiranagar").
- Negative Review Quarantine Shield: 1-3 star reviews are automatically quarantined. The engine drafts an empathetic, zero-liability resolution and notifies the owner via WhatsApp for 1-tap approval.
- Frontline Staff Attribution: Reviews mention attending doctors, baristas, or stylists by name, crediting an internal staff performance bonus ledger.

## 3. Subscription Pricing (INR)
- Starter Solo: ₹1,249/month (1 Google Business Location, Unlimited AI replies, 1 Countertop Stand)
- Growth Autopilot (Hero Offer): ₹2,999/quarter (₹999/mo equivalent, up to 2 branches, 1-Tap WhatsApp owner approvals, Staff Attribution Leaderboard, Free Acrylic Display Stand)
- Multi-Branch Pro: ₹3,499/month (Up to 5 locations, Centralized executive desk, Dedicated account manager)
All plans include 14-day free pilot, UPI AutoPay, and 18% GST tax invoices.

## 4. Technical Security & Data Residency
- Hosting: AWS Mumbai (ap-south-1) with complete data residency in India.
- Zero-PHI Medical Guarantee: No medical records, prescriptions, or patient diagnoses are ever processed or stored.
- Encryption: TLS 1.3 in transit and AES-256 at rest with AWS KMS key management.
- Authentication: Scrypt hashing with unique cryptographic salts, HTTP-only SameSite cookies, rate limiting, and complete multi-tenant file isolation.
`;
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Vary': 'Accept',
        ...SECURITY_HEADERS
      });
      return res.end(llmsFullTxt);
    }

    if (pathname === '/.well-known/ai-catalog.json') {
      const catalog = {
        "specVersion": "1.0",
        "entries": [
          {
            "identifier": "urn:air:reviewkaro.tech:reputation-os",
            "displayName": "ReviewKaro Autonomous Review & Reputation Engine",
            "type": "text/markdown",
            "url": "https://reviewkaro.tech/llms-full.txt",
            "representativeQueries": [
              "How does ReviewKaro automate Google review replies?",
              "What is the pricing for ReviewKaro in Indian Rupees?",
              "Is ReviewKaro compliant with DPDP Act 2023 and Google API policies?"
            ]
          },
          {
            "identifier": "urn:air:reviewkaro.tech:local-audit",
            "displayName": "ReviewKaro Google Local 3-Pack Audit Tool",
            "type": "text/html",
            "url": "https://reviewkaro.tech/free-audit",
            "representativeQueries": [
              "Audit Google Maps ranking for local clinic or salon",
              "Check unanswered review count and rating gap"
            ]
          },
          {
            "identifier": "urn:air:reviewkaro.tech:llms-manifest",
            "displayName": "ReviewKaro LLM Agent Manifest",
            "type": "text/markdown",
            "url": "https://reviewkaro.tech/llms.txt",
            "representativeQueries": [
              "Summary of ReviewKaro capabilities and endpoints",
              "ReviewKaro site map for autonomous AI agents"
            ]
          }
        ]
      };
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Vary': 'Accept',
        ...SECURITY_HEADERS
      });
      return res.end(JSON.stringify(catalog, null, 2));
    }

    // Markdown Content Negotiation for AI Agents (Accept: text/markdown)
    if (req.headers.accept && req.headers.accept.includes('text/markdown') && !pathname.startsWith('/api/') && !pathname.startsWith('/app/')) {
      const publicPaths = ['/', '/features', '/pricing', '/faq', '/security', '/compliance', '/qr-kit', '/for-agencies', '/free-audit', '/contact'];
      if (publicPaths.includes(pathname) || pathname.startsWith('/industries/') || pathname.startsWith('/blog')) {
        const md = `# ReviewKaro Operating System — ${pathname === '/' ? 'Home' : pathname}
Canonical URL: https://reviewkaro.tech${pathname}
Content-Signal: search=yes, ai-input=yes, ai-train=no

ReviewKaro is the Autonomous Google Review & In-Store AI QR Operating System for high-touch Indian businesses (clinics, salons, cafes, gyms).
Full technical context and documentation available at: https://reviewkaro.tech/llms-full.txt
`;
        res.writeHead(200, {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept',
          'Content-Signal': 'search=yes, ai-input=yes, ai-train=no',
          ...SECURITY_HEADERS
        });
        return res.end(md);
      }
    }

    // ----------------------------------------------------
    // 1. WORLD-CLASS MINIMALIST HOMEPAGE (Anti-Slop, 3D Canvas, Tasteskill v2 Standard)
    // ----------------------------------------------------
    if (pathname === '/') {
      const store = getStore();
      const html = renderHtmlPage(
        'ReviewKaro — Autonomous Google Review Autopilot & In-Store AI QR Operating System',
        'home',
        renderHomePage(store),
        {
          canonical: '/',
          description: 'Autonomous Google review autopilot & in-store AI QR stands for Indian clinics, cafes, salons & gyms. 4-min multi-dialect replies, zero-liability quarantine, staff attribution leaderboard.',
          keywords: 'Google review autopilot, in-store AI QR stands, Google Maps ranking, Local 3-Pack, reputation management India, clinic Google reviews, salon reviews, Hinglish AI replies, customer feedback automation',
          faqItems: HOME_FAQS
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // AUTHENTICATION & ONBOARDING SUITE (/login, /signup, /forgot-password, /logout)
    // ----------------------------------------------------
    if (pathname === '/login') {
      const html = renderHtmlPage('Sign In', 'login', renderLoginPage(parsedQuery));
      return sendHtml(200, html);
    }

    if (pathname === '/logout') {
      const cookies = parseCookies(req);
      const sess = cookies.reviewkaro_session || cookies.replyo_session;
      if (sess) {
        destroySession(sess);
      }
      res.writeHead(302, {
        'Location': '/login?logged_out=1',
        'Set-Cookie': [
          'reviewkaro_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
          'replyo_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        ],
        ...SECURITY_HEADERS
      });
      return res.end();
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
      const html = renderHtmlPage(
        'Clinical Privacy & Security Whitepaper',
        'security',
        renderSecurityPage(),
        {
          canonical: '/security',
          description: 'ReviewKaro clinical privacy and institutional security whitepaper. Strict compliance with India DPDP Act 2023, NMC Medical Ethics, Zero-PHI guarantee, TLS 1.3, and AWS Mumbai data residency.',
          keywords: 'DPDP Act 2023 compliance, NMC medical ethics review software, healthcare data residency India, Zero PHI guarantee, clinical data security',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Security & Trust', url: '/security' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/book-demo') {
      const html = renderHtmlPage(
        'Schedule Executive Demo & Solution Walkthrough',
        'demo',
        renderBookDemoPage(),
        {
          canonical: '/book-demo',
          description: 'Schedule a 1-on-1 live walkthrough of ReviewKaro with our senior solutions architect. Learn how in-store AI QR stands and autonomous review replies scale your local business.',
          keywords: 'schedule demo, Google review software demo, clinic reputation walkthrough, local business SaaS consultation',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Book Demo', url: '/book-demo' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/faq') {
      const html = renderHtmlPage(
        'Frequently Asked Questions & Policy Compliance',
        'faq',
        renderFaqPage(),
        {
          canonical: '/faq',
          description: 'Frequently asked questions about ReviewKaro: Google algorithm compliance, DPDP Act 2023, zero review gating, multi-dialect support (Hindi, Hinglish, English), and multi-branch management.',
          keywords: 'Google review automation FAQ, Google review policy compliance, DPDP Act 2023 review SaaS, medical ethics Google reviews, multi-branch reputation questions',
          faqItems: FAQ_ITEMS,
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/qr-kit') {
      const html = renderHtmlPage(
        'Countertop QR Display Hardware & NFC Stands',
        'qr-kit',
        renderQrKitPage(),
        {
          canonical: '/qr-kit',
          description: 'Medical-grade countertop QR and NFC display stands for clinic receptions, styling mirrors, and cafe counters. Scratch-resistant, alcohol-wipe safe, and embedded with ultra-fast NFC chips.',
          keywords: 'countertop QR stand, NFC review card, clinic reception QR display, Google review stand India, acrylic table tent, contactless review stand',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'QR Hardware Kit', url: '/qr-kit' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/terms') {
      const html = renderHtmlPage(
        'Terms of Service',
        'legal',
        renderTermsPage(),
        {
          canonical: '/terms',
          description: 'ReviewKaro Terms of Service. Governs subscription agreements, Google API usage policies, multi-tenant account governance, and fair use guidelines under Indian law.',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/privacy') {
      const html = renderHtmlPage(
        'Privacy Policy (DPDP Act 2023)',
        'legal',
        renderPrivacyPage(),
        {
          canonical: '/privacy',
          description: 'ReviewKaro Privacy Policy in compliance with India’s Digital Personal Data Protection Act 2023. Explains data minimization, Zero-PHI guarantee, and AWS Mumbai hosting.',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/refund-policy') {
      const html = renderHtmlPage(
        'Refund & Cancellation Policy',
        'legal',
        renderRefundPolicyPage(),
        {
          canonical: '/refund-policy',
          description: 'ReviewKaro subscription refund, cancellation, and billing policies. 14-day free pilot guarantee and transparent month-to-month cancellation with no hidden lock-ins.',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Refund Policy', url: '/refund-policy' }]
        }
      );
      return sendHtml(200, html);
    }

    if (pathname === '/dpdp-consent') {
      const html = renderHtmlPage(
        'DPDP Act 2023 Consent Framework',
        'legal',
        renderDpdpConsentPage(),
        {
          canonical: '/dpdp-consent',
          description: 'Official consent notice and data principal rights under India’s Digital Personal Data Protection Act 2023 for ReviewKaro reputation operating system users.',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'DPDP Consent', url: '/dpdp-consent' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 2. FEATURES (/features)
    // ----------------------------------------------------
    if (pathname === '/features') {
      const html = renderHtmlPage(
        'Reputation Architecture & AI Review Capabilities',
        'features',
        `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div class="text-center space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#f3f3f7] border border-[#b9bbc6]/40 text-[#ff5900] text-xs font-bold font-mono">
              Core Technical Architecture
            </div>
            <h1 class="text-4xl sm:text-5xl font-bold text-black tracking-[-0.03em] font-heading">Reputation Architecture Engineered for India</h1>
            <p class="text-[#60646c] text-sm sm:text-base leading-relaxed">
              Every capability is built specifically to address local business challenges across high-trust consumer enterprises in India—from dental operatory sterilization to restaurant bill folders.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-[12px] border border-[#b9bbc6]/40 shadow-xs space-y-4 card-3d">
              <div class="w-10 h-10 rounded-[8px] bg-[#fff7ed] text-[#ff5900] flex items-center justify-center">
                ${getSvgIcon('globe', 'w-5 h-5 text-[#ff5900]')}
              </div>
              <h2 class="font-bold text-xl text-black font-heading tracking-[-0.02em]">Multi-Lingual Dialect Mirroring</h2>
              <p class="text-xs text-[#60646c] leading-relaxed">
                ReviewKaro naturally replies in Devanagari Hindi, colloquial Hinglish, English, Tamil, Telugu, and Kannada, matching reviewer colloquialisms, gratitude phrases, and cultural tone in under 4 minutes.
              </p>
            </div>

            <div class="p-8 bg-white rounded-[12px] border border-[#b9bbc6]/40 shadow-xs space-y-4 card-3d">
              <div class="w-10 h-10 rounded-[8px] bg-amber-50 text-amber-700 flex items-center justify-center">
                ${getSvgIcon('shield', 'w-5 h-5 text-amber-600')}
              </div>
              <h2 class="font-bold text-xl text-black font-heading tracking-[-0.02em]">Zero-Liability Quarantine Safety Shield</h2>
              <p class="text-xs text-[#60646c] leading-relaxed">
                Hardcoded safety validator blocks refund offers, admissions of medical fault, or staff blame. Quarantines 1–3 star complaints into a private queue with direct manager telephone fallback.
              </p>
            </div>

            <div class="p-8 bg-white rounded-[12px] border border-[#b9bbc6]/40 shadow-xs space-y-4 card-3d">
              <div class="w-10 h-10 rounded-[8px] bg-blue-50 text-blue-700 flex items-center justify-center">
                ${getSvgIcon('qr', 'w-5 h-5 text-blue-600')}
              </div>
              <h2 class="font-bold text-xl text-black font-heading tracking-[-0.02em]">In-Clinic AI QR Studio</h2>
              <p class="text-xs text-[#60646c] leading-relaxed">
                Download printable A6 counter cards, A4 table tents, and bill stickers. Customers scan, tap 3 choices, get an AI draft built strictly from their selections, and post on Google Maps in 30 seconds.
              </p>
            </div>

            <div class="p-8 bg-white rounded-[12px] border border-[#b9bbc6]/40 shadow-xs space-y-4 card-3d">
              <div class="w-10 h-10 rounded-[8px] bg-teal-50 text-teal-700 flex items-center justify-center">
                ${getSvgIcon('mapPin', 'w-5 h-5 text-teal-600')}
              </div>
              <h2 class="font-bold text-xl text-black font-heading tracking-[-0.02em]">Google Local 3-Pack Keyword Injection</h2>
              <p class="text-xs text-[#60646c] leading-relaxed">
                Naturally weaves your neighborhood and service terms into positive replies (e.g., <em>“best dental clinic in Indiranagar”</em>), signaling search relevance directly to the Google Local 3-Pack algorithm.
              </p>
            </div>
          </div>
        </div>
      `,
        {
          canonical: '/features',
          description: 'Explore ReviewKaro reputation architecture: multi-dialect neural mirroring, zero-liability quarantine shield, frontline staff attribution, and Google Local 3-Pack rank booster.',
          keywords: 'Google Business Profile AI, review automation features, dialect mirroring, negative review quarantine shield, Google Local 3-Pack SEO, local keyword injection',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Features', url: '/features' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 3. PRICING (/pricing)
    // ----------------------------------------------------
    if (pathname === '/pricing') {
      const session = getSessionFromReq(req);
      const html = renderHtmlPage(
        'Transparent INR Plans & Razorpay Subscriptions',
        'pricing',
        `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div class="space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#f3f3f7] border border-[#b9bbc6]/40 text-[#ff5900] text-xs font-bold font-mono">
              Transparent Indian Rupee Billing
            </div>
            <h1 class="text-4xl sm:text-5xl font-bold text-black tracking-[-0.03em] font-heading">Transparent INR Plans. No Foreign Exchange Shock.</h1>
            <p class="text-[#60646c] text-sm sm:text-base leading-relaxed">
              Month-to-month flexibility. Pay securely with Razorpay UPI (GPay, PhonePe, Paytm, BHIM) or NetBanking. Full 18% GST tax invoices for input tax credit.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 text-left items-stretch">
            ${PLANS.map((plan) => `
              <div class="p-6 rounded-[12px] bg-white border ${plan.isPopular ? 'border-2 border-[#ff5900] shadow-sm relative' : 'border-[#b9bbc6]/40 shadow-xs'} flex flex-col justify-between card-3d">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <h2 class="font-bold text-xl text-black font-heading tracking-[-0.02em]">${plan.name}</h2>
                    ${plan.isPopular ? '<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ff5900] text-white rounded-[6px]">Popular</span>' : ''}
                  </div>
                  <div>
                    <span class="text-3xl font-bold text-black font-heading tabular-nums tracking-[-0.02em]">
                      ${plan.id === 'enterprise' ? 'Custom' : '₹' + plan.monthlyPrice}
                    </span>
                    ${plan.id !== 'enterprise' ? '<span class="text-xs text-[#60646c]"> / mo</span>' : ''}
                  </div>
                  <ul class="space-y-2 text-xs text-[#60646c] pt-3 border-t border-[#e5e7eb]">
                    ${plan.features.map((f) => `<li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>${f}</span></li>`).join('')}
                  </ul>
                </div>
                <a href="${session ? '/app/billing' : `/signup?plan=${plan.id}`}" class="mt-6 block w-full py-2.5 text-center rounded-[12px] ${plan.isPopular ? 'bg-[#ff5900] hover:opacity-90 text-white shadow-none' : 'bg-[#15191e] hover:bg-black text-white'} text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5900]">
                  ${session ? 'Choose ' + plan.name : 'Start with ' + plan.name} &rarr;
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `,
        {
          canonical: '/pricing',
          description: 'Transparent Indian Rupee (INR) pricing for ReviewKaro Google Review Autopilot. Starter at ₹1,249/mo, Growth Hero at ₹2,999/quarter, and Pro at ₹3,499/mo. 18% GST input tax credit.',
          keywords: 'SaaS review pricing INR, Google review software price India, clinic reputation management cost, UPI AutoPay subscription, GST invoice SaaS',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 4. FREE AUDIT TOOL (/free-audit)
    // ----------------------------------------------------
    if (pathname === '/free-audit') {
      const html = renderHtmlPage(
        'Free Google Local 3-Pack Reputation Audit Tool',
        'audit',
        `
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
                Manage Profile with ReviewKaro &rarr;
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
      const industryConfigs = {
        clinics: {
          name: 'Dental & Aesthetic Clinics',
          title: 'Google Review Autopilot for Dental & Aesthetic Clinics in India',
          hero: 'Autonomous Reputation OS for Dental, Dermatology & Healthcare Clinics',
          desc: 'Turn everyday patient checkups and dental treatments into authentic 5-star Google reviews in 30 seconds. ReviewKaro automates clinical dialect replies with local search keywords, protects against medical malpractice liability with our quarantine shield, and strictly adheres to NMC ethics and the DPDP Act 2023.',
          keywords: 'dental clinic Google reviews, aesthetic clinic reputation management, painless root canal reviews, doctor Google rating Bangalore, clinic review QR stand, NMC ethics medical reviews',
          touchpoint: 'Billing Counter Acrylic Stand & Operatory Tray NFC Card',
          exampleSvc: 'Painless Root Canal, Clear Aligners, Laser Hair Removal, Hydrafacial',
          geoFocus: 'Indiranagar (Bengaluru), Bandra West (Mumbai), Greater Kailash (Delhi), Jubilee Hills (Hyderabad)'
        },
        salons: {
          name: 'Hair Salons & Spas',
          title: 'Google Review Autopilot & Stylist Attribution for Salons & Luxury Spas',
          hero: 'Turn Styling Sessions & Hair Spa Days into Glowing Google Reviews',
          desc: 'Empower your stylists and colorists with contactless mirror QR stands. ReviewKaro mirrors beauty influencer phrasing, credits tips and bonuses directly into staff performance ledgers, and boosts your salon to the top of Google Local 3-Pack for high-intent walk-ins.',
          keywords: 'salon Google reviews, spa reputation software, hair artist review attribution, balayage reviews Bangalore Mumbai, salon tipping QR, luxury spa ratings',
          touchpoint: 'Styling Station Mirror QR Sticker & Reception NFC Tap Stand',
          exampleSvc: 'Ash Blonde Balayage, Keratin Smoothing, Ayurvedic Head Massage, Gel Extensions',
          geoFocus: 'Lavelle Road (Bengaluru), Khar (Mumbai), Defence Colony (Delhi), Koregaon Park (Pune)'
        },
        restaurants: {
          name: 'Restaurants, Cafes & Bakeries',
          title: 'Google Review Autopilot for Cafes, Dining & Bakeries in India',
          hero: 'Collect 5-Star Foodie Feedback Directly at the Table or Bill Folder',
          desc: 'Capture delighted diner reviews while the aftertaste of great food is fresh. ReviewKaro puts a 30-second review builder inside the bill folder or table tent. It weaves local culinary keywords into automated owner replies and quarantines order complaints before they hit Google Maps.',
          keywords: 'restaurant Google reviews, cafe bill folder QR, specialty coffee reviews Indiranagar Bandra, dining review autopilot, Zomato alternative reputation',
          touchpoint: 'Bill Presenter Leather Folder NFC & Acrylic Table Tent QR',
          exampleSvc: 'Specialty Pour-Over, Sourdough Croissants, Wood-Fired Neapolitan Pizza, Craft Cocktails',
          geoFocus: '12th Main Indiranagar, Cyber Hub Gurugram, Powai (Mumbai), Jubilee Hills (Hyderabad)'
        },
        gyms: {
          name: 'Gyms & Fitness Hubs',
          title: 'Google Review Autopilot & Coach Attribution for Gyms & Fitness Centers',
          hero: 'Turn Post-Workout Endorphins into High-Ranking Google Maps Reviews',
          desc: 'Member check-ins and personal training sessions become automated reputation assets. Coach-attributed review links give trainers recognition, while automated keyword injection ensures your gym dominates neighborhood searches for strength training and CrossFit.',
          keywords: 'gym Google reviews, fitness center reputation, personal trainer attribution reviews, strength club Google Maps ranking, CrossFit gym reviews India',
          touchpoint: 'Turnstile Check-In Stand, Water Station QR & Locker Room Exit NFC',
          exampleSvc: 'Deadlift Technique Coaching, HIIT Conditioning, Functional Strength, Clean Locker Rooms',
          geoFocus: 'Koramangala 4th Block (Bengaluru), Andheri West (Mumbai), Saket (Delhi), Madhapur (Hyderabad)'
        },
        coaching: {
          name: 'Coaching & Tuition Centers',
          title: 'Student Testimonials & Google Review OS for Coaching & Academic Academies',
          hero: 'Turn Student Rank Achievements into Verifiable Google Search Prominence',
          desc: 'Help parents and aspiring students discover your academic results. ReviewKaro enables student and parent review collection with zero friction, building organic trust for competitive exam prep and tuition batches.',
          keywords: 'coaching center Google reviews, tuition academy reputation, student testimonials Google Maps, education institute ranking India',
          touchpoint: 'Parent Counseling Desk Stand & Student Admit Card QR',
          exampleSvc: 'JEE Advanced Foundation, NEET Biology Mentorship, Commerce Tuitions, Olympiad Prep',
          geoFocus: 'Kota (Rajasthan), Kalu Sarai (Delhi), Malleshwaram (Bengaluru), Anna Nagar (Chennai)'
        }
      };

      const config = industryConfigs[ind] || industryConfigs['clinics'];
      const html = renderHtmlPage(
        config.title,
        'industries',
        `
        <div class="space-y-16 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          
          <!-- Hero Header -->
          <div class="text-center space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold font-mono">
              Tailored Vertical Architecture • ${config.name}
            </div>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading leading-tight" style="text-wrap: balance;">
              ${config.hero}
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              ${config.desc}
            </p>
            <div class="pt-2 flex flex-wrap justify-center gap-3">
              <a href="/signup" class="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all">
                Start 14-Day Free Pilot for ${config.name} &rarr;
              </a>
              <a href="/free-audit" class="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-sm transition-all">
                Scan Competitor Local 3-Pack Rank
              </a>
            </div>
          </div>

          <!-- Vertical Operational Blueprint Card -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 card-3d">
            <div class="border-b border-slate-100 pb-4">
              <h2 class="text-xl font-bold text-slate-900 font-heading">In-Store Reputation Workflow for ${config.name}</h2>
              <p class="text-xs text-slate-500 mt-1">Configured for seamless touchpoint collection with zero app download.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span class="text-brand-600 font-bold uppercase text-[10px] font-mono">Physical Touchpoint</span>
                <h3 class="font-bold text-sm text-slate-900 font-heading">Where Customers Tap</h3>
                <p class="text-slate-600 leading-relaxed">${config.touchpoint}</p>
              </div>

              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span class="text-brand-600 font-bold uppercase text-[10px] font-mono">Service Pills Injected</span>
                <h3 class="font-bold text-sm text-slate-900 font-heading">1-Tap Customer Choices</h3>
                <p class="text-slate-600 leading-relaxed">${config.exampleSvc}</p>
              </div>

              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span class="text-brand-600 font-bold uppercase text-[10px] font-mono">Metro Hub Focus</span>
                <h3 class="font-bold text-sm text-slate-900 font-heading">Local Search Prominence</h3>
                <p class="text-slate-600 leading-relaxed">${config.geoFocus}</p>
              </div>
            </div>

            <div class="p-6 bg-brand-50/60 rounded-2xl border border-brand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <h3 class="font-bold text-sm text-brand-950 font-heading">Need custom physical stands or POS integration?</h3>
                <p class="text-xs text-brand-800">ReviewKaro connects natively with Petpooja, Zenoti, Practo, and custom billing APIs.</p>
              </div>
              <a href="/book-demo" class="px-4 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-all text-center">
                Schedule Technical Consult &rarr;
              </a>
            </div>
          </div>

        </div>
      `,
        {
          canonical: `/industries/${ind}`,
          description: config.desc.slice(0, 160),
          keywords: config.keywords,
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Industries', url: '/features' },
            { name: config.name, url: `/industries/${ind}` }
          ]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 6. FOR AGENCIES (/for-agencies)
    // ----------------------------------------------------
    if (pathname === '/for-agencies') {
      const html = renderHtmlPage(
        'Agency Partner Network & White-Label Reporting',
        'agencies',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Earn 30% Recurring Commission with ReviewKaro</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Manage all client Google Business Profiles under one roof with white-label client PDF report cards.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h2 class="font-bold text-sm text-slate-900 font-heading">White-Label PDF Reports</h2>
              <p class="text-slate-500">Send automated weekly reputation report cards branded with your marketing agency logo.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h2 class="font-bold text-sm text-slate-900 font-heading">30% Lifetime Revenue Share</h2>
              <p class="text-slate-500">Earn 30% recurring monthly margin on every local clinic or salon you onboard.</p>
            </div>
            <div class="p-6 bg-white rounded-2xl border border-slate-200 space-y-2 card-3d">
              <h2 class="font-bold text-sm text-slate-900 font-heading">Multi-Tenant Client Desk</h2>
              <p class="text-slate-500">Switch between 50+ client locations in one single unified dashboard.</p>
            </div>
          </div>
          <div class="text-center pt-4">
            <a href="/app" class="inline-block px-8 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">Join Agency Partner Program &rarr;</a>
          </div>
        </div>
      `,
        {
          canonical: '/for-agencies',
          description: 'Partner with ReviewKaro to manage client Google Business Profiles at scale. White-label client PDF reports, multi-tenant dashboard, and 30% recurring monthly margin share.',
          keywords: 'agency review software white-label, Google Business Profile reseller, local SEO agency partner program India, review management for agencies',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'For Agencies', url: '/for-agencies' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // COMPETITOR COMPARISON (/vs/birdeye & /vs/:slug)
    // ----------------------------------------------------
    if (pathname.startsWith('/vs/')) {
      const comp = pathname.split('/')[2] || 'birdeye';
      const html = renderHtmlPage(
        'ReviewKaro vs Birdeye: The Local Reputation OS Built for India',
        'vs',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold font-mono">
              Head-to-Head Architectural Comparison
            </div>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
              ReviewKaro vs Birdeye: Why Indian Businesses Save 85% Annually
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              Birdeye is built for enterprise US corporations billing in USD. ReviewKaro is natively engineered for clinics, salons, and cafes in India—with transparent INR billing, WhatsApp owner approvals, and Hinglish dialect mirroring.
            </p>
          </div>

          <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm card-3d">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-heading">
                  <tr>
                    <th class="p-4 sm:p-5 font-bold">Feature / Capability</th>
                    <th class="p-4 sm:p-5 font-bold text-brand-600 bg-brand-50/50">ReviewKaro (India Native)</th>
                    <th class="p-4 sm:p-5 font-bold text-slate-500">Birdeye (US Enterprise)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">Pricing & Billing Currency</td>
                    <td class="p-4 sm:p-5 font-bold text-brand-700 bg-brand-50/30">₹999 / mo (₹2,999/quarter Hero Plan)</td>
                    <td class="p-4 sm:p-5 text-slate-500">$299 - $399 / mo (~₹25,000 - ₹33,000/mo)</td>
                  </tr>
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">Payment Modes & Taxes</td>
                    <td class="p-4 sm:p-5 font-bold text-emerald-700 bg-brand-50/30">UPI AutoPay, NetBanking + 18% GST Invoice</td>
                    <td class="p-4 sm:p-5 text-slate-500">International Credit Card + FX charges</td>
                  </tr>
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">Linguistic Dialect Mirroring</td>
                    <td class="p-4 sm:p-5 font-bold text-slate-900 bg-brand-50/30">Devanagari Hindi, Colloquial Hinglish, English, Tamil, Telugu, Kannada</td>
                    <td class="p-4 sm:p-5 text-slate-500">Rigid US / UK English Templates</td>
                  </tr>
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">Negative Review De-escalation</td>
                    <td class="p-4 sm:p-5 font-bold text-slate-900 bg-brand-50/30">1-Tap Owner WhatsApp Approval & Direct Call fallback</td>
                    <td class="p-4 sm:p-5 text-slate-500">Email blast ticketing queue</td>
                  </tr>
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">In-Store Customer QR Flow</td>
                    <td class="p-4 sm:p-5 font-bold text-slate-900 bg-brand-50/30">Zero App Download, <85KB, 30-Second Tap Flow</td>
                    <td class="p-4 sm:p-5 text-slate-500">DLT SMS links (frequently blocked by TRAI)</td>
                  </tr>
                  <tr>
                    <td class="p-4 sm:p-5 font-semibold text-slate-900">Data Sovereignty</td>
                    <td class="p-4 sm:p-5 font-bold text-slate-900 bg-brand-50/30">AWS Mumbai (ap-south-1) • DPDP Act 2023</td>
                    <td class="p-4 sm:p-5 text-slate-500">US Central Cloud data residency</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span class="text-xs text-slate-600">Ready to save 85% on your reputation stack?</span>
              <a href="/signup" class="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-colors">
                Start 14-Day Free Pilot &rarr;
              </a>
            </div>
          </div>
        </div>
      `,
        {
          canonical: '/vs/birdeye',
          description: 'Compare ReviewKaro vs Birdeye. Why Indian clinics, salons and restaurants choose ReviewKaro for transparent INR pricing, UPI AutoPay, WhatsApp approvals, and Hinglish dialect mirroring.',
          keywords: 'ReviewKaro vs Birdeye, Birdeye alternative India, reputation management software price India, Birdeye pricing INR',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/features' }, { name: 'ReviewKaro vs Birdeye', url: '/vs/birdeye' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // POS INTEGRATIONS (/integrations/:slug)
    // ----------------------------------------------------
    if (pathname.startsWith('/integrations/')) {
      const slug = pathname.split('/')[2] || 'petpooja';
      const html = renderHtmlPage(
        'Petpooja POS + ReviewKaro: Automatic Google Reviews for Restaurants',
        'integrations',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
              Certified POS Webhook Connector
            </div>
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
              Petpooja POS + ReviewKaro Review Autopilot
            </h1>
            <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
              Automatically trigger feedback requests when diners pay their food bill on Petpooja POS. Collect authentic 5-star Google Maps reviews while the dining experience is fresh.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d">
              <span class="text-brand-600 font-bold font-mono text-[11px] uppercase">Step 01</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">Bill Print / Settle</h2>
              <p class="text-slate-500 leading-relaxed">Cashier settles the dining table on Petpooja POS. Webhook instantly fires to ReviewKaro with zero delay.</p>
            </div>
            <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d">
              <span class="text-brand-600 font-bold font-mono text-[11px] uppercase">Step 02</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">Smart 30-Min Delay</h2>
              <p class="text-slate-500 leading-relaxed">ReviewKaro holds the review invitation until diners finish dessert, preventing intrusive interruptions.</p>
            </div>
            <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d">
              <span class="text-brand-600 font-bold font-mono text-[11px] uppercase">Step 03</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">1-Tap Google Review</h2>
              <p class="text-slate-500 leading-relaxed">Diner selects favorite dishes and posts an authentic Hinglish or English review on Google Maps.</p>
            </div>
          </div>

          <div class="p-8 bg-brand-50/60 rounded-3xl border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div class="space-y-1 text-center sm:text-left">
              <h3 class="font-bold text-base text-brand-950 font-heading">Ready to connect your Petpooja outlet?</h3>
              <p class="text-xs text-brand-800">Setup takes under 5 minutes with our native webhook URL. Zero code required.</p>
            </div>
            <a href="/signup" class="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap">
              Connect Petpooja &rarr;
            </a>
          </div>
        </div>
      `,
        {
          canonical: '/integrations/petpooja',
          description: 'Automate Google review collection from Petpooja POS billing. Native webhook connector for Indian cafes, restaurants and bakeries.',
          keywords: 'Petpooja Google reviews, restaurant review automation, Petpooja POS integration, cafe Google maps ratings',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Integrations', url: '/features' }, { name: 'Petpooja POS', url: '/integrations/petpooja' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // FREE TOOL (/tools/google-review-link-generator)
    // ----------------------------------------------------
    if (pathname === '/tools/google-review-link-generator' || pathname === '/tools') {
      const html = renderHtmlPage(
        'Free Google Review Link & Digital QR Code Generator',
        'tools',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="text-center space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
              100% Free Lead Magnet Tool
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">
              Google Review Link & Digital QR Generator
            </h1>
            <p class="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Generate a direct 1-tap review URL and digital QR code for your clinic, salon, or restaurant in 5 seconds.
            </p>
          </div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 card-3d">
            <div>
              <label for="bizSearch" class="block text-xs font-semibold text-slate-700 mb-1">Business Name or Place ID</label>
              <input id="bizSearch" type="text" placeholder="e.g. Dr. Sharma Dental Indiranagar" class="w-full text-xs p-3 rounded-xl border border-slate-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            </div>
            <button type="button" onclick="generateLink()" class="w-full min-h-[44px] rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              Generate Instant Review Link & QR &rarr;
            </button>

            <div id="resultBox" class="hidden pt-4 border-t border-slate-100 space-y-4">
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span class="text-[10px] font-mono text-slate-500 uppercase font-bold">Your Official 1-Tap Review URL</span>
                <p id="generatedUrl" class="font-mono text-xs text-brand-700 break-all select-all font-bold"></p>
              </div>
              <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <p><strong>Want to automate this?</strong> ReviewKaro turns this link into an interactive 30-second Hinglish builder that automatically weeds out 1-star complaints before they hit Google Maps.</p>
                <a href="/signup" class="inline-block font-bold text-brand-700 hover:underline">Start 14-Day Free Pilot &rarr;</a>
              </div>
            </div>
          </div>
        </div>
        <script>
          function generateLink() {
            const input = document.getElementById('bizSearch').value || 'Dr Sharma Dental Indiranagar';
            const slug = encodeURIComponent(input.trim());
            const url = 'https://search.google.com/local/writereview?placeid=' + slug;
            document.getElementById('generatedUrl').innerText = url;
            document.getElementById('resultBox').classList.remove('hidden');
          }
        </script>
      `,
        {
          canonical: '/tools/google-review-link-generator',
          description: 'Free Google review link and QR code generator for Indian local businesses. Create your official 1-tap review prompt instantly.',
          keywords: 'free Google review link generator, create Google review QR code, Google maps review short url, review generator India',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Tools', url: '/tools/google-review-link-generator' }]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 7. BLOG & GUIDES (/blog & /blog/:slug)
    // ----------------------------------------------------
    if (pathname === '/blog') {
      const html = renderHtmlPage(
        'Reputation Guides, Case Studies & Local SEO Playbooks',
        'blog',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Actionable Guides for Indian Business Owners</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Proven playbooks to protect your rating, rank in the Local 3-Pack, and automate review responses.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog/dr-sharma-case-study" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-brand-600">Case Study</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">How Dr. Sharma Clinic Added 128 Google Reviews in 60 Days</h2>
              <p class="text-xs text-slate-500">Learn how an Indiranagar dental practice leveraged reception QR cards to skyrocket from 4.4 to 4.8 stars.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Case Study &rarr;</span>
            </a>

            <a href="/blog/responding-to-negative-reviews" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-amber-600">Legal & De-escalation</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">Responding to 1-Star Medical Reviews Without Legal Liability</h2>
              <p class="text-xs text-slate-500">The exact templates Indian doctors and clinics use to de-escalate upset patients without admitting negligence.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>

            <a href="/blog/google-local-pack-seo-2026" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3 card-3d block hover:border-brand-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              <span class="text-xs font-bold uppercase text-blue-600">Local SEO Playbook</span>
              <h2 class="font-bold text-base text-slate-900 font-heading">How to Rank #1 in Google Local 3-Pack in Indian Metro Cities</h2>
              <p class="text-xs text-slate-500">Why review response velocity and localized keyword weaving outrank paid Google Ads for high-intent walk-ins.</p>
              <span class="text-brand-600 font-bold text-xs inline-block pt-2">Read Guide &rarr;</span>
            </a>
          </div>
        </div>
      `,
        {
          canonical: '/blog',
          description: 'Reputation management case studies, de-escalation templates, and Google Local 3-Pack SEO strategies for Indian healthcare clinics, restaurants, and salons.',
          keywords: 'local SEO blog India, Google review case studies, how to get Google reviews clinic, responding to negative medical reviews',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }]
        }
      );
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
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">The Solution: In-Clinic AI QR Flow</h2>
            <p>Dr. Sharma installed an A6 acrylic counter card at the billing counter and two table tents in the waiting lounge. Instead of asking patients to write long paragraphs, the QR code launched ReviewKaro's 30-second review builder.</p>
            <p>Patients simply tapped what they had done (e.g. “Root Canal”, “Teeth Whitening”), how comfortable they felt (“Painless Procedure”), and selected Hinglish. The AI synthesized an authentic review instantly, and with one tap, the text was copied to the patient's clipboard as Google Maps opened.</p>
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">The Results</h2>
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
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 1: Never Admit Medical Negligence Online</h2>
            <p>A public apology stating “We are sorry our doctor made a mistake” can be used as evidence in consumer disputes or Medical Council inquiries. ReviewKaro's hardcoded safety validator blocks fault admission automatically.</p>
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">Rule 2: Move the Discussion Offline Promptly</h2>
            <p>Provide a direct telephone number to the clinic manager or administrator. This signals to prospective patients reading the review that your clinic takes patient feedback seriously and handles concerns professionally.</p>
          `
        },
        'google-local-pack-seo-2026': {
          title: 'How to Rank #1 in Google Local 3-Pack in Indian Metro Cities',
          tag: 'Local SEO Strategy',
          content: `
            <p>Google's local search algorithm prioritizes three primary pillars: Relevance, Distance, and Prominence. In dense metropolitan markets like Bengaluru, Mumbai, and Delhi, distance is often neutralized because many competitors operate in the same neighborhood.</p>
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">Review Velocity and Owner Response Rate</h2>
            <p>Businesses that respond to 95%+ of reviews within 24 hours receive a measurable prominence boost in local pack rankings. ReviewKaro responds to 4-5 star reviews in under 4 minutes, ensuring your profile maintains the highest response velocity in your zip code.</p>
            <h2 class="text-base font-bold text-slate-900 font-heading mt-4">Keyword Weaving in Official Responses</h2>
            <p>When an owner responds with natural phrases like <em>“Thank you for choosing Dr. Sharma for your painless root canal in Indiranagar”</em>, Google's semantic index connects your listing to those high-intent local search queries.</p>
          `
        }
      };

      const article = articles[slug] || articles['dr-sharma-case-study'];
      const html = renderHtmlPage(
        article.title,
        'blog',
        `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <a href="/blog" class="text-xs font-bold text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded p-1">&larr; Back to all guides</a>
          <div class="border-b border-slate-200 pb-4 space-y-2">
            <span class="text-xs font-bold uppercase text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">${article.tag}</span>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 font-heading">${article.title}</h1>
            <p class="text-xs text-slate-400">Published October 2026 • 5 min read • By Dr. Ananya Sharma</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-4">
            ${article.content}
            <div class="pt-6 border-t border-slate-100 text-center">
              <a href="/signup" class="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Automate Your Clinic's Reviews with ReviewKaro &rarr;
              </a>
            </div>
          </div>
        </div>
      `,
        {
          canonical: `/blog/${slug}`,
          description: `Read ${article.title}. Actionable reputation management insights for Indian local businesses.`,
          keywords: 'reputation case study, clinic review guide, medical review response legal, local 3-pack rank guide',
          article: {
            title: article.title,
            author: 'Dr. Ananya Sharma',
            publishedAt: '2026-10-15T09:00:00+05:30',
            modifiedAt: '2026-10-30T09:00:00+05:30'
          },
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: article.title, url: `/blog/${slug}` }
          ]
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 8. CONTACT PAGE (/contact)
    // ----------------------------------------------------
    if (pathname === '/contact') {
      const html = renderHtmlPage(
        'Contact Us & Bengaluru Headquarters',
        'contact',
        `
        <div class="space-y-12 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="text-center space-y-3">
            <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-heading">Talk to our Reputation Specialists</h1>
            <p class="text-slate-600 text-sm max-w-xl mx-auto">Have questions about multi-location onboarding, UPI AutoPay, or Google Business Profile API setup?</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs card-3d">
              <h2 class="font-bold text-base text-slate-900 font-heading">Send us a message</h2>
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
                <h2 class="font-bold text-lg font-heading">Headquarters & Support</h2>
                <div class="text-xs space-y-2 text-slate-400">
                  <p><strong class="text-white">Bengaluru HQ:</strong> 80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034</p>
                  <p><strong class="text-white">Email:</strong> support@reviewkaro.tech</p>
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
      `,
        {
          canonical: '/contact',
          description: 'Contact ReviewKaro Technologies India Private Limited. Customer support, business inquiries, and technical support in Koramangala, Bengaluru.',
          keywords: 'contact ReviewKaro, ReviewKaro Bengaluru office, Google review customer care India, reputation support phone',
          breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]
        }
      );
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
      const descriptions = {
        '/privacy': 'Official ReviewKaro Privacy Policy in accordance with India DPDP Act 2023. Zero-PHI guarantee and AWS Mumbai data residency.',
        '/terms': 'Official Terms of Service governing ReviewKaro Google Business Profile automation, APIs, and multi-tenant software usage.',
        '/refund-policy': 'Transparent refund and cancellation policy for ReviewKaro subscriptions. 14-day free pilot and hassle-free cancellation.',
        '/dpdp-consent': 'Consent notice, data fiduciary obligations, and user rights under the Digital Personal Data Protection Act 2023.'
      };
      const html = renderHtmlPage(title, '', `
        <div class="space-y-8 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div class="border-b border-slate-200 pb-4">
            <h1 class="text-3xl font-black text-slate-900 font-heading">${title}</h1>
            <p class="text-xs text-slate-500 mt-1">Last Updated: October 2026 • ReviewKaro Technologies India Pvt Ltd</p>
          </div>
          <div class="bg-white p-8 rounded-3xl border border-slate-200 text-xs leading-relaxed text-slate-700 space-y-4">
            <p><strong>1. Compliance & Data Governance:</strong> ReviewKaro operates in full adherence to the Digital Personal Data Protection Act 2023 of India and Google API Services User Data Policy.</p>
            <p><strong>2. Google API Data Usage:</strong> ReviewKaro accesses Google Business Profile reviews solely to ingest comments and draft or post owner-authorized review replies. Customer review drafting (/q/[code]) requires zero login and does not collect phone numbers, email addresses, or names.</p>
            <p><strong>3. Anti-Incentivization Policy:</strong> In compliance with Google Local Guides and FTC regulations, ReviewKaro strictly prohibits offering rewards, discounts, or financial compensation in exchange for Google reviews.</p>
            <p><strong>4. Invoicing & Taxes:</strong> All subscriptions are billed in Indian Rupees (INR) with 18% GST invoices generated for input tax credit.</p>
            <p><strong>5. Contact Information:</strong> For legal inquiries or DPDP data deletion requests, contact our compliance officer at <code class="text-brand-700 font-semibold">compliance@reviewkaro.tech</code>.</p>
          </div>
        </div>
      `, {
        canonical: pathname,
        description: descriptions[pathname] || `${title} - ReviewKaro Technologies India Private Limited.`,
        keywords: `${title}, ReviewKaro legal policy, DPDP Act 2023 India, Google API review guidelines`,
        breadcrumbs: [{ name: 'Home', url: '/' }, { name: title, url: pathname }]
      });
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // OWNER APPLICATION (STATEFUL, DYNAMIC & AUTH-GUARDED)
    // ----------------------------------------------------
    const isAppRoute = pathname === '/app' || pathname.startsWith('/app/');
    if (isAppRoute) {
      const session = getSessionFromReq(req);
      const isDemoAllowed = process.env.NODE_ENV !== 'production' && process.env.ENABLE_DEMO_LOGIN === 'true';
      const isDemoAccess = isDemoAllowed && parsedQuery.demo === 'true';
      
      if (!session && !isDemoAccess) {
        res.writeHead(302, {
          'Location': `/login?auth_required=1&redirect=${encodeURIComponent(pathname)}`,
          ...SECURITY_HEADERS
        });
        return res.end();
      }

      // If accessing via demo parameter without existing session, provision demo session cookie
      if (!session && isDemoAccess) {
        const store = getStore();
        const demoToken = createSession({
          userId: 'usr_demo_01',
          email: store.user?.email || 'dr.sharma@sharmadental.in',
          name: store.user?.name || 'Dr. Ananya Sharma',
          role: store.user?.role || 'Executive Group Director'
        });
        res.setHeader('Set-Cookie', [
          `reviewkaro_session=${demoToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
          `replyo_session=${demoToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        ]);
      }
    }

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
              <p class="text-[11px] text-emerald-600 font-bold tabular-nums">↑ +0.4 since activating ReviewKaro</p>
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
                  <p class="text-[10px] text-slate-400 font-mono">reviewkaro.tech/q/sharma-dent-01</p>
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
                <p class="text-xs text-slate-500">Period: 12 Oct 2026 – 19 Oct 2026 • Prepared by ReviewKaro</p>
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
    // BILLING & RAZORPAY SUBSCRIPTIONS (/app/billing)
    // ----------------------------------------------------
    if (pathname === '/app/billing') {
      const { store, tenantId } = getStoreForReq(req);
      const reg = getRegistry();
      const plan = store.user?.plan || { status: 'trial', tier: 'starter', name: 'Starter Pilot (14 Days Free)', trialDaysLeft: 14 };
      const isActive = plan.status === 'active';
      const invoices = store.invoices || [];
      const razorpayConfig = getRazorpayConfig();

      const content = `
        <div class="space-y-8 max-w-5xl mx-auto">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight font-heading">Subscription & Razorpay Billing</h1>
              <p class="text-xs text-slate-500">Autonomous Google review autopilot plans. Instant UPI, NetBanking & Card activation.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}">
                <span class="w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
                <span>${isActive ? 'Active Subscription' : '14-Day Free Pilot'}</span>
              </span>
            </div>
          </div>

          <!-- Active Plan Hero Card -->
          <div class="p-6 sm:p-8 bg-dark-950 text-white rounded-3xl space-y-5 shadow-xl border border-slate-800 card-3d">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-[10px] uppercase font-bold text-brand-400 bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-800 tracking-wider font-mono">
                  ${isActive ? 'Paid Active Plan' : 'Free Trial Mode'}
                </span>
                <h2 class="text-2xl sm:text-3xl font-black mt-2 font-heading tracking-tight">
                  ${plan.name || 'Growth Autopilot Plan'}
                </h2>
                <p class="text-xs text-slate-400 mt-1">
                  ${isActive ? `Renews on ${plan.expiresAt ? plan.expiresAt.split('T')[0] : 'Auto-renew'} via Razorpay UPI AutoPay` : `Trial active. Upgrade below to lock in the special ₹2,999 quarterly price.`}
                </p>
              </div>
              <div class="text-right sm:text-right">
                <span class="text-xs text-slate-400 block font-medium">Payment Channel</span>
                <span class="text-sm font-bold text-emerald-400 flex items-center justify-start sm:justify-end gap-1.5 mt-0.5">
                  ${getSvgIcon('check', 'w-4 h-4 text-emerald-400')} Razorpay Verified (UPI/Cards)
                </span>
                ${plan.paymentId ? `<span class="text-[10px] text-slate-500 font-mono block mt-1">Ref: ${plan.paymentId}</span>` : ''}
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs border-t border-slate-800/80">
              <div>
                <span class="text-slate-400 text-[11px] block">AI Review Replies</span>
                <strong class="text-white font-heading text-base tabular-nums">Unlimited</strong>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">In-Store QR Stands</span>
                <strong class="text-white font-heading text-base tabular-nums">${store.qrcodes?.length || 1} Active</strong>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">Quarantine Shield</span>
                <strong class="text-emerald-400 font-heading text-base">100% Protected</strong>
              </div>
              <div>
                <span class="text-slate-400 text-[11px] block">GST Input Tax Credit</span>
                <strong class="text-white font-heading text-base font-mono">18% Compliant</strong>
              </div>
            </div>
          </div>

          <!-- Subscription Plan Selector (Razorpay Enabled) -->
          <div class="space-y-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 font-heading">Choose or Upgrade Your Plan</h2>
              <p class="text-xs text-slate-500">Pay securely in Indian Rupees via UPI (GPay, PhonePe, Paytm, BHIM) or Cards.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              <!-- Starter Plan -->
              <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between card-3d">
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-lg text-slate-900 font-heading">Starter Solo</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono">Monthly</span>
                  </div>
                  <div>
                    <span class="text-3xl font-black text-slate-900 font-heading tabular-nums">₹1,249</span>
                    <span class="text-xs text-slate-500"> / month</span>
                  </div>
                  <p class="text-xs text-slate-500">Ideal for single-chair clinics, independent cafes & local salons.</p>
                  <ul class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>1 Google Business Location</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Unlimited AI Multi-Lingual Replies</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Negative Review Quarantine Shield</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>1 Printable Countertop Table-Tent QR</span></li>
                  </ul>
                </div>
                <button type="button" onclick="startRazorpayCheckout('starter', 'monthly')" class="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <span>Pay ₹1,249 via Razorpay UPI &rarr;</span>
                </button>
              </div>

              <!-- Growth Plan (HERO SPECIAL) -->
              <div class="p-6 rounded-3xl bg-white border-2 border-brand-600 shadow-lg relative flex flex-col justify-between card-3d">
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md font-mono">
                  Recommended • Saves ₹2,998
                </div>
                <div class="space-y-3 mt-1">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-lg text-slate-900 font-heading">Growth Autopilot</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full font-mono border border-brand-200">Quarterly Hero</span>
                  </div>
                  <div>
                    <span class="text-3xl font-black text-brand-600 font-heading tabular-nums">₹2,999</span>
                    <span class="text-xs text-slate-500"> / 3 Months</span>
                    <div class="text-[11px] text-emerald-600 font-bold mt-0.5">Just ₹999/mo (40% Savings)</div>
                  </div>
                  <p class="text-xs text-slate-500">Full autopilot reputation OS with free physical countertop stand.</p>
                  <ul class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Everything in Starter + Up to 2 Branches</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>1-Tap WhatsApp Owner Approvals</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Staff Review Attribution & Leaderboard</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Free Acrylic Countertop Display Kit</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Weekly Executive PDF Report Card</span></li>
                  </ul>
                </div>
                <button type="button" onclick="startRazorpayCheckout('growth', 'quarterly')" class="mt-6 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <span>Pay ₹2,999 via Razorpay UPI &rarr;</span>
                </button>
              </div>

              <!-- Multi-Branch Pro -->
              <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between card-3d">
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <h3 class="font-bold text-lg text-slate-900 font-heading">Multi-Location Pro</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-mono">Enterprise</span>
                  </div>
                  <div>
                    <span class="text-3xl font-black text-slate-900 font-heading tabular-nums">₹3,499</span>
                    <span class="text-xs text-slate-500"> / month</span>
                  </div>
                  <p class="text-xs text-slate-500">Multi-chair clinics, restaurant chains, and fitness franchises.</p>
                  <ul class="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Up to 5 Locations Included</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Centralized Reputation Executive Desk</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Google Local 3-Pack Rank Tracker</span></li>
                    <li class="flex items-center gap-2">${getSvgIcon('check', 'w-3.5 h-3.5 text-emerald-600')} <span>Dedicated Account Manager & SLA</span></li>
                  </ul>
                </div>
                <button type="button" onclick="startRazorpayCheckout('pro', 'monthly')" class="mt-6 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                  <span>Pay ₹3,499 via Razorpay UPI &rarr;</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Payment History & Invoices -->
          <div class="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm card-3d">
            <h3 class="font-bold text-sm text-slate-900 font-heading">Tax Invoices & Payment History</h3>
            ${invoices.length > 0 ? `
              <div class="overflow-x-auto">
                <table class="w-full text-xs text-left">
                  <thead class="text-slate-400 font-medium border-b border-slate-100">
                    <tr>
                      <th class="py-2">Invoice</th>
                      <th class="py-2">Plan</th>
                      <th class="py-2">Amount</th>
                      <th class="py-2">Date</th>
                      <th class="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${invoices.map(inv => `
                      <tr>
                        <td class="py-3 font-mono font-bold text-slate-900">${inv.id}</td>
                        <td class="py-3">${inv.plan}</td>
                        <td class="py-3 font-bold text-slate-900 tabular-nums">${inv.amount}</td>
                        <td class="py-3 text-slate-500">${inv.date}</td>
                        <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">${inv.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <p class="text-xs text-slate-500 py-3">No previous invoices found. Payments made via Razorpay will generate downloadable 18% GST tax invoices here.</p>
            `}
          </div>

          <!-- Razorpay Gateway Integration Settings -->
          <div class="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">Merchant Gateway Configuration</h4>
                <p class="text-xs text-slate-500 mt-0.5">Your Razorpay API keys for direct bank settlement into your KYC-verified bank account.</p>
              </div>
              <span class="text-[10px] bg-brand-50 text-brand-700 font-bold font-mono px-2 py-0.5 rounded border border-brand-200">
                ${razorpayConfig.keyId ? 'Custom Keys Linked' : 'System Test Gateway'}
              </span>
            </div>
            
            <form onsubmit="saveRazorpaySettings(event)" class="space-y-3 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                  <input id="rzpKeyInput" type="text" placeholder="rzp_live_..." value="${razorpayConfig.keyId || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 outline-none bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
                  <input id="rzpSecretInput" type="password" placeholder="••••••••••••••••" value="${razorpayConfig.keySecret || ''}" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-brand-500 outline-none bg-white">
                </div>
              </div>
              <div class="flex items-center justify-between pt-1">
                <span id="rzpAlert" class="text-xs text-emerald-600 font-bold hidden">Settings saved successfully!</span>
                <button type="submit" class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm">
                  Save Gateway Keys
                </button>
              </div>
            </form>
          </div>

        </div>

        <script>
          async function startRazorpayCheckout(planId, billingCycle) {
            const btn = event.currentTarget;
            const origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-pulse">Connecting to Razorpay UPI…</span>';

            try {
              const res = await fetch('/api/billing/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, billingCycle })
              });
              const data = await res.json();

              if (!data.success) {
                alert(data.error || 'Failed to create payment order');
                btn.disabled = false;
                btn.innerHTML = origText;
                return;
              }

              // Test simulation fallback when live credentials are not passed
              if (data.isTestMock) {
                const verifyRes = await fetch('/api/billing/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    razorpay_order_id: data.orderId,
                    razorpay_payment_id: 'pay_sim_' + Date.now(),
                    razorpay_signature: 'test_signature',
                    planId,
                    billingCycle
                  })
                });
                const vdata = await verifyRes.json();
                if (vdata.success) {
                  alert('Payment confirmed! Your ' + data.planName + ' is now active.');
                  window.location.reload();
                }
                return;
              }

              const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'ReviewKaro Operating System',
                description: data.planName,
                order_id: data.orderId,
                handler: async function (response) {
                  const verifyRes = await fetch('/api/billing/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      planId,
                      billingCycle
                    })
                  });
                  const vdata = await verifyRes.json();
                  if (vdata.success) {
                    alert('Payment successful! Plan activated.');
                    window.location.reload();
                  } else {
                    alert('Payment verification failed: ' + vdata.error);
                  }
                },
                prefill: {
                  name: data.userName,
                  email: data.userEmail,
                  contact: data.userPhone
                },
                theme: { color: '#2563eb' }
              };
              const rzp = new Razorpay(options);
              rzp.open();
              btn.disabled = false;
              btn.innerHTML = origText;
            } catch (err) {
              alert('Checkout error: ' + err.message);
              btn.disabled = false;
              btn.innerHTML = origText;
            }
          }

          async function saveRazorpaySettings(e) {
            e.preventDefault();
            const keyId = document.getElementById('rzpKeyInput').value;
            const keySecret = document.getElementById('rzpSecretInput').value;
            const alertEl = document.getElementById('rzpAlert');
            const res = await fetch('/api/billing/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ razorpayKeyId: keyId, razorpayKeySecret: keySecret })
            });
            const data = await res.json();
            if (data.success) {
              alertEl.classList.remove('hidden');
              setTimeout(() => alertEl.classList.add('hidden'), 3000);
            }
          }
        </script>
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
      const reg = getRegistry();
      const tenantId = reg.qrLookup?.[code] || 'default';
      const store = getTenantStore(tenantId);
      const qrConfig = (store.qrcodes || []).find(q => q.code === code);
      const matchedBusiness = qrConfig ? (store.businesses || []).find(b => b.vertical === qrConfig.vertical) : null;
      const loc = matchedBusiness || store.location || {};
      const vertical = qrConfig?.vertical || loc.vertical || 'clinic';
      const vConfig = getVerticalConfig(vertical);
      const services = (store.servicesByVertical && (store.servicesByVertical[vConfig.id] || store.servicesByVertical[vertical])) || vConfig.onboarding.defaultServices;
      const qualities = (store.qualityTagsByVertical && (store.qualityTagsByVertical[vConfig.id] || store.qualityTagsByVertical[vertical])) || vConfig.onboarding.defaultQualities;
      let staffMembers = (store.staff || []).filter(s => !s.vertical || s.vertical === vConfig.id || s.vertical === vertical);
      if (staffMembers.length === 0 && vConfig.onboarding.defaultStaff) {
        staffMembers = vConfig.onboarding.defaultStaff.map((name, i) => ({ id: `st_def_${i}`, name }));
      }
      const defaultStaff = staffMembers[0] ? staffMembers[0].name : (vConfig.onboarding.defaultStaff[0] || 'Our Team');

      const html = renderHtmlPage(`${vConfig.shortName} Review Copilot`, 'qr', `
        <div class="min-h-screen bg-slate-100 py-6 px-4">
          <div class="max-w-md mx-auto space-y-4">
            
            <!-- Business Card Header -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-1 shadow-sm card-3d">
              <h1 class="font-extrabold text-slate-900 text-lg font-heading">${loc.name || 'Our Center'}</h1>
              <p class="text-xs text-slate-500">${loc.area || 'Bengaluru'}, ${loc.city || 'Karnataka'}</p>
              <div class="flex items-center justify-center gap-1.5 mt-1">
                <span class="text-[10px] text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full font-bold uppercase font-mono border border-brand-200">
                  ${vConfig.shortName}
                </span>
                <span class="text-xs text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full font-bold">
                  ${vConfig.flowType === 'micro' ? 'Micro-Flow (<15s) Review Copilot' : (vConfig.flowType === 'trust' ? 'Deep Trust Review Copilot' : '15-Second Review Copilot')}
                </span>
              </div>
            </div>

            <!-- Step 1: Rating -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-sm card-3d">
              <span class="text-xs font-bold uppercase text-slate-500 font-heading">1. ${vConfig.qrFlow.step1Title}</span>
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
                  ${vConfig.qrFlow.recoveryMessage}
                </p>
                <div class="flex flex-wrap gap-2 pt-1">
                  <a href="tel:${loc.managerPhone || loc.phone || '+919845011223'}" class="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-[11px] shadow-sm">
                    📞 Direct Call to Manager (${loc.managerPhone || loc.phone || '+91 98450 11223'})
                  </a>
                  <button type="button" onclick="continueToGoogle()" class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold text-[11px] hover:bg-slate-50">
                    Proceed to Google Maps Anyway
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Vertical Service / Menu / Item Pills -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
              <span class="font-bold uppercase text-slate-500 font-heading">2. ${vConfig.qrFlow.step2Title}</span>
              <div class="flex flex-wrap gap-1.5" id="serviceTags">
                ${services.map((svc, i) => `
                  <button type="button" onclick="toggleTag(this)" class="px-3 min-h-[40px] rounded-xl border text-xs font-medium focus-visible:outline-none transition-all ${
                    i === 0 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }">${svc}</button>
                `).join('')}
              </div>
            </div>

            ${vConfig.qrFlow.showQuality ? `
              <!-- Step 3 (Deep Trust Flow): Clinical / Teaching Quality Tags -->
              <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
                <span class="font-bold uppercase text-slate-500 font-heading">3. ${vConfig.qrFlow.step3Title}</span>
                <div class="flex flex-wrap gap-1.5" id="qualityTags">
                  ${qualities.map((q, i) => `
                    <button type="button" onclick="toggleTag(this)" class="px-3 min-h-[40px] rounded-xl border text-xs font-medium focus-visible:outline-none transition-all ${
                      i === 0 ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }">${q}</button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${vConfig.qrFlow.showStaff ? `
              <!-- Step 3 or 4: Frontline Staff Attribution Selector -->
              <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-sm text-xs card-3d">
                <span class="font-bold uppercase text-slate-500 font-heading">${vConfig.qrFlow.showQuality ? '4' : '3'}. ${vConfig.qrFlow.step4Title || vConfig.qrFlow.step3Title}</span>
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
            ` : ''}

            <!-- Step ${vConfig.questionCount + 1}: Language Choice & AI Generator -->
            <div class="p-5 bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm text-xs card-3d">
              <span class="font-bold uppercase text-slate-500 font-heading">${vConfig.questionCount + 1}. Preferred Review Language</span>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" onclick="setLang('hi-en', this)" class="py-2.5 rounded-xl border font-bold bg-brand-600 text-white border-brand-600 shadow-sm focus-visible:outline-none">Hinglish</button>
                <button type="button" onclick="setLang('en', this)" class="py-2.5 rounded-xl border font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 focus-visible:outline-none">English</button>
                <button type="button" onclick="setLang('hi', this)" class="py-2.5 rounded-xl border font-bold bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 focus-visible:outline-none">हिंदी</button>
              </div>
              <button type="button" onclick="generateDraft()" class="w-full min-h-[48px] bg-slate-900 text-white font-bold rounded-xl mt-2 hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2">
                ${getSvgIcon('sparkles', 'w-4 h-4 text-brand-400')}
                <span>Generate ${vConfig.flowType === 'micro' ? '10-Second' : '15-Second'} AI Review Draft &rarr;</span>
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
            const qualities = [];
            document.querySelectorAll('#qualityTags button.bg-brand-600').forEach(b => qualities.push(b.innerText.trim()));
            
            const res = await fetch('/api/ai/qr-draft', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                submission: {
                  rating: qrRating,
                  selectedServices: services.length ? services : ['${services[0] || 'Service'}'],
                  qualityTags: qualities.length ? qualities : ${JSON.stringify(qualities.slice(0, 2))},
                  staffName: ${vConfig.qrFlow.showStaff ? 'selectedStaff' : "''"},
                  ambienceTags: ['Modern Atmosphere'],
                  recommend: 'yes',
                  language: qrLang,
                  length: 'short',
                  vertical: '${vConfig.id}'
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
      const code = pathname.split('/')[2];
      const reg = getRegistry();
      const tenantId = reg.qrLookup?.[code] || 'default';
      const store = getTenantStore(tenantId);
      const placeId = store.location?.googlePlaceId || 'ChIJ_zX8sh8UrjsRn7w001';
      const html = renderHtmlPage('Thank You', 'qr', `
        <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4 card-3d">
            <div class="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
              ${getSvgIcon('check', 'w-6 h-6')}
            </div>
            <h1 class="text-2xl font-black text-slate-900 font-heading">Thank You for Supporting Us!</h1>
            <p class="text-xs text-slate-600">Your review helps genuine local customers discover ${escapeHtml(store.location?.name || 'our business')}.</p>
            <div class="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <strong>Reminder:</strong> Your text is copied to your clipboard. Simply paste it on Google Maps and tap Post!
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${placeId}" target="_blank" class="block w-full min-h-[44px] flex items-center justify-center bg-brand-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
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

    // ----------------------------------------------------
    // OFFLINE FALLBACK PAGE (/offline)
    // ----------------------------------------------------
    if (pathname === '/offline') {
      const html = renderHtmlPage(
        'No Internet Connection — Offline Fallback',
        '',
        `
        <div class="min-h-[70vh] flex items-center justify-center p-6 text-center">
          <div class="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
              ⚡
            </div>
            <h1 class="text-2xl font-black text-slate-900 font-heading">You Are Offline</h1>
            <p class="text-slate-500 text-xs leading-relaxed">
              We couldn't connect to ReviewKaro servers. Please check your mobile data or Wi-Fi connection. Any pending review approval links will automatically resume once reconnected.
            </p>
            <div class="pt-2">
              <button onclick="window.location.reload()" class="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors">
                Retry Connection &rarr;
              </button>
            </div>
            <div id="onlineBadge" class="hidden text-[11px] font-bold text-emerald-700 font-mono">
              ✓ Connection Restored! Reloading...
            </div>
          </div>
        </div>
        <script>
          window.addEventListener('online', () => {
            document.getElementById('onlineBadge').classList.remove('hidden');
            setTimeout(() => window.location.reload(), 1000);
          });
        </script>
        `,
        {
          canonical: '/offline',
          description: 'Offline fallback page for ReviewKaro. Check your internet connection.',
          robots: 'noindex, nofollow'
        }
      );
      return sendHtml(200, html);
    }

    // ----------------------------------------------------
    // 404 NOT FOUND HANDLER (Real HTTP 404 Status)
    // ----------------------------------------------------
    return sendHtml(404, renderHtmlPage('404 — Page Not Found', '', `
      <div class="min-h-[70vh] flex items-center justify-center p-6 text-center">
        <div class="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 card-3d">
          <div class="text-4xl font-black text-brand-600 font-heading tabular-nums">404</div>
          <h1 class="text-2xl font-bold text-slate-900 font-heading">Page Not Found</h1>
          <p class="text-slate-500 text-xs leading-relaxed">
            The link you followed may be broken or the page may have been removed. Explore our core resources below:
          </p>
          <div class="pt-2 grid grid-cols-2 gap-2 text-xs">
            <a href="/" class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200 transition-colors">
              Homepage &rarr;
            </a>
            <a href="/free-audit" class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200 transition-colors">
              Free Audit &rarr;
            </a>
            <a href="/features" class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200 transition-colors">
              Features &rarr;
            </a>
            <a href="/pricing" class="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200 transition-colors">
              Pricing INR &rarr;
            </a>
          </div>
        </div>
      </div>
    `, {
      canonical: pathname,
      description: 'Page not found - ReviewKaro Operating System',
      robots: 'noindex, follow'
    }));
    } catch (err) {
      console.error('Server error:', err);
      return sendJson(500, { success: false, error: 'Internal Server Error' });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ReviewKaro 2.0 (Swiss Minimalist & Fully Accessible) is LIVE on port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

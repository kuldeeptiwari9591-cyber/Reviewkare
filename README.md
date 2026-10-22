# Replyo - Autonomous Google Review SaaS for Indian Businesses

> **Review Reply & In-Clinic AI QR Flow** engineered specifically for Indian clinics, salons, restaurants, gyms, and coaching centres.

---

## 🚀 Key Features

### 1. Autonomous Review Reply Engine
- **Multi-Lingual Dialect & Tone Mirroring:** Fluent in Hindi, Hinglish, English, Tamil, Telugu, Kannada, Bengali, and Marathi.
- **Star-Based Autopilot:**
  - `4–5 Stars`: Automatically drafts, weaves local SEO keywords, and publishes directly to Google Maps in minutes.
  - `1–3 Stars`: Held for owner approval with Zero-Liability defense (blocks refund promises & fault admissions).
  - `Star-Only Reviews`: Gracefully thanks customers for high star ratings even when no written text is left.
- **1-Tap Mobile SMS / Email Approval:** Owners receive an SMS or email link (`/a/[token]`) to approve or edit held negative reviews in 3 seconds with **zero login friction**.
- **Style Regeneration:** Switch tone on demand (`shorter`, `warmer`, `firmer`).

### 2. In-Clinic AI QR Booster Flow (`/q/[code]`)
- **Ultra-Fast (<100KB, <2s load on 4G):** Zero login required for the customer.
- **Strict Anti-Invention Compliance:** AI review draft is synthesized *strictly* from the customer's selected treatment, quality tags, staff member, and ambience choices.
- **1-Tap Clipboard Copy & Google Maps Direct Handoff:** Copies text to clipboard and opens Google's direct review window for the business's Place ID.
- **100% Google Policy Compliant:** No review gating, no incentives or discounts for posting.

### 3. Print-Ready QR Studio (`/app/qr`)
- Live preview and export for:
  - **A6 Counter Cards** (Reception desks)
  - **A4 Table Tents** (Tables & waiting rooms)
  - **5×5 cm Bill Stickers** (Receipts & invoices)
  - **Rollup Standees** (Lobbies & entrances)
- SVG (Vector), high-res PNG (2000–4000px), and print-ready PDF with bleed margins.

### 4. Indian Pricing & Compliance
- **Transparent INR Pricing:**
  - **Basic:** ₹749/month (₹7,490/year) — 1 Location, 80 replies/mo
  - **Growth (Most Popular):** ₹1,349/month (₹13,490/year) — Unlimited replies, 3 QRs, SMS 1-tap links
  - **Pro:** ₹1,949/month (₹19,490/year) — Up to 3 Locations, competitor tracker
  - **Enterprise:** Custom quote for multi-branch chains & agencies
- **India-Ready Payments:** UPI AutoPay (Google Pay, PhonePe, Paytm) + GST-compliant invoices.
- **DPDP Act 2023 & Google Local Guides Compliant.**

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript Strict + Tailwind CSS
- **AI Core:** Gemini Flash with fallback validation pipeline & fast language detection
- **QR Generation:** High-res vector `qrcode` with Error Correction Level Q/H
- **Testing:** Custom end-to-end verification suite testing safety validation, tone mirroring, and token approvals

---

## 🧪 Verification & Running Tests

To run the complete 21-point automated test suite:

```bash
cd /root/replyo
npx tsc --noEmit false --outDir ./dist --module commonjs --target es2022 --moduleResolution node --jsx react-jsx
node dist/tests/verify-all.js
```

### Test Coverage (21 of 21 Passing):
- **Safety Validator:** Blocks refunds, prevents legal liability, enforces manager contact.
- **Linguistic Engine:** Accurately classifies Hindi, Hinglish, and English.
- **Autopilot Routing:** Auto-posts 5-star reviews, weaves local SEO keywords, holds 1–3 star complaints.
- **QR Draft Engine:** Restricts generated drafts strictly to customer picks without promotional bribes.
- **1-Tap Approvals:** Validates mobile SMS token resolution and instant status update.

---

## 📂 Project Structure

```
replyo/
├── src/
│   ├── types/
│   │   ├── index.ts               # Core data models, plans, autopilot levels
│   │   └── declarations.d.ts      # QR and canvas-confetti types
│   ├── lib/
│   │   ├── utils.ts               # Tailwind merge & INR formatting
│   │   ├── ai/
│   │   │   ├── safety-validator.ts# Zero-liability & no-refund shield
│   │   │   ├── reply-engine.ts    # Multi-lingual review response engine
│   │   │   └── qr-draft-engine.ts # Customer in-store review synthesizer
│   │   └── store/
│   │       └── db.ts              # In-memory Indian clinic store & state
│   ├── components/
│   │   ├── Navbar.tsx             # Global navigation with role switches
│   │   └── Footer.tsx             # Indian compliance & trust badges
│   └── app/
│       ├── page.tsx               # Marketing homepage with live AI sandbox
│       ├── pricing/page.tsx       # INR pricing & UPI AutoPay plans
│       ├── free-audit/page.tsx    # Lead magnet audit tool for local businesses
│       ├── q/[code]/page.tsx      # 30-sec customer mobile review flow
│       ├── q/[code]/done/page.tsx # Review confirmation & copy screen
│       ├── a/[token]/page.tsx     # Zero-login 1-tap mobile approval screen
│       ├── app/
│       │   ├── layout.tsx         # Owner sidebar navigation
│       │   ├── page.tsx           # Dashboard overview (4 KPIs + review simulation)
│       │   ├── reviews/page.tsx   # All reviews feed with star & language filters
│       │   ├── approvals/page.tsx # Held 1-3 star reviews triage desk
│       │   ├── qr/page.tsx        # Print-ready QR Studio & scan analytics
│       │   ├── growth/page.tsx    # Competitor leaderboard & SEO keywords
│       │   ├── settings/page.tsx  # Autopilot level & brand tone settings
│       │   └── billing/page.tsx   # UPI AutoPay & GST invoice history
│       └── api/                   # Serverless API routes
└── tests/
    └── verify-all.ts              # Automated test runner suite
```

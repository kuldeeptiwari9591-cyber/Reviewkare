"use strict";
// Single source for crawl metadata. Every public URL has one canonical path,
// one unique title, one unique description, and a sitemap decision. Duplicate
// landing pages point their canonical at the primary URL so Google indexes one
// version instead of reporting "crawled, currently not indexed" for the rest.
const { PLANS, planTerms } = require("./catalog");
const BLOG = require("./blog");

const INDEX =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX = "noindex, follow";
const SITE_MODIFIED = "2026-11-20";

const PAGES = {
  "/": {
    title: "ReviewKare — reviews collected and answered",
    exact: true,
    description:
      "A QR code lets customers pick what applied and post a review from three to five drafts. Owners can review recent Google feedback and approve a reply before publishing.",
    lastmod: SITE_MODIFIED,
    priority: "1.0",
  },
  "/features": {
    title: "Features: QR review drafts and Google replies",
    description:
      "See both flows: a QR composer that returns three to five grounded drafts, and a Google Business Profile inbox with template drafts and an approval step.",
    lastmod: SITE_MODIFIED,
    priority: "0.9",
  },
  "/pricing": {
    title: "Pricing with fixed access periods",
    description:
      "Compare prepaid review management plans for one location, one QR code, and one Business Profile. Access has a fixed end date and no automatic renewal.",
    lastmod: SITE_MODIFIED,
    priority: "0.9",
  },
  "/security": {
    title: "Security and data protection",
    description:
      "How ReviewKare isolates workspaces, encrypts Google refresh tokens, controls sessions, and limits what is stored, logged, and sent to model providers.",
    lastmod: SITE_MODIFIED,
    priority: "0.6",
  },
  "/compliance": {
    title: "Security and data protection",
    description:
      "How ReviewKare isolates workspaces, encrypts Google refresh tokens, controls sessions, and limits what is stored, logged, and sent to model providers.",
    canonical: "/security",
    lastmod: SITE_MODIFIED,
    priority: "0.3",
  },
  "/compare/google-review-link": {
    title: "Google review link vs QR review composer",
    description: "Compare a direct Google review link with a QR composer for a local business. See setup, customer steps, and who publishes the review.",
    lastmod: "2026-11-21",
    priority: "0.6",
  },
  "/compare/manual-review-replies": {
    title: "Manual Google replies vs a review reply workspace",
    description: "Compare replying directly in Google Business Profile with drafting and approving replies in a ReviewKare workspace.",
    lastmod: "2026-11-21",
    priority: "0.6",
  },
  "/privacy": {
    title: "Privacy notice",
    description:
      "What ReviewKare collects, why it is collected, how long it is kept, which processors are involved, and how to request access, correction, or deletion.",
    lastmod: SITE_MODIFIED,
    priority: "0.5",
  },
  "/dpdp-consent": {
    title: "Privacy notice",
    description:
      "What ReviewKare collects, why it is collected, how long it is kept, which processors are involved, and how to request access, correction, or deletion.",
    canonical: "/privacy",
    lastmod: SITE_MODIFIED,
    priority: "0.3",
  },
  "/terms": {
    title: "Terms of service",
    description:
      "The agreement for using ReviewKare: acceptable use, customer responsibilities, review-platform rules, payment terms, and limitation of liability.",
    lastmod: SITE_MODIFIED,
    priority: "0.5",
  },
  "/refund-policy": {
    title: "Refund policy",
    description:
      "How refund requests are reviewed for a prepaid access period, what is eligible, what is not, and how to submit a request from the billing page.",
    lastmod: SITE_MODIFIED,
    priority: "0.5",
  },
  "/faq": {
    title: "Frequently asked questions",
    description:
      "Direct answers about the QR composer, Google Business Profile connection, AI replies, approval, billing periods, data storage, and supported languages.",
    lastmod: SITE_MODIFIED,
    priority: "0.8",
  },
  "/contact": {
    title: "Contact and support",
    description:
      "Send a question about setup, billing, or a Google connection. This form records a request; it does not create a calendar event or promise a reply time.",
    lastmod: SITE_MODIFIED,
    priority: "0.6",
  },

  "/qr-kit": {
    title: "QR kit for printed review codes",
    description:
      "What a review QR code should contain, where to place it, what the guest sees, and the checks to run before you print a poster for your counter.",
    lastmod: SITE_MODIFIED,
    priority: "0.7",
  },
  "/free-audit": {
    title: "Reputation audit checklist",
    description:
      "A self-serve checklist for reviewing your Google presence: listing accuracy, review replies, recent photos, response time, and the gaps worth fixing first.",
    lastmod: SITE_MODIFIED,
    priority: "0.6",
  },
  "/tools": {
    title: "Google review link generator",
    description:
      "Turn a Google Place ID into a review link you can copy and test. The tool runs in the browser and does not store the identifier you enter.",
    canonical: "/tools/google-review-link-generator",
    lastmod: SITE_MODIFIED,
    priority: "0.3",
  },
  "/tools/google-review-link-generator": {
    title: "Google review link generator",
    description:
      "Build a write-review URL from your Google Place ID, then test it on a phone before printing. No account, no stored Place ID, no short-link redirect.",
    lastmod: SITE_MODIFIED,
    priority: "0.7",
  },
  "/blog": {
    title: "Guides for reviews and replies",
    description:
      "Practical guides on replying to negative Google reviews, running a review QR code within platform rules, and finding the right Google Place ID.",
    lastmod: SITE_MODIFIED,
    priority: "0.8",
  },
  "/offline": {
    title: "You are offline",
    description:
      "This page is shown when the browser has no network connection. Nothing was submitted.",
    robots: NOINDEX,
    lastmod: SITE_MODIFIED,
    priority: "0.1",
  },
};

for (const article of BLOG.ARTICLES) {
  PAGES["/blog/" + article.slug] = {
    title: article.title,
    description: article.description,
    lastmod: article.updated,
    priority: "0.7",
  };
}

const SITEMAP_EXCLUDE = new Set([
  "/offline",
  "/compliance",
  "/dpdp-consent",
  "/tools",
]);

function metaFor(pathname) {
  const page = PAGES[pathname];
  if (!page) return null;
  const canonicalPath = page.canonical || pathname;
  return {
    title: page.title,
    fullTitle: page.exact ? page.title : page.title + " | ReviewKare",
    description: page.description,
    canonicalPath,
    robots: page.robots || INDEX,
    lastmod: page.lastmod || SITE_MODIFIED,
    priority: page.priority || "0.5",
    indexable: !(page.robots || "").startsWith("noindex"),
  };
}

function absolute(origin, pathname) {
  return origin.replace(/\/$/, "") + (pathname === "/" ? "/" : pathname);
}

function sitemap(origin) {
  const urls = Object.keys(PAGES)
    .filter((pathname) => {
      const meta = metaFor(pathname);
      return meta.indexable && !SITEMAP_EXCLUDE.has(pathname);
    })
    .map((pathname) => {
      const meta = metaFor(pathname);
      return {
        loc: absolute(origin, pathname),
        lastmod: meta.lastmod,
        priority: meta.priority,
      };
    })
    .sort((a, b) => a.loc.localeCompare(b.loc));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (url) =>
        `  <url><loc>${xml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod><priority>${url.priority}</priority></url>`,
    )
    .join("\n")}\n</urlset>\n`;
}

function xml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function organization(origin, config = {}) {
  const node = {
    "@type": "Organization",
    "@id": origin + "/#organization",
    name: "ReviewKare",
    url: origin + "/",
    logo: {
      "@type": "ImageObject",
      url: origin + "/static/logo.png",
      width: 256,
      height: 256,
    },
    description:
      "Review collection and Google Business Profile reply management for local businesses.",
    knowsLanguage: ["en-IN"],
  };
  if (config.supportEmail) {
    node.email = config.supportEmail;
    node.contactPoint = [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: config.supportEmail,
        availableLanguage: ["English"],
      },
    ];
  }
  return node;
}

function website(origin) {
  return {
    "@type": "WebSite",
    "@id": origin + "/#website",
    url: origin + "/",
    name: "ReviewKare",
    description:
      "QR review collection and Google Business Profile reply management.",
    publisher: { "@id": origin + "/#organization" },
    inLanguage: "en-IN",
  };
}

function softwareApplication(origin, config) {
  return {
    "@type": "SoftwareApplication",
    "@id": origin + "/#software",
    name: "ReviewKare",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Review management",
    operatingSystem: "Web",
    url: origin + "/",
    description:
      "Collect customer reviews through a QR composer and draft and approve replies to Google Business Profile reviews.",
    publisher: { "@id": origin + "/#organization" },
    inLanguage: "en-IN",
    offers: Object.entries(config.plans || PLANS).map(([id, plan]) => ({
      "@type": "Offer",
      name: plan.name,
      price: (planTerms(plan)[0].amount / 100).toFixed(2),
      priceCurrency: "INR",
      url: origin + "/pricing#" + id,
      availability: config.billingEnabled ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };
}

function breadcrumb(origin, pathname) {
  const meta = metaFor(pathname);
  const canonicalPath = meta ? meta.canonicalPath : pathname;
  const parts = canonicalPath.split("/").filter(Boolean);
  const items = [{ name: "Home", item: origin + "/" }];
  if (parts[0] === "blog" && parts[1]) {
    items.push({ name: "Guides", item: origin + "/blog" });
    const article = BLOG.article(parts[1]);
    items.push({
      name: article ? article.title : "Guide",
      item: absolute(origin, canonicalPath),
    });
  } else {
    const meta2 = metaFor("/" + parts[0]);
    items.push({
      name: meta2 ? meta2.title.replace(/ \| ReviewKare$/, "") : parts[0],
      item: origin + "/" + parts[0],
    });
  }
  return {
    "@type": "BreadcrumbList",
    "@id": absolute(origin, canonicalPath) + "#breadcrumb",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function webPage(origin, pathname, meta) {
  const url = absolute(origin, meta.canonicalPath);
  const node = {
    "@type": pathname === "/blog" ? "CollectionPage" : "WebPage",
    "@id": url + "#webpage",
    url,
    name: meta.fullTitle || meta.title,
    description: meta.description,
    isPartOf: { "@id": origin + "/#website" },
    about: { "@id": origin + "/#organization" },
    inLanguage: "en-IN",
    dateModified: meta.lastmod,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: origin + "/static/og-banner.png",
      width: 1200,
      height: 630,
    },
  };
  return node;
}

function schemaFor({ pathname, origin, config = {}, faqs = null }) {
  const meta = metaFor(pathname);
  if (!meta) return null;
  const graph = [
    organization(origin, config),
    website(origin),
    webPage(origin, pathname, meta),
  ];
  if (pathname === "/" || pathname === "/pricing")
    graph.push(softwareApplication(origin, config));
  if (meta.canonicalPath !== "/" && meta.indexable)
    graph.push(breadcrumb(origin, pathname));
  if (pathname === "/faq" && Array.isArray(faqs) && faqs.length)
    graph.push({
      "@type": "FAQPage",
      "@id": origin + "/faq#faq",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  if (pathname === "/blog")
    graph.push({
      "@type": "ItemList",
      "@id": origin + "/blog#list",
      itemListElement: BLOG.list().map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: origin + "/blog/" + article.slug,
        name: article.title,
      })),
    });
  const article = BLOG.article(pathname.replace(/^\/blog\//, ""));
  if (pathname.startsWith("/blog/") && article)
    graph.push({
      "@type": "BlogPosting",
      "@id": absolute(origin, pathname) + "#article",
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: article.updated,
      articleSection: article.topic,
      inLanguage: "en-IN",
      author: { "@id": origin + "/#organization" },
      publisher: { "@id": origin + "/#organization" },
      mainEntityOfPage: {
        "@id": absolute(origin, meta.canonicalPath) + "#webpage",
      },
      image: {
        "@type": "ImageObject",
        url: origin + "/static/og-banner.png",
        width: 1200,
        height: 630,
      },
    });
  return { "@context": "https://schema.org", "@graph": graph.filter(Boolean) };
}

function robots(origin) {
  const ai = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-User",
    "PerplexityBot",
    "Google-Extended",
  ];
  const shared = [
    "Disallow: /app",
    "Disallow: /admin",
    "Disallow: /api/",
    "Disallow: /a/",
    "Disallow: /q/",
    "Disallow: /login",
    "Disallow: /signup",
    "Disallow: /forgot-password",
    "Disallow: /reset-password",
    "Disallow: /verify-email",
    "Disallow: /logout",
    "Disallow: /docs/",
    "Disallow: /data/",
    "Disallow: /audit/",
    "Disallow: /.git/",
    "Disallow: /.runtime",
    "Disallow: /*.sqlite",
    "Disallow: /*.sqlite-wal",
    "Disallow: /*.md$",
  ];
  return [
    "# Public marketing and legal pages are open to every crawler.",
    "# Workspace, guest, and account URLs are excluded on purpose.",
    "",
    "User-agent: *",
    "Allow: /",
    ...shared,
    "",
    "# Answer engines may read the public pages. Private paths stay closed.",
    ...ai.flatMap((agent) => [
      "User-agent: " + agent,
      "Allow: /",
      ...shared,
      "",
    ]),
    "Sitemap: " + origin + "/sitemap.xml",
    "",
  ].join("\n");
}

function llms(origin, full = false) {
  const lines = [
    "# ReviewKare",
    "",
    "> ReviewKare collects customer reviews with a QR code and manages replies to",
    "> Google Business Profile reviews. Customers choose and publish their own",
    "> review. Owners approve every reply before it is published.",
    "",
    "Canonical site: " + origin + "/",
    "Language: English (en-IN)",
    "Pricing: fixed prepaid access periods with no automatic renewal. See /pricing for available terms.",
    "No ranking, rating, or compliance outcome is guaranteed.",
    "",
    "## Product facts",
    "",
    "- QR flow: guest scans, picks a rating, ticks configured attributes, receives",
    "  three to five first-person drafts built only from those selections, edits one,",
    "  and posts it to Google themselves. No rating gate and no preselected stars.",
    "- Reply flow: connect a Google Business Profile, fetch reviews, generate an",
    "  editable reply draft, approve the exact text, then publish to Google or copy it.",
    "- Guest drafts are deterministic templates, not generative AI. AI is optional",
    "  and used only for reply drafts after the owner enables it.",
    "- One workspace covers one location, one QR code, and one Business Profile.",
    "- Not offered: multi-location dashboards, team seats, white-label, automatic",
    "  WhatsApp or POS posting, bulk QR generation, ranking guarantees.",
    "",
    "## Pages",
    "",
    "- [Features](" + origin + "/features): both flows in detail",
    "- [Pricing](" + origin + "/pricing): plans, limits, fixed periods",
    "- [FAQ](" + origin + "/faq): QR, Google, AI, billing, and data answers",
    "- [Security](" + origin + "/security): isolation, encryption, access control",
    "- [Privacy](" + origin + "/privacy): data collected and retention",
    "- [QR kit](" + origin + "/qr-kit): printing and placement guidance",
    "- [Google review link generator](" +
      origin +
      "/tools/google-review-link-generator)",
    "- [Guides](" + origin + "/blog): review and reply guidance",
    "- [Contact](" + origin + "/contact)",
    "",
    "## Guides",
    "",
    ...BLOG.list().map(
      (article) =>
        "- [" +
        article.title +
        "](" +
        origin +
        "/blog/" +
        article.slug +
        "): " +
        article.summary,
    ),
    "",
  ];
  if (!full) return lines.join("\n");
  lines.push(
    "## Crawl guidance",
    "",
    "- Index the public pages listed above and the guide URLs.",
    "- Do not index /app, /api, /q/, /a/, account pages, or signed approval links.",
    "- Quote the visible page text. Do not infer ratings, customer counts, or",
    "  outcomes that are not stated on the page.",
    "",
    "## Common questions, short answers",
    "",
    "- Does ReviewKare post reviews for customers? No. The customer edits and posts.",
    "- Does it filter unhappy customers? No. Every rating gets the same link.",
    "- Is a credit card required at signup? No card is collected at signup.",
    "- Does access renew automatically? No. Each purchase is a fixed period.",
    "- Can it publish without approval? No. Publishing sends the approved text only.",
    "",
  );
  return lines.join("\n");
}

function aiCatalog(origin) {
  return {
    name: "ReviewKare",
    url: origin + "/",
    description:
      "QR review collection plus Google Business Profile reply management for one location per workspace.",
    languages: ["en-IN"],
    documentation: origin + "/llms-full.txt",
    pages: Object.keys(PAGES)
      .filter((pathname) => {
        const meta = metaFor(pathname);
        return meta.indexable && !SITEMAP_EXCLUDE.has(pathname);
      })
      .map((pathname) => absolute(origin, pathname)),
    features: [
      "QR review composer with three to five grounded drafts",
      "configurable guest attributes per business",
      "Google Business Profile review fetch",
      "AI reply drafts with owner approval",
      "publish approved replies to Google",
      "copy-and-paste fallback without a Google connection",
    ],
    unavailable: [
      "multi-location dashboards",
      "team seats and delegated access",
      "automated WhatsApp or POS posting",
      "review gating or rating filters",
      "ranking or rating guarantees",
    ],
  };
}

module.exports = {
  PAGES,
  INDEX,
  NOINDEX,
  metaFor,
  absolute,
  sitemap,
  schemaFor,
  robots,
  llms,
  aiCatalog,
};

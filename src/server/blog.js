"use strict";
// Long-form guides published at /blog/<slug>. Static strings only: no user
// input, no database reads, so these pages are cheap to render and safe to
// cache. Every claim here is a general description of how Google reviews and
// QR codes work, not a measured statistic.

const ARTICLES = [
  {
    slug: "reply-to-negative-google-review",
    title: "How to reply to a negative Google review",
    description:
      "A practical reply structure for negative Google reviews, four worked examples, and the moves that turn a public complaint into a worse one.",
    date: "2026-11-18",
    updated: "2026-11-18",
    readMinutes: 8,
    topic: "Reputation",
    summary:
      "A negative review is read by every future customer who scrolls that far. The reply matters more than the rating.",
    body: `<p class="lead">A negative review is not a verdict on the business. It is a public message with an audience: the next person deciding whether to book. The reply is the part you control.</p>
<h2>Why the reply matters more than the star rating</h2>
<p>Prospects rarely read a single review in isolation. They read the complaint, then look for the owner's response. A calm, specific reply signals that someone is paying attention. A defensive reply confirms the complaint and adds a second one: the business cannot take feedback.</p>
<p>Nobody expects a perfect record. They expect a business that behaves well when something goes wrong.</p>
<h2>A five-part reply that works for most complaints</h2>
<ol class="mini-steps">
<li><strong>Thank them for the detail</strong><span>One short sentence. Not "thanks for the feedback" — reference what they described.</span></li>
<li><strong>Acknowledge the specific problem</strong><span>Name it: the wait, the bill, the room, the handoff. Vagueness reads as a template.</span></li>
<li><strong>Say what you have changed or checked</strong><span>Concrete and small beats grand and unverifiable. "We moved the pickup desk" is believable.</span></li>
<li><strong>Move the detail offline</strong><span>Give a name and a direct channel so the public thread does not become a negotiation.</span></li>
<li><strong>Close in one line</strong><span>No coupon, no condition, no request to edit the review.</span></li>
</ol>
<p>Keep the whole reply under roughly 120 words. Long replies look like arguments.</p>
<h2>Four worked examples</h2>
<h3>1. A long wait</h3>
<blockquote class="preserve">Thank you for describing the wait on Saturday. Forty minutes between courses is not the experience we want to run, and you are right that nobody explained the delay. We have changed how the kitchen flags a late table so the floor team can say something before a guest has to ask. If you are willing, email us and we will look at the specific booking. — Priya, owner</blockquote>
<p>The reply names the duration, accepts the service failure, and describes one operational change. It does not blame a staff member by name.</p>
<h3>2. A billing dispute</h3>
<blockquote class="preserve">Thank you for flagging the charge. I can see why an item you did not order is upsetting, and I am sorry it reached your bill. We are checking how it was entered at the counter. Please send the bill reference to our support address and we will resolve it directly, whether that means a correction or a refund. — Arjun, manager</blockquote>
<p>Do not argue about the amount in public. Offer a channel, not a conclusion.</p>
<h3>3. A complaint about a person</h3>
<blockquote class="preserve">I am sorry your visit felt rushed and that the handover was unclear. I have spoken with the team about how that appointment was closed out. I will not discuss an individual's employment in a public thread, but I would like to hear what happened from your side. Please contact me directly. — Meera, practice manager</blockquote>
<p>This is the one case where a little distance is correct. Acknowledge the experience, protect the employee, and keep the detail private.</p>
<h3>4. A review that looks fake or off-topic</h3>
<blockquote class="preserve">Thank you for the note. We cannot match this to a booking or a visit on our side, so we may be looking at the wrong record. If you did visit, please contact us with the date so we can look properly. If this review is not about our business, we will ask Google to review it under their content policy.</blockquote>
<p>Say what you can verify, then stop. Repeated public accusations of fakery rarely help.</p>
<h2>What not to do</h2>
<ul class="meta-list">
<li>Do not offer a discount, refund, or gift in exchange for editing or deleting the review. Incentivising review changes is against Google's review policies.</li>
<li>Do not paste the same reply across every review. Duplicate wording is obvious and reads as automated.</li>
<li>Do not reveal private booking, medical, or payment details in a public thread.</li>
<li>Do not reply while angry. Draft it, wait, then edit.</li>
<li>Do not ask staff to post counter-reviews. It is easy to detect and it damages trust.</li>
</ul>
<h2>When to ask Google to remove a review</h2>
<p>Removal is for policy violations, not for disagreement. Typical grounds are spam, advertising, off-topic content, hate speech, personal information, or a conflict of interest. A one-star review that accurately describes a bad visit is not a violation, and reporting it usually changes nothing.</p>
<p>If you believe a review breaks policy, flag it through Google and keep your own record of the request. Do not promise a customer that a review will disappear.</p>
<h2>A short checklist before you publish</h2>
<ol class="mini-steps">
<li><strong>Specific</strong><span>Does the reply mention what they actually described?</span></li>
<li><strong>Calm</strong><span>Would you be comfortable if a future customer read only this reply?</span></li>
<li><strong>Actionable</strong><span>Is there one concrete change or one clear next step?</span></li>
<li><strong>Private where needed</strong><span>Are personal and payment details out of the public text?</span></li>
<li><strong>Honest</strong><span>Does it avoid promising something the business cannot do?</span></li>
</ol>
<h2>Where ReviewKare fits</h2>
<p>ReviewKare fetches Google Business Profile reviews, drafts a reply from the review text, and holds it until you approve the exact wording. You can edit every sentence, then publish to Google or copy the text yourself. Nothing posts on a timer, and no reply is sent without a person approving it.</p>
<p><a class="button secondary" href="/features">See how the reply flow works</a></p>`,
  },
  {
    slug: "qr-codes-for-google-reviews",
    title: "QR codes for Google reviews: what they can and cannot do",
    description:
      "Where a review QR code helps, where it creates compliance risk, and how to test the customer journey before you print a thousand posters.",
    date: "2026-11-18",
    updated: "2026-11-18",
    readMinutes: 7,
    topic: "QR reviews",
    summary:
      "A QR code removes friction. It does not remove the customer's choice, and it cannot guarantee a review is published.",
    body: `<p class="lead">A QR code is a shortcut to a page. On its own it does not collect a review, and it does not make an unhappy customer happy. Used well, it removes the small friction that stops a satisfied customer from writing anything at all.</p>
<h2>What a review QR code can do</h2>
<ul class="meta-list">
<li>Open the right destination in one scan, without asking a customer to search for your business.</li>
<li>Show a short, mobile-first page with your business name and a rating picker.</li>
<li>Offer a starting point — a few drafts built from what the customer selected — so the page is not blank.</li>
<li>Send the customer to Google with the review box already open.</li>
</ul>
<h2>What it cannot do</h2>
<ul class="meta-list">
<li>It cannot confirm that a review was posted. Google does not report that back to a QR page.</li>
<li>It cannot filter customers by rating. Routing only happy customers to a review link is review gating and is against Google's policies.</li>
<li>It cannot preselect stars or write the review for the customer.</li>
<li>It cannot promise a ranking, a rating, or a number of reviews.</li>
<li>It cannot replace the moment of service. A QR code on a table does not fix a bad visit.</li>
</ul>
<h2>The link behind the code</h2>
<p>For a single location, the simplest destination is Google's write-review URL with your Place ID:</p>
<pre><code>https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID</code></pre>
<p>The Place ID is a stable identifier for the location. It is not the same as a CID, a short link, or the text in the Maps URL. If the Place ID is wrong, the page can open the wrong business or fail entirely, and a printed code cannot be recalled.</p>
<p>ReviewKare includes a <a href="/tools/google-review-link-generator">review link generator</a> that builds and tests the URL before you print it.</p>
<h2>Where to place the code</h2>
<ol class="mini-steps">
<li><strong>At the counter</strong><span>Eye level, reachable from a phone, with one sentence of context from staff.</span></li>
<li><strong>On the bill folder</strong><span>The customer is already holding it and the visit is fresh.</span></li>
<li><strong>On a table card or room key</strong><span>Useful where the visit ends away from the till.</span></li>
<li><strong>At the end of a service</strong><span>Better than a poster in a corridor nobody reads.</span></li>
</ol>
<p>Do not put the code where a customer has to install an app, join a Wi-Fi network, or create an account first. Every extra step loses people.</p>
<h2>Test the journey before printing</h2>
<ol class="mini-steps">
<li><strong>Scan with a real phone</strong><span>Not a desktop preview. Check the page on a small screen.</span></li>
<li><strong>Use a private window</strong><span>Confirms the page works without your logged-in session.</span></li>
<li><strong>Check the destination business</strong><span>Open the Google link and confirm the name and address.</span></li>
<li><strong>Try a low rating</strong><span>The composer must still produce honest drafts. If it hides them, you have built a gate.</span></li>
<li><strong>Print one copy first</strong><span>Scan the printed version. Screens can read codes that paper cannot.</span></li>
</ol>
<h2>Measuring without inventing numbers</h2>
<p>You can count QR page opens and draft requests in your own workspace. You cannot see how many of those became live Google reviews, because Google does not expose that event to the QR page. Treat scan counts as interest, not as published reviews.</p>
<p>If you need a real before-and-after, record the public review count on a fixed date each month and compare it with your own draft volume. Do not present a scan count as a review count.</p>
<h2>Compliance rules worth knowing</h2>
<ul class="meta-list">
<li>No incentives for reviews. Offering a discount or a prize in exchange for a review is against Google's policies.</li>
<li>No selective routing by rating. Everyone gets the same link and the same options.</li>
<li>No bulk or fake reviews, including reviews written by staff or family.</li>
<li>No request to remove or edit a review as a condition of service.</li>
</ul>
<p>ReviewKare is built around these limits: the same QR for every customer, no rating gate, and drafts that mention only what the customer selected.</p>
<h2>Start with one location</h2>
<p>Print one code, test it on two phones, and watch the first twenty scans before you order posters. If the destination or the business name changes, reprint. A QR code on paper is a commitment.</p>
<p><a class="button secondary" href="/qr-kit">Open the QR kit</a></p>`,
  },
  {
    slug: "find-google-place-id",
    title: "Find your Google Place ID and test a review link",
    description:
      "Where to find a Google Place ID, how it differs from a CID or short link, and a five-minute test that catches a wrong destination before printing.",
    date: "2026-11-18",
    updated: "2026-11-18",
    readMinutes: 6,
    topic: "Google Business Profile",
    summary:
      "Most broken review links are a wrong identifier, not a broken QR code. Find the Place ID once and verify it twice.",
    body: `<p class="lead">A review link is only as good as the identifier inside it. Google uses several: a Place ID, a CID, a Maps URL, and short links. They are not interchangeable.</p>
<h2>What a Place ID is</h2>
<p>A Place ID is a stable text identifier for a place in Google's database. It looks like a long string of letters, numbers, and underscores. It does not change when the business updates its name, hours, or photos, which is why it is safer for a printed QR code than a URL copied from a browser.</p>
<h2>How to find it</h2>
<ol class="mini-steps">
<li><strong>Open Google Maps</strong><span>Search for the exact business and confirm the address and category.</span></li>
<li><strong>Open the Place ID Finder</strong><span>Google publishes a Place ID Finder tool for developers. Search the same business there.</span></li>
<li><strong>Copy the full ID</strong><span>Select the whole string. A truncated ID is the most common cause of a broken link.</span></li>
<li><strong>Paste it into your workspace</strong><span>ReviewKare stores the Place ID on the workspace and builds the review URL from it.</span></li>
</ol>
<h2>Place ID is not a CID</h2>
<p>A CID is a numeric identifier that appears in some Maps URLs. A Place ID is a text identifier used by the Places API. A review link built with a CID may work in a browser, but it is not the same value and should not be substituted in a Place ID field.</p>
<p>Short links such as <code>g.page/...</code> can also work, but they hide the destination and can be redirected or revoked. For print, prefer a direct URL you control.</p>
<h2>Test the link in five minutes</h2>
<ol class="mini-steps">
<li><strong>Open the generated URL in a private window</strong><span>You should see the review box for the correct business.</span></li>
<li><strong>Check the business name and address</strong><span>Not just the name. Chains share names across cities.</span></li>
<li><strong>Try it on a phone</strong><span>Confirm the page loads without an app install prompt.</span></li>
<li><strong>Scan the printed QR</strong><span>Test the actual paper, not just the screen.</span></li>
<li><strong>Try a second location</strong><span>If you run more than one, confirm each has its own Place ID and workspace.</span></li>
</ol>
<h2>Common mistakes</h2>
<ul class="meta-list">
<li><strong>Wrong location in a chain.</strong> The name matches, the address does not.</li>
<li><strong>Place ID from a search result, not the place.</strong> Search results and places can carry different identifiers.</li>
<li><strong>Trailing characters lost in copy.</strong> The ID looks plausible but points nowhere.</li>
<li><strong>One code for several locations.</strong> A single QR cannot serve two Place IDs.</li>
<li><strong>Printing before testing.</strong> A wrong code on a thousand receipts is expensive to undo.</li>
</ul>
<h2>What to do when the link opens the wrong business</h2>
<p>Do not adjust the URL by hand. Go back to Maps, confirm the exact location, copy the Place ID again, and replace the stored value. If the business recently moved or merged listings, the old Place ID can point at a closed location. In that case, reprint the QR after the new listing is verified.</p>
<h2>Build and test the link</h2>
<p>The <a href="/tools/google-review-link-generator">Google review link generator</a> turns a Place ID into a review URL you can copy and test. It runs in the browser and does not store the ID.</p>
<p><a class="button secondary" href="/tools/google-review-link-generator">Open the link generator</a></p>`,
  },
];

const bySlug = new Map(ARTICLES.map((article) => [article.slug, article]));

function article(slug) {
  return bySlug.get(slug) || null;
}

function list() {
  return ARTICLES.slice().sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = { ARTICLES, article, list };

"use strict";
const { escape: e } = require("./security");

const comparisons = {
  "/compare/google-review-link": {
    title: "A direct Google review link or a QR review composer?",
    answer: "Use a direct link when customers are ready to write. Use the composer when they would benefit from editable wording based on the details they choose. The customer opens Google and posts the review.",
    columns: ["Direct Google link", "ReviewKare QR flow"],
    rows: [
      ["Customer steps", "Open Google, write, and submit.", "Scan, choose details, edit a draft, and submit it on Google."],
      ["Business setup", "Find and share the Google review link.", "Configure one workspace, a Place ID and optional prompts, then share the workspace QR."],
      ["Best fit", "A text message, email, or a short path to the review form.", "A counter sign or printed poster where guests may want writing help."],
      ["Who publishes", "The customer.", "The customer."],
    ],
    related: [["/tools/google-review-link-generator", "Build a direct Google review link"], ["/qr-kit", "See the QR kit"]],
  },
  "/compare/manual-review-replies": {
    title: "Manual Google replies or a review reply workspace?",
    answer: "Reply directly in Google when one person manages a small queue. A ReviewKare workspace adds a draft and approval step, with publishing available when a Business Profile connection is configured.",
    columns: ["Direct Google reply", "ReviewKare workspace"],
    rows: [
      ["Where you work", "Open the review in Google Business Profile.", "Review the text and draft in one workspace."],
      ["Drafting", "Write the reply yourself.", "Start with a template or an optional AI draft when available."],
      ["Approval", "The person in Google checks the reply before posting.", "Review and approve the exact reply before publishing or copying it."],
      ["Best fit", "A small queue with one owner.", "A repeated draft-and-review process for one location."],
    ],
    related: [["/features", "Review the reply workflow"], ["/blog/reply-to-negative-google-review", "Read the guide to negative-review replies"]],
  },
};

function comparison(pathname) {
  const page = comparisons[pathname];
  if (!page) return null;
  const table = page.rows.map(([label, left, right]) =>
    `<tr><th scope="row">${e(label)}</th><td>${e(left)}</td><td>${e(right)}</td></tr>`).join("");
  return `<article class="section flush"><h1>${e(page.title)}</h1><p class="lead">${e(page.answer)}</p>
    <div class="table-scroll"><table><thead><tr><th scope="col">Task</th>
    ${page.columns.map(column => `<th scope="col">${e(column)}</th>`).join("")}</tr></thead>
    <tbody>${table}</tbody></table></div><h2>Related guides and tools</h2><ul class="meta-list">
    ${page.related.map(([href, text]) => `<li><a href="${e(href)}">${e(text)}</a></li>`).join("")}
    </ul></article>`;
}

module.exports = { comparison };

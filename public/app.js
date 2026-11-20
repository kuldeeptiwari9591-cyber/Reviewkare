"use strict";
document.documentElement.classList.add("js");
const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
function status(node, text, error = false) {
  if (!node) return;
  node.textContent = text;
  node.className = "status " + (error ? "error" : "success");
}
async function request(endpoint, body, method = "POST") {
  const response = await fetch(endpoint, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
    body: JSON.stringify(body),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      "The server returned an unexpected response. Please try again.",
    );
  }
  if (!response.ok || result.success === false)
    throw new Error(result.error || "The request failed. Please try again.");
  return result;
}
function renderDrafts(drafts) {
  const list = document.getElementById("draft-options"),
    editor = document.getElementById("customer-text");
  if (!list) return;
  list.textContent = "";
  drafts.forEach((draft, index) => {
    const label = document.createElement("label");
    label.className = "draft-option";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "draft-choice";
    radio.value = draft.id;
    radio.checked = index === 0;
    const body = document.createElement("span");
    body.className = "draft-option-body";
    const style = document.createElement("strong");
    style.textContent = draft.style;
    const text = document.createElement("span");
    text.className = "draft-option-text";
    text.textContent = draft.text;
    body.append(style, text);
    label.append(radio, body);
    radio.addEventListener("change", () => {
      if (editor) editor.value = draft.text;
    });
    list.append(label);
  });
  const result = document.getElementById("draft-result");
  if (result) result.hidden = false;
  if (editor) {
    editor.value = drafts[0]?.text || "";
    document
      .getElementById("draft-result")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
for (const form of document.querySelectorAll("form[data-api]"))
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('[type="submit"]'),
      output = form.querySelector(".status");
    button.disabled = true;
    status(output, "Working…");
    try {
      const data = new FormData(form);
      const body = Object.fromEntries(data.entries());
      const isCustomer = form.id === "customer-draft";
      if (isCustomer) {
        if (!body.rating) throw new Error("Choose your rating first.");
        body.attributes = data.getAll("attributes");
      }
      const result = await request(
        form.dataset.api,
        body,
        form.dataset.method || "POST",
      );
      if (isCustomer && Array.isArray(result.drafts)) {
        renderDrafts(result.drafts);
        status(
          output,
          `${result.drafts.length} drafts ready. Pick one, then edit it.`,
        );
      } else if (result.approvalUrl) {
        status(output, "Approval link created. It expires in 24 hours. ");
        const anchor = document.createElement("a");
        anchor.href = result.approvalUrl;
        anchor.textContent = "Open approval link";
        output.append(anchor);
      } else if (result.orderId) {
        await checkout(result, output);
      } else if (result.redirect) {
        window.location.assign(result.redirect);
      } else {
        status(output, result.message || "Saved.");
        if (form.dataset.reload === "true") {
          setTimeout(() => window.location.reload(), 700);
        } else if (form.dataset.method === "DELETE") window.location.reload();
      }
    } catch (error) {
      status(
        output,
        error.message || "Connection failed. Your action was not confirmed.",
        true,
      );
    } finally {
      button.disabled = false;
    }
  });
async function copy(text, source, output) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error();
    await navigator.clipboard.writeText(text);
    status(output, "Copied. Paste the text yourself when you are ready.");
  } catch {
    source.focus();
    source.select();
    status(
      output,
      "Automatic copying is unavailable. Select and copy the text manually.",
      true,
    );
  }
}
document.getElementById("copy-customer")?.addEventListener("click", () => {
  const source = document.getElementById("customer-text"),
    output = document.getElementById("copy-status");
  if (!document.getElementById("confirm-experience").checked) {
    status(
      output,
      "Confirm that you checked the text and it reflects your experience.",
      true,
    );
    return;
  }
  copy(source.value, source, output);
});
for (const button of document.querySelectorAll("[data-copy-target]"))
  button.addEventListener("click", () => {
    const source = document.getElementById(button.dataset.copyTarget);
    let output = button.parentElement.querySelector(".copy-status");
    if (!output) {
      output = document.createElement("p");
      output.className = "copy-status";
      output.setAttribute("role", "status");
      button.parentElement.append(output);
    }
    copy(source.value, source, output);
  });
for (const button of document.querySelectorAll("[data-retry]"))
  button.addEventListener("click", () => location.reload());
function draftCardElement(reviewId, candidate) {
  const label = document.createElement("label");
  label.className = "draft-card";
  const choice = document.createElement("input");
  choice.type = "radio";
  choice.name = "draft-" + reviewId;
  choice.value = candidate.id;
  if (candidate.selected) choice.checked = true;
  const body = document.createElement("span");
  body.className = "draft-body";
  const style = document.createElement("strong");
  style.textContent = candidate.style || "Draft";
  const model = document.createElement("small");
  model.textContent = candidate.label || candidate.model || "";
  const text = document.createElement("span");
  text.className = "preserve";
  text.textContent = candidate.draftText || "";
  const meta = document.createElement("small");
  meta.className = "muted";
  meta.textContent =
    "Match score " +
    (Number(candidate.score) || 0) +
    "/100 · " +
    (Number(candidate.latencyMs) || 0) +
    " ms";
  body.append(style, document.createTextNode(" "), model, text, meta);
  label.append(choice, body);
  return label;
}
function renderDrafts(list, reviewId, candidates) {
  list.replaceChildren(
    ...candidates.map((candidate) => draftCardElement(reviewId, candidate)),
  );
}
for (const button of document.querySelectorAll("[data-generate-drafts]"))
  button.addEventListener("click", async () => {
    const reviewId = button.dataset.generateDrafts,
      panel = button.closest(".ai-drafts"),
      output = panel?.querySelector(".status"),
      list = panel?.querySelector("[data-draft-list]");
    button.disabled = true;
    status(
      output,
      "Asking the configured models. This can take a few seconds…",
    );
    try {
      const result = await request(
        "/api/reviews/" + encodeURIComponent(reviewId) + "/drafts",
        {},
      );
      if (result.candidates?.length && list) {
        renderDrafts(list, reviewId, result.candidates);
        status(output, result.message || "Drafts ready. Select one to use.");
      } else {
        if (list) list.replaceChildren();
        status(
          output,
          result.message ||
            "No usable AI draft came back. Use the standard template.",
          true,
        );
      }
    } catch (error) {
      status(
        output,
        error.message ||
          "AI drafting failed. Your existing draft is unchanged.",
        true,
      );
    } finally {
      button.disabled = false;
    }
  });
for (const button of document.querySelectorAll("[data-use-draft]"))
  button.addEventListener("click", async () => {
    const reviewId = button.dataset.useDraft,
      panel = button.closest(".ai-drafts"),
      output = panel?.querySelector(".status"),
      checked = panel?.querySelector(
        '[data-draft-list] input[type="radio"]:checked',
      );
    if (!checked) {
      status(output, "Choose one draft first.", true);
      return;
    }
    button.disabled = true;
    try {
      const result = await request(
        "/api/reviews/" +
          encodeURIComponent(reviewId) +
          "/drafts/" +
          encodeURIComponent(checked.value) +
          "/select",
        {},
      );
      const field = document.querySelector(
        '[data-reply-text="' + reviewId + '"]',
      );
      if (field && result.review?.reply?.draftText) {
        field.value = result.review.reply.draftText;
        field.focus();
      }
      status(
        output,
        result.message || "Draft selected. Edit and approve it below.",
      );
    } catch (error) {
      status(output, error.message, true);
    } finally {
      button.disabled = false;
    }
  });
document
  .getElementById("link-generator")
  ?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget,
      id = new FormData(form).get("placeId");
    const output = form.querySelector(".status");
    output.replaceChildren();
    const link = document.createElement("a");
    link.href =
      "https://search.google.com/local/writereview?placeid=" +
      encodeURIComponent(id);
    link.textContent = link.href;
    output.append(link);
  });
document
  .getElementById("print-poster")
  ?.addEventListener("click", () => window.print());
let checkoutPromise;
async function checkout(order, output) {
  status(
    output,
    `Total ${order.amountDisplay} for ${order.durationDays} days. No automatic renewal. Preparing secure checkout…`,
  );
  if (!checkoutPromise)
    checkoutPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Could not load checkout. No payment was confirmed."));
      document.head.append(script);
    });
  await checkoutPromise;
  const checkout = new window.Razorpay({
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "ReviewKare",
    description: order.planName,
    handler: async (response) => {
      try {
        const result = await request("/api/billing/verify", response);
        status(output, result.message);
        window.location.assign("/app/billing");
      } catch (error) {
        status(
          output,
          error.message +
            " If charged, contact support with the payment reference; do not pay again.",
          true,
        );
      }
    },
    modal: {
      ondismiss: () =>
        status(
          output,
          "Checkout closed. No payment has been confirmed by this page.",
        ),
    },
  });
  checkout.on("payment.failed", () =>
    status(output, "Payment failed. Your access has not been changed.", true),
  );
  checkout.open();
}
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "Close" : "Menu";
  });
  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a") && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.textContent = "Menu";
      navToggle.focus();
    }
  });
}
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function countUp(element) {
  if (element.dataset.counted) return;
  element.dataset.counted = "1";
  const target = Number(element.dataset.count) || 0;
  if (reduceMotion.matches || target === 0) {
    element.textContent = String(target);
    return;
  }
  const start = performance.now();
  const duration = Math.min(1500, 500 + target * 10);
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(tick);
    else element.textContent = String(target);
  }
  window.requestAnimationFrame(tick);
}
const revealTargets = document.querySelectorAll(".reveal");
const countTargets = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  for (const target of revealTargets) revealObserver.observe(target);
  const countObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.4 },
  );
  for (const target of countTargets) countObserver.observe(target);
} else {
  for (const target of revealTargets) target.classList.add("is-visible");
  for (const target of countTargets) countUp(target);
}
reduceMotion.addEventListener?.("change", () => {
  for (const target of countTargets) {
    if (target.dataset.counted) target.textContent = target.dataset.count;
  }
});

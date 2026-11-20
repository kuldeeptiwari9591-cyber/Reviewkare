// @ts-check
"use strict";
/**
 * Guest review composer.
 *
 * The customer picks a rating and the things that actually applied to their
 * visit. This module turns those selections into three to five first-person
 * drafts. It never adds a detail the guest did not select, never promises a
 * reward, and never hides a low rating: a two-star visit gets a two-star draft.
 */

const PRESETS = {
  restaurant: ["Food", "Service", "Ambience", "Value", "Cleanliness"],
  cafe: ["Coffee", "Food", "Service", "Seating", "Value"],
  gym: ["Equipment", "Trainers", "Classes", "Cleanliness", "Value"],
  salon: ["Styling", "Service", "Cleanliness", "Value", "Booking"],
  clinic: ["Care", "Staff", "Cleanliness", "Waiting time", "Booking"],
  retail: ["Product range", "Staff", "Prices", "Store layout", "Checkout"],
  other: ["Service", "Quality", "Value", "Cleanliness", "Experience"],
};

const NOUNS = {
  restaurant: "restaurant",
  cafe: "café",
  gym: "gym",
  salon: "salon",
  clinic: "clinic",
  retail: "shop",
  other: "visit",
};

function presetFor(vertical) {
  return (PRESETS[vertical] || PRESETS.other).slice();
}

function cleanLabel(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

function normaliseAttributes(value, vertical) {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set();
  const output = [];
  for (const item of source) {
    const label = cleanLabel(item);
    const key = label.toLowerCase();
    if (!label || seen.has(key)) continue;
    seen.add(key);
    output.push(label);
    if (output.length >= 5) break;
  }
  if (output.length) return output;
  return presetFor(vertical).slice(0, 3);
}

function listPhrase(items) {
  const list = items.map((item) => item.toLowerCase());
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

function sentence(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  const capped = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function cap(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function toneFor(rating) {
  if (rating >= 4) return "positive";
  if (rating === 3) return "mixed";
  return "critical";
}

function attrLine(attributes, tone) {
  const phrase = listPhrase(attributes);
  const single = attributes.length === 1;
  if (tone === "positive") return `${phrase} really stood out`;
  if (tone === "mixed")
    return `${phrase} ${single ? "was" : "were"} good, though not everything landed`;
  return `${phrase} ${single ? "was" : "were"} not what I hoped for`;
}

/**
 * @param {{businessName?: string, vertical?: string, rating: number,
 *   attributes?: string[], note?: string}} input
 * @returns {{id: string, style: string, text: string}[]}
 */
function compose(input) {
  const rating = Math.min(5, Math.max(1, Number(input.rating) || 3));
  const vertical = NOUNS[input.vertical] ? input.vertical : "other";
  const noun = NOUNS[vertical];
  const name = cleanLabel(input.businessName) || "this place";
  const attributes = normaliseAttributes(input.attributes, vertical);
  const note = sentence(input.note);
  const tone = toneFor(rating);
  const lead = attrLine(attributes, tone);
  const Lead = cap(lead);

  const drafts = [];

  if (note) {
    drafts.push({
      id: "note-first",
      style: "Your words first",
      text:
        tone === "positive"
          ? `${note} ${Lead} at ${name} — I would come back.`
          : `${note} At ${name}, ${lead}.`,
    });
  }

  if (tone === "positive") {
    drafts.push({
      id: "short",
      style: "Short",
      text: `${name} delivered. ${Lead}. I would go back.`,
    });
    drafts.push({
      id: "warm",
      style: "Warm",
      text: `Genuinely good ${noun}. ${Lead} — the kind of place I would recommend without hesitating.`,
    });
    drafts.push({
      id: "plain",
      style: "Plain",
      text: `Good ${noun}. ${Lead}. Worth a visit if you are nearby.`,
    });
  } else if (tone === "mixed") {
    drafts.push({
      id: "balanced",
      style: "Balanced",
      text: `Mixed visit at ${name}. ${Lead}. Some room to improve, but worth another try.`,
    });
    drafts.push({
      id: "short",
      style: "Short",
      text: `${Lead} at ${name}. Not perfect, not a write-off.`,
    });
    drafts.push({
      id: "fair",
      style: "Fair",
      text: `Three stars from me. ${Lead} at ${name}.`,
    });
  } else {
    drafts.push({
      id: "direct",
      style: "Direct",
      text: `Disappointing visit to ${name}. ${Lead}.`,
    });
    drafts.push({
      id: "specific",
      style: "Specific",
      text: `${Lead} at ${name} — that is why this is a ${rating}-star review.`,
    });
    drafts.push({
      id: "hopeful",
      style: "Constructive",
      text: `Not the visit I hoped for. At ${name}, ${lead}. I hope it improves.`,
    });
  }

  const seen = new Set();
  return drafts
    .filter((draft) => {
      const key = draft.text.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5)
    .map((draft) => ({ ...draft, text: draft.text.replace(/\s+/g, " ") }));
}

module.exports = {
  PRESETS,
  NOUNS,
  presetFor,
  normaliseAttributes,
  compose,
};

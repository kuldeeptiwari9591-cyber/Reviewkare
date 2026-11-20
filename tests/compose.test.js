"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  PRESETS,
  presetFor,
  normaliseAttributes,
  compose,
} = require("../src/server/compose");

test("vertical presets are copied and unknown types fall back safely", () => {
  const first = presetFor("restaurant");
  assert.deepEqual(first, PRESETS.restaurant);
  first.push("Injected");
  assert.ok(!PRESETS.restaurant.includes("Injected"));

  assert.deepEqual(presetFor("submarine"), PRESETS.other);
  assert.equal(presetFor(null).length, 5);
});

test("attributes are cleaned, de-duplicated, capped, and never empty", () => {
  assert.deepEqual(
    normaliseAttributes(["  Food  ", "food", "Service", "", "Value"], "cafe"),
    ["Food", "Service", "Value"],
  );
  assert.equal(
    normaliseAttributes(["A", "B", "C", "D", "E", "F", "G"], "other").length,
    5,
  );
  assert.ok(normaliseAttributes([], "gym").length > 0);
  assert.ok(normaliseAttributes(undefined, "gym").length > 0);
  assert.deepEqual(normaliseAttributes([], "cafe"), presetFor("cafe").slice(0, 3));
});

test("a five-star visit gets three to five upbeat drafts", () => {
  const drafts = compose({
    businessName: "Northside Cafe",
    vertical: "cafe",
    rating: 5,
    attributes: ["Coffee", "Seating"],
  });
  assert.ok(drafts.length >= 3 && drafts.length <= 5);
  for (const draft of drafts) {
    assert.ok(draft.id && draft.style && draft.text.length > 20);
    assert.ok(/[.!?]$/.test(draft.text), draft.text);
    assert.ok(!/\s{2,}/.test(draft.text), draft.text);
    assert.ok(!/undefined|null|\[|\]/i.test(draft.text), draft.text);
  }
  const joined = drafts.map((draft) => draft.text).join(" ");
  assert.ok(/coffee and seating really stood out/i.test(joined));
  assert.ok(!/not what I hoped for/i.test(joined));
});

test("a one-star visit is honestly negative and never recommends the business", () => {
  const drafts = compose({
    businessName: "Northside Gym",
    vertical: "gym",
    rating: 1,
    attributes: ["Equipment"],
  });
  assert.ok(drafts.length >= 3 && drafts.length <= 5);
  const joined = drafts.map((draft) => draft.text).join(" ");
  assert.ok(joined.includes("1-star review"));
  assert.ok(!/would come back|recommend without hesitating|worth a visit/i.test(joined));
  // Singular agreement for a single attribute.
  assert.ok(/equipment was not what I hoped for/i.test(joined));
});

test("plural agreement and a three-star balance are used for mixed visits", () => {
  const mixed = compose({
    businessName: "Northside Salon",
    vertical: "salon",
    rating: 3,
    attributes: ["Styling", "Booking"],
  });
  const text = mixed.map((draft) => draft.text).join(" ");
  assert.ok(/styling and booking were good, though not everything landed/i.test(text));
  assert.ok(text.includes("Three stars from me"));

  const single = compose({ rating: 3, attributes: ["Styling"] });
  assert.ok(
    /styling was good/i.test(
      single.map((draft) => draft.text).join(" "),
    ),
  );
});

test("the guest's own words come first and unsupported details never appear", () => {
  const drafts = compose({
    businessName: "Northside Dental",
    vertical: "clinic",
    rating: 2,
    attributes: ["Care"],
    note: "the reception desk helped me sort an appointment",
  });
  const first = drafts[0];
  assert.equal(first.id, "note-first");
  assert.ok(first.text.startsWith("The reception desk helped me sort an appointment."));

  const joined = drafts.map((draft) => draft.text).join(" ");
  assert.ok(!/price|refund|insurance|parking/i.test(joined));
  assert.ok(!/https?:/i.test(joined));

  // Deterministic output: the same input never produces different drafts.
  assert.deepEqual(
    compose({
      businessName: "Northside Dental",
      vertical: "clinic",
      rating: 2,
      attributes: ["Care"],
      note: "the reception desk helped me sort an appointment",
    }),
    drafts,
  );
});

test("drafts are de-duplicated and capped at five", () => {
  const drafts = compose({
    businessName: "Northside Retail",
    vertical: "retail",
    rating: 4,
    attributes: ["Staff", "Prices", "Checkout", "Product range", "Store layout"],
    note: "Quick trip.",
  });
  assert.ok(drafts.length <= 5);
  const texts = drafts.map((draft) => draft.text.toLowerCase());
  assert.equal(new Set(texts).size, texts.length);
});

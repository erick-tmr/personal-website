/* ===========================================================================
   Presentation helpers for the save editor.

   The pending-changes list is what a visitor is asked to trust before they
   download anything, so its ordering, its offsets and its "no change" rules
   are pinned here rather than checked by eye.
   =========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";

import {
  checksumView,
  diffRows,
  errorKeys,
  formatNumber,
  hex,
  machineView,
  nameRemaining,
  outputFileName
} from "../web/js/tools/yellow-legacy/editor-format.js";

const block = (over = {}) => ({
  name: "RED",
  trainerId: 1234,
  money: 100,
  coins: 0,
  badges: new Array(8).fill(false),
  towns: new Array(11).fill(false),
  ...over
});

test("hex pads and uppercases", () => {
  assert.equal(hex(0x2641), "0x2641");
  assert.equal(hex(0x01, 2), "0x01");
  assert.equal(hex(0xff, 2), "0xFF");
  assert.equal(hex(0x7ff), "0x07FF");
});

test("formatNumber follows the language", () => {
  assert.equal(formatNumber(1234567, "en"), "1,234,567");
  assert.equal(formatNumber(1234567, "pt"), "1.234.567");
  assert.equal(formatNumber(0, "en"), "0");
  assert.equal(formatNumber(null, "en"), "0");
});

test("diffRows", async (t) => {
  await t.test("is empty when nothing changed", () => {
    const orig = block();
    assert.deepEqual(diffRows(orig, { ...orig, badges: orig.badges.slice(), towns: orig.towns.slice() }), []);
  });

  await t.test("is empty without a loaded save", () => {
    assert.deepEqual(diffRows(null, null), []);
    assert.deepEqual(diffRows(block(), null), []);
  });

  await t.test("reports each field at the offset it is written to", () => {
    const orig = block();
    const rows = diffRows(orig, block({ name: "ASH", money: 999, trainerId: 7, coins: 50 }), "en");
    assert.deepEqual(
      rows.map((r) => [r.offset, r.labelKey]),
      [
        ["0x2598", "ylDiffName"],
        ["0x2641", "ylDiffMoney"],
        ["0x2653", "ylDiffId"],
        ["0x289E", "ylDiffCoins"]
      ]
    );
  });

  await t.test("shows before and after, grouped for the language", () => {
    const rows = diffRows(block({ money: 1000 }), block({ money: 456789 }), "pt");
    assert.deepEqual(rows[0].before, "1.000");
    assert.deepEqual(rows[0].after, "456.789");
  });

  await t.test("summarises badges as a count and a mask", () => {
    const badges = new Array(8).fill(false);
    badges[0] = true;
    badges[7] = true;
    const rows = diffRows(block(), block({ badges }), "en");
    assert.equal(rows[0].labelKey, "ylDiffBadges");
    assert.equal(rows[0].offset, "0x2650");
    assert.equal(rows[0].before, "0 · 0x00");
    assert.equal(rows[0].after, "2 · 0x81");
  });

  await t.test("summarises towns as a count", () => {
    const towns = new Array(11).fill(true);
    const rows = diffRows(block(), block({ towns }), "en");
    assert.equal(rows[0].labelKey, "ylDiffTowns");
    assert.equal(rows[0].offset, "0x29B7");
    assert.deepEqual([rows[0].before, rows[0].after], ["0", "11"]);
  });

  await t.test("renders an emptied name as a dash rather than a blank cell", () => {
    const rows = diffRows(block({ name: "RED" }), block({ name: "" }), "en");
    assert.equal(rows[0].after, "—");
  });

  await t.test("ignores a flag change that cancels out", () => {
    const towns = new Array(11).fill(false);
    towns[2] = true;
    const orig = block({ towns });
    assert.deepEqual(diffRows(orig, block({ towns: towns.slice() })), []);
  });
});

test("machineView covers every phase", () => {
  assert.deepEqual(machineView("idle"), { tone: "idle", statusKey: "ylStatusIdle" });
  assert.deepEqual(machineView("loaded"), { tone: "loaded", statusKey: "ylStatusLoaded" });
  assert.deepEqual(machineView("edited"), { tone: "edited", statusKey: "ylStatusEdited" });
  assert.deepEqual(machineView("error"), { tone: "error", statusKey: "ylStatusError" });
  assert.deepEqual(machineView("nonsense"), machineView("idle"));
});

test("checksumView", () => {
  assert.equal(checksumView(null).tone, "idle");
  assert.equal(checksumView({ ok: true }).labelKey, "ylChecksumOk");
  assert.equal(checksumView({ ok: true }).tone, "green");
  assert.equal(checksumView({ ok: false }).labelKey, "ylChecksumBad");
  assert.equal(checksumView({ ok: false }).noteKey, "ylChecksumBadNote");
});

test("errorKeys", () => {
  assert.equal(errorKeys(null), null);
  assert.deepEqual(errorKeys("vanillaSave"), { titleKey: "ylErrVanilla", bodyKey: "ylErrVanillaMsg" });
  assert.deepEqual(errorKeys("badSize"), { titleKey: "ylErrBadSize", bodyKey: "ylErrBadSizeMsg" });
  // an unknown code still renders a message rather than an empty alert
  assert.deepEqual(errorKeys("something-new"), { titleKey: "ylErrRead", bodyKey: "ylErrReadMsg" });
});

test("outputFileName", () => {
  assert.equal(outputFileName("PKMN_YLW.sav"), "PKMN_YLW-edited.sav");
  assert.equal(outputFileName("PKMN_YLW.SAV"), "PKMN_YLW-edited.sav");
  assert.equal(outputFileName("MY.SAVE.sav"), "MY.SAVE-edited.sav");
  assert.equal(outputFileName(""), "yellow-legacy-edited.sav");
  assert.equal(outputFileName(".sav"), "yellow-legacy-edited.sav");
  assert.equal(outputFileName("no-extension"), "no-extension-edited.sav");
});

test("nameRemaining never goes negative", () => {
  assert.equal(nameRemaining(null, 10), 10);
  assert.equal(nameRemaining({ name: "RED" }, 10), 7);
  assert.equal(nameRemaining({ name: "ABCDEFGHIJ" }, 10), 0);
});

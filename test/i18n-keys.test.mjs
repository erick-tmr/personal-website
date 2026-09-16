/* ===========================================================================
   i18n key integrity across every page.

   Hand-porting a couple of hundred keys in two languages is exactly where a
   typo hides: a mistyped data-i18n silently renders the English fallback
   forever, and a key present in one language only silently blanks the node in
   the other. Both are invisible in a quick browser pass, so they are asserted
   here instead.

   Tools register themselves in TOOLS below — one line each. Their copy lives
   next to the tool and is namespaced, so a merge into the site dictionary can
   never shadow a shared key.
   =========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { DICT } from "../web/js/i18n/dictionary.js";
import { PATCHER_DICT } from "../web/js/tools/mario-tennis/patcher-copy.js";
import { EDITOR_DICT } from "../web/js/tools/yellow-legacy/editor-copy.js";

const WEB = new URL("../web/", import.meta.url).pathname;

/** Every tool that merges its own copy into the site dictionary. */
const TOOLS = [
  { name: "mario tennis save patcher", dict: PATCHER_DICT, prefix: "mt" },
  { name: "yellow legacy save editor", dict: EDITOR_DICT, prefix: "yl" }
];

/** Every .html file under web/, the way build.mjs discovers them. */
async function pages(dir = WEB) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "assets") out.push(...(await pages(full)));
    } else if (entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

/** Keys any tool page can resolve: the site dictionary plus every tool's own. */
const merged = {
  en: Object.assign({}, DICT.en, ...TOOLS.map((t) => t.dict.en)),
  pt: Object.assign({}, DICT.pt, ...TOOLS.map((t) => t.dict.pt))
};

test("every language defines the same keys", async (t) => {
  await t.test("site dictionary", () => {
    assert.deepEqual(Object.keys(DICT.en).sort(), Object.keys(DICT.pt).sort());
  });

  for (const tool of TOOLS) {
    await t.test(`${tool.name} dictionary`, () => {
      assert.deepEqual(Object.keys(tool.dict.en).sort(), Object.keys(tool.dict.pt).sort());
    });
  }
});

test("tool dictionaries stay out of each other's way", async (t) => {
  for (const tool of TOOLS) {
    await t.test(`${tool.name}: no key shadows a site key`, () => {
      assert.deepEqual(Object.keys(tool.dict.en).filter((k) => k in DICT.en), []);
    });

    await t.test(`${tool.name}: every key is namespaced "${tool.prefix}"`, () => {
      assert.deepEqual(Object.keys(tool.dict.en).filter((k) => !k.startsWith(tool.prefix)), []);
    });
  }

  await t.test("no two tools claim the same key", () => {
    const seen = new Map();
    const clashes = [];
    for (const tool of TOOLS) {
      for (const key of Object.keys(tool.dict.en)) {
        if (seen.has(key)) clashes.push(`${key} (${seen.get(key)} / ${tool.name})`);
        seen.set(key, tool.name);
      }
    }
    assert.deepEqual(clashes, []);
  });
});

test("every data-i18n key in the markup resolves", async (t) => {
  const files = await pages();
  assert.ok(files.length >= 4, "expected the home page, both hubs and both tool pages");

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
    if (!keys.length) continue;

    await t.test(file.slice(WEB.length), () => {
      for (const key of keys) {
        for (const lang of ["en", "pt"]) {
          assert.ok(merged[lang][key], `${lang} is missing "${key}"`);
        }
      }
    });
  }
});

test("dynamic keys the UI resolves at runtime all exist", () => {
  // The formatters return these as bare strings, so nothing else would catch a
  // rename until the page rendered an empty span.
  const runtime = [
    // mario tennis
    "mtChkAllOk",
    "mtChkBad",
    "mtAuditCount",
    "mtStateLocked",
    "mtStateUnlocked",
    "mtStatePartial",
    "mtNoteLocked",
    "mtNoteUnlocked",
    "mtNotePartial",
    "mtStatusIdle",
    "mtStatusLoaded",
    "mtStatusPatched",
    "mtStatusError",
    "mtOkUnlocked",
    "mtOkUnlockedMsg",
    "mtOkRestored",
    "mtOkRestoredMsg",
    "mtHintIdle",
    "mtHintLocked",
    "mtHintUnlocked",
    // yellow legacy
    "ylStatusIdle",
    "ylStatusLoaded",
    "ylStatusEdited",
    "ylStatusError",
    "ylChecksumOk",
    "ylChecksumBad",
    "ylChecksumOkNote",
    "ylChecksumBadNote",
    "ylOkTitle",
    "ylOkMsg",
    "ylDiffNone",
    "ylDiffName",
    "ylDiffId",
    "ylDiffMoney",
    "ylDiffCoins",
    "ylDiffBadges",
    "ylDiffTowns",
    "ylNameHint",
    "ylBadgeCount",
    "ylTownCount",
    "ylHintIdle",
    "ylHintClean",
    // shared
    "musicNowPlaying",
    "musicPaused"
  ];
  for (const key of runtime) {
    for (const lang of ["en", "pt"]) {
      assert.ok(merged[lang][key], `${lang} is missing runtime key "${key}"`);
    }
  }
});

test("the toggle chips built at runtime have a label in both languages", async () => {
  const { BADGES, TOWNS } = await import("../web/js/tools/yellow-legacy/save-format.js");
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const keys = [
    ...BADGES.map((b) => "ylBadge" + cap(b.key)),
    ...TOWNS.map((t) => "ylTown" + cap(t.key))
  ];
  assert.equal(keys.length, 19);
  for (const key of keys) {
    for (const lang of ["en", "pt"]) {
      assert.ok(merged[lang][key], `${lang} is missing chip key "${key}"`);
    }
  }
});

test("every error code maps to a title and a body", async (t) => {
  await t.test("mario tennis", async () => {
    const { errorKeys } = await import("../web/js/tools/mario-tennis/patcher-format.js");
    const codes = ["badSize", "badMagic", "badDirectory", "badSave", "read", "transferDirty", "lib", "unknown"];
    for (const code of codes) {
      const { titleKey, bodyKey } = errorKeys(code);
      for (const lang of ["en", "pt"]) {
        assert.ok(merged[lang][titleKey], `${lang} is missing "${titleKey}" (${code})`);
        assert.ok(merged[lang][bodyKey], `${lang} is missing "${bodyKey}" (${code})`);
      }
    }
  });

  await t.test("yellow legacy", async () => {
    const { errorKeys } = await import("../web/js/tools/yellow-legacy/editor-format.js");
    const codes = ["badSize", "notYellowLegacy", "vanillaSave", "read", "lib", "write", "unknown"];
    for (const code of codes) {
      const { titleKey, bodyKey } = errorKeys(code);
      for (const lang of ["en", "pt"]) {
        assert.ok(merged[lang][titleKey], `${lang} is missing "${titleKey}" (${code})`);
        assert.ok(merged[lang][bodyKey], `${lang} is missing "${bodyKey}" (${code})`);
      }
    }
  });
});

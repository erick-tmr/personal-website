/* ===========================================================================
   SaveEditor — the editor's state machine.

   Every path a visitor can take through the tool, without a browser: the
   rejections, the draft/original split that makes "revert" meaningful, and the
   lazy import failing.
   =========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";

import { buildSave, buildVanillaSave } from "./helpers/build-gen1-save.mjs";
import { SaveEditor } from "../web/js/tools/yellow-legacy/save-editor.js";
import { OFFSETS, readPlayer } from "../web/js/tools/yellow-legacy/save-format.js";

const LIB = () => import("../web/js/tools/yellow-legacy/save-format.js");

/** An editor with a save already loaded. */
async function loaded(options) {
  const editor = new SaveEditor({ loadLib: LIB });
  await editor.loadBytes("PKMN_YLW.sav", buildSave(options));
  return editor;
}

test("starts idle", () => {
  const editor = new SaveEditor({ loadLib: LIB });
  assert.equal(editor.phase, "idle");
  assert.equal(editor.loaded, false);
  assert.equal(editor.dirty, false);
  assert.equal(editor.writeBytes(), null);
});

test("loading a save", async (t) => {
  await t.test("reads the trainer block and clones it into a draft", async () => {
    const editor = await loaded({ name: "ERICK", money: 12345 });
    assert.equal(editor.phase, "loaded");
    assert.equal(editor.fileName, "PKMN_YLW.sav");
    assert.equal(editor.orig.name, "ERICK");
    assert.deepEqual(editor.draft.name, editor.orig.name);
    assert.equal(editor.dirty, false);
  });

  await t.test("gives the draft its own flag arrays", async () => {
    const editor = await loaded();
    editor.toggle("badges", 0);
    assert.notDeepEqual(editor.draft.badges, editor.orig.badges);
  });

  await t.test("notifies subscribers", async () => {
    const editor = new SaveEditor({ loadLib: LIB });
    let calls = 0;
    const off = editor.onChange(() => calls++);
    await editor.loadBytes("a.sav", buildSave());
    assert.equal(calls, 1);
    off();
    editor.setName("X");
    assert.equal(calls, 1);
  });
});

test("rejections leave no half-loaded state", async (t) => {
  const cases = [
    ["badSize", new Uint8Array(1024)],
    ["notYellowLegacy", new Uint8Array(0x8000)],
    ["vanillaSave", buildVanillaSave()]
  ];

  for (const [code, bytes] of cases) {
    await t.test(code, async () => {
      const editor = await loaded();
      await editor.loadBytes("bad.sav", bytes);
      assert.equal(editor.error, code);
      assert.equal(editor.phase, "error");
      assert.equal(editor.loaded, false);
      assert.equal(editor.bytes, null);
      assert.equal(editor.orig, null);
      assert.equal(editor.draft, null);
      assert.equal(editor.fileName, "bad.sav");
    });
  }

  await t.test("an unreadable file", async () => {
    const editor = await loaded();
    editor.failRead("locked.sav");
    assert.equal(editor.error, "read");
    assert.equal(editor.loaded, false);
  });
});

test("the byte logic failing to load is an error, not a crash", async (t) => {
  await t.test("surfaces a lib error", async () => {
    const editor = new SaveEditor({ loadLib: () => Promise.reject(new Error("offline")) });
    await editor.loadBytes("a.sav", buildSave());
    assert.equal(editor.error, "lib");
    assert.equal(editor.loaded, false);
  });

  await t.test("retries rather than caching the failure forever", async () => {
    let attempt = 0;
    const editor = new SaveEditor({
      loadLib: () => (++attempt === 1 ? Promise.reject(new Error("offline")) : LIB())
    });
    await editor.loadBytes("a.sav", buildSave());
    assert.equal(editor.error, "lib");
    await editor.loadBytes("a.sav", buildSave({ name: "ASH" }));
    assert.equal(editor.error, null);
    assert.equal(editor.orig.name, "ASH");
    assert.equal(attempt, 2);
  });
});

test("editing the draft", async (t) => {
  await t.test("filters the name through the Gen 1 charmap", async () => {
    const editor = await loaded();
    editor.setName("Ash€Ketchum");
    assert.equal(editor.draft.name, "AshKetchum");
  });

  await t.test("stops at the field capacity", async () => {
    const editor = await loaded();
    editor.setName("ABCDEFGHIJKLMNOP");
    assert.equal(editor.draft.name, "ABCDEFGHIJ");
  });

  await t.test("clamps numbers and strips non-digits", async () => {
    const editor = await loaded();
    editor.setNumber("money", "1,234,567");
    assert.equal(editor.draft.money, 999999);
    editor.setNumber("coins", "99999");
    assert.equal(editor.draft.coins, 9999);
    editor.setNumber("trainerId", "70000");
    assert.equal(editor.draft.trainerId, 65535);
  });

  await t.test("treats an emptied field as zero", async () => {
    const editor = await loaded({ money: 500 });
    editor.setNumber("money", "");
    assert.equal(editor.draft.money, 0);
  });

  await t.test("rolls an ID inside the field's range", async () => {
    const editor = await loaded();
    for (let i = 0; i < 40; i++) {
      editor.randomId();
      assert.ok(editor.draft.trainerId >= 0 && editor.draft.trainerId <= 0xffff);
      assert.equal(Number.isInteger(editor.draft.trainerId), true);
    }
  });

  await t.test("toggles a single flag and ignores out-of-range indexes", async () => {
    const editor = await loaded();
    editor.toggle("towns", 3);
    assert.equal(editor.draft.towns[3], true);
    editor.toggle("towns", 3);
    assert.equal(editor.draft.towns[3], false);
    editor.toggle("towns", 99);
    assert.equal(editor.draft.towns.length, 11);
  });

  await t.test("sets every flag at once", async () => {
    const editor = await loaded();
    editor.setAll("badges", true);
    assert.deepEqual(editor.draft.badges, new Array(8).fill(true));
    editor.setAll("towns", false);
    assert.deepEqual(editor.draft.towns, new Array(11).fill(false));
  });

  await t.test("never touches the original", async () => {
    const editor = await loaded({ name: "RED", money: 100 });
    editor.setName("ASH");
    editor.setNumber("money", "999");
    editor.setAll("badges", true);
    assert.equal(editor.orig.name, "RED");
    assert.equal(editor.orig.money, 100);
    assert.deepEqual(editor.orig.badges, new Array(8).fill(false));
  });

  await t.test("edits are ignored before a save is loaded", () => {
    const editor = new SaveEditor({ loadLib: LIB });
    editor.setName("ASH");
    editor.setNumber("money", "1");
    editor.toggle("badges", 0);
    editor.setAll("towns", true);
    editor.randomId();
    assert.equal(editor.draft, null);
  });
});

test("dirty tracking drives the phase", async (t) => {
  await t.test("an edit makes it dirty", async () => {
    const editor = await loaded({ money: 100 });
    assert.equal(editor.phase, "loaded");
    editor.setNumber("money", "200");
    assert.equal(editor.dirty, true);
    assert.equal(editor.phase, "edited");
  });

  await t.test("editing back to the original value is not dirty", async () => {
    const editor = await loaded({ money: 100 });
    editor.setNumber("money", "200");
    editor.setNumber("money", "100");
    assert.equal(editor.dirty, false);
    assert.equal(editor.phase, "loaded");
  });

  await t.test("a flag round trip is not dirty", async () => {
    const editor = await loaded();
    editor.toggle("badges", 5);
    assert.equal(editor.dirty, true);
    editor.toggle("badges", 5);
    assert.equal(editor.dirty, false);
  });
});

test("revert and reset", async (t) => {
  await t.test("revert restores the draft and keeps the file", async () => {
    const editor = await loaded({ name: "RED", money: 100 });
    editor.setName("ASH");
    editor.setAll("towns", true);
    editor.revert();
    assert.equal(editor.dirty, false);
    assert.equal(editor.draft.name, "RED");
    assert.equal(editor.loaded, true);
    assert.equal(editor.fileName, "PKMN_YLW.sav");
  });

  await t.test("reset forgets everything", async () => {
    const editor = await loaded();
    editor.setName("ASH");
    editor.reset();
    assert.equal(editor.phase, "idle");
    assert.equal(editor.bytes, null);
    assert.equal(editor.fileName, null);
    assert.equal(editor.error, null);
  });
});

test("writeBytes", async (t) => {
  await t.test("produces a save that reads back as the draft", async () => {
    const editor = await loaded({ name: "RED", money: 100 });
    editor.setName("ASH");
    editor.setNumber("money", "999999");
    editor.setAll("badges", true);
    editor.toggle("towns", 10);

    const out = editor.writeBytes();
    const player = readPlayer(out);
    assert.equal(player.name, "ASH");
    assert.equal(player.money, 999999);
    assert.deepEqual(player.badges, new Array(8).fill(true));
    assert.equal(player.towns[10], true);
    assert.equal(player.checksum.ok, true);
  });

  await t.test("leaves the loaded bytes untouched", async () => {
    const editor = await loaded();
    const before = Uint8Array.from(editor.bytes);
    editor.setAll("badges", true);
    editor.writeBytes();
    assert.deepEqual(editor.bytes, before);
  });

  await t.test("does not rewrite a name the visitor never touched", async () => {
    const editor = new SaveEditor({ loadLib: LIB });
    const save = buildSave({ name: "RED" });
    save[OFFSETS.playerName + 1] = 0xba; // a byte the codec renders as "?"
    const before = save.slice(OFFSETS.playerName, OFFSETS.playerName + 11);

    await editor.loadBytes("exotic.sav", save);
    editor.setNumber("money", "4242"); // edit something else entirely
    const out = editor.writeBytes();

    assert.deepEqual(out.slice(OFFSETS.playerName, OFFSETS.playerName + 11), before);
    assert.equal(readPlayer(out).money, 4242);
  });

  await t.test("does rewrite the name once it is edited", async () => {
    const editor = await loaded({ name: "RED" });
    editor.setName("ASH");
    assert.equal(readPlayer(editor.writeBytes()).name, "ASH");
  });

  await t.test("repairs a broken checksum on the way out", async () => {
    const editor = new SaveEditor({ loadLib: LIB });
    const save = buildSave({ fixChecksum: false });
    save[OFFSETS.checksum] = 0x00;
    await editor.loadBytes("broken.sav", save);
    assert.equal(editor.orig.checksum.ok, false);
    assert.equal(readPlayer(editor.writeBytes()).checksum.ok, true);
  });
});

test("the download notice clears on the next edit", async () => {
  const editor = await loaded();
  editor.markDownloaded();
  assert.equal(editor.downloaded, true);
  editor.setName("ASH");
  assert.equal(editor.downloaded, false);
});

/* ===========================================================================
   Pokémon Yellow Legacy save format — byte-level behaviour.

   The offsets under test are NOT the vanilla Gen 1 ones (see the lib header):
   Yellow Legacy's larger bag pushes money, badges, the trainer ID and coins 78
   bytes later, while the town flags, the gym mirror and the checksum stay put.
   That half-shifted layout is exactly the kind of thing a hand-check gets
   wrong, so it is pinned here against literals.
   =========================================================================== */
import test from "node:test";
import assert from "node:assert/strict";

import {
  AT,
  buildSave,
  buildVanillaSave,
  checksum as fixtureChecksum
} from "./helpers/build-gen1-save.mjs";
import {
  BADGES,
  OFFSETS,
  SAVE_SIZE,
  TOWNS,
  badgeMask,
  computeChecksum,
  decodeName,
  encodeName,
  isEncodable,
  readBCD,
  readPlayer,
  townMask,
  validateSave,
  writeBCD,
  writePlayer
} from "../web/js/tools/yellow-legacy/save-format.js";

test("offsets match the Yellow Legacy symfile", () => {
  // 0x25A3 + (wram address - 0xD2F6). Shifted +78 from vanilla:
  assert.equal(OFFSETS.money, 0x2641);
  assert.equal(OFFSETS.badges, 0x2650);
  assert.equal(OFFSETS.trainerId, 0x2653);
  assert.equal(OFFSETS.coins, 0x289e);
  // Unshifted, because the hack deletes 78 bytes of filler further down:
  assert.equal(OFFSETS.playerName, 0x2598);
  assert.equal(OFFSETS.townsVisited, 0x29b7);
  assert.equal(OFFSETS.beatGymFlags, 0x29d6);
  assert.equal(OFFSETS.checksum, 0x3523);
  assert.equal(OFFSETS.checksumStart, 0x2598);
  assert.equal(OFFSETS.checksumEnd, 0x3522);
});

test("text codec", async (t) => {
  await t.test("round-trips the printable set", () => {
    const text = "Mr. O'Hara-9";
    const bytes = encodeName(text, 10);
    assert.equal(decodeName(bytes, 0, 10), text.slice(0, 10));
  });

  await t.test("terminates and pads to capacity + 1", () => {
    const bytes = encodeName("AB", 10);
    assert.equal(bytes.length, 11);
    assert.equal(bytes[0], 0x80); // A
    assert.equal(bytes[1], 0x81); // B
    for (let i = 2; i < 11; i++) assert.equal(bytes[i], 0x50);
  });

  await t.test("drops characters the game cannot store", () => {
    assert.equal(decodeName(encodeName("A€B", 10), 0, 10), "AB");
    assert.equal(isEncodable("€"), false);
    assert.equal(isEncodable("♀"), true);
  });

  await t.test("truncates at capacity", () => {
    assert.equal(decodeName(encodeName("ABCDEFGHIJKLMN", 10), 0, 10), "ABCDEFGHIJ");
  });

  await t.test("renders unknown stored bytes as ?", () => {
    const bytes = new Uint8Array([0x80, 0x01, 0x50]);
    assert.equal(decodeName(bytes, 0, 10), "A?");
  });
});

test("BCD", async (t) => {
  await t.test("reads big-endian packed digits", () => {
    const b = new Uint8Array([0x00, 0x30, 0x00]);
    assert.equal(readBCD(b, 0, 3), 3000);
  });

  await t.test("rejects a non-decimal nibble", () => {
    assert.equal(readBCD(new Uint8Array([0x0a, 0x00, 0x00]), 0, 3), null);
  });

  await t.test("writes what it reads", () => {
    const b = new Uint8Array(3);
    for (const value of [0, 1, 999, 123456, 999999]) {
      writeBCD(b, 0, 3, value);
      assert.equal(readBCD(b, 0, 3), value);
    }
  });

  await t.test("clamps past the field's capacity", () => {
    const b = new Uint8Array(2);
    writeBCD(b, 0, 2, 123456);
    assert.equal(readBCD(b, 0, 2), 9999);
  });
});

test("checksum agrees with the independently coded spec", () => {
  const save = buildSave({ money: 54321, coins: 777 });
  assert.equal(computeChecksum(save), fixtureChecksum(save));
  assert.equal(save[OFFSETS.checksum], computeChecksum(save));
});

test("validateSave", async (t) => {
  await t.test("accepts a well-formed save", () => {
    const check = validateSave(buildSave());
    assert.deepEqual({ ok: check.ok, code: check.code, checksumOk: check.checksumOk }, {
      ok: true,
      code: null,
      checksumOk: true
    });
  });

  await t.test("reports a bad checksum without refusing the file", () => {
    const save = buildSave({ fixChecksum: false });
    save[OFFSETS.checksum] = 0x00;
    const check = validateSave(save);
    assert.equal(check.ok, true);
    assert.equal(check.checksumOk, false);
  });

  await t.test("refuses the wrong size", () => {
    assert.deepEqual(validateSave(new Uint8Array(0x8000 - 1)).code, "badSize");
    assert.deepEqual(validateSave(new Uint8Array(0x20000)).code, "badSize");
    assert.deepEqual(validateSave(null).code, "badSize");
  });

  await t.test("refuses noise", () => {
    assert.equal(validateSave(new Uint8Array(SAVE_SIZE)).code, "notYellowLegacy");
  });

  await t.test("tells a vanilla save apart from a Yellow Legacy one", () => {
    // Same size, same shape, money 78 bytes earlier — the whole reason this
    // check exists is that reading it at YL offsets yields plausible nonsense.
    assert.equal(validateSave(buildVanillaSave()).code, "vanillaSave");
  });

  await t.test("accepts a name holding charmap bytes the decoder cannot draw", () => {
    // é ($BA) and the 'd contraction ($BB) are legal name bytes. Refusing them
    // would reject a perfectly good save over a rendering limitation.
    for (const byte of [0xba, 0xbb, 0xe1, 0xf0]) {
      const save = buildSave({ name: "RED" });
      save[OFFSETS.playerName + 1] = byte;
      save[OFFSETS.checksum] = computeChecksum(save);
      assert.equal(validateSave(save).ok, true, `byte 0x${byte.toString(16)} should be accepted`);
    }
  });

  await t.test("refuses a save whose bag count cannot fit the bag", () => {
    const save = buildSave();
    save[AT.bagCount] = 60; // capacity is 59
    assert.equal(validateSave(save).ok, false);
  });
});

test("readPlayer reads every exposed field", () => {
  const badges = [true, false, true, false, false, false, false, true];
  const towns = [true, true, false, false, false, false, false, false, false, false, true];
  const save = buildSave({ name: "ERICK", trainerId: 0xbeef, money: 456789, coins: 1234, badges, towns });

  const player = readPlayer(save);
  assert.equal(player.name, "ERICK");
  assert.equal(player.trainerId, 0xbeef);
  assert.equal(player.money, 456789);
  assert.equal(player.coins, 1234);
  assert.deepEqual(player.badges, badges);
  assert.deepEqual(player.towns, towns);
  assert.equal(player.checksum.ok, true);
});

test("writePlayer", async (t) => {
  const base = buildSave({ name: "RED", trainerId: 1, money: 10, coins: 2 });
  const edit = {
    name: "ASH",
    trainerId: 0x7fff,
    money: 999999,
    coins: 9999,
    badges: new Array(8).fill(true),
    towns: new Array(11).fill(true)
  };

  await t.test("round-trips through readPlayer", () => {
    const out = writePlayer(base, edit);
    const player = readPlayer(out);
    assert.equal(player.name, "ASH");
    assert.equal(player.trainerId, 0x7fff);
    assert.equal(player.money, 999999);
    assert.equal(player.coins, 9999);
    assert.deepEqual(player.badges, new Array(8).fill(true));
    assert.deepEqual(player.towns, new Array(11).fill(true));
  });

  await t.test("does not mutate the input", () => {
    const before = Uint8Array.from(base);
    writePlayer(base, edit);
    assert.deepEqual(base, before);
  });

  await t.test("repairs the checksum", () => {
    const broken = buildSave({ fixChecksum: false });
    broken[OFFSETS.checksum] = 0x00;
    const out = writePlayer(broken, readPlayer(broken));
    assert.equal(out[OFFSETS.checksum], computeChecksum(out));
    assert.equal(validateSave(out).checksumOk, true);
  });

  await t.test("mirrors the badge mask into wBeatGymFlags", () => {
    const out = writePlayer(base, edit);
    assert.equal(out[OFFSETS.beatGymFlags], out[OFFSETS.badges]);
    assert.equal(out[OFFSETS.badges], 0xff);
  });

  await t.test("leaves the mirror alone when asked not to", () => {
    const out = writePlayer(base, edit, false);
    assert.equal(out[OFFSETS.beatGymFlags], base[OFFSETS.beatGymFlags]);
  });

  await t.test("touches only the fields it owns", () => {
    const out = writePlayer(base, edit);
    const owned = new Set([OFFSETS.checksum, OFFSETS.beatGymFlags]);
    for (let i = 0; i < 11; i++) owned.add(OFFSETS.playerName + i);
    for (let i = 0; i < 3; i++) owned.add(OFFSETS.money + i);
    for (let i = 0; i < 2; i++) owned.add(OFFSETS.trainerId + i);
    for (let i = 0; i < 2; i++) owned.add(OFFSETS.coins + i);
    owned.add(OFFSETS.badges);
    for (let i = 0; i < 2; i++) owned.add(OFFSETS.townsVisited + i);

    const changed = [];
    for (let i = 0; i < SAVE_SIZE; i++) if (out[i] !== base[i]) changed.push(i);
    assert.deepEqual(changed.filter((i) => !owned.has(i)), []);
  });

  await t.test("clamps out-of-range values instead of corrupting the field", () => {
    const out = writePlayer(base, { ...edit, money: 10_000_000, coins: 99_999, trainerId: 0x1ffff });
    const player = readPlayer(out);
    assert.equal(player.money, 999999);
    assert.equal(player.coins, 9999);
    assert.equal(player.trainerId, 0xffff);
  });

  await t.test("refuses a save of the wrong size", () => {
    assert.throws(() => writePlayer(new Uint8Array(10), edit), { code: "badSize" });
  });

  await t.test("leaves the stored name untouched when no name is supplied", () => {
    // A name holding a byte the codec does not model (é = $BA) decodes to "?".
    // Re-encoding that would rename the player, so an unedited name is skipped.
    const exotic = buildSave({ name: "RED" });
    exotic[OFFSETS.playerName + 1] = 0xba;
    const before = exotic.slice(OFFSETS.playerName, OFFSETS.playerName + 11);

    const out = writePlayer(exotic, { ...edit, name: undefined });
    assert.deepEqual(out.slice(OFFSETS.playerName, OFFSETS.playerName + 11), before);
    // ...while the fields that were supplied still land.
    assert.equal(readPlayer(out).money, 999999);
    assert.equal(readPlayer(out).checksum.ok, true);
  });
});

test("bit masks", () => {
  assert.equal(BADGES.length, 8);
  assert.equal(TOWNS.length, 11);
  assert.equal(badgeMask(new Array(8).fill(true)), 0xff);
  assert.equal(badgeMask([true, false, false, false, false, false, false, false]), 0x01);
  assert.equal(townMask(new Array(11).fill(true)), 0x7ff);
  assert.equal(townMask(new Array(11).fill(false)), 0);
});

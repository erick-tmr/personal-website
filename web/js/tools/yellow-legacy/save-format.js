/* ===========================================================================
   Pokémon Yellow Legacy (Game Boy, Gen 1 save layout) — pure byte logic.

   Responsibility (SRP): read, edit and re-checksum the trainer block of a
   32 KiB Gen 1 SRAM dump. Knows nothing about files, i18n or the DOM.

   THE OFFSETS ARE NOT VANILLA. Yellow Legacy raises BAG_ITEM_CAPACITY from 20
   to 59 (constants/menu_constants.asm), so `wBagItems:: ds CAPACITY * 2 + 1`
   grows 41 -> 119 bytes and everything from wPlayerMoney through
   wGameProgressFlags sits 78 bytes later than in vanilla R/B/Y. The hack pays
   for that by deleting the 78-byte filler at the end of the game-progress
   block (`; ds 78` in ram/wram.asm), so wGameProgressFlagsEnd onwards — the
   town flags, the gym mirror, the checksum — lands back on the vanilla
   offsets, and sMainData keeps its 0x789 size. Half the block moves; half
   does not. Do not "fix" these against a vanilla Gen 1 reference.

   Derived from the Yellow Legacy source, not from a document. Assembling
   ram.asm standalone and linking it against the RAM half of layout.link
   yields (rgbds 1.0.3):

       00:d2f6 wMainDataStart      01:a598 sPlayerName
       00:d394 wPlayerMoney        01:a5a3 sMainData
       00:d3a3 wObtainedBadges     01:b523 sGameDataEnd
       00:d3a6 wPlayerID           01:b523 sMainDataCheckSum
       00:d5f1 wPlayerCoins
       00:d70a wTownVisitedFlag
       00:d729 wBeatGymFlags

   SRAM bank 1 starts at file offset 0x2000, so a .sav offset is
   0x25A3 + (wram address - 0xD2F6) for anything inside the main data block.
   =========================================================================== */

export const SAVE_SIZE = 0x8000;

/** Bag capacity in Yellow Legacy (vanilla is 20) — the reason for the shift. */
export const BAG_ITEM_CAPACITY = 59;

export const OFFSETS = {
  playerName: 0x2598, // sPlayerName, 01:a598
  bagCount: 0x25c9, // wNumBagItems
  bagItems: 0x25ca, // wBagItems, 59 * 2 + 1 bytes
  money: 0x2641, // wPlayerMoney      d394 -> 0x25A3 + 0x09E
  rivalName: 0x2644, // wRivalName        d397
  options: 0x264f, // wOptions          d3a2
  badges: 0x2650, // wObtainedBadges   d3a3 -> 0x25A3 + 0x0AD
  trainerId: 0x2653, // wPlayerID         d3a6 -> 0x25A3 + 0x0B0
  coins: 0x289e, // wPlayerCoins      d5f1 -> 0x25A3 + 0x2FB
  townsVisited: 0x29b7, // wTownVisitedFlag  d70a -> 0x25A3 + 0x414
  beatGymFlags: 0x29d6, // wBeatGymFlags     d729 -> 0x25A3 + 0x433
  checksum: 0x3523, // sMainDataCheckSum 01:b523
  checksumStart: 0x2598, // sGameData
  checksumEnd: 0x3522 // sGameDataEnd - 1
};

/**
 * Where vanilla R/B/Y keeps the same fields. Never written — only used to tell
 * a vanilla save apart from a Yellow Legacy one, so the error can say which
 * mistake the visitor made instead of a generic "unrecognised file".
 */
export const VANILLA_OFFSETS = { money: 0x25f3, badges: 0x2602, trainerId: 0x2605, coins: 0x2850 };

export const NAME_CAPACITY = 10; // 11 bytes incl. terminator
export const NAME_INGAME_MAX = 7; // what the in-game keyboard allows
export const MONEY_MAX = 999999;
export const COINS_MAX = 9999;
export const ID_MAX = 0xffff;

/** Badge bits, low bit first — constants/script_constants.asm. */
export const BADGES = [
  { key: "boulder", bit: 0, city: "Pewter" },
  { key: "cascade", bit: 1, city: "Cerulean" },
  { key: "thunder", bit: 2, city: "Vermilion" },
  { key: "rainbow", bit: 3, city: "Celadon" },
  { key: "soul", bit: 4, city: "Fuchsia" },
  { key: "marsh", bit: 5, city: "Saffron" },
  { key: "volcano", bit: 6, city: "Cinnabar" },
  { key: "earth", bit: 7, city: "Viridian" }
];

/** Town-visited bits, indexed by Gen 1 map id — constants/map_constants.asm. */
export const TOWNS = [
  { key: "pallet", bit: 0 },
  { key: "viridian", bit: 1 },
  { key: "pewter", bit: 2 },
  { key: "cerulean", bit: 3 },
  { key: "lavender", bit: 4 },
  { key: "vermilion", bit: 5 },
  { key: "celadon", bit: 6 },
  { key: "fuchsia", bit: 7 },
  { key: "cinnabar", bit: 8 },
  { key: "indigo", bit: 9 },
  { key: "saffron", bit: 10 }
];

export class SaveError extends Error {
  constructor(code) {
    super(code);
    this.name = "SaveError";
    this.code = code;
  }
}

/* ---------------------------------------------------------------- text ---- */

const BYTE_TO_CHAR = new Map();
const CHAR_TO_BYTE = new Map();

function mapRange(start, chars) {
  for (let i = 0; i < chars.length; i++) {
    BYTE_TO_CHAR.set(start + i, chars[i]);
    if (!CHAR_TO_BYTE.has(chars[i])) CHAR_TO_BYTE.set(chars[i], start + i);
  }
}
mapRange(0x80, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
mapRange(0xa0, "abcdefghijklmnopqrstuvwxyz");
mapRange(0xf6, "0123456789");
[
  [0x7f, " "], [0x9a, "("], [0x9b, ")"], [0x9c, ":"], [0x9d, ";"],
  [0x9e, "["], [0x9f, "]"], [0xe0, "'"], [0xe3, "-"], [0xe6, "?"],
  [0xe7, "!"], [0xe8, "."], [0xef, "♂"], [0xf1, "×"], [0xf3, "/"],
  [0xf4, ","], [0xf5, "♀"], [0xba, "é"], [0xf0, "¥"]
].forEach(([b, c]) => {
  BYTE_TO_CHAR.set(b, c);
  CHAR_TO_BYTE.set(c, b);
});

export const TERMINATOR = 0x50;

/** Decode a fixed-length Gen 1 string. Unknown bytes become '?'. */
export function decodeName(bytes, offset, capacity) {
  let out = "";
  for (let i = 0; i < capacity; i++) {
    const b = bytes[offset + i];
    if (b === TERMINATOR || b === undefined) break;
    out += BYTE_TO_CHAR.has(b) ? BYTE_TO_CHAR.get(b) : "?";
  }
  return out;
}

/** Encode to `capacity` chars + terminator; pads the rest with terminators. */
export function encodeName(text, capacity) {
  const out = new Uint8Array(capacity + 1).fill(TERMINATOR);
  let i = 0;
  for (const ch of String(text || "")) {
    if (i >= capacity) break;
    const b = CHAR_TO_BYTE.get(ch);
    if (b === undefined) continue;
    out[i++] = b;
  }
  return out;
}

/** Characters the game can store (for input filtering). */
export function isEncodable(ch) {
  return CHAR_TO_BYTE.has(ch);
}

/**
 * Is this byte one the game can hold in a name? Deliberately wider than the
 * decoder's table: the charmap also has é, the 'd/'l/'s/'t/'v/'r/'m
 * contractions and the PK/MN ligatures, which are single bytes in the save but
 * not single characters on screen. Validation has to accept them or a
 * perfectly good save gets refused; decodeName still renders the ones it
 * cannot draw as "?", and an unedited name is never written back.
 *
 * Ranges from constants/charmap.asm.
 */
function isNameByte(b) {
  return b === 0x7f || (b >= 0x80 && b <= 0xbf) || (b >= 0xe0 && b <= 0xe8) || (b >= 0xef && b <= 0xff);
}

/**
 * Does this field read as a Gen 1 name — name bytes up to a terminator, and a
 * terminator inside the field? Used to tell a real trainer block from
 * arbitrary bytes that happen to sit at the same offset.
 */
function looksLikeName(bytes, offset, capacity) {
  for (let i = 0; i <= capacity; i++) {
    const b = bytes[offset + i];
    if (b === TERMINATOR) return i > 0; // empty names do not occur in a save
    if (!isNameByte(b)) return false;
  }
  return false; // never terminated
}

/* ----------------------------------------------------------------- bcd ---- */

/** Big-endian BCD read. Returns null when a nibble is not a decimal digit. */
export function readBCD(bytes, offset, length) {
  let value = 0;
  for (let i = 0; i < length; i++) {
    const b = bytes[offset + i];
    const hi = b >> 4;
    const lo = b & 0x0f;
    if (hi > 9 || lo > 9) return null;
    value = value * 100 + hi * 10 + lo;
  }
  return value;
}

export function writeBCD(bytes, offset, length, value) {
  let v = Math.max(0, Math.min(Math.floor(Number(value) || 0), Math.pow(100, length) - 1));
  for (let i = length - 1; i >= 0; i--) {
    const pair = v % 100;
    bytes[offset + i] = (((pair / 10) << 4) & 0xf0) | pair % 10;
    v = Math.floor(v / 100);
  }
}

/* ------------------------------------------------------------ checksum ---- */

/**
 * SAVCheckSum (engine/menus/save.asm): 8-bit wrapping sum of sGameData..
 * sGameDataEnd-1, then complemented.
 */
export function computeChecksum(bytes) {
  let sum = 0;
  for (let i = OFFSETS.checksumStart; i <= OFFSETS.checksumEnd; i++) sum = (sum + bytes[i]) & 0xff;
  return ~sum & 0xff;
}

/* ---------------------------------------------------------- validation ---- */

/** Does the trainer block read as Yellow Legacy data at the shifted offsets? */
function readsAsYellowLegacy(bytes) {
  return (
    looksLikeName(bytes, OFFSETS.playerName, NAME_CAPACITY) &&
    looksLikeName(bytes, OFFSETS.rivalName, NAME_CAPACITY) &&
    readBCD(bytes, OFFSETS.money, 3) !== null &&
    readBCD(bytes, OFFSETS.coins, 2) !== null &&
    bytes[OFFSETS.bagCount] <= BAG_ITEM_CAPACITY
  );
}

/** ...or as a vanilla R/B/Y save, whose money and coins sit 78 bytes earlier? */
function readsAsVanilla(bytes) {
  return (
    looksLikeName(bytes, OFFSETS.playerName, NAME_CAPACITY) &&
    looksLikeName(bytes, VANILLA_OFFSETS.money + 3, NAME_CAPACITY) &&
    readBCD(bytes, VANILLA_OFFSETS.money, 3) !== null &&
    readBCD(bytes, VANILLA_OFFSETS.coins, 2) !== null
  );
}

/**
 * Accepts a Uint8Array. Refuses anything that is not a 32 KiB Yellow Legacy
 * save. A wrong checksum is reported, not refused — the editor repairs it.
 *
 * A vanilla save is refused with its own code: it is the same size and the
 * same shape, and reading it at Yellow Legacy's offsets would show plausible
 * nonsense rather than fail loudly.
 */
export function validateSave(bytes) {
  if (!bytes || bytes.length !== SAVE_SIZE) return { ok: false, code: "badSize" };
  if (!readsAsYellowLegacy(bytes)) {
    return { ok: false, code: readsAsVanilla(bytes) ? "vanillaSave" : "notYellowLegacy" };
  }
  return { ok: true, code: null, checksumOk: bytes[OFFSETS.checksum] === computeChecksum(bytes) };
}

/* --------------------------------------------------------------- read ----- */

function bitsFrom(bytes, offset, list) {
  return list.map((entry) => ((bytes[offset + (entry.bit >> 3)] >> (entry.bit & 7)) & 1) === 1);
}

/** Everything this editor exposes, as plain JS values. */
export function readPlayer(bytes) {
  const stored = bytes[OFFSETS.checksum];
  const computed = computeChecksum(bytes);
  return {
    name: decodeName(bytes, OFFSETS.playerName, NAME_CAPACITY),
    trainerId: (bytes[OFFSETS.trainerId] << 8) | bytes[OFFSETS.trainerId + 1],
    money: readBCD(bytes, OFFSETS.money, 3) ?? 0,
    coins: readBCD(bytes, OFFSETS.coins, 2) ?? 0,
    badges: bitsFrom(bytes, OFFSETS.badges, BADGES),
    towns: bitsFrom(bytes, OFFSETS.townsVisited, TOWNS),
    checksum: { stored, computed, ok: stored === computed }
  };
}

/* -------------------------------------------------------------- write ----- */

function writeBits(bytes, offset, list, values) {
  list.forEach((entry, i) => {
    const byteOffset = offset + (entry.bit >> 3);
    const mask = 1 << (entry.bit & 7);
    if (values[i]) bytes[byteOffset] |= mask;
    else bytes[byteOffset] &= ~mask & 0xff;
  });
}

/**
 * Returns a NEW Uint8Array with the edited player block and a fixed checksum.
 * `mirrorGyms` also writes the badge mask to the redundant wBeatGymFlags byte,
 * which the game reads for the gym statues and two NPC scripts.
 *
 * Omitting `data.name` leaves the stored name bytes exactly as they were. The
 * text codec covers what the in-game keyboard can produce, but the charmap has
 * a handful of entries it does not model (é, the 'd/'s contractions, the PK/MN
 * ligatures), and those decode to "?". Re-encoding an untouched name would
 * write that "?" back and quietly rename the player, so the caller skips the
 * field entirely unless the visitor actually edited it.
 */
export function writePlayer(bytes, data, mirrorGyms = true) {
  if (!bytes || bytes.length !== SAVE_SIZE) throw new SaveError("badSize");
  const out = new Uint8Array(bytes);

  if (typeof data.name === "string") out.set(encodeName(data.name, NAME_CAPACITY), OFFSETS.playerName);

  const id = Math.max(0, Math.min(Math.floor(Number(data.trainerId) || 0), ID_MAX));
  out[OFFSETS.trainerId] = (id >> 8) & 0xff;
  out[OFFSETS.trainerId + 1] = id & 0xff;

  writeBCD(out, OFFSETS.money, 3, Math.min(Number(data.money) || 0, MONEY_MAX));
  writeBCD(out, OFFSETS.coins, 2, Math.min(Number(data.coins) || 0, COINS_MAX));

  writeBits(out, OFFSETS.badges, BADGES, data.badges || []);
  writeBits(out, OFFSETS.townsVisited, TOWNS, data.towns || []);

  if (mirrorGyms) out[OFFSETS.beatGymFlags] = out[OFFSETS.badges];

  out[OFFSETS.checksum] = computeChecksum(out);
  return out;
}

/** Badge mask as a byte, for the diff readout. */
export function badgeMask(values) {
  let mask = 0;
  BADGES.forEach((b, i) => {
    if (values[i]) mask |= 1 << b.bit;
  });
  return mask;
}

/** Town mask as a 16-bit value, for the diff readout. */
export function townMask(values) {
  let mask = 0;
  TOWNS.forEach((t, i) => {
    if (values[i]) mask |= 1 << t.bit;
  });
  return mask;
}

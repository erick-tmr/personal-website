/* ===========================================================================
   Synthetic Pokémon Yellow Legacy save fixtures for tests.

   Built independently of web/js/tools/yellow-legacy/save-format.js on purpose:
   these encode the format spec by hand — offsets, charmap, BCD and checksum
   are all re-derived here — so the tests validate the lib against the spec
   rather than against itself. Real saves contain personal data and are never
   committed.

   Offsets come from the Yellow Legacy symfile (see save-format.js header) and
   are deliberately written as literals, not imported.
   =========================================================================== */

const SAVE_SIZE = 0x8000;
const TERM = 0x50;

/** Yellow Legacy offsets — the shifted ones are marked. */
export const AT = {
  playerName: 0x2598,
  bagCount: 0x25c9,
  bagItems: 0x25ca,
  money: 0x2641, // +78 vs vanilla
  rivalName: 0x2644, // +78
  options: 0x264f, // +78
  badges: 0x2650, // +78
  trainerId: 0x2653, // +78
  coins: 0x289e, // +78
  townsVisited: 0x29b7, // vanilla-aligned
  beatGymFlags: 0x29d6, // vanilla-aligned
  checksum: 0x3523 // vanilla-aligned
};

/** Vanilla R/B/Y positions, for the "this is not a romhack save" fixture. */
export const VANILLA_AT = { money: 0x25f3, rivalName: 0x25f6, badges: 0x2602, trainerId: 0x2605, coins: 0x2850 };

/** Gen 1 charmap, rebuilt from the constants table rather than imported. */
function charToByte(ch) {
  if (ch >= "A" && ch <= "Z") return 0x80 + (ch.charCodeAt(0) - 65);
  if (ch >= "a" && ch <= "z") return 0xa0 + (ch.charCodeAt(0) - 97);
  if (ch >= "0" && ch <= "9") return 0xf6 + (ch.charCodeAt(0) - 48);
  const extra = { " ": 0x7f, "'": 0xe0, "-": 0xe3, "?": 0xe6, "!": 0xe7, ".": 0xe8, "/": 0xf3, ",": 0xf4 };
  if (ch in extra) return extra[ch];
  throw new Error(`not encodable: ${ch}`);
}

export function writeName(bytes, at, text) {
  for (let i = 0; i < 11; i++) bytes[at + i] = TERM;
  [...text].slice(0, 10).forEach((ch, i) => {
    bytes[at + i] = charToByte(ch);
  });
}

/** Big-endian packed BCD, `length` bytes. */
export function writeBCD(bytes, at, length, value) {
  const digits = String(value).padStart(length * 2, "0").slice(-length * 2);
  for (let i = 0; i < length; i++) {
    bytes[at + i] = (Number(digits[i * 2]) << 4) | Number(digits[i * 2 + 1]);
  }
}

/** Sum 0x2598..0x3522, 8-bit wrapping, complemented. */
export function checksum(bytes) {
  let sum = 0;
  for (let i = 0x2598; i <= 0x3522; i++) sum = (sum + bytes[i]) & 0xff;
  return ~sum & 0xff;
}

/** Set `count` low bits from an array of booleans, LSB first. */
function writeFlags(bytes, at, flags) {
  flags.forEach((on, i) => {
    if (on) bytes[at + (i >> 3)] |= 1 << (i & 7);
  });
}

/**
 * A structurally valid Yellow Legacy save with a correct checksum.
 *
 * @param {object} [o]
 * @param {string} [o.name]      player name, max 10 chars
 * @param {string} [o.rival]     rival name
 * @param {number} [o.trainerId] 0-65535
 * @param {number} [o.money]     0-999999
 * @param {number} [o.coins]     0-9999
 * @param {boolean[]} [o.badges] 8 flags, index 0 = Boulder
 * @param {boolean[]} [o.towns]  11 flags, index 0 = Pallet
 * @param {number} [o.bagCount]  items in the bag (Yellow Legacy allows 59)
 * @param {boolean} [o.fixChecksum]
 */
export function buildSave({
  name = "RED",
  rival = "BLUE",
  trainerId = 0x1234,
  money = 3000,
  coins = 0,
  badges = new Array(8).fill(false),
  towns = new Array(11).fill(false),
  bagCount = 3,
  fixChecksum = true
} = {}) {
  const b = new Uint8Array(SAVE_SIZE);

  writeName(b, AT.playerName, name);
  writeName(b, AT.rivalName, rival);

  // Bag: count, then (item, qty) pairs, then the 0xFF terminator.
  b[AT.bagCount] = bagCount;
  for (let i = 0; i < bagCount; i++) {
    b[AT.bagItems + i * 2] = 0x14 + i; // arbitrary item ids
    b[AT.bagItems + i * 2 + 1] = 1;
  }
  b[AT.bagItems + bagCount * 2] = 0xff;

  writeBCD(b, AT.money, 3, money);
  writeBCD(b, AT.coins, 2, coins);

  b[AT.options] = 0x03; // medium text speed
  b[AT.trainerId] = (trainerId >> 8) & 0xff;
  b[AT.trainerId + 1] = trainerId & 0xff;

  writeFlags(b, AT.badges, badges);
  writeFlags(b, AT.townsVisited, towns);
  b[AT.beatGymFlags] = b[AT.badges];

  if (fixChecksum) b[AT.checksum] = checksum(b);
  return b;
}

/**
 * A vanilla R/B/Y save: same size and same player name slot, but money, rival
 * name and coins sit 78 bytes earlier and the bag holds only 20 items.
 */
export function buildVanillaSave({ name = "RED", rival = "BLUE", money = 3000, coins = 0 } = {}) {
  const b = new Uint8Array(SAVE_SIZE);
  writeName(b, AT.playerName, name);
  writeName(b, VANILLA_AT.rivalName, rival);
  b[AT.bagCount] = 2;
  b[AT.bagItems] = 0x14;
  b[AT.bagItems + 1] = 1;
  b[AT.bagItems + 2] = 0x15;
  b[AT.bagItems + 3] = 1;
  b[AT.bagItems + 4] = 0xff;
  writeBCD(b, VANILLA_AT.money, 3, money);
  writeBCD(b, VANILLA_AT.coins, 2, coins);
  b[VANILLA_AT.trainerId] = 0x12;
  b[VANILLA_AT.trainerId + 1] = 0x34;
  b[AT.checksum] = checksum(b);
  return b;
}

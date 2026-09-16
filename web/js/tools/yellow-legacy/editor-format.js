/* ===========================================================================
   Presentation helpers for the save editor — pure functions, no DOM.

   Responsibility (SRP): turn what save-format.js reports into the exact shapes
   the page renders — the pending-changes rows, the machine's status, the
   checksum readout and the output filename. Deterministic and dependency-free,
   which is the point: the diff is the part a visitor is asked to trust before
   downloading, so it is tested rather than eyeballed.

   These return dictionary *keys*, never sentences, so the UI can resolve them
   through i18n and switch language without recomputing any of this. Numbers are
   the one exception — they are formatted here, because grouping separators are
   locale data rather than copy.
   =========================================================================== */
import { OFFSETS, badgeMask, townMask } from "./save-format.js";

const NO_VALUE = "—";

/** "0x" + uppercase hex, zero-padded to `digits`. */
export function hex(value, digits = 4) {
  return "0x" + value.toString(16).toUpperCase().padStart(digits, "0");
}

/** Group digits the way the visitor's language does. */
export function formatNumber(value, lang) {
  return Number(value || 0).toLocaleString(lang === "pt" ? "pt-BR" : "en-US");
}

const countOn = (flags) => flags.filter(Boolean).length;

/**
 * Every field whose draft value differs from the file, in save order, each
 * carrying the offset it will be written to.
 *
 * @param {object|null} orig   readPlayer() output
 * @param {object|null} draft  the edited copy
 * @param {string} [lang]
 * @returns {Array<{offset: string, labelKey: string, before: string, after: string}>}
 */
export function diffRows(orig, draft, lang = "en") {
  if (!orig || !draft) return [];
  const num = (v) => formatNumber(v, lang);
  const rows = [];

  if (draft.name !== orig.name) {
    rows.push({
      offset: hex(OFFSETS.playerName),
      labelKey: "ylDiffName",
      before: orig.name || NO_VALUE,
      after: draft.name || NO_VALUE
    });
  }
  if (draft.money !== orig.money) {
    rows.push({ offset: hex(OFFSETS.money), labelKey: "ylDiffMoney", before: num(orig.money), after: num(draft.money) });
  }
  if (badgeMask(draft.badges) !== badgeMask(orig.badges)) {
    rows.push({
      offset: hex(OFFSETS.badges),
      labelKey: "ylDiffBadges",
      before: `${countOn(orig.badges)} · ${hex(badgeMask(orig.badges), 2)}`,
      after: `${countOn(draft.badges)} · ${hex(badgeMask(draft.badges), 2)}`
    });
  }
  if (draft.trainerId !== orig.trainerId) {
    rows.push({
      offset: hex(OFFSETS.trainerId),
      labelKey: "ylDiffId",
      before: String(orig.trainerId),
      after: String(draft.trainerId)
    });
  }
  if (draft.coins !== orig.coins) {
    rows.push({ offset: hex(OFFSETS.coins), labelKey: "ylDiffCoins", before: num(orig.coins), after: num(draft.coins) });
  }
  if (townMask(draft.towns) !== townMask(orig.towns)) {
    rows.push({
      offset: hex(OFFSETS.townsVisited),
      labelKey: "ylDiffTowns",
      before: String(countOn(orig.towns)),
      after: String(countOn(draft.towns))
    });
  }
  return rows;
}

/**
 * The machine's LED tone and status word, keyed off the editor's phase.
 * @param {"idle"|"loaded"|"edited"|"error"} phase
 */
export function machineView(phase) {
  const map = {
    idle: { tone: "idle", statusKey: "ylStatusIdle" },
    loaded: { tone: "loaded", statusKey: "ylStatusLoaded" },
    edited: { tone: "edited", statusKey: "ylStatusEdited" },
    error: { tone: "error", statusKey: "ylStatusError" }
  };
  return map[phase] || map.idle;
}

/** The side panel's checksum readout. */
export function checksumView(checksum) {
  if (!checksum) return { labelKey: null, text: NO_VALUE, noteKey: null, tone: "idle" };
  return checksum.ok
    ? { labelKey: "ylChecksumOk", text: null, noteKey: "ylChecksumOkNote", tone: "green" }
    : { labelKey: "ylChecksumBad", text: null, noteKey: "ylChecksumBadNote", tone: "red" };
}

// validateSave() reports "vanillaSave" for an official R/B/Y save, which is a
// different mistake from an unrecognised file and gets its own message.
const ERROR_KEYS = {
  badSize: "ylErrBadSize",
  notYellowLegacy: "ylErrNotYellowLegacy",
  vanillaSave: "ylErrVanilla",
  read: "ylErrRead",
  lib: "ylErrLib",
  write: "ylErrWrite",
  unknown: "ylErrRead"
};

/**
 * Dictionary keys for an error code. Unrecognised codes fall back to the
 * generic message rather than rendering an empty alert.
 * @param {string|null} code
 */
export function errorKeys(code) {
  if (!code) return null;
  const base = ERROR_KEYS[code] || ERROR_KEYS.unknown;
  return { titleKey: base, bodyKey: base + "Msg" };
}

/**
 * Name for the downloaded file. Only a trailing ".sav" is stripped, so
 * "MY.SAVE.sav" keeps its inner dots.
 * @param {string} inputName
 */
export function outputFileName(inputName) {
  const base = (inputName || "yellow-legacy.sav").replace(/\.sav$/i, "");
  return (base || "yellow-legacy") + "-edited.sav";
}

/** The one-line summary under the trainer name field. */
export function nameRemaining(draft, capacity) {
  return draft ? Math.max(0, capacity - draft.name.length) : capacity;
}

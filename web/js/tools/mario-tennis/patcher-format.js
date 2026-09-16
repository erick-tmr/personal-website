/* ===========================================================================
   Presentation helpers for the save patcher — pure functions, no DOM, no i18n.

   Responsibility (SRP): turn what save-format.js reports into the exact shapes
   the page renders — hex cells, audit rows, tone names and dictionary keys.
   Everything here is deterministic and dependency-free, which is the point:
   hex padding, the placeholder for records that cannot be audited, the badSave
   alias and filename derivation are all fiddly enough to deserve tests rather
   than a squint at the browser.

   These return *keys*, never sentences. The UI resolves them through i18n so
   the page can switch language without recomputing any of this.
   =========================================================================== */

export { interpolate } from "../../util/interpolate.js";

const NO_VALUE = "-";

/**
 * "0x" + uppercase hex, zero-padded to `digits`.
 * @param {number} value
 * @param {number} digits
 */
export function hex(value, digits) {
  return "0x" + value.toString(16).toUpperCase().padStart(digits, "0");
}

/**
 * Flatten both halves of a report into renderable audit rows, primary first.
 * Records the lib could not audit (computedSum === null) render as a dash with
 * a neutral flag rather than a misleading "BAD".
 *
 * @param {object|null} report  the object from inspectSave()
 * @returns {Array<{half: string, rec: string, addr: string, size: string,
 *                  stored: string, computed: string, flag: "ok"|"bad"|"none"}>}
 */
export function auditRows(report) {
  if (!report || !report.records) return [];
  const rows = [];
  const push = (half, records) => {
    for (const r of records) {
      rows.push({
        half,
        rec: hex(r.offset, 3),
        addr: hex(r.addr, 4),
        size: hex(r.size, 3),
        stored: hex(r.storedSum, 4),
        computed: r.computedSum === null ? NO_VALUE : hex(r.computedSum, 4),
        flag: r.ok === null ? "none" : r.ok ? "ok" : "bad"
      });
    }
  };
  push("PRI", report.records.primary);
  push("BAK", report.records.backup);
  return rows;
}

/**
 * How many rows carry a real verdict, and how many of those failed.
 * @param {ReturnType<typeof auditRows>} rows
 */
export function auditSummary(rows) {
  const audited = rows.filter((r) => r.flag !== "none");
  return {
    total: rows.length,
    audited: audited.length,
    bad: audited.filter((r) => r.flag === "bad").length
  };
}

/**
 * The checksum stat cell: a dictionary key, its variables, and a tone.
 * @param {ReturnType<typeof auditSummary>} summary
 */
export function checksumLabel(summary) {
  if (!summary.audited) return { key: null, text: NO_VALUE, vars: {}, tone: "muted" };
  return summary.bad
    ? { key: "mtChkBad", vars: { n: summary.bad }, tone: "red" }
    : { key: "mtChkAllOk", vars: {}, tone: "green" };
}

/**
 * Label, note and tone for the inspector's state readout.
 * @param {"locked"|"unlocked"|"partial"|"invalid"} state
 */
export function stateView(state) {
  if (state === "locked") {
    return { labelKey: "mtStateLocked", noteKey: "mtNoteLocked", tone: "red" };
  }
  if (state === "unlocked") {
    return { labelKey: "mtStateUnlocked", noteKey: "mtNoteUnlocked", tone: "green" };
  }
  return { labelKey: "mtStatePartial", noteKey: "mtNotePartial", tone: "lime" };
}

/**
 * The machine's LED colour and status word, keyed off the patcher's phase.
 * @param {"idle"|"loaded"|"patched"|"error"} phase
 */
export function machineView(phase) {
  const map = {
    idle: { tone: "idle", statusKey: "mtStatusIdle" },
    loaded: { tone: "loaded", statusKey: "mtStatusLoaded" },
    patched: { tone: "patched", statusKey: "mtStatusPatched" },
    error: { tone: "error", statusKey: "mtStatusError" }
  };
  return map[phase] || map.idle;
}

// applyUnlock() rejects a structurally bad save with "badSave", which is the
// same problem the loader reports as "badDirectory" — one message covers both.
const ERROR_KEYS = {
  badSize: "mtErrBadSize",
  badMagic: "mtErrBadMagic",
  badDirectory: "mtErrBadDirectory",
  badSave: "mtErrBadDirectory",
  read: "mtErrRead",
  transferDirty: "mtErrTransfer",
  lib: "mtErrLib",
  unknown: "mtErrUnknown"
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

/** Dictionary keys for the post-patch success block. */
export function patchKeys(patched) {
  return patched === "restored"
    ? { titleKey: "mtOkRestored", bodyKey: "mtOkRestoredMsg" }
    : { titleKey: "mtOkUnlocked", bodyKey: "mtOkUnlockedMsg" };
}

/**
 * Name for the downloaded file: the original with the outcome appended.
 * Only a trailing ".sav" is stripped, so "MY.SAVE.sav" keeps its inner dots.
 * @param {string} inputName
 * @param {"unlocked"|"restored"} mode
 */
export function outputFileName(inputName, mode) {
  const base = (inputName || "mario-tennis.sav").replace(/\.sav$/i, "");
  return (base || "mario-tennis") + "-" + mode + ".sav";
}

/** Profile names for the inspector, blanks dropped. */
export function playerLabel(report) {
  const names = (report && report.playerNames ? report.playerNames : []).filter(Boolean);
  return names.length ? names.join(" · ") : NO_VALUE;
}

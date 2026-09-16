/* ===========================================================================
   EditorUI — the DOM adapter between the page and the SaveEditor.

   Responsibility (SRP): wire the page's controls (file picker, dropzone, the
   four trainer fields, the badge and town chips, revert/reset/download) to the
   SaveEditor, and paint its state. It owns the browser-only parts the state
   machine deliberately avoids — FileReader, Blob, object URLs — and nothing
   else.

   Every visible string is resolved through i18n.t() at render time, so the UI
   subscribes to both editor.onChange and i18n.onChange. Two things are built
   once rather than per render: the chips (rebuilding them would drop focus
   mid-keyboard-toggle) and the inputs (rewriting a field the visitor is typing
   in would move their caret). Both are *updated* on render instead — a value
   is only written back when it actually differs, which is what makes the
   clamping visible without fighting the keyboard.
   =========================================================================== */
import { BADGES, NAME_CAPACITY, TOWNS } from "./save-format.js";
import { interpolate } from "../../util/interpolate.js";
import {
  checksumView,
  diffRows,
  errorKeys,
  formatNumber,
  machineView,
  nameRemaining,
  outputFileName
} from "./editor-format.js";

const REVOKE_DELAY = 2000;

/** Chip label keys, derived from the format lib's ordering. */
const BADGE_KEYS = BADGES.map((b) => "ylBadge" + b.key[0].toUpperCase() + b.key.slice(1));
const TOWN_KEYS = TOWNS.map((t) => "ylTown" + t.key[0].toUpperCase() + t.key.slice(1));

export class EditorUI {
  /**
   * @param {object} deps
   * @param {import("./save-editor.js").SaveEditor} deps.editor
   * @param {import("../../i18n/i18n.js").I18n} deps.i18n
   * @param {Document|HTMLElement} [deps.root]
   */
  constructor({ editor, i18n, root = document }) {
    this.editor = editor;
    this.i18n = i18n;

    this.led = root.getElementById("ylLed");
    if (!this.led) return; // not the editor page — nothing to wire

    this.status = root.getElementById("ylStatus");
    this.alert = root.getElementById("ylAlert");
    this.success = root.getElementById("ylSuccess");
    this.noticeTpl = root.getElementById("ylNoticeTpl");

    this.emptyView = root.getElementById("ylEmpty");
    this.loadedView = root.getElementById("ylLoaded");
    this.dropzone = root.getElementById("ylDropzone");
    this.fileInput = root.getElementById("ylFile");
    this.fileName = root.getElementById("ylFileName");

    this.nameInput = root.getElementById("ylName");
    this.nameHint = root.getElementById("ylNameHint");
    this.idInput = root.getElementById("ylId");
    this.rollBtn = root.getElementById("ylRollId");
    this.moneyInput = root.getElementById("ylMoney");
    this.coinsInput = root.getElementById("ylCoins");

    this.badgeGrid = root.getElementById("ylBadgeGrid");
    this.badgeCount = root.getElementById("ylBadgeCount");
    this.townGrid = root.getElementById("ylTownGrid");
    this.townCount = root.getElementById("ylTownCount");

    this.diffCount = root.getElementById("ylDiffCount");
    this.diffPanel = root.getElementById("ylDiffPanel");
    this.diffBody = root.getElementById("ylDiffBody");

    this.downloadBtn = root.getElementById("ylDownload");
    this.revertBtn = root.getElementById("ylRevert");
    this.resetBtn = root.getElementById("ylReset");
    this.actionHint = root.getElementById("ylActionHint");
    this.outName = root.getElementById("ylOutName");

    this.checksum = root.getElementById("ylChecksum");
    this.checksumNote = root.getElementById("ylChecksumNote");
    this.loadedSummary = root.getElementById("ylLoadedSummary");

    this.badgeChips = this._buildChips(this.badgeGrid, BADGES, "badges", BADGE_KEYS);
    this.townChips = this._buildChips(this.townGrid, TOWNS, "towns", TOWN_KEYS);

    this._bind(root);
    this.editor.onChange(() => this.render());
    this.i18n.onChange(() => this.render());
    this.render();
  }

  /**
   * One <button aria-pressed> per flag, built once. A button rather than a
   * checkbox because the design is a chip, and aria-pressed is what tells a
   * screen reader it is a toggle rather than a link.
   */
  _buildChips(grid, entries, kind, labelKeys) {
    const frag = document.createDocumentFragment();
    const chips = entries.map((entry, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "toggle-chip toggle-chip--" + (kind === "badges" ? "badge" : "town");
      button.setAttribute("aria-pressed", "false");

      const dot = document.createElement("span");
      dot.className = "toggle-chip__dot";
      dot.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.className = "toggle-chip__name";

      button.append(dot, label);

      // Badges carry their gym's city; towns are already place names.
      let city = null;
      if (entry.city) {
        city = document.createElement("span");
        city.className = "toggle-chip__city";
        city.textContent = entry.city;
        button.append(city);
      }

      button.addEventListener("click", () => this.editor.toggle(kind, index));
      frag.appendChild(button);
      return { button, label, labelKey: labelKeys[index] };
    });
    grid.appendChild(frag);
    return chips;
  }

  _bind(root) {
    this.dropzone.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) this._load(file);
    });

    // The dropzone is a <button>, so Enter/Space activation and focus come for
    // free; only the drag affordance needs wiring.
    const setDrag = (on) => this.dropzone.classList.toggle("is-drag", on);
    this.dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      setDrag(true);
    });
    this.dropzone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      setDrag(true);
    });
    this.dropzone.addEventListener("dragleave", () => setDrag(false));
    this.dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) this._load(file);
    });

    this.nameInput.addEventListener("input", (e) => this.editor.setName(e.target.value));
    this.idInput.addEventListener("input", (e) => this.editor.setNumber("trainerId", e.target.value));
    this.moneyInput.addEventListener("input", (e) => this.editor.setNumber("money", e.target.value));
    this.coinsInput.addEventListener("input", (e) => this.editor.setNumber("coins", e.target.value));
    this.rollBtn.addEventListener("click", () => this.editor.randomId());

    root.getElementById("ylBadgeAll").addEventListener("click", () => this.editor.setAll("badges", true));
    root.getElementById("ylBadgeNone").addEventListener("click", () => this.editor.setAll("badges", false));
    root.getElementById("ylTownAll").addEventListener("click", () => this.editor.setAll("towns", true));
    root.getElementById("ylTownNone").addEventListener("click", () => this.editor.setAll("towns", false));

    this.revertBtn.addEventListener("click", () => this.editor.revert());
    this.resetBtn.addEventListener("click", () => {
      this.fileInput.value = "";
      this.editor.reset();
    });
    this.downloadBtn.addEventListener("click", () => this._download());
  }

  /** Read a picked or dropped file and hand the bytes to the state machine. */
  _load(file) {
    const reader = new FileReader();
    reader.onerror = () => this.editor.failRead(file.name);
    reader.onload = () => this.editor.loadBytes(file.name, new Uint8Array(reader.result));
    reader.readAsArrayBuffer(file);
  }

  _download() {
    const bytes = this.editor.writeBytes();
    if (!bytes) return; // the editor has surfaced the error already

    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFileName(this.editor.fileName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY);
    this.editor.markDownloaded();
  }

  /** Translate a key, optionally filling {placeholders}. */
  _t(key, vars) {
    const text = this.i18n.t(key) ?? "";
    return vars ? interpolate(text, vars) : text;
  }

  /** Write a value back only when it differs — see the header note on carets. */
  _setValue(input, value) {
    const next = String(value);
    if (input.value !== next) input.value = next;
  }

  render() {
    const editor = this.editor;
    const lang = this.i18n.lang;

    const machine = machineView(editor.phase);
    this.led.dataset.tone = machine.tone;
    this.status.textContent = this._t(machine.statusKey);

    this._paintNotice(this.alert, errorKeys(editor.error), "error");
    this._paintNotice(this.success, editor.downloaded ? { titleKey: "ylOkTitle", bodyKey: "ylOkMsg" } : null, "success");

    this.emptyView.hidden = editor.loaded;
    this.loadedView.hidden = !editor.loaded;

    // Chip labels are runtime-built, so they need translating even while the
    // editor is idle and the panel is hidden.
    this._paintChips(this.badgeChips, editor.draft ? editor.draft.badges : null);
    this._paintChips(this.townChips, editor.draft ? editor.draft.towns : null);

    if (!editor.loaded) {
      // Clear rather than leave the previous file's details behind the hidden
      // panel, so nothing stale can resurface on the next render.
      this.fileName.textContent = "";
      this.diffBody.replaceChildren();
      this.checksum.textContent = "—";
      this.checksum.dataset.tone = "idle";
      this.checksumNote.textContent = "";
      this.loadedSummary.textContent = "—";
      this.actionHint.textContent = this._t("ylHintIdle");
      return;
    }

    this.fileName.textContent = editor.fileName || "";

    const draft = editor.draft;
    this._setValue(this.nameInput, draft.name);
    this._setValue(this.idInput, draft.trainerId);
    this._setValue(this.moneyInput, draft.money);
    this._setValue(this.coinsInput, draft.coins);
    this.nameHint.textContent = this._t("ylNameHint", { left: nameRemaining(draft, NAME_CAPACITY) });

    this.badgeCount.textContent = this._t("ylBadgeCount", { n: draft.badges.filter(Boolean).length });
    this.townCount.textContent = this._t("ylTownCount", { n: draft.towns.filter(Boolean).length });

    const rows = diffRows(editor.orig, draft, lang);
    this.diffCount.textContent = rows.length ? String(rows.length) : this._t("ylDiffNone");
    this.diffCount.dataset.tone = rows.length ? "edited" : "idle";
    this.diffPanel.hidden = rows.length === 0;
    this._renderDiff(rows);

    const chk = checksumView(editor.orig.checksum);
    this.checksum.textContent = chk.labelKey ? this._t(chk.labelKey) : chk.text;
    this.checksum.dataset.tone = chk.tone;
    this.checksumNote.textContent = chk.noteKey ? this._t(chk.noteKey) : "";

    this.loadedSummary.textContent = `${editor.orig.name || "—"} · ID ${editor.orig.trainerId} · ₽${formatNumber(
      editor.orig.money,
      lang
    )}`;

    this.revertBtn.disabled = !editor.dirty;
    // `opacity: .34` communicates nothing to a screen reader, so the reason a
    // disabled control is disabled gets spelled out.
    this.actionHint.textContent = editor.dirty ? "" : this._t("ylHintClean");
    this.outName.textContent = outputFileName(editor.fileName);
  }

  /** @param {Array<{button: HTMLElement, label: HTMLElement, labelKey: string}>} chips */
  _paintChips(chips, flags) {
    chips.forEach((chip, i) => {
      chip.label.textContent = this._t(chip.labelKey);
      chip.button.setAttribute("aria-pressed", String(!!(flags && flags[i])));
    });
  }

  _renderDiff(rows) {
    const frag = document.createDocumentFragment();
    for (const row of rows) {
      const tr = document.createElement("tr");

      const offset = document.createElement("td");
      offset.className = "diff__offset";
      offset.textContent = row.offset;

      const label = document.createElement("td");
      label.textContent = this._t(row.labelKey);

      const change = document.createElement("td");
      change.className = "diff__change";
      const before = document.createElement("span");
      before.className = "diff__before";
      before.textContent = row.before;
      const after = document.createElement("span");
      after.className = "diff__after";
      after.textContent = "→ " + row.after;
      change.append(before, " ", after);

      tr.append(offset, label, change);
      frag.appendChild(tr);
    }
    this.diffBody.replaceChildren(frag);
  }

  /**
   * Fill a live region from the notice template, or empty it. Content is
   * inserted into a region that has existed since first paint, which is what
   * makes role="alert"/"status" announce reliably.
   *
   * @param {HTMLElement} region
   * @param {{titleKey: string, bodyKey: string}|null} keys
   * @param {"error"|"success"} kind
   */
  _paintNotice(region, keys, kind) {
    if (!keys) {
      region.replaceChildren();
      return;
    }
    const node = this.noticeTpl.content.cloneNode(true);
    const notice = node.querySelector(".notice");
    notice.classList.add("notice--" + kind);
    notice.querySelector(".notice__badge").textContent = kind === "error" ? "×" : "✓";
    notice.querySelector(".notice__title").textContent = this._t(keys.titleKey);
    notice.querySelector(".notice__body").textContent = this._t(keys.bodyKey);
    region.replaceChildren(node);
  }
}

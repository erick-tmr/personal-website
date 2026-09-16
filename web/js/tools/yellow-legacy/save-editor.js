/* ===========================================================================
   SaveEditor — the editor's state, with no DOM in sight.

   Responsibility (SRP): hold the loaded save, the trainer block as read from
   it (`orig`) and the edited copy (`draft`), and drive save-format.js. It
   takes bytes and exposes bytes; FileReader, Blob and object URLs belong to
   editor-ui.js. That split is what makes every branch here reachable from
   `node --test` without a browser.

   Mirrors the SavePatcher/PatcherUI seam next door: state object emits, DOM
   adapter subscribes. The difference is what an "edit" means — the patcher
   flips one binary unlock, whereas here `draft` is a small record the UI
   mutates field by field and `editor-format.js` diffs against `orig`.

   save-format.js is loaded lazily so its byte logic is fetched only when the
   page actually runs, and injected (loadLib) so the failure path is testable
   rather than theoretical.
   =========================================================================== */

/** @typedef {"idle"|"loaded"|"edited"|"error"} Phase */
/** @typedef {"badges"|"towns"} FlagKind */

const FLAG_LENGTHS = { badges: 8, towns: 11 };

export class SaveEditor {
  /**
   * @param {object} [deps]
   * @param {() => Promise<object>} [deps.loadLib]  resolves the save-format module
   */
  constructor({ loadLib = () => import("./save-format.js") } = {}) {
    this._loadLib = loadLib;
    this._lib = null;
    this._pending = null;
    this.listeners = new Set();

    this.fileName = null;
    this.bytes = null;
    /** @type {object|null} the trainer block as it was read from the file */
    this.orig = null;
    /** @type {object|null} the same shape, with the visitor's edits */
    this.draft = null;
    this.error = null;
    this.downloaded = false;
  }

  /** @returns {Phase} */
  get phase() {
    if (this.error) return "error";
    if (this.dirty) return "edited";
    return this.loaded ? "loaded" : "idle";
  }

  get loaded() {
    return !!(this.orig && this.draft);
  }

  /** Does the draft differ from what the file held? */
  get dirty() {
    if (!this.loaded) return false;
    const a = this.orig;
    const b = this.draft;
    return (
      a.name !== b.name ||
      a.trainerId !== b.trainerId ||
      a.money !== b.money ||
      a.coins !== b.coins ||
      a.badges.some((on, i) => on !== b.badges[i]) ||
      a.towns.some((on, i) => on !== b.towns[i])
    );
  }

  /**
   * Resolve save-format.js. Memoized, so a failed import is retried on the next
   * call rather than being cached as broken forever.
   * @returns {Promise<object|null>} the module, or null once the error is set
   */
  async ready() {
    if (this._lib) return this._lib;
    if (!this._pending) {
      this._pending = Promise.resolve()
        .then(this._loadLib)
        .then((mod) => {
          this._lib = mod;
          return mod;
        })
        .catch(() => {
          this._pending = null;
          this._fail("lib");
          return null;
        });
    }
    return this._pending;
  }

  /**
   * Validate and read a save. Any rejection leaves the previous file cleared
   * and the error visible — never a half-loaded state.
   * @param {string} fileName
   * @param {Uint8Array} bytes
   */
  async loadBytes(fileName, bytes) {
    const lib = await this.ready();
    if (!lib) return;

    const check = lib.validateSave(bytes);
    if (!check.ok) {
      this._fail(check.code, fileName);
      return;
    }

    const orig = lib.readPlayer(bytes);
    this.fileName = fileName;
    this.bytes = bytes;
    this.orig = orig;
    this.draft = cloneBlock(orig);
    this.error = null;
    this.downloaded = false;
    this._emit();
  }

  /** The browser could not read the file at all. */
  failRead(fileName) {
    this._fail("read", fileName);
  }

  /**
   * Set the trainer name, dropping anything the Gen 1 charmap cannot store and
   * stopping at the field's capacity — the same filtering the in-game keyboard
   * would have applied.
   * @param {string} raw
   */
  setName(raw) {
    if (!this.loaded) return;
    const lib = this._lib;
    let out = "";
    for (const ch of String(raw)) {
      if (out.length >= lib.NAME_CAPACITY) break;
      if (lib.isEncodable(ch)) out += ch;
    }
    this._patch({ name: out });
  }

  /**
   * @param {"trainerId"|"money"|"coins"} field
   * @param {string|number} raw  digits; anything else is stripped
   */
  setNumber(field, raw) {
    if (!this.loaded) return;
    const max = this._maxFor(field);
    const digits = String(raw).replace(/[^0-9]/g, "");
    this._patch({ [field]: digits === "" ? 0 : Math.min(parseInt(digits, 10), max) });
  }

  /** A fresh trainer ID, the way the game rolls one at the start. */
  randomId() {
    if (!this.loaded) return;
    this._patch({ trainerId: Math.floor(Math.random() * (this._maxFor("trainerId") + 1)) });
  }

  /**
   * @param {FlagKind} kind
   * @param {number} index
   */
  toggle(kind, index) {
    if (!this.loaded) return;
    const list = this.draft[kind].slice();
    if (index < 0 || index >= list.length) return;
    list[index] = !list[index];
    this._patch({ [kind]: list });
  }

  /**
   * @param {FlagKind} kind
   * @param {boolean} value
   */
  setAll(kind, value) {
    if (!this.loaded) return;
    this._patch({ [kind]: new Array(FLAG_LENGTHS[kind]).fill(value) });
  }

  /** Throw the edits away, keeping the loaded file. */
  revert() {
    if (!this.loaded) return;
    this.draft = cloneBlock(this.orig);
    this.downloaded = false;
    this._emit();
  }

  /** Forget the file entirely. */
  reset() {
    this.fileName = null;
    this.bytes = null;
    this.orig = null;
    this.draft = null;
    this.error = null;
    this.downloaded = false;
    this._emit();
  }

  /**
   * The edited save. Returns a new Uint8Array and leaves the loaded bytes
   * alone, so a failed write cannot damage what is on screen.
   * @returns {Uint8Array|null} null once an error has been surfaced
   */
  writeBytes() {
    if (!this._lib || !this.bytes || !this.draft) return null;
    try {
      // An untouched name keeps its original bytes — see writePlayer's note on
      // the charmap entries the codec cannot round-trip.
      const payload =
        this.draft.name === this.orig.name
          ? Object.assign({}, this.draft, { name: undefined })
          : this.draft;
      return this._lib.writePlayer(this.bytes, payload);
    } catch (e) {
      // SaveError carries .code; anything else is genuinely unexpected.
      this.error = (e && e.code) || "write";
      this._emit();
      return null;
    }
  }

  /** The browser has handed the file over; show the "what now" notice. */
  markDownloaded() {
    this.downloaded = true;
    this._emit();
  }

  /**
   * Subscribe to state changes.
   * @param {(editor: SaveEditor) => void} cb
   * @returns {() => void} unsubscribe
   */
  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  _maxFor(field) {
    const lib = this._lib;
    if (field === "money") return lib.MONEY_MAX;
    if (field === "coins") return lib.COINS_MAX;
    return lib.ID_MAX;
  }

  /** Apply a partial edit to the draft. Any edit invalidates a prior download. */
  _patch(patch) {
    this.draft = Object.assign({}, this.draft, patch);
    this.downloaded = false;
    this._emit();
  }

  /** Clear the loaded save and surface an error code. */
  _fail(code, fileName = this.fileName) {
    this.error = code;
    this.fileName = fileName;
    this.bytes = null;
    this.orig = null;
    this.draft = null;
    this.downloaded = false;
    this._emit();
  }

  _emit() {
    this.listeners.forEach((cb) => cb(this));
  }
}

/** A detached copy of the editable fields — readPlayer's arrays are shared. */
function cloneBlock(block) {
  return {
    name: block.name,
    trainerId: block.trainerId,
    money: block.money,
    coins: block.coins,
    badges: block.badges.slice(),
    towns: block.towns.slice()
  };
}

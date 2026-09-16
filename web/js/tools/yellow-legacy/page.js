/* ===========================================================================
   Pokémon Yellow Legacy save editor · entry point.

   Composition root for /tools/pokemon-yellow-legacy-save-editor/: merges the
   tool's copy into the site dictionary, starts the shared chrome, and wires
   the editor to its UI.

   applyPreferred() runs last on purpose — I18n.t() returns undefined until the
   first apply(), and EditorUI resolves every string through it.
   =========================================================================== */
import { DICT, DEFAULT_LANG } from "../../i18n/dictionary.js";
import { bootSite } from "../../site.js";
import { EDITOR_DICT } from "./editor-copy.js";
import { SaveEditor } from "./save-editor.js";
import { EditorUI } from "./editor-ui.js";

const dict = {
  en: { ...DICT.en, ...EDITOR_DICT.en },
  pt: { ...DICT.pt, ...EDITOR_DICT.pt }
};

const i18n = bootSite({ dict, defaultLang: DEFAULT_LANG });
new EditorUI({ editor: new SaveEditor(), i18n });
i18n.applyPreferred();

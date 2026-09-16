/* ===========================================================================
   interpolate — fill {placeholders} in a translated string.

   Shared by every tool's formatter: copy lives in the dictionaries with
   {named} slots so a translator can move a number to wherever the sentence
   needs it, which a string concatenation would not allow.
   =========================================================================== */

/**
 * @param {string} template
 * @param {Record<string, string|number>} vars
 * @returns {string} the template with every known {key} replaced; unknown
 *   placeholders are left visible rather than blanked, so a missing variable
 *   shows up instead of silently vanishing.
 */
export function interpolate(template, vars) {
  if (!template) return "";
  return template.replace(/\{(\w+)\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole
  );
}

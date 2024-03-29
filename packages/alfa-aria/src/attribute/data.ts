// This file has been automatically generated based on the WAI-ARIA specification.
// Do therefore not modify it directly! If you wish to make changes, do so in
// `scripts/attributes.js` and run `yarn generate` to rebuild this file.

/**
 * @internal
 */
export type Attributes = typeof Attributes;

/**
 * @internal
 */
export const Attributes = {
  "aria-activedescendant": {
    kind: "property",
    type: "id-reference",
    options: null,
    default: null,
  },
  "aria-atomic": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-autocomplete": {
    kind: "property",
    type: "token",
    options: ["inline", "list", "both", "none"],
    default: "none",
  },
  "aria-busy": {
    kind: "state",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-checked": {
    kind: "state",
    type: "tristate",
    options: null,
    default: "undefined",
  },
  "aria-colcount": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-colindex": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-colspan": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-controls": {
    kind: "property",
    type: "id-reference-list",
    options: null,
    default: null,
  },
  "aria-current": {
    kind: "state",
    type: "token",
    options: ["page", "step", "location", "date", "time", "true", "false"],
    default: "false",
  },
  "aria-describedby": {
    kind: "property",
    type: "id-reference-list",
    options: null,
    default: null,
  },
  "aria-details": {
    kind: "property",
    type: "id-reference",
    options: null,
    default: null,
  },
  "aria-disabled": {
    kind: "state",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-dropeffect": {
    kind: "property",
    type: "token-list",
    options: ["copy", "execute", "link", "move", "none", "popup"],
    default: "none",
  },
  "aria-errormessage": {
    kind: "property",
    type: "id-reference",
    options: null,
    default: null,
  },
  "aria-expanded": {
    kind: "state",
    type: "true-false-undefined",
    options: null,
    default: "undefined",
  },
  "aria-flowto": {
    kind: "property",
    type: "id-reference-list",
    options: null,
    default: null,
  },
  "aria-grabbed": {
    kind: "state",
    type: "true-false-undefined",
    options: null,
    default: "undefined",
  },
  "aria-haspopup": {
    kind: "property",
    type: "token",
    options: ["false", "true", "menu", "listbox", "tree", "grid", "dialog"],
    default: "false",
  },
  "aria-hidden": {
    kind: "state",
    type: "true-false-undefined",
    options: null,
    default: "undefined",
  },
  "aria-invalid": {
    kind: "state",
    type: "token",
    options: ["grammar", "false", "spelling", "true"],
    default: "false",
  },
  "aria-keyshortcuts": {
    kind: "property",
    type: "string",
    options: null,
    default: null,
  },
  "aria-label": {
    kind: "property",
    type: "string",
    options: null,
    default: null,
  },
  "aria-labelledby": {
    kind: "property",
    type: "id-reference-list",
    options: null,
    default: null,
  },
  "aria-level": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-live": {
    kind: "property",
    type: "token",
    options: ["assertive", "off", "polite"],
    default: "off",
  },
  "aria-modal": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-multiline": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-multiselectable": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-orientation": {
    kind: "property",
    type: "token",
    options: ["horizontal", "undefined", "vertical"],
    default: "undefined",
  },
  "aria-owns": {
    kind: "property",
    type: "id-reference-list",
    options: null,
    default: null,
  },
  "aria-placeholder": {
    kind: "property",
    type: "string",
    options: null,
    default: null,
  },
  "aria-posinset": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-pressed": {
    kind: "state",
    type: "tristate",
    options: null,
    default: "undefined",
  },
  "aria-readonly": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-relevant": {
    kind: "property",
    type: "token-list",
    options: ["additions", "additions text", "all", "removals", "text"],
    default: "additions text",
  },
  "aria-required": {
    kind: "property",
    type: "true-false",
    options: null,
    default: "false",
  },
  "aria-roledescription": {
    kind: "property",
    type: "string",
    options: null,
    default: null,
  },
  "aria-rowcount": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-rowindex": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-rowspan": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-selected": {
    kind: "state",
    type: "true-false-undefined",
    options: null,
    default: "undefined",
  },
  "aria-setsize": {
    kind: "property",
    type: "integer",
    options: null,
    default: null,
  },
  "aria-sort": {
    kind: "property",
    type: "token",
    options: ["ascending", "descending", "none", "other"],
    default: "none",
  },
  "aria-valuemax": {
    kind: "property",
    type: "number",
    options: null,
    default: null,
  },
  "aria-valuemin": {
    kind: "property",
    type: "number",
    options: null,
    default: null,
  },
  "aria-valuenow": {
    kind: "property",
    type: "number",
    options: null,
    default: null,
  },
  "aria-valuetext": {
    kind: "property",
    type: "string",
    options: null,
    default: null,
  },
} as const;

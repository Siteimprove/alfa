import { Attribute } from "./types";

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-activedescendant
 */
export const ActiveDescendant: Attribute = {
  name: "aria-activedescendant",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-atomic
 */
export const Atomic: Attribute = {
  name: "aria-atomic",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-autocomplete
 */
export const Autocomplete: Attribute = {
  name: "aria-autocomplete",
  type: "token",
  values: ["inline", "list", "both", "none"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-busy
 */
export const Busy: Attribute = {
  name: "aria-busy",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-checked
 */
export const Checked: Attribute = {
  name: "aria-checked",
  type: "tristate"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colcount
 */
export const ColumnCount: Attribute = {
  name: "aria-colcount",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colindex
 */
export const ColumnIndex: Attribute = {
  name: "aria-colindex",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-colspan
 */
export const ColumnSpan: Attribute = {
  name: "aria-colspan",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-controls
 */
export const Controls: Attribute = {
  name: "aria-controls",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-current
 */
export const Current: Attribute = {
  name: "aria-current",
  type: "token",
  values: ["page", "step", "location", "date", "time", "true", "false"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-describedby
 */
export const DescribedBy: Attribute = {
  name: "aria-describedby",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-describedat
 */
export const DescribedAt: Attribute = {
  name: "aria-describedat",
  type: "uri"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-details
 */
export const Details: Attribute = {
  name: "aria-details",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-disabled
 */
export const Disabled: Attribute = {
  name: "aria-disabled",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-dropeffect
 */
export const DropEffect: Attribute = {
  name: "aria-dropeffect",
  type: "token-list",
  values: ["copy", "execute", "link", "move", "none", "popup"],
  deprecated: true
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-errormessage
 */
export const ErrorMessage: Attribute = {
  name: "aria-errormessage",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-expanded
 */
export const Expanded: Attribute = {
  name: "aria-expanded",
  type: "true-false-undefined"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-flowto
 */
export const FlowTo: Attribute = {
  name: "aria-flowto",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-grabbed
 */
export const Grabbed: Attribute = {
  name: "aria-grabbed",
  type: "true-false-undefined",
  deprecated: true
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-haspopup
 */
export const HasPopup: Attribute = {
  name: "aria-haspopup",
  type: "token",
  values: ["false", "true", "menu", "listbox", "tree", "grid", "dialog"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-hidden
 */
export const Hidden: Attribute = {
  name: "aria-hidden",
  type: "true-false-undefined"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-invalid
 */
export const Invalid: Attribute = {
  name: "aria-invalid",
  type: "token",
  values: ["grammar", "false", "spelling", "true"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-keyshortcuts
 */
export const KeyShortcuts: Attribute = {
  name: "aria-keyshortcuts",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-label
 */
export const Label: Attribute = {
  name: "aria-label",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-labelledby
 */
export const LabelledBy: Attribute = {
  name: "aria-labelledby",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-level
 */
export const Level: Attribute = {
  name: "aria-level",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-live
 */
export const Live: Attribute = {
  name: "aria-live",
  type: "token",
  values: ["assertive", "off", "polite"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-modal
 */
export const Modal: Attribute = {
  name: "aria-modal",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-multiline
 */
export const Multiline: Attribute = {
  name: "aria-multiline",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-multiselectable
 */
export const Multiselectable: Attribute = {
  name: "aria-multiselectable",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-orientation
 */
export const Orientation: Attribute = {
  name: "aria-orientation",
  type: "token",
  values: ["horizontal", "undefined", "vertical"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-owns
 */
export const Owns: Attribute = {
  name: "aria-owns",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-placeholder
 */
export const Placeholder: Attribute = {
  name: "aria-placeholder",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-posinset
 */
export const PositionInSet: Attribute = {
  name: "aria-posinset",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-pressed
 */
export const Pressed: Attribute = {
  name: "aria-pressed",
  type: "tristate"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-readonly
 */
export const ReadOnly: Attribute = {
  name: "aria-readonly",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-relevant
 */
export const Relevant: Attribute = {
  name: "aria-relevant",
  type: "token-list",
  values: ["additions", "all", "removals", "text"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-required
 */
export const Required: Attribute = {
  name: "aria-required",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-roledescription
 */
export const RoleDescription: Attribute = {
  name: "aria-roledescription",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowcount
 */
export const RowCount: Attribute = {
  name: "aria-rowcount",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowindex
 */
export const RowIndex: Attribute = {
  name: "aria-rowindex",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-rowspan
 */
export const RowSpan: Attribute = {
  name: "aria-rowspan",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-selected
 */
export const Selected: Attribute = {
  name: "aria-selected",
  type: "true-false-undefined"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-setsize
 */
export const SetSize: Attribute = {
  name: "aria-setsize",
  type: "integer"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-sort
 */
export const Sort: Attribute = {
  name: "aria-sort",
  type: "token",
  values: ["ascending", "descending", "none", "other"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuemax
 */
export const ValueMaximum: Attribute = {
  name: "aria-valuemax",
  type: "number"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuemin
 */
export const ValueMinimum: Attribute = {
  name: "aria-valuemin",
  type: "number"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuenow
 */
export const ValueNow: Attribute = {
  name: "aria-valuenow",
  type: "number"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-valuetext
 */
export const ValueText: Attribute = {
  name: "aria-valuetext",
  type: "string"
};

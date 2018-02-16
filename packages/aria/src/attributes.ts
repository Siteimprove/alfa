import { State, Property } from "./types";

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-activedescendant
 */
export const ActiveDescendant: Property = {
  name: "aria-activedescendant",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-atomic
 */
export const Atomic: Property = {
  name: "aria-atomic",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-autocomplete
 */
export const Autocomplete: Property = {
  name: "aria-autocomplete",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-busy
 */
export const Busy: State = {
  name: "aria-busy",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-controls
 */
export const Controls: Property = {
  name: "aria-controls",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-current
 */
export const Current: State = {
  name: "aria-current",
  type: "token",
  values: ["page", "step", "location", "date", "time", "true", "false"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-describedby
 */
export const DescribedBy: Property = {
  name: "aria-describedby",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-details
 */
export const Details: Property = {
  name: "aria-details",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-disabled
 */
export const Disabled: State = {
  name: "aria-disabled",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-dropeffect
 */
export const DropEffect: State = {
  name: "aria-dropeffect",
  type: "token-list",
  values: ["copy", "execute", "link", "move", "none", "popup"],
  deprecated: true
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-errormessage
 */
export const ErrorMessage: Property = {
  name: "aria-errormessage",
  type: "id-reference"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-expanded
 */
export const Expanded: State = {
  name: "aria-expanded",
  type: "true-false-undefined"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-flowto
 */
export const FlowTo: Property = {
  name: "aria-flowto",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-grabbed
 */
export const Grabbed: State = {
  name: "aria-grabbed",
  type: "true-false-undefined",
  deprecated: true
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-haspopup
 */
export const HasPopup: Property = {
  name: "aria-haspopup",
  type: "token",
  values: ["false", "true", "menu", "listbox", "tree", "grid", "dialog"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-hidden
 */
export const Hidden: State = {
  name: "aria-hidden",
  type: "true-false-undefined"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-invalid
 */
export const Invalid: State = {
  name: "aria-invalid",
  type: "token",
  values: ["grammar", "false", "spelling", "true"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-keyshortcuts
 */
export const KeyShortcuts: Property = {
  name: "aria-keyshortcuts",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-label
 */
export const Label: Property = {
  name: "aria-label",
  type: "string"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-labelledby
 */
export const LabelledBy: Property = {
  name: "aria-labelledby",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-live
 */
export const Live: Property = {
  name: "aria-live",
  type: "token",
  values: ["assertive", "off", "polite"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-modal
 */
export const Modal: Property = {
  name: "aria-modal",
  type: "true-false"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-owns
 */
export const Owns: Property = {
  name: "aria-owns",
  type: "id-reference-list"
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-relevant
 */
export const Relevant: Property = {
  name: "aria-relevant",
  type: "token-list",
  values: ["additions", "all", "removals", "text"]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#aria-roledescription
 */
export const RoleDescription: Property = {
  name: "aria-roledescription",
  type: "string"
};

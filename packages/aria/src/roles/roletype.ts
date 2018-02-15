import { Role } from "../types";

/**
 * @see https://www.w3.org/TR/wai-aria/#roletype
 */
export const Roletype: Role = {
  abstract: true,
  supportedAttributes: [
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-atomic
     */
    {
      name: "aria-atomic",
      type: "true-false"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-busy
     */
    {
      name: "aria-busy",
      type: "true-false"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-controls
     */
    {
      name: "aria-controls",
      type: "id-reference-list"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-current
     */
    {
      name: "aria-current",
      type: "token",
      values: ["page", "step", "location", "date", "time", "true", "false"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-describedby
     */
    {
      name: "aria-describedby",
      type: "id-reference-list"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-details
     */
    {
      name: "aria-details",
      type: "id-reference"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-disabled
     */
    {
      name: "aria-disabled",
      type: "true-false"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-dropeffect
     */
    {
      name: "aria-dropeffect",
      type: "token-list",
      values: ["copy", "execute", "link", "move", "none", "popup"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-errormessage
     */
    {
      name: "aria-errormessage",
      type: "id-reference"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-flowto
     */
    {
      name: "aria-flowto",
      type: "id-reference-list"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-grabbed
     */
    {
      name: "aria-grabbed",
      type: "true-false-undefined"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-haspopup
     */
    {
      name: "aria-haspopup",
      type: "token",
      values: ["false", "true", "menu", "listbox", "tree", "grid", "dialog"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-hidden
     */
    {
      name: "aria-hidden",
      type: "true-false-undefined"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-invalid
     */
    {
      name: "aria-invalid",
      type: "token",
      values: ["grammar", "false", "spelling", "true"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-keyshortcuts
     */
    {
      name: "aria-keyshortcuts",
      type: "string"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-label
     */
    {
      name: "aria-label",
      type: "string"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-labelledby
     */
    {
      name: "aria-labelledby",
      type: "id-reference-list"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-live
     */
    {
      name: "aria-live",
      type: "token",
      values: ["assertive", "off", "polite"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-owns
     */
    {
      name: "aria-owns",
      type: "id-reference-list"
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-relevant
     */
    {
      name: "aria-relevant",
      type: "token-list",
      values: ["additions", "all", "removals", "text"]
    },
    /**
     * @see https://www.w3.org/TR/wai-aria/#aria-roledescription
     */
    {
      name: "aria-roledescription",
      type: "string"
    }
  ]
};

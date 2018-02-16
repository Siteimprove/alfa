import { Role } from "./types";
import * as Attributes from "./attributes";

/**
 * @see https://www.w3.org/TR/wai-aria/#roletype
 */
export const Roletype: Role = {
  name: "roletype",
  abstract: true,
  supportedAttributes: [
    Attributes.Atomic,
    Attributes.Busy,
    Attributes.Controls,
    Attributes.Current,
    Attributes.DescribedBy,
    Attributes.Details,
    Attributes.Disabled,
    Attributes.DropEffect,
    Attributes.ErrorMessage,
    Attributes.FlowTo,
    Attributes.Grabbed,
    Attributes.HasPopup,
    Attributes.Hidden,
    Attributes.Invalid,
    Attributes.KeyShortcuts,
    Attributes.Label,
    Attributes.LabelledBy,
    Attributes.Live,
    Attributes.Owns,
    Attributes.Relevant,
    Attributes.RoleDescription
  ]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#structure
 */
export const Structure: Role = {
  name: "structure",
  abstract: true,
  inherits: [Roletype]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#widget
 */
export const Widget: Role = {
  name: "widget",
  abstract: true,
  inherits: [Roletype]
};

/**
 * @see https://www.w3.org/TR/wai-aria/#window
 */
export const Window: Role = {
  name: "window",
  abstract: true,
  inherits: [Roletype],
  supportedAttributes: [Attributes.Expanded, Attributes.Modal]
};

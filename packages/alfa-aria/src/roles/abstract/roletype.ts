import { Role } from "../../types";
import * as Attributes from "../../attributes";

/**
 * @see https://www.w3.org/TR/wai-aria/#roletype
 */
export const Roletype: Role = {
  name: "roletype",
  abstract: true,
  supported: () => [
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

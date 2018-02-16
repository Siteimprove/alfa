import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#range
 */
export const Range: Role = {
  name: "range",
  abstract: true,
  label: { from: "author" },
  inherits: [Widget],
  supported: [
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow,
    Attributes.ValueText
  ]
};

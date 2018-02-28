import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Range } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#scrollbar
 */
export const ScrollBar: Role = {
  name: "scrollbar",
  label: { from: ["author"] },
  inherits: [Range],
  supported: [
    Attributes.Controls,
    Attributes.Orientation,
    Attributes.ValueMaximum,
    Attributes.ValueMinimum,
    Attributes.ValueNow
  ]
};

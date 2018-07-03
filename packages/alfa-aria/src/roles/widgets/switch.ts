import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Checkbox } from "./checkbox";

/**
 * @see https://www.w3.org/TR/wai-aria/#switch
 */
export const Switch: Role = {
  name: "switch",
  inherits: () => [Checkbox],
  required: () => [Attributes.Checked],
  label: { from: ["contents", "author"], required: true }
};

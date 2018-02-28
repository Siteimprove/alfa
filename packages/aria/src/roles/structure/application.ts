import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#application
 */
export const Application: Role = {
  name: "application",
  label: { from: ["author"], required: true },
  inherits: [Structure],
  supported: [Attributes.ActiveDescendant]
};

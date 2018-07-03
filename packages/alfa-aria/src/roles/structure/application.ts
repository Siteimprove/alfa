import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Structure } from "../abstract/structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#application
 */
export const Application: Role = {
  name: "application",
  inherits: () => [Structure],
  supported: () => [Attributes.ActiveDescendant],
  label: { from: ["author"], required: true }
};

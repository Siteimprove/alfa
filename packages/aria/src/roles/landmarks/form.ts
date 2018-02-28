import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#form
 */
export const Form: Role = {
  name: "form",
  label: { from: ["author"] },
  inherits: [Landmark]
};

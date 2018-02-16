import { Role } from "../../types";
import { Structure } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#presentation
 */
export const Presentation: Role = {
  name: "presentation",
  label: { from: "author" },
  inherits: [Structure]
};

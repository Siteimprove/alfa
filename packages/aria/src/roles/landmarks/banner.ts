import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#banner
 */
export const Banner: Role = {
  name: "banner",
  label: { from: "author" },
  inherits: [Landmark]
};

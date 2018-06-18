import { Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#banner
 */
export const Banner: Role = {
  name: "banner",
  inherits: [Landmark],
  label: { from: ["author"] }
};

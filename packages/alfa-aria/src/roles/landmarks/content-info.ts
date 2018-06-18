import { Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#contentinfo
 */
export const ContentInfo: Role = {
  name: "contentinfo",
  inherits: [Landmark],
  label: { from: ["author"] }
};

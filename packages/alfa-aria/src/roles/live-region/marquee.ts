import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#marquee
 */
export const Marquee: Role = {
  name: "marquee",
  category: Category.LiveRegion,
  inherits: () => [Section],
  label: { from: ["author"], required: true }
};

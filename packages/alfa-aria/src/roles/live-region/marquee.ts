import { Role } from "../../types";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#marquee
 */
export const Marquee: Role = {
  name: "marquee",
  inherits: [Section],
  label: { from: ["author"], required: true }
};

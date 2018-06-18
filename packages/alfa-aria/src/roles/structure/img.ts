import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#img
 */
export const Img: Role = {
  name: "img",
  inherits: [Section],
  label: { from: ["author"], required: true }
};

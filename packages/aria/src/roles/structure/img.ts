import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#img
 */
export const Img: Role = {
  name: "img",
  inherits: [Section],
  label: { from: ["author"], required: true }
};

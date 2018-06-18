import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#log
 */
export const Log: Role = {
  name: "log",
  inherits: [Section],
  label: { from: ["author"], required: true }
};

import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#log
 */
export const Log: Role = {
  name: "log",
  category: Category.LiveRegion,
  inherits: () => [Section],
  implicits: () => [[Attributes.Live, "polite"]],
  label: { from: ["author"], required: true }
};

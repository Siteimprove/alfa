import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#status
 */
export const Status: Role = {
  name: "status",
  category: Category.LiveRegion,
  inherits: () => [Section],
  implicits: () => [[Attributes.Live, "polite"], [Attributes.Atomic, "true"]],
  label: { from: ["author"] }
};

import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#alert
 */
export const Alert: Role = {
  name: "alert",
  category: Category.LiveRegion,
  inherits: () => [Section],
  implicits: () => [
    [Attributes.Live, "assertive"],
    [Attributes.Atomic, "true"]
  ],
  label: { from: ["author"] }
};

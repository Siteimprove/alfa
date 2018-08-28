import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#alert
 */
export const Alert: Role = {
  name: "alert",
  category: Category.LiveRegion,
  inherits: () => [Section],
  label: { from: ["author"] }
};

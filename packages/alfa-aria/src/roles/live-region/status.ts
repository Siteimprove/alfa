import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#status
 */
export const Status: Role = {
  name: "status",
  category: Category.LiveRegion,
  inherits: () => [Section],
  label: { from: ["author"] }
};

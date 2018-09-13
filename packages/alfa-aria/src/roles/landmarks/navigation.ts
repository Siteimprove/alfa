import { Category, Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#navigation
 */
export const Navigation: Role = {
  name: "navigation",
  category: Category.Landmark,
  inherits: () => [Landmark],
  label: { from: ["author"] }
};

import { Category, Role } from "../../types";
import { Structure } from "../abstract/structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#presentation
 */
export const Presentation: Role = {
  name: "presentation",
  category: Category.Structure,
  inherits: () => [Structure],
  label: { from: ["author"] }
};

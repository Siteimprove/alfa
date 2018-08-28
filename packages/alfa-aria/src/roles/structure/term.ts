import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#term
 */
export const Term: Role = {
  name: "term",
  category: Category.Structure,
  inherits: () => [Section],
  label: { from: ["author"] }
};

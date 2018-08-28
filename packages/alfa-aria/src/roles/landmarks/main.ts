import { Category, Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#main
 */
export const Main: Role = {
  name: "main",
  category: Category.Landmark,
  inherits: () => [Landmark],
  label: { from: ["author"] }
};

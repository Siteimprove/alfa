import { Category, Role } from "../../types";
import { Roletype } from "./roletype";

/**
 * @see https://www.w3.org/TR/wai-aria/#structure
 */
export const Structure: Role = {
  name: "structure",
  category: Category.Abstract,
  inherits: () => [Roletype]
};

import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Roletype } from "./roletype";

/**
 * @see https://www.w3.org/TR/wai-aria/#window
 */
export const Window: Role = {
  name: "window",
  category: Category.Abstract,
  inherits: () => [Roletype],
  supported: () => [Attributes.Expanded, Attributes.Modal]
};

import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Structure } from "./structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#section
 */
export const Section: Role = {
  name: "section",
  category: Category.Abstract,
  inherits: () => [Structure],
  supported: () => [Attributes.Expanded]
};

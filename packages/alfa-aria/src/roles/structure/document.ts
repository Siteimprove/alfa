import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Structure } from "../abstract/structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#document
 */
export const Document: Role = {
  name: "document",
  category: Category.Structure,
  inherits: () => [Structure],
  supported: () => [Attributes.Expanded],
  label: { from: ["author"] }
};

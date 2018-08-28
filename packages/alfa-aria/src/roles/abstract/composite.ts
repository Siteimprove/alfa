import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#composite
 */
export const Composite: Role = {
  name: "composite",
  category: Category.Abstract,
  inherits: () => [Widget],
  supported: () => [Attributes.ActiveDescendant],
  label: { from: ["author"] }
};

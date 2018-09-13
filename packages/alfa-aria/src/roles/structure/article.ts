import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Document } from "./document";

/**
 * @see https://www.w3.org/TR/wai-aria/#article
 */
export const Article: Role = {
  name: "article",
  category: Category.Structure,
  inherits: () => [Document],
  supported: () => [Attributes.PositionInSet, Attributes.SetSize],
  label: { from: ["author"] }
};

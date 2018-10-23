import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { SectionHead } from "../abstract/section-head";
/**
 * @see https://www.w3.org/TR/wai-aria/#heading
 */
export const Heading: Role = {
  name: "heading",
  category: Category.Structure,
  inherits: () => [SectionHead],
  required: () => [Attributes.Level],
  implicits: () => [[Attributes.Level, "2"]],
  label: { from: ["contents", "author"], required: true }
};

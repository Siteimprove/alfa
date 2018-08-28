import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Structure } from "./structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#sectionhead
 */
export const SectionHead: Role = {
  name: "sectionhead",
  category: Category.Abstract,
  inherits: () => [Structure],
  supported: () => [Attributes.Expanded],
  label: { from: ["contents", "author"] }
};

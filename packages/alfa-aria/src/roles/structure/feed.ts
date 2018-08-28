import { Category, Role } from "../../types";
import { Article } from "./article";
import { List } from "./list";

/**
 * @see https://www.w3.org/TR/wai-aria/#feed
 */
export const Feed: Role = {
  name: "feed",
  category: Category.Structure,
  inherits: () => [List],
  owned: () => [Article],
  label: { from: ["author"] }
};

import { Role } from "../../types";
import { Article, List } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#feed
 */
export const Feed: Role = {
  name: "feed",
  inherits: [List],
  owned: [Article],
  label: { from: ["author"] }
};

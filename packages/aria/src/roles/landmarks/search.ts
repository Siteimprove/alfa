import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#search
 */
export const Search: Role = {
  name: "search",
  inherits: [Landmark],
  label: { from: ["author"] }
};

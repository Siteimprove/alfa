import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#search
 */
export const Search: Role = {
  name: "search",
  label: { from: ["author"] },
  inherits: [Landmark]
};

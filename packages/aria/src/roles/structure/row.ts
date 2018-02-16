import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#row
 */
export const Row: Role = {
  name: "row",
  label: { from: "author" },
  inherits: [Widget],
  context: []
};

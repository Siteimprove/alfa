import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowgroup
 */
export const RowGroup: Role = {
  name: "rowgroup",
  label: { from: "author" },
  inherits: [Structure],
  context: []
};

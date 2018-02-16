import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#document
 */
export const Document: Role = {
  name: "document",
  label: { from: "author" },
  inherits: [Structure],
  supported: [Attributes.Expanded]
};

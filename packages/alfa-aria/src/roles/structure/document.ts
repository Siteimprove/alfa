import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "../abstract/structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#document
 */
export const Document: Role = {
  name: "document",
  inherits: () => [Structure],
  supported: () => [Attributes.Expanded],
  label: { from: ["author"] }
};

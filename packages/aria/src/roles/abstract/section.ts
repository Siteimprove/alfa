import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Structure } from "./structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#section
 */
export const Section: Role = {
  name: "section",
  abstract: true,
  inherits: [Structure],
  supported: [Attributes.Expanded]
};

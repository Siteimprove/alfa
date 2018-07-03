import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#group
 */
export const Group: Role = {
  name: "group",
  inherits: () => [Section],
  supported: () => [Attributes.ActiveDescendant],
  label: { from: ["author"] }
};

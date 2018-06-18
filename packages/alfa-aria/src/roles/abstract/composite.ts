import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#composite
 */
export const Composite: Role = {
  name: "composite",
  abstract: true,
  inherits: () => [Widget],
  supported: () => [Attributes.ActiveDescendant],
  label: { from: ["author"] }
};

import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Group } from "./group";

/**
 * @see https://www.w3.org/TR/wai-aria/#toolbar
 */
export const Toolbar: Role = {
  name: "toolbar",
  inherits: () => [Group],
  supported: () => [Attributes.Orientation],
  label: { from: ["author"] }
};

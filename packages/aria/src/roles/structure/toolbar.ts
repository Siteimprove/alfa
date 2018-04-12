import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Group } from "../structure";
/**
 * @see https://www.w3.org/TR/wai-aria/#toolbar
 */
export const ToolBar: Role = {
  name: "toolbar",
  inherits: [Group],
  supported: [Attributes.Orientation],
  label: { from: ["author"] }
};

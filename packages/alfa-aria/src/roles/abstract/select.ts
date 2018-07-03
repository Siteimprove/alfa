import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Group } from "../structure/group";
import { Composite } from "./composite";

/**
 * @see https://www.w3.org/TR/wai-aria/#select
 */
export const Select: Role = {
  name: "select",
  abstract: true,
  inherits: () => [Composite, Group],
  supported: () => [Attributes.Orientation],
  label: { from: ["author"] }
};
